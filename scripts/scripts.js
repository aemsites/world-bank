import {
  sampleRUM,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
  fetchPlaceholders,
  getMetadata,
} from './aem.js';
import { picture, source, img } from './dom-helpers.js';

import {
  getLanguage,
  createSource,
  formatDate,
  setPageLanguage,
  cookiePopUp,
  showCookieConsent,
  PATH_PREFIX,
} from './utils.js';

const LCP_BLOCKS = ['bio-detail']; // add your LCP blocks to the list
export const CLASS_MAIN_HEADING = 'main-heading';
export const LANGUAGE_ROOT = `/ext/${getLanguage()}`;

/**
 * Moves all the attributes from a given elmenet to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-')),
  );
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

async function renderWBDataLayer() {
  const config = await fetchPlaceholders(PATH_PREFIX);
  const lastPubDateStr = getMetadata('published-time');
  const firstPubDateStr = getMetadata('content_date') || lastPubDateStr;
  window.wbgData.page = {
    pageInfo: {
      pageCategory: getMetadata('pagecategory'),
      channel: getMetadata('channel'),
      contentType: getMetadata('content_type'),
      pageUid: getMetadata('pageuid'),
      pageName: getMetadata('pagename'),
      pageFirstPub: formatDate(firstPubDateStr),
      pageLastMod: formatDate(lastPubDateStr),
      webpackage: '',
    },
  };

  window.wbgData.site = {
    siteInfo: {
      siteLanguage: getLanguage() || 'en',
      siteType: config.analyticsSiteType || 'main',
      siteEnv: config.environment || 'Dev',
    },

    techInfo: {
      cmsType: config.analyticsCmsType || 'aem edge',
      bussVPUnit: config.analyticsBussvpUnit || 'ecr',
      bussUnit: config.analyticsBussUnit || 'ecrcc',
      bussUserGroup: config.analyticsBussUserGroup || 'external',
      bussAgency: config.analyticsBussAgency || 'ibrd',
    },
  };
}

/**
 * Decorates Dynamic Media images by modifying their URLs to include specific parameters
 * and creating a <picture> element with different sources for different image formats and sizes.
 *
 * @param {HTMLElement} main - The main container element that includes the links to be processed.
 */
export function decorateDMImages(main) {
  main.querySelectorAll('a[href^="https://delivery-p"]').forEach((a) => {
    const url = new URL(a.href.split('?')[0]);
    if (url.hostname.endsWith('.adobeaemcloud.com')) {
      const pictureEl = picture(
        source({ srcset: `${url.href}?width=1400&quality=85&preferwebp=true`, type: 'image/webp', media: '(min-width: 992px)' }),
        source({ srcset: `${url.href}?width=1320&quality=85&preferwebp=true`, type: 'image/webp', media: '(min-width: 768px)' }),
        source({ srcset: `${url.href}?width=780&quality=85&preferwebp=true`, type: 'image/webp', media: '(min-width: 320px)' }),
        source({ srcset: `${url.href}?width=1400&quality=85`, media: '(min-width: 992px)' }),
        source({ srcset: `${url.href}?width=1320&quality=85`, media: '(min-width: 768px)' }),
        source({ srcset: `${url.href}?width=780&quality=85`, media: '(min-width: 320px)' }),
        img({ src: `${url.href}?width=1400&quality=85`, alt: a.innerText }),
      );
      a.replaceWith(pictureEl);
    }
  });
}

/**
 * remove the adujusts the auto images
 * @param {Element} main The container element
 */
function adjustAutoImages(main) {
  const pictureElement = main.querySelector('div > p > picture');
  if (pictureElement) {
    const pElement = pictureElement.parentElement;
    pElement.className = 'auto-image-container';
  }
}

/**
 * Return the placeholder file specific to language
 * @returns
 */
export async function fetchLanguagePlaceholders() {
  const langCode = getLanguage();
  try {
    // Try fetching placeholders with the specified language
    return await fetchPlaceholders(`${PATH_PREFIX}/${langCode}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error fetching placeholders for lang: ${langCode}. Will try to get en placeholders`, error);
    // Retry without specifying a language (using the default language)
    try {
      return await fetchPlaceholders(`${PATH_PREFIX}/en`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error fetching placeholders:', err);
    }
  }
  return {}; // default to empty object
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
// eslint-disable-next-line no-unused-vars
function buildAutoBlocks(main) {
  try {
    adjustAutoImages(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateDMImages(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */

async function createSkipToMainNavigationBtn() {
  const placeholder = await fetchLanguagePlaceholders();
  const main = document.querySelector('main');
  main.id = 'main';

  const anchor = document.createElement('a');
  anchor.id = 'skip-to-main-content';
  anchor.className = 'visually-hidden focusable';
  anchor.href = '#main';
  anchor.textContent = placeholder.skipToMainContent || 'Skip to Main Content';
  document.body.insertBefore(anchor, document.body.firstChild);
}

/**
 * Translate 404 page
 * @returns
 */
export async function load404() {
  const main = document.querySelector('main');
  const placeholders = await fetchLanguagePlaceholders();
  const homelink = main.querySelector('p a');
  const searchForm = main.querySelector('form');
  main.querySelector('h1').innerText = placeholders.notFoundHeading || 'Page Not Found';
  main.querySelector('h2').innerText = placeholders.notFoundSubHeading || '404 Error';
  main.querySelector('h2 + p').innerText = placeholders.notFoundText || 'The page you requested could not be found. Try using the search box below or click on the homepage button to go there.';
  homelink.innerText = placeholders.notFoundBtnLabel || 'Go to homepage';
  homelink.title = placeholders.notFoundBtnLabel || 'Go to homepage';
  homelink.href = placeholders.logoUrl || '/';
  searchForm.action = placeholders.searchRedirectUrl || 'https://www.worldbank.org/en/search';
  searchForm.querySelector('input').placeholder = placeholders.searchVariable || 'Search worldbank.org';
  main.classList.remove('loading');
  return null;
}

async function loadEager(doc) {
  setPageLanguage();
  decorateTemplateAndTheme();
  await createSkipToMainNavigationBtn();
  await cookiePopUp();
  renderWBDataLayer();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Return the json for any placeholder file specific to language using filename as argument
 * @returns
 */
export const fetchLangDatabyFileName = async (fileName) => {
  const langCode = getLanguage();
  try {
    const response = await fetch(`${PATH_PREFIX}/${langCode}/${fileName}.json`);
    if (!response.ok) {
      throw new Error('Failed to load data');
    }
    const json = await response.json();
    return json.data || [];
  } catch (error) {
    return [];
  }
};

/**
 * Create section background image
 *
 * @param {*} doc
 */
function decorateSectionImages(doc) {
  const sectionImgContainers = doc.querySelectorAll('main .section[data-image]');
  sectionImgContainers.forEach((sectionImgContainer) => {
    const sectionImg = sectionImgContainer.dataset.image;
    const sectionTabImg = sectionImgContainer.dataset.tabImage;
    const sectionMobImg = sectionImgContainer.dataset.mobImage;
    let defaultImgUrl = null;

    const newPic = document.createElement('picture');
    if (sectionImg) {
      newPic.appendChild(createSource(sectionImg, 1920, '(min-width: 1024px)'));
      defaultImgUrl = sectionImg;
    }

    if (sectionTabImg) {
      newPic.appendChild(createSource(sectionTabImg, 1024, '(min-width: 768px)'));
      defaultImgUrl = sectionTabImg;
    }

    if (sectionMobImg) {
      newPic.appendChild(createSource(sectionTabImg, 600, '(max-width: 767px)'));
      defaultImgUrl = sectionMobImg;
    }

    const newImg = document.createElement('img');
    newImg.src = defaultImgUrl;
    newImg.alt = '';
    newImg.className = 'sec-img';
    newImg.loading = 'lazy';
    newImg.width = '768';
    newImg.height = '100%';

    if (defaultImgUrl) {
      newPic.appendChild(newImg);
      sectionImgContainer.prepend(newPic);
    }
  });
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  decorateSectionImages(doc);
  showCookieConsent();
  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();

  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
  import('./sidekick.js').then(({ initSidekick }) => initSidekick());
}

/**
 * Fetch filtered search results
 * @returns List of search results
 */
export async function fetchSearch() {
  window.searchData = window.searchData || {};
  if (Object.keys(window.searchData).length === 0) {
    const path = `${LANGUAGE_ROOT}/query-index.json?limit=500&offset=0`;

    const resp = await fetch(path);
    window.searchData = JSON.parse(await resp.text()).data;
  }
  return window.searchData;
}

async function loadPage() {
  window.wbgData ||= {};
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
