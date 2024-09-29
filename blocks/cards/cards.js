import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  [...ul.children].forEach((li) => {
    const a = document.createElement('a');
    const imgDiv = li.querySelector('.cards-card-image');
    const h3link = li.querySelector('.cards-card-body h3:first-child a');
    if (imgDiv && h3link) {
      a.href = h3link.href;
      const pic = imgDiv.querySelector('picture');
      if (pic) {
        a.append(pic);
        imgDiv.prepend(a);
      }
    }
  });

  block.textContent = '';
  block.append(ul);
}
