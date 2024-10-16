import { div } from '../../scripts/dom-helpers.js';
import { CLASS_MAIN_HEADING } from '../../scripts/scripts.js';
import { TAG_ROOT, getTaxonomy } from '../../scripts/utils.js';

const isMobile = window.matchMedia('(max-width: 768px)');
const desktopConst = 400;
const tabConst = 150;
const tabTopPosition = 100;

async function createCard(card) {
  const [cardtitle, carddesc, imagediv] = card.children;
  if (!cardtitle || !carddesc || !imagediv) {
    return;
  }
  const tagName = cardtitle.textContent;
  cardtitle.textContent = await getTaxonomy(tagName);
  card.className = tagName.replace(
    `${TAG_ROOT}category/`,
    '',
  ).trim();
  cardtitle.className = 'cardtitle';
  carddesc.className = 'carddesc';
}

const handleBG = new ResizeObserver(() => {
  const priorityListleft = document.querySelector('.priority-list .left-column-container');
  const priorityListright = document.querySelector('.priority-list .right-column-container');
  const imageContainer = priorityListleft.querySelector('.image-container');
  const cards = priorityListright.querySelector('.cards-container');
  if (isMobile) {
    const firstimg = [...cards.children].at(0).querySelector('img');
    imageContainer.style.backgroundImage = `url(${
      firstimg.src
    })`;
  }
});

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
    imageContainer.style.backgroundImage = `url(${
      firstimg.src
    })`;
  }
  leftColumnContainer.append(imageContainer);
  block.append(leftColumnContainer);

  window.addEventListener('scroll', () => handlePriorityListScroll(leftColumnContainer, cards));
  handleBG.observe(document.body);
  block.append(rightColumnContainer);
}
