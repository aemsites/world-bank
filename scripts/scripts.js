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
} from './aem.js';

import {
  getLanguage,
  createSource,
} from './utils.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list
export const CLASS_MAIN_HEADING = 'main-heading';

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

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks() {
  try {
    // TODO: add auto block, if needed
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
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */

function createSkipToMainNavigationBtn() {
  const main = document.querySelector('main');
  main.id = 'main';

  const anchor = document.createElement('a');
  anchor.tabIndex = 0;
  anchor.id = 'skip-to-main-content';
  anchor.className = 'visually-hidden focusable';
  anchor.href = '#main';
  anchor.textContent = 'Skip to Main Navigation';
  document.body.insertBefore(anchor, document.body.firstChild);
}

async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  createSkipToMainNavigationBtn();
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
 * Return the placeholder file specific to language
 * @returns
 */
export async function fetchLanguagePlaceholders() {
  const langCode = getLanguage();
  try {
    // Try fetching placeholders with the specified language
    return await fetchPlaceholders(`/${langCode}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error fetching placeholders for lang: ${langCode}. Will try to get en placeholders`, error);
    // Retry without specifying a language (using the default language)
    try {
      return await fetchPlaceholders('/en');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error fetching placeholders:', err);
    }
  }
  return {}; // default to empty object
}

/**
 * Return the json for any placeholder file specific to language using filename as argument
 * @returns
 */
export const fetchLangDatabyFileName = async (fileName) => {
  const langCode = getLanguage();
  try {
    const response = await fetch(`/${langCode}/${fileName}.json`);
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

    const picture = document.createElement('picture');
    if (sectionImg) {
      picture.appendChild(createSource(sectionImg, 1920, '(min-width: 1024px)'));
      defaultImgUrl = sectionImg;
    }

    if (sectionTabImg) {
      picture.appendChild(createSource(sectionTabImg, 1024, '(min-width: 768px)'));
      defaultImgUrl = sectionTabImg;
    }

    if (sectionMobImg) {
      picture.appendChild(createSource(sectionTabImg, 600, '(max-width: 767px)'));
      defaultImgUrl = sectionMobImg;
    }

    const img = document.createElement('img');
    img.src = defaultImgUrl;
    img.alt = '';
    img.className = 'sec-img';
    img.loading = 'lazy';
    img.width = '768';
    img.height = '100%';

    if (defaultImgUrl) {
      picture.appendChild(img);
      sectionImgContainer.prepend(picture);
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
    const lang = getLanguage();
    const path = `/${lang}/query-index.json?limit=500&offset=0`;

    const resp = await fetch(path);
    window.searchData = JSON.parse(await resp.text()).data;
  }
  return window.searchData;
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
