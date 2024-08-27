import { div } from '../../scripts/dom-helpers.js';
import { processTags } from '../../scripts/utils.js';
import { fetchLanguagePlaceholders } from '../../scripts/scripts.js';
import { toCamelCase } from '../../scripts/aem.js';

async function fetchingPlaceholdersData(block) {
  const listOfAllPlaceholdersData = await fetchLanguagePlaceholders();
  const storyTypeDivs = block.querySelectorAll('.story-type');

  storyTypeDivs.forEach((storyTypeDiv) => {
    const sTypeKey = toCamelCase(`tag-story-type-${storyTypeDiv.textContent}`);
    if (listOfAllPlaceholdersData[sTypeKey]) {
      storyTypeDiv.innerText = listOfAllPlaceholdersData[sTypeKey].toUpperCase();
    }
  });
}

export default function decorate(block) {
  // Style and append the heading to the main container
  const heading = block.querySelector('.explore-cards > div:first-child');
  heading.classList.add('heading');

  // Select all cards except the first child (heading)
  const cards = block.querySelectorAll('.explore-cards > div:nth-child(n+2)');
  const cardsContainer = div({ class: 'explore-card-container' });

  // Iterate through each card
  cards.forEach((card) => {
    // Extract elements from the card
    const [imageContainer, altText, title, link, contentType, storyType] = card.children;
    card.classList.add('explore-card');

    // Set alt attribute for the image
    const imgElement = imageContainer.querySelector('img');
    imgElement.setAttribute('alt', altText.textContent);
    imageContainer.className = 'card-img';
    altText.remove();
    const anchorTag = link.querySelector('a');
    anchorTag.textContent = '';
    anchorTag.title = title.textContent;
    anchorTag.appendChild(imageContainer);
    anchorTag.className = 'card-link';
    title.className = 'card-title';

    const cardContent = div({ class: 'card-content' });
    // Content type
    const cType = processTags(contentType.innerText, 'content-type');
    if (cType) {
      const cTypeIcon = div({ class: `card-icon icon-${cType}` });
      cardContent.append(cTypeIcon);
    }

    // Story type
    const STORY_TYPE = 'story-type';
    const sType = processTags(storyType.innerText, STORY_TYPE);
    if (sType) {
      storyType.innerText = sType;
      storyType.className = STORY_TYPE;
      cardContent.append(storyType);
    }
    cardContent.append(title);
    card.textContent = '';
    card.appendChild(anchorTag);
    card.appendChild(cardContent);
    cardsContainer.append(card);
  });
  block.appendChild(cardsContainer);
  fetchingPlaceholdersData(block);
}
