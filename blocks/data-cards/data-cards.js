import { processTags } from '../../scripts/utils.js';
import { div, a } from '../../scripts/dom-helpers.js';

function processTag(tag) {
  let tagTxt = tag.innerText;
  if (tagTxt) {
    tagTxt = processTags(tagTxt, 'category');
    tag.classList.add(tagTxt);
    // TODO: Read it from placeholder
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
    rte1.className= 'main-heading';
    if (rte1 && rte2 && rte3) {
      block.append(createRTEContainer([rte1, rte2, rte3]));
    }

    if (!cards.length) return;

    const dataCardItems = div({ class: 'data-card-items' });
    dataCardItems.append(...cards);
    block.append(dataCardItems);

    cards.forEach((row) => {
      row.className = 'data-card';
      const [tag, title, description, disclaimer] = [...row.children];
      tag.className = 'data-card-tag';
      title.className = 'data-card-title';
      description.className = 'data-card-description';
      disclaimer.className = 'data-card-disclaimer';      

      const anchor =  a({class: 'anchor-tag', href: "link.textContent"});
      anchor.append(title);
      anchor.append(description);
      row.append(anchor);
      row.append(disclaimer);

      if (tag) {
        processTag(tag);
      }
    });
  }

  const isNewsCardVariation = block.classList.contains('news-card-variation');
  if (isNewsCardVariation) {
    const [rte1, rte2, rte3, ...cards] = [...block.children];
    if (rte1 && rte2 && rte3) {
        rte1.className= 'main-heading';
      block.append(createRTEContainer([rte1, rte2, rte3]));
    }

    if (!cards.length) return;

    const newsCardItems = div({ class: 'news-card-items' });
    newsCardItems.append(...cards);
    block.append(newsCardItems);

    cards.forEach((row) => {
      row.className = 'news-card';
      const [tag, title, image] = [...row.children];
      tag.className = 'news-card-tag';
      title.className = 'news-card-title';
      image.className = 'news-card-image';

      const anchor = a({class: 'anchor-tag', href: "link.textContent"});
      anchor.append(title.querySelector('p'));
      title.append(anchor);

      if (tag) {
        processTag(tag);
      }
    });
  }
}
