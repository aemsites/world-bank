import { fetchSearch, LANGUAGE_ROOT } from '../../scripts/scripts.js';
import {
  ol, li, a, span,
} from '../../scripts/dom-helpers.js';

export default async function decorate(block) {
  const results = await fetchSearch();
  const regex = '^/(.*?)/?$';
  const pathSegments = window.location.pathname.replace(regex, '$1').split('/');
  const list = ol({ class: 'breadcrumb', itemtype: 'https://schema.org/BreadcrumbList', itemscope: '' });
  const { origin } = window.location;
  let pagePath = '';
  let metaContent = 1;
  pathSegments.forEach((page) => {
    pagePath += page;
    const crumb = li({
      class: 'crumb', itemprop: 'itemListElement', itemscope: '', itemtype: 'https://schema.org/ListItem',
    });
    // This condition is for homepage path
    if (!pagePath) {
      const href = `${origin}${LANGUAGE_ROOT}/home`;
      const homeSvg = `${window.hlx.codeBasePath}/icons/home.svg`;
      // TODO:localize the title and alt
      const homeLink = `<a itemprop='item' href='${href}' title='Home'><img itemprop='image'
        src='${homeSvg}' alt='Home'></img></a><meta itemprop='position' content='${metaContent}'/>`;
      crumb.innerHTML = homeLink;
      const pipelineSymbol = span({ class: 'breadcrumb-separator' });
      crumb.append(pipelineSymbol);
      list.append(crumb);
    } else {
      const pageObj = results.filter((item) => item.path === pagePath);
      if (pageObj && pageObj.length === 1) {
        metaContent += 1;
        const pageInfo = pageObj[0];
        const label = pageInfo.navTitle ? pageInfo.navTitle : pageInfo.title;
        if (pageInfo.path !== window.location.pathname) {
          const labelElement = span({ itemprop: 'name' }, label);
          const anchor = a({
            class: 'breadcrumb',
            href: origin + pagePath,
            title: label,
            itemprop: 'item',
          }, labelElement);
          crumb.append(anchor);
          const meta = document.createElement('meta');
          // Using setAttribute because meta.itemprop is not working to set itemprop attribute.
          meta.setAttribute('itemprop', 'position');
          meta.setAttribute('content', metaContent);
          crumb.append(meta);
          const pipelineSymbol = span({
            class: 'breadcrumb-separator',
          });
          crumb.append(pipelineSymbol);
          list.append(crumb);
        }
      }
    }
    pagePath = `${pagePath}/`;
  });
  block.innerHTML = list.outerHTML;
}
