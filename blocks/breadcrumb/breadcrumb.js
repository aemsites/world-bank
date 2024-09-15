import { fetchSearch, createTag } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const results = await fetchSearch();
  const regex = '^/(.*?)/?$';
  const pathSegments = window.location.pathname.replace(regex, '$1').split('/');
  const list = createTag('ol', { class: 'breadcrumb' });
  const origin = window.location.origin;
  let pagePath = '';
  pathSegments.forEach((page) => {
    pagePath += page;
    const crumb = createTag('li', { class: 'crumb' });
    //This condition is for homepage path
    if (!pagePath) {
      const lang = '';
      //For homepage other than en, add language to homepage path
      if(document.documentElement.lang != 'en') {
        lang = '/' + document.documentElement.lang;
      }
      const homeSvg = `${window.hlx.codeBasePath}/icons/home.svg`;
      //TODO: localize the title and alt
      const homeLink = `<a href='${origin + lang}' title='Home'><img src='${homeSvg}' alt='Home'>
                                      </img></a>`;
      crumb.innerHTML = homeLink;
      const pipelineSymbol = createTag('span', {class: 'breadcrumb-separator'});
      crumb.append(pipelineSymbol);
      list.append(crumb);
    } else {
      const pageObj = results.filter(item => item.path == pagePath);
      if(pageObj && pageObj.length === 1) {
        const pageInfo = pageObj[0];
        const label = pageInfo.navTitle ? pageInfo.navTitle : pageInfo.title;
        if(pageInfo.path !== window.location.pathname) {
          const anchorText = document.createTextNode(label);
          const anchor = createTag('a', { class: 'breadcrumb', href: origin + pagePath, 
                title: label }, label);
          crumb.append(anchor);
          const pipelineSymbol = createTag('span', {class: 'breadcrumb-separator'});
          crumb.append(pipelineSymbol)
        } else {
          const navTitleEl = document.createTextNode(label);
          crumb.appendChild(navTitleEl);
        }
        list.append(crumb);
      }
    }
    pagePath = pagePath + '/';
  });
  block.innerHTML = list.outerHTML;
} 
