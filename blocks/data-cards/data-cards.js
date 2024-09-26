import { processTags } from '../../scripts/utils.js';
import { div, a } from '../../scripts/dom-helpers.js';

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
      const [tag, title, link, image, alt] = [...row.children];
      tag.className = 'news-card-tag';
      title.className = 'news-card-title';
      image.className = 'news-card-image';
      if (alt) {
        const pic = image.querySelector('img');
        const p = alt.querySelector('p');
        pic.src = p.textContent.trim();
        alt.remove();
      }
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
