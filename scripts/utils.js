export const TAG_ROOT = 'world-bank:';
export const SUPPORTED_LANGUAGES = ['en', 'zh', 'ru', 'fr', 'es', 'ar'];
export const INTERNAL_PAGES = ['/footer', '/nav', '/fragments', '/data', '/drafts'];

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
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
      lang = 'en';
    }
  }
  return lang;
}

/**
 * Remove prefix from tag
 * @param {*} tag
 * @returns
 */
export function processTags(tag, prefix = '') {
  if (tag) {
    return tag.replace(TAG_ROOT, '').replace(`${prefix}/`, '');
  }
  return null;
}

/**
 * Add a link tag around img tag if image is following by a tag
 * @param {*} container
 */
export function decorateLinkedPictures(container) {
  [...container.querySelectorAll('picture + br + a')]
    .filter((a) => {
      try {
        // ignore domain in comparison
        return new URL(a.href).pathname;
      } catch (e) {
        return false;
      }
    })
    .forEach((a) => {
      const picture = a.previousElementSibling.previousElementSibling;
      picture.remove();
      const br = a.previousElementSibling;
      br.remove();
      const txt = a.innerHTML;
      a.innerHTML = picture.outerHTML;
      a.setAttribute('aria-label', txt);
      a.setAttribute('title', txt);
    });
}

/**
 *
 * Helper function to create a <source> element
 *
 * @returns imageSource
 */
export function createSource(src, width, mediaQuery) {
  const { pathname } = new URL(src, window.location.href);
  const source = document.createElement('source');
  source.type = 'image/webp';
  source.srcset = `${pathname}?width=${width}&format=webply&optimize=medium`;
  source.media = mediaQuery;

  return source;
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
  await window.navigationData[langCode];
}

export async function fetchData(url, method = 'GET', headers = {}, body = null) {
  try {
    const options = { method, headers: { ...headers } };
    if (method === 'POST' && body) { options.headers['Content-Type'] = 'application/json'; options.body = JSON.stringify(body); }
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error fetching data from ${url}:`, error);
    return null;
  }
}

/**
 * Returns the true of the current page in the browser.
 * If the page is running in a iframe with srcdoc,
 * the ancestor origin + the path query param is returned.
 * @returns {String} The href of the current page or the href of the block running in the library
 */
export function getHref() {
  if (window.location.href !== 'about:srcdoc') return window.location.href;

  const urlParams = new URLSearchParams(window.parent.location.search);
  return `${window.parent.location.origin}${urlParams.get('path')}`;
}

/*
 * Returns the environment type based on the hostname.
 */
export function getEnvType(hostname = window.location.hostname) {
  const fqdnToEnvType = {
    'worldbank.org': 'prod',
    'www.worldbank.org': 'prod',
    'main--aem-competency--aem-comp.hlx.page': 'prod',
    'main--aem-competency--aem-comp.hlx.live': 'prod',
  };
  return fqdnToEnvType[hostname] || 'dev';
}

/**
 * Check if a page is internal or not
 */
export function isInternalPage() {
  const pageUrl = getHref();
  // eslint-disable-next-line consistent-return
  INTERNAL_PAGES.forEach((element) => { if (pageUrl.indexOf(element) > 0) return true; });
  return false;
}

export function formatDate(dObjStr) {
  if (dObjStr) {
    const dObj = new Date(dObjStr);
    const yyyy = dObj.getFullYear();
    let mm = dObj.getMonth() + 1;
    let dd = dObj.getDate();

    if (dd < 10) dd = `0${dd}`;
    if (mm < 10) mm = `0${mm}`;

    const formatted = `${dd}-${mm}-${yyyy}`;
    return formatted;
  }
  return '';
}

/**
 * Gets the extension of a URL.
 * @param {string} url The URL
 * @returns {string} The extension
 * @private
 * @example
 * get_url_extension('https://example.com/foo.jpg');
 * // returns 'jpg'
 * get_url_extension('https://example.com/foo.jpg?bar=baz');
 * // returns 'jpg'
 * get_url_extension('https://example.com/foo');
 * // returns ''
 * get_url_extension('https://example.com/foo.jpg#qux');
 * // returns 'jpg'
 */
export function getUrlExtension(url) {
  return url.split(/[#?]/)[0].split('.').pop().trim();
}
