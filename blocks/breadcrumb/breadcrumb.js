import { getMetadata } from '../../scripts/aem.js';

export default async function decorate(block) {
  const regex = '^/(.*?)/?$';
  const toTitleCase = (phrase) => (
    phrase
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace(/-/g, ' ')
  );

  const pathSegments = window.location.pathname.replace(regex, '$1').split('/');
  pathSegments.pop(); // Current Breadcrumb value comes from page title.

  const list = document.createElement('ol');
  list.className = 'breadcrumb';
  let segments = window.location.origin;

  pathSegments.forEach((page, index) => {
    segments += (index !== pathSegments.length - 1) ? `${page}/` : `${page}`;
    const crumb = document.createElement('li');
    crumb.className = 'crumb';
    if (!page) {
      const homeSvg = `${window.hlx.codeBasePath}/icons/home.svg`;
      const homeLink = `<a href='${segments}' title='Home'><img src='${homeSvg}' alt='Home'>
                                      </img></a>`;
      crumb.innerHTML = homeLink;
    } else {
      const label = toTitleCase(page);
      const anchor = document.createElement('a');
      const anchorText = document.createTextNode(label);
      anchor.appendChild(anchorText);
      anchor.href = segments;
      anchor.title = label;
      crumb.append(anchor);
    }
    list.append(crumb);
  });

  const navTitle = getMetadata('og:title');
  const crumb = document.createElement('li');
  const navTitleEl = document.createTextNode(navTitle);
  crumb.appendChild(navTitleEl);
  list.append(crumb);
  block.innerHTML = list.outerHTML;
}
