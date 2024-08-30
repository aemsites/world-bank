import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
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
  // Style and append the heading to the main container
  const heading = block.querySelector('.mini-cards > div:first-child');
  heading.classList.add('heading');

  // Select all cards except the first child (heading)
  const cards = block.querySelectorAll('.mini-cards > div:nth-child(n+2)');
  const miniCardsContainer = div({ class: 'mini-card-container' });
  cards.forEach((row) => {
    row.className = 'mini-card';
    const [imageDiv, tagDiv, titleDiv, dateDiv, timeDiv, locationDiv, linkDiv] = row.children;
    imageDiv.className = 'mini-card-image';
    tagDiv.className = 'mini-card-tag';
    titleDiv.className = 'mini-card-title';
    dateDiv.className = 'mini-card-date';
    timeDiv.className = 'mini-card-time';
    locationDiv.className = 'mini-card-location';
    const link = linkDiv.textContent ? linkDiv.textContent : '';
    linkDiv.remove();
    if (!timeDiv.textContent) {
      timeDiv.remove();
    }
    if (tagDiv) {
      processTag(tagDiv);
    }
    const text = div({ class: 'mc-text-wrapper' }, tagDiv, a({ href: link }, titleDiv), div({ class: 'date-time-info' }, dateDiv, timeDiv.textContent ? timeDiv : ''), locationDiv);
    row.append(text, imageDiv);
    miniCardsContainer.append(row);
  });

  block.append(miniCardsContainer);
  // Optimize images
  block.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
}
