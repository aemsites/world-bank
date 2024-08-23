import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import { p, button, div } from '../../scripts/dom-helpers.js';

// Utility function to create an HTML element with optional class
function createElement(tag, className) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  return element;
}

// Creates a feature card element with its content
function createFeatureCard(row) {
  const [featureImageContent, featureTagContent, featureHeadingContent, featureDescContent, featureLink] = row.children;
  
  const featureContentWrapper = div(
    { class: 'explore-card-content' },
    p({ class: 'explore-card-content-heading' }, featureHeadingContent.textContent),
    p({ class: 'explore-card-content-description' }, featureDescContent.textContent),
    button({ type: 'button', href: featureLink.textContent }, 'Read More')
  );

  const pictureElement = featureImageContent.querySelector('picture');
  return div({ class: 'explore-card' }, pictureElement, featureContentWrapper);
}

// Processes a row to create a list item
function processRow(row) {
  const [imageContent, tagContent, headingContent] = row.children;

  const li = createElement('li');
  const textWrapper = div({ class: 'explore-cards-card-text-wrapper' });
  const imageDiv = div({ class: 'explore-cards-card-img' });
  const tagElement = div({ class: 'explore-cards-card-event' });
  const heading = createElement('p');

  if (tagContent) {
    tagElement.textContent = tagContent.textContent.substring(11).trim();
  }

  if (imageContent) {
    imageDiv.innerHTML = imageContent.innerHTML; // Preserve any HTML content inside imageContent
  }

  if (headingContent) {
    heading.textContent = headingContent.textContent;
  }

  textWrapper.append(heading, tagElement);
  li.append(imageDiv, textWrapper);

  row.innerHTML = ''; // Clear the original row content

  moveInstrumentation(row, li);
  return li;
}

// Main function to decorate the block
export default function decorate(block) {
  const ul = createElement('ul');
  const childrenArray = Array.from(block.children);
  console.log(childrenArray);
  
  if (childrenArray.length > 0) {
    const featureCard = createFeatureCard(childrenArray[0]);

    for (let index = 1; index < childrenArray.length; index++) {
      const row = childrenArray[index];
      const li = processRow(row);
      ul.appendChild(li);
    }

    // Optimize images
    ul.querySelectorAll('picture > img').forEach((img) => {
      const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
      moveInstrumentation(img, optimizedPic.querySelector('img'));
      img.closest('picture').replaceWith(optimizedPic);
    });

    // Clear block and append the new content
 /*   block.innerHTML = ''; // Clear all content

    block.append(
      featureCard,
      div({ class: 'curated-cards list' },
        div({ class: 'curated-cards-line-div' },
          div({ class: 'line-text' }, 'MORE TOP STORIES'),
          div({ class: 'line' })
        ),
        ul
      )
    ); 
    */
  }
}
