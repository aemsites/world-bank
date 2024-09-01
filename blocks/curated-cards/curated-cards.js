import { createOptimizedPicture, toCamelCase } from '../../scripts/aem.js';
import { moveInstrumentation, fetchLanguagePlaceholders } from '../../scripts/scripts.js';
import {
  p, button, div, a, li, ul,
} from '../../scripts/dom-helpers.js';
import { processTags } from '../../scripts/utils.js';

const FEATURE_BTN_LABEL = 'curated-banner-button-label';

function processTag(tagdiv, tagAuthored) {
  let tagValue = tagAuthored.innerText;
  if (tagValue) {
    tagValue = processTags(tagValue, 'content-type');
    tagdiv.textContent = tagValue;
  }
}

// Creates a feature card element with its content
function createFeatureCard(row, placeHolders) {
  const [
    featureImageContent,
    featureTagContent,
    featureHeadingContent,
    featureDescContent,
    featureLink,
  ] = row.children;
  const featureDiv = div({ class: 'feature-card' });
  moveInstrumentation(row, featureDiv);
  featureTagContent.innerHTML = '';
  const featureContentWrapper = div(
    { class: 'feature-card-content' },
    p({ class: 'feature-card-content-heading' }, featureHeadingContent.textContent),
    p({ class: 'feature-card-content-description' }, featureDescContent.textContent),
    a({ href: featureLink.textContent }, button({ type: 'button' }, placeHolders[toCamelCase(FEATURE_BTN_LABEL)] || 'Read More Story')), // TODO button label approach
  );
  const pictureElement = featureImageContent.querySelector('picture');
  if (pictureElement) {
    featureDiv.append(pictureElement);
  }
  featureDiv.append(featureContentWrapper);
  return featureDiv;
}

// Processes a row to create a list item
function processRow(row) {
  const [imageContent, tagContent, headingContent, linkDiv] = row.children;
  const liTag = li();
  moveInstrumentation(row, liTag);
  const textWrapper = div({ class: 'curated-cards-card-text-wrapper' });
  const imageDiv = div({ class: 'curated-cards-card-img' });
  const tagElement = div({ class: 'curated-cards-card-event' });
  const heading = p();
  const link = linkDiv.textContent ? linkDiv.textContent : '';
  linkDiv.remove();

  if (tagContent) {
    processTag(tagElement, tagContent);
  }

  if (imageContent) {
    imageDiv.innerHTML = imageContent.innerHTML;
  }

  if (headingContent) {
    heading.textContent = headingContent.textContent;
  }

  textWrapper.append(a({ href: link }, heading), tagElement);
  liTag.append(imageDiv, textWrapper);

  row.innerHTML = '';
  return liTag;
}

// Main function to decorate the block
export default async function decorate(block) {
  const ulElement = ul();
  const curatedCardsInputList = Array.from(block.children);
  const listOfAllPlaceholdersData = await fetchLanguagePlaceholders();

  if (curatedCardsInputList.length > 0) {
    const featureCard = createFeatureCard(curatedCardsInputList[0], listOfAllPlaceholdersData);

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
