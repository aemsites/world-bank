import { div } from '../../scripts/dom-helpers.js';
import { processTags } from '../../scripts/utils.js';
import { fetchLanguagePlaceholders, CLASS_MAIN_HEADING } from '../../scripts/scripts.js';
import { toCamelCase } from '../../scripts/aem.js';

async function fetchingPlaceholdersData(block) {
  const listOfAllPlaceholdersData = await fetchLanguagePlaceholders();
  if (!listOfAllPlaceholdersData) return;

  const storyTypeDivs = block.querySelectorAll('.story-type');
  if (!storyTypeDivs) return;

  storyTypeDivs.forEach((storyTypeDiv) => {
    const sTypeKey = toCamelCase(`tag-story-type-${storyTypeDiv.textContent}`);
    if (listOfAllPlaceholdersData[sTypeKey]) {
      storyTypeDiv.innerText = listOfAllPlaceholdersData[sTypeKey].toUpperCase();
    }
  });
}

export default function decorate(block) {
  // Style and append the heading to the main container
  const [heading, ...cards] = [...block.children];
  if (!cards || !cards.length) return;
  if (heading) {
    heading.classList.add(CLASS_MAIN_HEADING);
  }

  const cardsContainer = div({ class: 'explore-card-container' });
  // Iterate through each card
  cards.forEach((card) => {
    if (!card) return;

    // Extract elements from the card
    const [imageContainer, altText, title, link, contentType, storyType] = card.children;
    card.classList.add('explore-card');

    let anchorTag = null;

    // Set alt attribute for the image
    const imgElement = imageContainer?.querySelector('img');
    if (imgElement && altText) {
      imgElement.setAttribute('alt', altText.textContent);
      imageContainer.className = 'card-img';
      altText.remove();
    }

    if (link && title) {
      anchorTag = link.querySelector('a');
      if (anchorTag) {
        anchorTag.textContent = '';
        anchorTag.title = title.textContent;
        if (imageContainer) {
          anchorTag.appendChild(imageContainer);
        }
        anchorTag.className = 'card-link';
        title.className = 'card-title';
      }
    }

    const cardContent = div({ class: 'card-content' });

    // Content type
    const cType = contentType ? processTags(contentType.innerText, 'content-type') : null;
    const allowedTypes = ['video', 'audio'];
    if (cType && allowedTypes.includes(cType)) {
      const cTypeIcon = div({ class: `card-icon icon-${cType}` });
      cardContent.append(cTypeIcon);
    }

    // Story type
    const STORY_TYPE = 'story-type';
    const sType = storyType ? processTags(storyType.innerText, STORY_TYPE) : null;
    if (sType) {
      storyType.innerText = sType;
      storyType.className = STORY_TYPE;
      cardContent.append(storyType);
    }

    if (title) {
      cardContent.append(title);
    }

    card.textContent = '';

    if (cardContent && anchorTag) {
      anchorTag.appendChild(cardContent);
      card.appendChild(anchorTag);
    }

    cardsContainer.append(card);
  });

  block.appendChild(cardsContainer);
  fetchingPlaceholdersData(block);
}
