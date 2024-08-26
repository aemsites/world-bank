import { div, img } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  // Select all cards except the first child (heading)
  const cards = block.querySelectorAll('.explore-cards > div:nth-child(n+2)');

  // Create and style the main container
  const developmentStories = div({ class: 'development-stories' });

  // Style and append the heading to the main container
  const heading = block.querySelector('.explore-cards > div:first-child');
  heading.classList.add('explore-title');
  developmentStories.appendChild(heading);

  // Create a container for all the cards
  const storiesContainer = div({ class: 'stories-container' });

  // Map of content types to icons
  const contentTypeIcons = {
    'podcast-audio': '/icons/podcast.svg',
    video: '/icons/playbutton.svg',
  };

  // Iterate through each card and transform it
  cards.forEach((card) => {
    // Extract elements from the card
    const [imageContainer, altText, contentType, storyType, storyHeading, , link] = card.children;

    // Set alt attribute for the image
    const imgElement = imageContainer.querySelector('img');
    imgElement.setAttribute('alt', altText.textContent);

    // Style the story type and create content container
    storyType.classList.add('story-type');
    const storyContent = div({ class: 'story-content' });

    // Append content type icon if applicable
    const iconsrc = contentTypeIcons[contentType.textContent];
    if (iconsrc) {
      const contentTypeDiv = div({ class: 'contenttype-icon' }, img({ src: iconsrc }));
      storyContent.appendChild(contentTypeDiv);
    }

    // Clear the anchor tag's text content and append the image container
    const anchorTag = link.querySelector('a');
    anchorTag.textContent = '';
    anchorTag.appendChild(imageContainer);

    // Append story type and heading to the story content
    storyHeading.classList.add('story-heading');
    storyContent.appendChild(storyType);
    storyContent.appendChild(storyHeading);

    // Create story card and append content
    const storyCard = div({ class: 'story-card' }, anchorTag, storyContent);
    storiesContainer.appendChild(storyCard);
  });

  // Append the stories container to the main container
  developmentStories.appendChild(storiesContainer);

  // Replace the old content with the new one
  block.innerHTML = '';
  block.appendChild(developmentStories);
}
