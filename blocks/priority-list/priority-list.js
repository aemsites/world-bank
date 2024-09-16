import { div, img } from '../../scripts/dom-helpers.js';
import { CLASS_MAIN_HEADING } from '../../scripts/scripts.js';
import { TAG_ROOT } from '../../scripts/utils.js';

const desktopConst = 400;
const tabConst = 150;
const tabTopPosition = 100;
function createCard(card) {
  const [cardtitle, carddesc, imagediv, imagealt] = card.children;
  if (!cardtitle || !carddesc || !imagediv || !imagealt) {
    return;
  }
  cardtitle.textContent = cardtitle.textContent.replace(
    `${TAG_ROOT}category/`,
    '',
  );
  card.className = cardtitle.textContent;
  cardtitle.className = 'cardtitle';
  carddesc.className = 'carddesc';
  const image = imagediv.querySelector('img');
  image.alt = imagealt.querySelector('p').textContent;
  imagealt.remove();
}
function handlePriorityListScroll(leftColumnContainer, cards) {
  const image = leftColumnContainer.querySelector('.image-container');
  if (image.getBoundingClientRect().top === tabTopPosition) {
    let prevmin;
    let prevval;
    cards.forEach((card, index) => {
      const curtop = card.getBoundingClientRect().top;
      if (image.getBoundingClientRect().top >= curtop - tabConst) {
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
  } else if (image.getBoundingClientRect().top >= 0) {
    let prevmin;
    let prevval;
    cards.forEach((card, index) => {
      const curtop = card.getBoundingClientRect().top;
      if (
        image.getBoundingClientRect().top
          >= card.getBoundingClientRect().top - desktopConst
      ) {
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
}
export default async function decorate(block) {
  const [subtitle, maintitle, buttontext, buttonlink, ...cards] = [
    ...block.children,
  ];
  if (!subtitle || !maintitle || !buttontext || !buttonlink || cards.length === 0) {
    return;
  }
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
  const firstimg = cards.at(0).querySelector('img');
  if (firstimg) {
    const imgElement = img({ src: firstimg.src, alt: firstimg.alt });
    imageContainer.append(imgElement);
    imageContainer.style.backgroundImage = `url(${
      firstimg.src
    })`;
  }
  leftColumnContainer.append(imageContainer);
  block.append(leftColumnContainer);

  window.addEventListener('scroll', () => handlePriorityListScroll(leftColumnContainer, cards));
  block.append(rightColumnContainer);
}
