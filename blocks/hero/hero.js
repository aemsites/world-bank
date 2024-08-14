export default function decorate(block) {
  const pictureElement = block.querySelector('div picture');
  const titleElement = block.querySelector('div:nth-child(2) > div > p');
  const descriptionElement = block.querySelector('div:nth-child(3) > div > p');
  const buttonElement = block.querySelector('div:nth-child(4) > div > p');
  const linkElement = block.querySelector('div a');

  // Create the hero container
  const heroContainer = document.createElement('div');
  heroContainer.classList.add('hero-component');

  // Create and set up the title element
  const heroTitle = document.createElement('h1');
  heroTitle.textContent = titleElement.textContent;

  // Create and set up the description element
  const heroDescription = document.createElement('p');
  heroDescription.textContent = descriptionElement.textContent;

  // Create and set up the picture element
  const pictureDiv = document.createElement('div');
  pictureDiv.appendChild(pictureElement);

  // Create and set up the button div
  const heroButton = document.createElement('a');
  heroButton.href = linkElement.href;
  heroButton.textContent = buttonElement.textContent; 
  heroButton.classList.add('hero-button');
  const buttonDiv = document.createElement('div');
  buttonDiv.appendChild(heroButton);

  const contentDiv = document.createElement('div');
  contentDiv.appendChild(heroTitle);
  contentDiv.appendChild(heroDescription);

  const mainDiv = document.createElement('div');
  mainDiv.classList.add('hero-content');
  mainDiv.appendChild(contentDiv);
  mainDiv.appendChild(buttonDiv);

  // Append the title, description, and button to the hero container
  heroContainer.appendChild(pictureDiv);
  heroContainer.appendChild(mainDiv);

  // Replace the existing hero block with the new hero container
  block.innerHTML = '';
  block.appendChild(heroContainer);
}