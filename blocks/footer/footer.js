import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { getLanguage } from '../../scripts/scripts.js';

/**
 * Switch block handler
 * @param {HTML} ClassName The container
 * @param {HTML} ul The content pass in a parent class
 */
function switchBlock(className, ul) {
  const listName = document.createElement('div');
  listName.className = className;
  listName.appendChild(ul);
  return listName;
}

/**
 * Add <img> for icon, prefixed with codeBasePath and optional prefix.
 * @param {Element} [span] span element with icon classes
 */
function addAttributes(span, prefix = '') {
  const iconName = Array.from(span.classList)
    .find((c) => c.startsWith('icon-'))
    .substring(5);
  const img = document.createElement('img');
  img.dataset.iconName = iconName;
  img.src = `${window.hlx.codeBasePath}${prefix}/icons/${iconName}.svg`;
  img.alt = iconName;
  img.title = iconName;
  img.loading = 'lazy';
  span.append(img);
}

/**
 * Images / Icons Handler
 * @param {Element} [element] Element containing icons
 */
function addElementProperties(element) {
  const icons = [...element.querySelectorAll('span.icon')];
  icons.forEach((span) => {
    addAttributes(span);
    span.removeChild(span.firstElementChild);
  });
}

/**
 * Add anchor tag & properties for logo.
 * @param {Element} [element] Element containing icons
*/
function addAnchorTag(element) {
  const anchorLink = document.createElement('a');
  const logoImage = element.querySelector('img');
  anchorLink.href = '';
  anchorLink.title = logoImage.alt;
  anchorLink.appendChild(element);
  return anchorLink;
}

/**
 * HTML handler
 * @param {HTML} ClassName The container
 * @param {HTML} ul The content pass in a parent class
 */
function htmlParser(htmlObj, ul, prepend = '') {
  [...htmlObj].forEach((Contentdata) => {
    addElementProperties(Contentdata);

    const li = document.createElement('li');
    if (Contentdata.tagName === 'PICTURE') {
      const pictureTagHandler = addAnchorTag(Contentdata);
      li.appendChild(pictureTagHandler);
    } else {
      li.appendChild(Contentdata);
    }

    if (prepend) {
      if (Contentdata.textContent.trim()) {
        ul.prepend(li);
      }
    } else {
      ul.append(li);
    }
  });
}

export default async function decorate(block) {
  // load nav as fragment
  const footerMeta = getMetadata('footer');
  const lang = getLanguage();
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : `/${lang}/footer`;
  const fragment = await loadFragment(footerPath);

  // decorate nav DOM
  block.textContent = '';
  const section = document.createElement('section');

  const Rows = fragment.firstElementChild.querySelectorAll('.columns-wrapper');
  const Classes = ['ft-social', 'ft-main', 'ft-legal'];
  [...Rows].forEach((Rowsdata, iRows) => {
    Rowsdata.className = Classes[iRows];
    const Columns = Rowsdata.querySelectorAll('[data-block-name="columns"] > div > div');
    [...Columns].forEach((Columnsdata) => {
      // Handling "a" tag.
      const ul = document.createElement('ul');
      const anchorTagContent = Columnsdata.querySelectorAll('div > p > a');
      htmlParser(anchorTagContent, ul);

      // Handling "picture" tag.
      const pictureTagContent = Columnsdata.querySelectorAll('div > picture');
      htmlParser(pictureTagContent, ul);

      // Handline "p" tag.
      const pTagContent = Columnsdata.querySelectorAll('div > p');
      htmlParser(pTagContent, ul, 'prepend');

      switch (Rowsdata.className) {
        case 'ft-social':
          Rowsdata.append(switchBlock('ft-social-list', ul));
          break;
        case 'ft-main':
          Rowsdata.append(switchBlock('ft-main-item', ul));
          break;
        case 'ft-legal':
          Rowsdata.append(switchBlock('ft-legal-list', ul));
          break;
        default:
      }
    });
    Rowsdata.removeChild(Rowsdata.firstElementChild);
    section.append(Rowsdata);
  });
  block.append(section);
}
