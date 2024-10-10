import { toCamelCase } from '../../scripts/aem.js';
import { moveInstrumentation, fetchLanguagePlaceholders } from '../../scripts/scripts.js';
import {
  p, h1, div, a, li, ul, picture, img,
} from '../../scripts/dom-helpers.js';
import { processTags, dynamicMediaAssetProcess } from '../../scripts/utils.js';

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

function updateDMImage(pictureElement, dmImageContent) {
  const useSmartCrop = dmImageContent.querySelector('p:nth-child(2)')?.textContent.trim() || '';
  const queryParams = dmImageContent.querySelector('p:nth-child(3')?.textContent.trim() || '';
  if (pictureElement) {
    // add query params to the image urls
    if (queryParams.length > 0) {
      Array.from(pictureElement.children).forEach((child) => {
        const baseUrl = child.tagName === 'SOURCE' ? child.srcset.split('?')[0] : child.src.split('?')[0];
        if (child.tagName === 'SOURCE' && child.srcset) {
          child.srcset = `${baseUrl}?${queryParams}`;
        } else if (child.tagName === 'IMG' && child.src) {
          child.src = `${baseUrl}?${queryParams}`;
        }
      });
    }
    // add smartcrop query param based on viewport
    if (useSmartCrop === 'true') {
      const viewportWidth = window.innerWidth;
      let smartcropValue;
      if (viewportWidth > 1024) {
        smartcropValue = 'desktop';
      } else if (viewportWidth > 768) {
        smartcropValue = 'tablet';
      } else {
        smartcropValue = 'mobile';
      }
      Array.from(pictureElement.children).forEach((child) => {
        const baseUrl = child.tagName === 'SOURCE' ? child.srcset : child.src;
        const separator = baseUrl.includes('?') ? '&' : '?';
        if (child.tagName === 'SOURCE' && child.srcset) {
          child.srcset = `${baseUrl}${separator}smartcrop=${smartcropValue}`;
        } else if (child.tagName === 'IMG' && child.src) {
          child.src = `${baseUrl}${separator}smartcrop=${smartcropValue}`;
        }
      });
    }
  }
}

// Creates a feature card element with its content
function createFeatureCard(row, placeHolders) {
  const [
    useDM,
    featureImageContent,
    dmImageContent,
    featureTagContent,
    featureHeadingContent,
    featureDescContent,
    featureLink,
  ] = row.children;
  const featureDiv = div({ class: 'feature-card' });
  moveInstrumentation(row, featureDiv);
  featureTagContent.innerHTML = ''; // why are we dumping the tag content?
  const featureContentWrapper = div(
    { class: 'feature-card-content' },
    div(
      { class: 'feature-card-content-text' },
      a(
        { href: featureLink.textContent },
        h1({ class: 'feature-card-content-heading' }, featureHeadingContent.textContent),
        p({ class: 'feature-card-content-description' }, featureDescContent.textContent),
      ),
    ),
    div(
      { class: 'feature-card-link' },
      a(
        { href: featureLink.textContent, class: 'button' },
        placeHolders[toCamelCase(FEATURE_BTN_LABEL)] || 'Read More Story',
      ),
    ),
  );

  let pictureElement;
  if (useDM.textContent.trim() === '') {
    pictureElement = featureImageContent.querySelector('picture');
  } else {
    pictureElement = dmImageContent.querySelector('picture');
    updateDMImage(pictureElement, dmImageContent);
  }
  // Append image or a fallback placeholder if no pictureElement is found
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
  const [useDM, imageContent, dmImage, tagContent, headingContent, decsDiv, linkDiv] = row.children;
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

  if (useDM.textContent.trim() === '' && imageContent) {
    imageDiv.innerHTML = imageContent.innerHTML;
  } else {
    const dmPicture = dmImage.querySelector('picture');
    updateDMImage(dmPicture, dmImage);
    imageDiv.innerHTML = dmPicture.outerHTML;
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
