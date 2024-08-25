import {
  getMetadata
} from '../../scripts/aem.js';
import {
  loadFragment
} from '../fragment/fragment.js';
import {
  getLanguage
} from '../../scripts/scripts.js';

export default async function decorate(block) {
  // load nav as fragment
  const footerMeta = getMetadata('footer');
  const lang = getLanguage();
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : `/${lang}/footer`;
  const fragment = await loadFragment(footerPath);


  // decorate nav DOM
  block.textContent = '';
  const section = document.createElement('section');

  let Rows = fragment.firstElementChild.querySelectorAll('.columns-wrapper');
  let Classes = ['ft-social', 'ft-main', 'ft-legal'];
  [...Rows].forEach((Rowsdata, iRows) => {
      Rowsdata.className = Classes[iRows];

      let Columns = Rowsdata.querySelectorAll('[data-block-name="columns"] > div > div');

      [...Columns].forEach((Columnsdata) => {

          // Handling "a" tag.
          let ul = document.createElement('ul');
          let aContent = Columnsdata.querySelectorAll('div > p > a');
          [...aContent].forEach((Contentdata) => {
              let li = document.createElement("li");
              li.appendChild(Contentdata);
              ul.append(li)
          }); // aContent

          // Handling "picture" tag.
          let pictureContent = Columnsdata.querySelectorAll('div > picture');
          [...pictureContent].forEach((Contentdata) => {
              let li = document.createElement("li");
              li.appendChild(Contentdata);
              ul.append(li);
          })

          // Handline "p" tag.
          let pContent = Columnsdata.querySelectorAll('div > p');
          [...pContent].forEach((Contentdata) => {
              if (Contentdata.textContent.trim()) {
                  let li = document.createElement("li");
                  li.appendChild(Contentdata);
                  ul.prepend(li)
              }
          }); // pContent

          switch (Rowsdata.className) {
              case 'ft-social':
                  let socialList = document.createElement('div');
                  socialList.className = 'ft-social-list';
                  socialList.appendChild(ul)
                  Rowsdata.append(socialList)
                  break;

              case 'ft-main':
                  let mainList = document.createElement('div');
                  mainList.className = 'ft-main-item';
                  mainList.appendChild(ul)
                  Rowsdata.append(mainList)
                  break;

              case 'ft-legal':
                  let legalList = document.createElement('div');
                  legalList.className = 'ft-legal-list';
                  legalList.appendChild(ul)
                  Rowsdata.append(legalList)
                  break;

              case 'default':
                  break;
          }
      });

      Rowsdata.removeChild(Rowsdata.firstElementChild)
      section.append(Rowsdata)
  });
  block.append(section);
}