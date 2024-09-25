import { processTags } from '../../scripts/utils.js';
import {
  div, a, button, img, p,
} from '../../scripts/dom-helpers.js';

function processTag(tag) {
  let tagTxt = tag.innerText;
  if (tagTxt) {
    tagTxt = processTags(tagTxt, 'category');
    tag.classList.add(tagTxt);
    tag.firstElementChild.innerText = tagTxt;
  }
}

function processNewsTag(tag) {
  let tagTxt = tag.innerText;
  if (tagTxt) {
    tagTxt = processTags(tagTxt, 'category');
    tag.nextElementSibling.classList.add(tagTxt);
    tag.firstElementChild.innerText = tagTxt;
  }
}

function createRTEContainer(rteElements) {
  const rteContainer = div({ class: 'rte-container' });
  rteElements.forEach((rte) => rteContainer.append(rte));
  return rteContainer;
}

/* Carousel Starts here */
/* eslint-disable no-bitwise */

function arrowIcon(props) {
  const icon = img();
  icon.src = `${window.hlx.codeBasePath}/icons/${props}.svg`;
  icon.alt = `${props}`;
  icon.loading = 'lazy';
  icon.dataset.iconName = `${props}`;
  return icon;
}

function arrow(props) {
  const container = p({ class: 'arrow-button-container' });
  const anchor = button({ class: 'carousel-button' });
  anchor.classList.add(`button-${props}`);
  anchor.type = 'button';
  anchor.append(arrowIcon(props));
  container.append(anchor);
  return container;
}

function moveDirection(itemWidth, option) {
  const carouselItems = document.querySelector('.data-card-items');
  if (option === '+') {
    carouselItems.scrollLeft += itemWidth;
  } else {
    carouselItems.scrollLeft -= itemWidth;
  }
}

function buttonEvents(nextBtn, prevBtn) {
  const cardsContainer = document.querySelector('.data-card-items');
  const moveRightBtn = document.querySelector(`.button-${nextBtn}`);
  const moveLeftBtn = document.querySelector(`.button-${prevBtn}`);
  const screenWidth = window.screen.width;
  let currentIndex = 0;
  let maxIndex = cardsContainer.children.length;

  if (screenWidth > 600) {
    maxIndex -= 1;
  } else if (screenWidth > 700) {
    maxIndex -= 2;
  }

  function updateButtons() {
    moveLeftBtn.disabled = currentIndex <= 0;
    moveRightBtn.disabled = currentIndex >= maxIndex - 1;
  }

  updateButtons();

  moveLeftBtn.addEventListener('click', () => {
    currentIndex -= 1;
    const carouselItems = document.querySelector('.data-card-items > a');
    const totalItems = carouselItems.children.length || 1;
    const itemWidth = parseInt(carouselItems.scrollWidth / totalItems, 10)
    + ((currentIndex === 0 & screenWidth >= 600) * 10000);
    moveDirection(itemWidth, '-');
    updateButtons();
  }, true);

  moveRightBtn.addEventListener('click', () => {
    currentIndex += 1;
    const carouselItems = document.querySelector('.data-card-items > a');
    const totalItems = carouselItems.children.length || 1;
    const itemWidth = parseInt(carouselItems.scrollWidth / totalItems, 10)
    + ((maxIndex - 1 === currentIndex & screenWidth >= 600) * 10000);
    moveDirection(itemWidth, '+');
    updateButtons();
  }, true);
}

function addCarouselToDataCards(block) {
  const divContainer = div({ class: 'carousel-arrows' });
  const nextBtn = 'next';
  const prevBtn = 'prev';
  divContainer.append(arrow(`${prevBtn}`));
  divContainer.append(arrow(`${nextBtn}`));
  block.append(divContainer);

  buttonEvents(nextBtn, prevBtn);
}

/* Carousel Ends here */

export default async function decorate(block) {
  const isDataCardVariation = block.classList.contains('data-card-variation');
  if (isDataCardVariation) {
    const [rte1, rte2, rte3, ...cards] = [...block.children];
    rte1.className = 'main-heading';
    if (rte1 && rte2 && rte3) {
      block.append(createRTEContainer([rte1, rte2, rte3]));
    }

    if (!cards.length) return;

    const dataCardItems = div({ class: 'data-card-items' });
    dataCardItems.append(...cards);
    block.append(dataCardItems);

    cards.forEach((row) => {
      row.className = 'data-card';
      const [tag, title, description, link, disclaimer] = [...row.children];
      tag.className = 'data-card-tag';
      title.className = 'data-card-title';
      description.className = 'data-card-description';
      disclaimer.className = 'data-card-disclaimer';
      const anchor = a({ class: 'anchor-tag', href: link.textContent });
      link.remove();

      if (tag) {
        processTag(tag);
      }

      row.parentNode.insertBefore(anchor, row);
      anchor.appendChild(row);
    });
    addCarouselToDataCards(block);
  }

  const isNewsCardVariation = block.classList.contains('news-card-variation');
  if (isNewsCardVariation) {
    const [rte1, rte2, rte3, ...cards] = [...block.children];
    rte1.className = 'main-heading';
    if (rte1 && rte2 && rte3) {
      block.append(createRTEContainer([rte1, rte2, rte3]));
    }

    if (!cards.length) return;

    const newsCardItems = div({ class: 'news-card-items' });
    newsCardItems.append(...cards);
    block.append(newsCardItems);

    cards.forEach((row) => {
      row.className = 'news-card';
      const [tag, title, link, image] = [...row.children];
      tag.className = 'news-card-tag';
      title.className = 'news-card-title';
      image.className = 'news-card-image';
      const anchor = a({ class: 'anchor-tag', href: link.textContent });
      link.remove();

      if (tag) {
        processNewsTag(tag);
      }
      row.parentNode.insertBefore(anchor, row);
      anchor.appendChild(row);
    });
  }
}
