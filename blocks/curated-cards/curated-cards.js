import { createOptimizedPicture, toCamelCase } from '../../scripts/aem.js';
import { moveInstrumentation, fetchLanguagePlaceholders } from '../../scripts/scripts.js';
import {
  p, h1, div, a, li, ul, picture, img,
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
    div({ class: ' feature-card-content-text' }, a({ href: featureLink.textContent }, h1({ class: 'feature-card-content-heading' }, featureHeadingContent.textContent), p({ class: 'feature-card-content-description' }, featureDescContent.textContent))),
    div({ class: ' feature-card-link' }, a({ href: featureLink.textContent, class: 'button' }, placeHolders[toCamelCase(FEATURE_BTN_LABEL)] || 'Read More Story')),
  );
  const pictureElement = featureImageContent.querySelector('picture');
  if (pictureElement) {
    featureDiv.append(pictureElement);
  } else {
    featureDiv.append(picture({}, img({ style: 'height: 500px;', alt: 'Imgae cannot be empty' })));
  }
  featureDiv.append(featureContentWrapper);
  return featureDiv;
}

// Processes a row to create a list item
function processRow(row) {
  const [imageContent, alttext, tagContent, headingContent, decsDiv, linkDiv] = row.children;
  const liTag = li();
  moveInstrumentation(row, liTag);
  const textWrapper = div({ class: 'curated-cards-card-text-wrapper' });
  const imageDiv = div({ class: 'curated-cards-card-img' });
  const tagElement = div({ class: 'curated-cards-card-event' });
  const heading = p();
  const link = linkDiv.textContent ? linkDiv.textContent : '';
  linkDiv.remove();
  decsDiv.remove();

  if (tagContent) {
    processTag(tagElement, tagContent);
  }

  if (imageContent) {
    imageDiv.innerHTML = imageContent.innerHTML;
    if (alttext) {
      const pic = imageDiv.querySelector('img');
      pic.alt = alttext.querySelector('p').textContent.trim();
      alttext.remove();
    }
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
    ulElement.querySelectorAll('picture > img').forEach((imgVar) => {
      const optimizedPic = createOptimizedPicture(imgVar.src, imgVar.alt, false, [{ width: '250' }]);
      const newPic = optimizedPic.querySelector('img');
      moveInstrumentation(imgVar, newPic);
      newPic.width = 200;
      newPic.height = 150;
      imgVar.closest('picture').replaceWith(optimizedPic);
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
