import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('role', 'button');
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('role');
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }
  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
let listOfAllAuthoredData = [];

function makeImageClickableNSettingAltText() {
  const logoImage = document.querySelector('.nav-brand img');
  const anchor = document.createElement('a');
  Object.assign(anchor, {
    href: listOfAllAuthoredData[1],
    title: logoImage.alt,
  });
  anchor.appendChild(document.querySelector('.nav-brand picture'));
  document.querySelector('.nav-brand .default-content-wrapper').appendChild(anchor);
}

function createSearchBox() {
  const navWrapper = document.querySelector('.nav-wrapper');
  const navTools = document.querySelector('.nav-tools p');
  let searchDiv = navWrapper.querySelector('.search-div');
  let cancelDiv = navWrapper.querySelector('.cancel-div');
  const searchImage = document.querySelector('.icon-search');

  if (searchDiv) {
    const isVisible = searchDiv.style.display !== 'none';
    searchDiv.style.display = isVisible ? 'none' : 'flex';
    if (cancelDiv) {
      cancelDiv.style.display = isVisible ? 'none' : 'flex';
    }
    searchImage.style.display = isVisible ? 'block' : 'none';
  } else {
    cancelDiv = document.createElement('div');
    cancelDiv.classList.add('cancel-div');

    const cancelImg = document.createElement('img');
    cancelImg.classList.add('cancel-image');
    cancelImg.src = '/icons/cancel.svg';
    cancelImg.alt = 'cancel';
    cancelImg.style.display = 'flex'; // Initially visible
    cancelImg.style.cursor = 'pointer';
    cancelImg.addEventListener('click', () => {
      searchDiv.style.display = 'none';
      cancelDiv.style.display = 'none';
      searchImage.style.display = 'block'; // Show search icon again
    });
    cancelDiv.appendChild(cancelImg);
    navTools.appendChild(cancelDiv);
    // Hide search icon
    searchImage.style.display = 'none';

    searchDiv = document.createElement('div');
    searchDiv.classList.add('search-div');
    const searchInputBox = document.createElement('input');
    Object.assign(searchInputBox, {
      type: 'text',
      id: 'search-input',
      name: 'myInput',
      placeholder: 'Enter text here',
      value: listOfAllAuthoredData[0],
    });
    searchDiv.appendChild(searchInputBox);
    navWrapper.appendChild(searchDiv);
  }
}

function settingAltTextForSearchIcon() {
  const searchImage = document.querySelector('.icon-search');
  searchImage.addEventListener('click', () => {
    createSearchBox();
  });
  searchImage.setAttribute('title', listOfAllAuthoredData[3] && listOfAllAuthoredData[3] ? listOfAllAuthoredData[3] : 'Alt text for search');
}

function fetchingAuthoredData(block) {
  const authoredDiv = block.querySelector('.global-header-container .global-header-wrapper');
  listOfAllAuthoredData = Array.from(authoredDiv.querySelectorAll('p')).map((p) => p.textContent);
  makeImageClickableNSettingAltText();
  settingAltTextForSearchIcon();
}

export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  // toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
  fetchingAuthoredData(block);
}
