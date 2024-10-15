import { createOptimizedPicture, toClassName } from '../../scripts/aem.js';
import { moveInstrumentation, CLASS_MAIN_HEADING } from '../../scripts/scripts.js';
import { a, div } from '../../scripts/dom-helpers.js';
import { processTags, getTaxonomy } from '../../scripts/utils.js';

async function processTag(tag) {
  const tagTxt = tag.innerText;
  if (tagTxt) {
    tag.classList.add(toClassName(processTags(tagTxt, 'content-type')));
    tag.firstElementChild.innerText = await getTaxonomy(tagTxt, 'content-type');
  }
}

export default function decorate(block) {
  const [heading, ...cards] = [...block.children];
  if (heading) {
    heading.classList.add(CLASS_MAIN_HEADING);
  }
  const miniCardsContainer = div({ class: 'mini-card-container' });
  cards.forEach(async (row) => {
    row.className = 'mini-card';
    const [imageDiv, tagDiv, titleDiv, dateDiv, timeDiv, locationDiv, linkDiv, alt] = row.children;
    imageDiv.className = 'mini-card-image';
    tagDiv.className = 'mini-card-tag';
    titleDiv.className = 'mini-card-title';
    dateDiv.className = 'mini-card-date';
    timeDiv.className = 'mini-card-time';
    locationDiv.className = 'mini-card-location';
    const link = linkDiv.textContent ? linkDiv.textContent : '';
    if (alt) {
      const pic = imageDiv.querySelector('img');
      const p = alt.querySelector('p');
      if (p && pic) {
        pic.alt = p.textContent.trim();
      }
      alt.remove();
    }
    linkDiv.remove();
    if (!timeDiv.textContent) {
      timeDiv.remove();
    }
    if (tagDiv) {
      await processTag(tagDiv);
    }
    const text = div({ class: 'mc-text-wrapper' }, tagDiv, a({ href: link }, titleDiv), div({ class: 'date-time-info' }, dateDiv, timeDiv.textContent ? timeDiv : ''), locationDiv);
    row.append(text, a({ href: link }, imageDiv));
    miniCardsContainer.append(row);
  });

  block.append(miniCardsContainer);
  // Optimize images
  block.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '250' }]);
    const newPic = optimizedPic.querySelector('img');
    newPic.width = 250;
    newPic.height = 150;
    moveInstrumentation(img, newPic);
    img.closest('picture').replaceWith(optimizedPic);
  });
}
