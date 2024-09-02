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

const LCP_BLOCKS = []; // add your LCP blocks to the list
export const CLASS_MAIN_HEADING = 'main-heading';
export const TAG_ROOT = 'world-bank:category/';

let lang;

/**
 * Process current pathname and return details for use in language switching
 * Considers pathnames like /en/path/to/content and
 * /content/world-bank/global/en/path/to/content.html for both EDS and AEM
 */
export function getPathDetails() {
  const { pathname } = window.location;
  const isContentPath = pathname.startsWith('/content');
  const parts = pathname.split('/');
  const safeLangGet = (index) => (parts.length > index ? parts[index] : 'en');
  /* 4 is the index of the language in the path for AEM content paths like
     /content/world-bank/global/en/path/to/content.html
     1 is the index of the language in the path for EDS paths like /en/path/to/content
    */
  let langCode = isContentPath ? safeLangGet(4) : safeLangGet(1);
  // remove suffix from lang if any
  if (langCode.indexOf('.') > -1) {
    langCode = langCode.substring(0, langCode.indexOf('.'));
  }
  if (!langCode) langCode = 'en'; // default to en
  // substring before lang
  const prefix = pathname.substring(0, pathname.indexOf(`/${langCode}`)) || '';
  const suffix = pathname.substring(pathname.indexOf(`/${langCode}`) + langCode.length + 1) || '';
  return {
    prefix,
    suffix,
    langCode,
    isContentPath,
  };
}

/**
 * Fetch and return language of current page.
 * @returns language of current page
 */
export function getLanguage() {
  if (!lang) {
    lang = getPathDetails().langCode;
  }
  return lang;
}

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
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
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
 * Return the placeholder file specific to language
 * @returns
 */
export async function fetchLanguageNavigation(langCode) {
  window.navigationData = window.navigationData || {};

  if (!window.navigationData[langCode]) {
    window.navigationData[langCode] = new Promise((resolve) => {
      fetch(`${langCode}/navigation.json`)
        .then((resp) => (resp.ok ? resp.json() : {}))
        .then((json) => {
          window.navigationData[langCode] = json.data;
          resolve(window.navigationData[langCode]);
        })
        .catch(() => {
          window.navigationData[langCode] = {};
          resolve(window.navigationData[langCode]);
        });
    });
  }
  const navJsonData = await window.navigationData[langCode];
  return navJsonData;
}
/**
 * Return the json for any placeholder file specific to language using filename as argument
 * @returns
 */
export const fetchLangPlaceholderbyFileName = async (fileName) => {
  const langCode = getLanguage();
  try {
    const response = await fetch(`${langCode}/${fileName}.json`);
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
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

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

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
