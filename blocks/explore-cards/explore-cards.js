import { div } from '../../scripts/dom-helpers.js';
import { processTags } from '../../scripts/utils.js';

export default function decorate(block) {
  // Style and append the heading to the main container
  const heading = block.querySelector('.explore-cards > div:first-child');
  heading.classList.add('heading');

  // Select all cards except the first child (heading)
  const cards = block.querySelectorAll('.explore-cards > div:nth-child(n+2)');
  const cardsContainer = div({ class: 'explore-cards-container' });

  // Iterate through each card and transform it
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
    const sType = processTags(storyType.innerText, 'story-type');
    if (sType) {
      // TODO: Read sType localized value from placeholder
      storyType.innerText = sType;
      storyType.className = 'story-type';
      cardContent.append(storyType);
    }
    cardContent.append(title);
    card.textContent = '';
    card.appendChild(anchorTag);
    card.appendChild(cardContent);
    cardsContainer.append(card);
  });
  block.appendChild(cardsContainer);
}
