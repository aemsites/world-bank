import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation, CLASS_MAIN_HEADING } from '../../scripts/scripts.js';
import { a, div } from '../../scripts/dom-helpers.js';
import { processTags } from '../../scripts/utils.js';

function processTag(tag) {
  let tagTxt = tag.innerText;
  if (tagTxt) {
    tagTxt = processTags(tagTxt, 'content-type');
    tag.classList.add(tagTxt);
    // TODO: Read it from placeholder
    tag.firstElementChild.innerText = tagTxt;
  }
}

export default function decorate(block) {
  const [heading, ...cards] = [...block.children];
  if (heading) {
    heading.classList.add(CLASS_MAIN_HEADING);
  }
  const miniCardsContainer = div({ class: 'mini-card-container' });
  cards.forEach((row) => {
    row.className = 'mini-card';
    const [imageDiv, alt, tagDiv, titleDiv, dateDiv, timeDiv, locationDiv, linkDiv] = row.children;
    imageDiv.className = 'mini-card-image';
    tagDiv.className = 'mini-card-tag';
    titleDiv.className = 'mini-card-title';
    dateDiv.className = 'mini-card-date';
    timeDiv.className = 'mini-card-time';
    locationDiv.className = 'mini-card-location';
    const link = linkDiv.textContent ? linkDiv.textContent : '';
    if (alt) {
      const pic = imageDiv.querySelector('img');
      pic.alt = alt.querySelector('p').textContent.trim();
      alt.remove();
    }
    linkDiv.remove();
    if (!timeDiv.textContent) {
      timeDiv.remove();
    }
    if (tagDiv) {
      processTag(tagDiv);
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
