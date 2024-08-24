import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import {
  p, button, div, a, li, ul,
} from '../../scripts/dom-helpers.js';

// Creates a feature card element with its content
function createFeatureCard(row) {
  const [
    featureImageContent,
    featureTagContent,
    featureHeadingContent,
    featureDescContent,
    featureLink,
  ] = row.children;
  featureTagContent.innerHTML = '';
  const featureContentWrapper = div(
    { class: 'feature-card-content' },
    p({ class: 'feature-card-content-heading' }, featureHeadingContent.textContent),
    p({ class: 'feature-card-content-description' }, featureDescContent.textContent),
    a({ href: featureLink.textContent }, button({ type: 'button' }, 'Read the Story')), // TODO button label approach
  );

  const pictureElement = featureImageContent.querySelector('picture');
  return div({ class: 'feature-card' }, pictureElement, featureContentWrapper);
}

// Processes a row to create a list item
function processRow(row) {
  const [imageContent, tagContent, headingContent] = row.children;

  const liTag = li();
  const textWrapper = div({ class: 'curated-cards-card-text-wrapper' });
  const imageDiv = div({ class: 'curated-cards-card-img' });
  const tagElement = div({ class: 'curated-cards-card-event' });
  const heading = p();

  if (tagContent) {
    tagElement.textContent = tagContent.textContent.substring(11).trim();
  }

  if (imageContent) {
    imageDiv.innerHTML = imageContent.innerHTML;
  }

  if (headingContent) {
    heading.textContent = headingContent.textContent;
  }

  textWrapper.append(heading, tagElement);
  liTag.append(imageDiv, textWrapper);

  row.innerHTML = '';
  return liTag;
}

// Main function to decorate the block
export default function decorate(block) {
  const ulElement = ul();
  const curatedCardsInputList = Array.from(block.children);

  if (curatedCardsInputList.length > 0) {
    const featureCard = createFeatureCard(curatedCardsInputList[0]);

    for (let index = 1; index < curatedCardsInputList.length; index += 1) {
      const row = curatedCardsInputList[index];
      const liIndex = processRow(row);
      ulElement.appendChild(liIndex);
    }

    // Optimize images
    ulElement.querySelectorAll('picture > img').forEach((img) => {
      const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
      moveInstrumentation(img, optimizedPic.querySelector('img'));
      img.closest('picture').replaceWith(optimizedPic);
    });

    block.innerHTML = ''; // Clear all content

    block.append(
      featureCard,
      div(
        { class: 'curated-cards list' },
        div(
          { class: 'curated-cards-line-div' },
          div({ class: 'line-text' }, 'MORE TOP STORIES'),
          div({ class: 'line' }),
        ),
        ulElement,
      ),
    );
  }
}
