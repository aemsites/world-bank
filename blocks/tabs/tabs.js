import { getMetadata, toClassName, fetchPlaceholders } from '../../scripts/aem.js';
import { a, button, div } from '../../scripts/dom-helpers.js';
import { getLanguage, fetchData } from '../../scripts/utils.js';
import { loadFragment } from '../fragment/fragment.js';

const langCode = getLanguage();
const upiId = getMetadata('upi');

async function getTabUrl(type) {
  try {
    const tabUrl = `${type}Url`;
    const globalProperties = await fetchPlaceholders();
    const rawUrl = globalProperties[`${tabUrl}`];
    return rawUrl.replace('{langCode}', langCode).replace('{upiId}', upiId);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error fetching tab URL for type: ${type}`, error);
    return '';
  }
}

function formatDate(dateString) {
  if (dateString) {
    const date = new Date(dateString);
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  }
  return '';
}

function createListElement(masterType, link, heading, date) {
  return div(
    { class: 'tab-li-element' },
    div({ class: 'tab-li-element-type' }, masterType),
    a({ href: link, rel: 'noopener noreferrer', target: '_blank' }, div({ class: 'tab-li-element-heading' }, heading)),
    div({ class: 'tab-li-element-date' }, date),
  );
}

function removeShowMoreButton(tabPanel) {
  const buttonContainer = tabPanel.querySelector('.show-more-container');
  if (buttonContainer) {
    tabPanel.removeChild(buttonContainer);
  }
}

function showMoreButton(tabPanel, loadMoreFn) {
  const buttonContainer = div({ class: 'show-more-container' });
  const buttonEl = button({ class: 'show-more-button' }, 'Show More');
  buttonEl.addEventListener('click', () => {
    loadMoreFn();
  });

  buttonContainer.appendChild(buttonEl);
  tabPanel.appendChild(buttonContainer);
}

function populateTab(data, tabPanel, elementType, createItemFn) {
  const items = data?.value || Object.values(data[elementType] || {});
  let displayedItemsCount = 0;
  const itemsPerPage = 5;

  function loadMoreItems() {
    removeShowMoreButton(tabPanel);
    const remainingItems = items.slice(displayedItemsCount, displayedItemsCount + itemsPerPage);
    remainingItems.forEach((item) => {
      const liElement = createItemFn(item);
      tabPanel.appendChild(liElement);
    });
    displayedItemsCount += remainingItems.length;
    showMoreButton(tabPanel, loadMoreItems);
    if (displayedItemsCount >= items.length) {
      removeShowMoreButton(tabPanel);
    }
  }
  loadMoreItems();
}

function populateBlogTab(data, tabPanel) {
  populateTab(data, tabPanel, 'blogs', (blog) => {
    const heading = blog.title;
    const liLink = blog.pagePublishPath;
    const date = formatDate(blog.blogDate);
    if (heading || liLink || date) {
      return createListElement('Blog', liLink, heading, date);
    }
    return '';
  });
}

function populatePublicationTab(data, tabPanel) {
  populateTab(data, tabPanel, 'documents', (doc) => {
    const masterType = doc.docty;
    const heading = doc.display_title;
    const liLink = doc.url;
    const date = formatDate(doc.docdt);
    if (heading || liLink || date) {
      return createListElement(masterType, liLink, heading, date);
    }
    return '';
  });
}

function populateProjectTab(data, tabPanel) {
  populateTab(data, tabPanel, 'projects', (project) => {
    const heading = project.project_name;
    const liLink = project.url;
    const date = formatDate(project.boardapprovaldate);
    if (heading || liLink || date) {
      return createListElement('Project', liLink, heading, date);
    }
    return '';
  });
}

function populateAllTab(data, tabPanel) {
  populateTab(data, tabPanel, 'everything', (item) => {
    const heading = item.title;
    const masterType = item.masterconttype;
    const liLink = item.link;
    const date = formatDate(item.master_date);
    if (heading || liLink || date) {
      return createListElement(masterType, liLink, heading, date);
    }
    return '';
  });
}

async function fetchDataForTab(type, url) {
  if (type === 'blogs') {
    const postData = {
      search: '*',
      filter: `(bloggers/any(blogger: blogger/upi eq '${upiId}') and (language eq 'English'))`,
      top: 50,
      skip: 0,
      orderby: 'blogDate desc',
      count: true,
    };
    const headers = {
      'ocp-apim-subscription-key': 'a02440fa123c4740a83ed288591eafe4',
    };
    return fetchData(url, 'POST', headers, postData);
  }
  return fetchData(url);
}

function showSpinner(tabPanel) {
  const spinnerContainer = div({ class: 'spinner-container' }, div({ class: 'spinner' }));
  tabPanel.appendChild(spinnerContainer);
}

function removeSpinner(tabPanel) {
  const spinner = tabPanel.querySelector('.spinner-container');
  if (spinner) tabPanel.removeChild(spinner);
}

async function decorateTab(tabPanel, type) {
  tabPanel.innerHTML = '';
  showSpinner(tabPanel);

  const url = await getTabUrl(type);
  const data = await fetchDataForTab(type, url);

  if (data) {
    if (type === 'blogs') populateBlogTab(data, tabPanel);
    else if (type === 'publication') populatePublicationTab(data, tabPanel);
    else if (type === 'project') populateProjectTab(data, tabPanel);
    else populateAllTab(data, tabPanel);
  } else {
    // eslint-disable-next-line no-console
    console.error('No data available for tab type:', type);
  }

  removeSpinner(tabPanel);
}

export default async function decorate(block) {
  const tablist = div({ class: 'tabs-list', role: 'tablist' });

  // decorate tabs and tabpanels
  const tabs = [...block.children].map((child) => child.firstElementChild);

  tabs.forEach((tab, i) => {
    const id = toClassName(tab.textContent);
    // decorate tabpanel
    const tabpanel = block.children[i];
    const tabType = tabpanel.children[1].textContent;
    tabpanel.className = 'tabs-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');
    tabpanel.setAttribute('type', tabType);
    tabpanel.setAttribute('data-loaded', false);
    tabpanel.children[1].remove();
    if (i === 0) {
      decorateTab(tabpanel, tabType);
      tabpanel.setAttribute('data-loaded', true);
    }
    // build tab button
    const tabButton = button({
      class: 'tabs-tab',
      id: `tab-${id}`,
      type: 'button',
      'aria-controls': `tabpanel-${id}`,
      'aria-selected': !i,
      role: 'tab',
    }, tab.textContent);

    tabButton.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      tabpanel.setAttribute('aria-hidden', false);
      tabButton.setAttribute('aria-selected', true);
      const dataLoaded = tabpanel.getAttribute('data-loaded');
      if (tabType !== 'manual' && dataLoaded === 'false') {
        decorateTab(tabpanel, tabType);
        tabpanel.setAttribute('data-loaded', true);
      }
    });
    tablist.append(tabButton);
    tab.remove();
  });

  block.querySelectorAll('[type="manual"] a').forEach(async (link) => {
    const path = link ? link.getAttribute('href') : '';
    if (path === '') return;
    const ablosutePath = path.replace('.html', '');
    const tabPanel = link.closest('[role=tabpanel]');
    const fragment = await loadFragment(ablosutePath);

    // decorate footer DOM
    const content = div({}, fragment);
    tabPanel.innerHTML = '';
    tabPanel.append(content);
  });

  block.prepend(tablist);
}
