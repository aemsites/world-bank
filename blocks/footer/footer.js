import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { getLanguage } from '../../scripts/utils.js';

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

  // Icon link analytics
  const iconLink = span.parentElement;
  iconLink.dataset.customlink = 'sm:footer';
  iconLink.dataset.text = iconName;
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
  const lang = getLanguage();
  const anchorLink = document.createElement('a');
  const logoImage = element.querySelector('img');
  anchorLink.href = `/${lang}`;
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
  [...htmlObj].forEach((contentValue) => {
    addElementProperties(contentValue);

    const li = document.createElement('li');
    if (contentValue.tagName === 'PICTURE') {
      const pictureTagHandler = addAnchorTag(contentValue);
      li.appendChild(pictureTagHandler);
    } else {
      li.appendChild(contentValue);
    }

    if (prepend) {
      if (contentValue.textContent.trim()) {
        ul.prepend(li);
      }
    } else {
      ul.append(li);
    }
  });
}

export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const lang = getLanguage();
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : `/${lang}/footer`;
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const section = document.createElement('section');
  section.className = 'default-content-wrapper section bg-primary-blue-90';

  const rows = fragment.firstElementChild.querySelectorAll('.columns-wrapper');
  const classes = ['ft-social', 'ft-main', 'ft-legal'];
  [...rows].forEach((rowValue, rowIndex) => {
    rowValue.className = classes[rowIndex];
    const columns = rowValue.querySelectorAll('.columns > div > div');
    [...columns].forEach((columnValue) => {
      // Handling "a" tag.
      const ul = document.createElement('ul');
      const anchorTag = columnValue.querySelectorAll('div > p > a');
      htmlParser(anchorTag, ul);

      // Handling "picture" tag.
      const pictureTag = columnValue.querySelectorAll('div > picture');
      htmlParser(pictureTag, ul);

      // Handline "p" tag.
      const pTag = columnValue.querySelectorAll('div > p');
      htmlParser(pTag, ul, 'prepend');

      switch (rowValue.className) {
        case 'ft-social':
          rowValue.append(switchBlock('ft-social-list', ul));
          break;
        case 'ft-main':
          rowValue.append(switchBlock('ft-main-item', ul));
          break;
        case 'ft-legal':
          rowValue.append(switchBlock('ft-legal-list', ul));
          break;
        default:
      }

      // Subscribe newsletter analytics
      if (rowValue.className === 'ft-main') {
        const subscribeLink = ul.querySelector('a[href*="newsletter"]');
        if (subscribeLink) {
          subscribeLink.dataset.form = 'world bank group newsletters::newsletter';
        }
      }
    });
    rowValue.removeChild(rowValue.firstElementChild);
    section.append(rowValue);
  });
  block.append(section);
}
