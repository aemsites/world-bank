import { fetchSearch } from '../../scripts/scripts.js';
import {
  ol, li, a, span,
} from '../../scripts/dom-helpers.js';

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
      let lang = '';
      // For homepage other than en, add language to homepage path
      if (document.documentElement.lang !== 'en') {
        lang = `/${document.documentElement.lang}`;
      }
      const homeSvg = `${window.hlx.codeBasePath}/icons/home.svg`;
      // TODO:localize the title and alt
      const homeLink = `<a href='${origin + lang}' title='Home'><img src='${homeSvg}' alt='Home'>
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
        } else {
          const navTitleEl = document.createTextNode(label);
          crumb.appendChild(navTitleEl);
        }
        list.append(crumb);
      }
    }
    pagePath = `${pagePath}/`;
  });
  block.innerHTML = list.outerHTML;
}
