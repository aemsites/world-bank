import { createOptimizedPicture, toCamelCase } from '../../scripts/aem.js';
import { moveInstrumentation, fetchLanguagePlaceholders } from '../../scripts/scripts.js';
import {
  p, h1, div, a, li, ul, picture, img,
} from '../../scripts/dom-helpers.js';
import { processTags } from '../../scripts/utils.js';

const FEATURE_BTN_LABEL = 'curated-banner-button-label';
const MORE_TOP_STORY = 'more-top-story-label';
const listOfAllPlaceholdersData = await fetchLanguagePlaceholders();

function processTag(tagdiv, tagAuthored, placeholders) {
  let tagValue = tagAuthored.innerText;
  if (tagValue) {
    tagValue = processTags(tagValue, 'content-type');
    tagdiv.textContent = placeholders[toCamelCase(tagValue)] || tagValue;
  }
}

// Creates a feature card element with its content
function createFeatureCard(row, placeHolders) {
  const [
    featureImageContent,
    featureAltContent,
    featureQueryParams,
    featureTagContent,
    featureHeadingContent,
    featureDescContent,
    featureLink,
  ] = row.children;
  const featureDiv = div({ class: 'feature-card' });
  moveInstrumentation(row, featureDiv);
  featureTagContent.innerHTML = '';
  if (featureAltContent) {
    const pic = featureImageContent.querySelector('img');
    if (pic) {
      pic.alt = featureAltContent.textContent.trim();
    }
    featureAltContent.innerHTML = '';
  }
  const featureContentWrapper = div(
    { class: 'feature-card-content' },
    div({ class: ' feature-card-content-text' }, a({ href: featureLink.textContent }, h1({ class: 'feature-card-content-heading' }, featureHeadingContent.textContent), p({ class: 'feature-card-content-description' }, featureDescContent.textContent))),
    div({ class: ' feature-card-link' }, a({ href: featureLink.textContent, class: 'button' }, placeHolders[toCamelCase(FEATURE_BTN_LABEL)] || 'Read More Story')),
  );
  const pictureElement = featureImageContent.querySelector('picture');
  if (featureQueryParams) {
    const pic = pictureElement.querySelector('img');
    const baseUrl = pic.src.split('?')[0]; // Get the base URL without query params
    if (pic) {
      pic.src = `${baseUrl}?${featureQueryParams.textContent}`;
    }
  }
  if (pictureElement) {
    featureDiv.append(pictureElement);
  } else {
    featureDiv.append(picture({}, img({ style: 'height: 500px;', alt: 'Image cannot be empty' })));
  }
  featureDiv.append(featureContentWrapper);
  return featureDiv;
}

// Processes a row to create a list item
function processRow(row) {
  const [imageContent, tagContent, headingContent, decsDiv, linkDiv, alttext] = row.children;
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
    processTag(tagElement, tagContent, listOfAllPlaceholdersData);
  }

  if (imageContent) {
    imageDiv.innerHTML = imageContent.innerHTML;
    if (alttext) {
      const pic = imageDiv.querySelector('img');
      const para = alttext.querySelector('p');
      if (para && pic) {
        pic.alt = para.textContent.trim();
      }
      alttext.remove();
    }
  }

  if (headingContent) {
    heading.textContent = headingContent.textContent;
  }

  textWrapper.append(heading, tagElement);
  liTag.append(a({ href: link }, imageDiv, textWrapper));

  row.innerHTML = '';
  return liTag;
}

// Main function to decorate the block
export default async function decorate(block) {
  const ulElement = ul();
  const curatedCardsInputList = Array.from(block.children);

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
          div({ class: 'line-text' }, listOfAllPlaceholdersData[toCamelCase(MORE_TOP_STORY)] || 'MORE TOP STORIES'),
          div({ class: 'line' }),
        ),
        ulElement,
      ),
    );
  }
}
