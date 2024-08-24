import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import { p, button, div } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
    // Select all cards except the first child (heading)
    const cards = block.querySelectorAll('.explore-cards > div:nth-child(n+2)');

    // Create and style the main container
    const developmentStories = document.createElement('div');
    developmentStories.classList.add('development-stories');

    // Style and append the heading to the main container
    const heading = block.querySelector('.explore-cards > div:first-child');
    heading.classList.add('explore-title');
    developmentStories.appendChild(heading);

    // Create a container for all the cards
    const storiesContainer = document.createElement('div');
    storiesContainer.classList.add('stories-container');

    // Iterate through each card and transform it
    cards.forEach(card => {
        const storyCard = document.createElement('div');
        storyCard.classList.add('story-card');

        // Extract elements from the card
        const [imageContainer, altText, contentType, storyType, storyHeading, tags, link] = card.children;

        storyCard.classList.add(contentType.textContent);
        imageContainer.getElementsByTagName('img')[0].setAttribute("alt",altText.textContent);

        // Style the story type and create content container
        storyType.classList.add('story-type');

        const storyContent = document.createElement('div');
        storyContent.classList.add('story-content');

        const anchorTag = link.getElementsByTagName('a')[0];
        anchorTag.textContent = ''; 
        anchorTag.appendChild(imageContainer);
        storyContent.appendChild(storyType);
        storyContent.appendChild(storyHeading);

    // Append image and content to the card
        storyCard.appendChild(anchorTag);
        storyCard.appendChild(storyContent);

        // Add the card to the container
        storiesContainer.appendChild(storyCard);
    });

    // Append the stories container to the main container
    developmentStories.appendChild(storiesContainer);

    // Replace the old content with the new one
    block.innerHTML = '';
    block.appendChild(developmentStories);
}
