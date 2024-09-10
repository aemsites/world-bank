import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import createSlider from '../../scripts/slider.js';

export default function decorate(block) {
  let i = 0;
  const ul = document.createElement('ul');
  const divtag = document.createElement('div');
  [...block.children].forEach((row) => {
    if (i > 3) {
      const li = document.createElement('li');
      moveInstrumentation(row, li);
      while (row.firstElementChild) li.append(row.firstElementChild);
      [...li.children].forEach((div) => {
        if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
        else div.className = 'cards-card-body';
      });
      ul.append(li);
    } else if (i <= 3) {
      if (row.firstElementChild.firstElementChild) {
        divtag.append(row.firstElementChild.firstElementChild);
      }
      if (row.firstElementChild) {
        divtag.append(row.firstElementChild.firstElementChild || '');
      }
      divtag.className = 'default-content-wrapper';
    }
    i += 1;
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.parentNode.parentNode.prepend(divtag);
  block.append(ul);
  createSlider(block);
}
