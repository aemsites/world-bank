import { toCamelCase } from '../../scripts/aem.js';
import { moveInstrumentation, fetchLanguagePlaceholders } from '../../scripts/scripts.js';
import {
  p, div, a, li, ul,
} from '../../scripts/dom-helpers.js';
import { getTaxonomy } from '../../scripts/utils.js';

const MORE_TOP_STORY = 'more-top-story-label';
const listOfAllPlaceholdersData = await fetchLanguagePlaceholders();

async function processTag(tagdiv, tagAuthored) {
  const tagValue = tagAuthored.innerText;
  if (tagValue) {
    tagdiv.textContent = await getTaxonomy(tagValue, 'content-type');
  }
}

function removeSmartcropParam(queryParams) {
  return queryParams.split('&').filter((param) => !param.startsWith('smartcrop=')).join('&');
}

function updateDMImage(pictureElement, dmImageContent) {
  const useSmartCrop = dmImageContent.querySelector('p:nth-child(2)')?.textContent.trim() || '';
  const queryParams = dmImageContent.querySelector('p:nth-child(3)')?.textContent.trim() || '';

  if (!pictureElement) return;
  const updatedQueryParams = queryParams.length > 0 ? removeSmartcropParam(queryParams) : '';

  let smartcropValue = '';
  if (useSmartCrop === 'true') {
    const viewportWidth = window.innerWidth;
    if (viewportWidth > 1024) {
      smartcropValue = 'desktop';
    } else if (viewportWidth > 768) {
      smartcropValue = 'tablet';
    } else {
      smartcropValue = 'mobile';
    }
  }

  Array.from(pictureElement.children).forEach((child) => {
    const isSource = child.tagName === 'SOURCE';
    const baseUrl = isSource ? child.srcset.split('?')[0] : child.src.split('?')[0];
    const separator = baseUrl.includes('?') ? '&' : '?';
    let newUrl = baseUrl;
    if (updatedQueryParams) {
      newUrl = `${baseUrl}?${updatedQueryParams}`;
    }
    if (smartcropValue) {
      newUrl += `${separator}smartcrop=${smartcropValue}`;
    }
    if (isSource && child.srcset) {
      child.srcset = newUrl;
    } else if (child.src) {
      child.src = newUrl;
    }
  });
}

// Creates a feature card element with its content
function createFeatureCard(row) {
  const [
    useDM,
    featureImageContent,
    dmImageContent,
    featureTagContent,
    featureHeadingContent,
    featureDescContent,
    featureLink,
    readMoreLable,
  ] = row.children;
  const featureDiv = div({ class: 'feature-card' });
  moveInstrumentation(row, featureDiv);
  featureTagContent.innerHTML = '';
  const featureContentWrapper = div(
    { class: 'feature-card-content' },
    div(
      { class: 'feature-card-content-text' },
      a(
        { href: featureLink?.textContent },
        div({ class: 'feature-card-content-heading' }, featureHeadingContent.textContent),
        p({ class: 'feature-card-content-description' }, featureDescContent.textContent),
      ),
    ),
    div(
      { class: 'feature-card-link' },
      a(
        { href: featureLink?.textContent, class: 'button' },
        readMoreLable.textContent || 'Read More Story',
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
  featureDiv.append(pictureElement);
  featureDiv.append(featureContentWrapper);
  return featureDiv;
}

// Processes a row to create a list item
async function processRow(row) {
  const [
    useDM,
    imageContent,
    dmImage,
    tagContent,
    headingContent,
    decsDiv,
    linkDiv,
    readMoreLableDiv,
  ] = row.children;
  const liTag = li();
  moveInstrumentation(row, liTag);
  const textWrapper = div({ class: 'curated-cards-card-text-wrapper' });
  const imageDiv = div({ class: 'curated-cards-card-img' });
  const tagElement = div({ class: 'curated-cards-card-event' });
  const heading = p();
  let link = '';
  if (linkDiv) {
    link = linkDiv.textContent.trim();
    linkDiv.remove();
  }
  decsDiv.remove();
  readMoreLableDiv.remove();

  if (tagContent) {
    await processTag(tagElement, tagContent);
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
    const featureCard = createFeatureCard(curatedCardsInputList[0]);

    for (let index = 1; index < curatedCardsInputList.length; index += 1) {
      const row = curatedCardsInputList[index];
      // eslint-disable-next-line no-await-in-loop
      const liIndex = await processRow(row);
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
