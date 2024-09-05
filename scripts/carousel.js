import {
  loadCSS,
} from './aem.js';

loadCSS(`${window.hlx.codeBasePath}/styles/carousel.css`);

// Handling Next / Previous Arrow Image
function arrowIcon(props) {
  const icon = document.createElement('img');
  icon.src = `${window.hlx.codeBasePath}/icons/${props}.svg`;
  icon.alt = `${props}`;
  icon.loading = 'lazy';
  icon.dataset.iconName = `${props}`;
  return icon;
}

// Handling Anchor Tag
function arrow(props) {
  const anchor = document.createElement('a');
  anchor.className = `${props}`;
  anchor.title = `${props}`;
  anchor.append(arrowIcon(props));
  return anchor;
}

export default async function createCarousel(block) {
  const nextBtn = 'next';
  const prevBtn = 'prev';
  block.append(arrow(`${nextBtn}`));
  block.append(arrow(`${prevBtn}`));

  // Call function after page load
  window.setTimeout(() => {
    const carouselItems = document.querySelector('.cards > ul');
    const totalItems = carouselItems.children.length || 1;
    const moveRightBtn = document.querySelector(`.${nextBtn}`);
    const moveLeftBtn = document.querySelector(`.${prevBtn}`);
    const itemWidth = parseInt(carouselItems.scrollWidth / totalItems, 10);
    const itemList = [...document.querySelectorAll('.cards > ul > li')];
    const observerOptions = {
      rootMargin: '0px',
      threshold: 0.25,
    };

    // Button Event Handler
    moveRightBtn.addEventListener('click', () => {
      carouselItems.scrollLeft += itemWidth;
    }, false);

    moveLeftBtn.addEventListener('click', () => {
      carouselItems.scrollLeft -= itemWidth;
    }, false);

    // Observer Callback Function
    const callBack = (entries) => {
      entries.forEach((entry) => {
        const { target } = entry;
        if (entry.intersectionRatio >= 0.25) {
          target.classList.remove('opacity'); target.classList.add('active');
        } else {
          target.classList.remove('active'); target.classList.add('opacity');
        }
      });
      try {
        if (entries[0].target.parentElement.children[0].className === 'active') {
          moveLeftBtn.style.display = 'none';
          moveRightBtn.style.display = 'block';
        } else if (entries[0].target.parentElement.children[entries[0].target.parentElement.children.length - 1].className === 'active') {
          moveLeftBtn.style.display = 'block';
          moveRightBtn.style.display = 'none';
        } else {
          moveLeftBtn.style.display = 'block';
          moveRightBtn.style.display = 'block';
        }
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
  }, 100);
}
