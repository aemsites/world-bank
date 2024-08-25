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
 * HTML handler
 * @param {HTML} ClassName The container
 * @param {HTML} ul The content pass in a parent class
 */
function htmlParser(htmlObj, ul, prepend = '') {
  [...htmlObj].forEach((Contentdata) => {
    const li = document.createElement('li');
    li.appendChild(Contentdata);
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
