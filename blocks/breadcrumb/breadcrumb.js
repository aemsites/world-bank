import { fetchSearch, LANGUAGE_ROOT } from '../../scripts/scripts.js';
import {
  ol, li, a, span,
} from '../../scripts/dom-helpers.js';
import { getMetadata } from '../../scripts/aem.js';

/**
 * Get label for the current page. If page does not exist in search index, get the label
 * from og:title metadata or else get it from the page url in title case format.
 * @param {*} searchIndex
 * @returns label
 */
const getCurrentPageLabel = (searchIndex) => {
  const currentPagePath = window.location.pathname;
  let label = '';
  const pageObj = searchIndex.filter((item) => item.path === currentPagePath);
  if (pageObj && pageObj.length === 1) {
    label = pageObj[0].navTitle ? pageObj[0].navTitle : pageObj[0].title;
    if (label) {
      return label;
    }
  }
  label = getMetadata('og:title');
  if (label) {
    return label;
  }
  const currentPageName = currentPagePath.split('/').pop();
  return currentPageName.toLowerCase().split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    .replace(/-/g, ' ');
};

export default async function decorate(block) {
  const results = await fetchSearch();
  const regex = '^/(.*?)/?$';
  const pathSegments = window.location.pathname.replace(regex, '$1').split('/');
  const list = ol({ class: 'breadcrumb' });
  const { origin } = window.location;
  let pagePath = '';
  pathSegments.forEach((page) => {
    pagePath += page;
    const crumb = li({ class: 'crumb' });
    // This condition is for homepage path
    if (!pagePath) {
      const href = `${origin}${LANGUAGE_ROOT}/home`;
      const homeSvg = `${window.hlx.codeBasePath}/icons/home.svg`;
      // TODO:localize the title and alt
      const homeLink = `<a href='${href}' title='Home'><img src='${homeSvg}' alt='Home'>
                                      </img></a>`;
      crumb.innerHTML = homeLink;
      const pipelineSymbol = span({ class: 'breadcrumb-separator' });
      crumb.append(pipelineSymbol);
      list.append(crumb);
    } else {
      const pageObj = results.filter((item) => item.path === pagePath);
      if (pageObj && pageObj.length === 1) {
        const pageInfo = pageObj[0];
        const label = pageInfo.navTitle ? pageInfo.navTitle : pageInfo.title;
        if (pageInfo.path !== window.location.pathname) {
          const anchor = a({
            class: 'breadcrumb',
            href: origin + pagePath,
            title: label,
          }, label);
          crumb.append(anchor);
          const pipelineSymbol = span({
            class: 'breadcrumb-separator',
          });
          crumb.append(pipelineSymbol);
        }
        list.append(crumb);
      }
    }
    pagePath = `${pagePath}/`;
  });
  const currentPageLabel = getCurrentPageLabel(results);
  const navTitleEl = document.createTextNode(currentPageLabel);
  const crumb = li({ class: 'crumb' });
  crumb.appendChild(navTitleEl);
  list.append(crumb);
  block.innerHTML = list.outerHTML;
}
