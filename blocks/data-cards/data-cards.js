import { toClassName } from '../../scripts/aem.js';
import { processTags, getTaxonomy } from '../../scripts/utils.js';
import {
  div, a, p, img, button,
} from '../../scripts/dom-helpers.js';

async function processTag(tag) {
  const tagTxt = tag.innerText;
  if (tagTxt) {
    tag.classList.add(toClassName(processTags(tagTxt, 'category')));
    tag.firstElementChild.innerText = await getTaxonomy(tagTxt, 'category');
  }
}

async function processNewsTag(tag) {
  const tagTxt = tag.innerText;
  if (tagTxt) {
    tag.nextElementSibling.classList.add(processTags(tagTxt, 'category'));
    tag.firstElementChild.innerText = await getTaxonomy(tagTxt, 'category');
  }
}

function createRTEContainer(rteElements) {
  const rteContainer = div({ class: 'rte-container' });
  rteElements.forEach((rte) => rteContainer.append(rte));
  return rteContainer;
}

/* Carousel Starts here */

// Handling Next / Previous Arrow Image
function arrowIcon(props) {
  const icon = img();
  icon.src = `${window.hlx.codeBasePath}/icons/${props}.svg`;
  icon.alt = `${props}`;
  icon.loading = 'lazy';
  icon.dataset.iconName = `${props}`;
  icon.width = '14';
  icon.height = '12';
  return icon;
}

// Handling Anchor Tag
function arrow(props) {
  const container = p({ class: 'button-container' });
  const anchor = button({ class: `button ${props}` });
  anchor.title = `${props}`;
  anchor.type = 'button';
  anchor.append(arrowIcon(props));
  container.append(anchor);
  return container;
}

function createSlider(block) {
  const nextBtn = 'next';
  const prevBtn = 'prev';
  const divContainer = div({ class: 'arrow-buttons' });
  divContainer.append(arrow(`${prevBtn}`));
  divContainer.append(arrow(`${nextBtn}`));
  block.append(divContainer);

  // Call function after page load
  const moveRightBtn = block.querySelector(`.${nextBtn}`);
  const moveLeftBtn = block.querySelector(`.${prevBtn}`);
  const itemList = [...block.querySelectorAll('.data-card-items > a')];
  const observerOptions = {
    rootMargin: '0px',
    threshold: 1,
  };

  function moveDirection(itemWidth, option) {
    const carouselItems = block.querySelector('.data-card-items');
    if (option === '+') {
      carouselItems.scrollLeft += itemWidth;
    } else {
      carouselItems.scrollLeft -= itemWidth;
    }
  }

  // Button Event Handler
  moveLeftBtn.addEventListener('click', () => {
    const carouselItems = block.querySelector('.data-card-items');
    const totalItems = carouselItems.children.length || 1;
    const itemWidth = parseInt(carouselItems.scrollWidth / totalItems, 10);
    moveDirection(itemWidth, '-');
  }, true);

  moveRightBtn.addEventListener('click', () => {
    const carouselItems = block.querySelector('.data-card-items');
    const totalItems = carouselItems.children.length || 1;
    const itemWidth = parseInt(carouselItems.scrollWidth / totalItems, 10);
    moveDirection(itemWidth, '+');
  }, true);

  // Observer Callback Function
  const callBack = (entries) => {
    const dir = document.documentElement.dir || 'ltr';
    let disableLeftBtn = false;
    let disableRightBtn = false;

    if (dir === 'rtl') {
      document.querySelector('.next').style.right = 'auto';
      document.querySelector('.prev').style.right = 'auto';
      document.querySelector('.next').style.left = '0';
      document.querySelector('.prev').style.left = '0';
    }

    entries.forEach((entry) => {
      const {
        target,
      } = entry;
      if (entry.intersectionRatio >= 1) {
        target.classList.remove('opacity');
        target.classList.add('active');
      } else {
        target.classList.remove('active');
        target.classList.add('opacity');
      }
    });
    try {
      if (entries[0].target.parentElement.children[0].className === 'anchor-tag active') {
        if (dir === 'rtl') {
          disableLeftBtn = false;
          disableRightBtn = true;
        } else {
          disableLeftBtn = true;
          disableRightBtn = false;
        }
      } else if (entries[0].target.parentElement.children[entries[0].target.parentElement.children.length - 1].className === 'anchor-tag active') {
        if (dir === 'rtl') {
          disableLeftBtn = true;
          disableRightBtn = false;
        } else {
          disableLeftBtn = false;
          disableRightBtn = true;
        }
      }
      moveLeftBtn.disabled = disableLeftBtn;
      moveRightBtn.disabled = disableRightBtn;
    } catch (e) {
      /* error structure was not as expected */
    }
  };

  // Create Observer instance
  const observer = new IntersectionObserver(callBack, observerOptions);

  // Apply observer on each item
  itemList.forEach((item) => {
    observer.observe(item);
  });
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
    createSlider(block);
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

    cards.forEach(async (row) => {
      row.className = 'news-card';
      const [tag, title, link, image, alt] = [...row.children];
      tag.className = 'news-card-tag';
      title.className = 'news-card-title';
      image.className = 'news-card-image';
      if (alt) {
        const pic = image.querySelector('img');
        const pTag = alt.querySelector('p');
        if (pTag && pic) {
          pic.alt = pTag.textContent.trim();
        }
        alt.remove();
      }
      const anchor = a({ class: 'anchor-tag', href: link.textContent });
      link.remove();

      if (tag) {
        await processNewsTag(tag);
      }
      row.parentNode.insertBefore(anchor, row);
      anchor.appendChild(row);
    });
  }
}
