import { div, img } from '../../scripts/dom-helpers.js';
import { CLASS_MAIN_HEADING } from '../../scripts/scripts.js';

function createCard(card) {
  const [cardtitle, carddesc,,] = card.children;
  cardtitle.textContent = cardtitle.textContent.replace('world-bank:category/', '');
  card.className = cardtitle.textContent;
  cardtitle.className = 'cardtitle';
  carddesc.className = 'carddesc';
}

export default async function decorate(block) {
  const [subtitle, maintitle, buttontext, buttonlink, ...cards] = [...block.children];
  subtitle.className = 'subtitle';
  maintitle.className = CLASS_MAIN_HEADING;
  const buttonLink = buttonlink.getElementsByTagName('a')[0];
  buttonLink.innerHTML = buttontext.textContent;
  buttonLink.title = buttontext.textContent;
  buttonLink.className = 'button primary';
  const buttonWrapper = div(
    { class: 'button-wrapper' },
    buttonLink.cloneNode(true),
  );
  const textContainer = div({ class: 'text-container' });
  textContainer.append(subtitle);
  textContainer.append(maintitle);
  textContainer.append(buttonWrapper);
  buttonlink.remove();
  buttontext.remove();
  const cardsContainer = div({ class: 'cards-container' });
  cards.forEach((card) => {
    createCard(card);
    cardsContainer.append(card);
  });
  const leftColumnContainer = div({ class: 'left-column-container' });
  const rightColumnContainer = div({ class: 'right-column-container' });
  rightColumnContainer.append(textContainer);
  rightColumnContainer.append(cardsContainer);
  const imageContainer = div({ class: 'image-container' });
  const imgElement = img({ src: cards.at(0).querySelector('img').src });
  imageContainer.append(imgElement);

  imageContainer.style.backgroundImage = `url(${cards.at(0).querySelector('img').src})`;
  leftColumnContainer.append(imageContainer);
  block.append(leftColumnContainer);

  window.addEventListener('scroll', () => {
    const image = leftColumnContainer.querySelector('.image-container');
    if (image.getBoundingClientRect().top >= 0) {
      let prevmin;
      let prevval;
      cards.forEach((card, index) => {
        const curtop = card.getBoundingClientRect().top;
        if (image.getBoundingClientRect().top >= card.getBoundingClientRect().top - 400) {
          if (index === 0) {
            prevmin = curtop;
            prevval = index;
          } else if (prevmin < curtop && prevval !== index) {
            prevmin = curtop;
            prevval = index;
          }
        }
      });
      cards.forEach((card, index) => {
        if (index === prevval) {
          image.style.backgroundImage = `url(${card.querySelector('img').src})`;
        }
      });
    } else if (image.getBoundingClientRect().top === 100) {
      let prevmin;
      let prevval;
      cards.forEach((card, index) => {
        const curtop = card.getBoundingClientRect().top;
        if (image.getBoundingClientRect().top >= curtop - 150) {
          if (index === 0) {
            prevmin = curtop;
            prevval = index;
          } else if (prevmin < curtop && prevval !== index) {
            prevmin = curtop;
            prevval = index;
          }
        }
      });
      cards.forEach((card, index) => {
        if (index === prevval) {
          image.style.backgroundImage = `url(${card.querySelector('img').src})`;
        }
      });
    }
  });
  block.append(rightColumnContainer);
}
