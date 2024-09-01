import { processTags } from '../../scripts/utils.js';
import { div } from '../../scripts/dom-helpers.js';

function processTag(tag) {
  let tagTxt = tag.innerText;
  if (tagTxt) {
    tagTxt = processTags(tagTxt, '');
    tag.classList.add(tagTxt);
    // TODO: Read it from placeholder
    tag.firstElementChild.innerText = tagTxt;
  }
}

export default async function decorate(block) {
  const isDataCardVariation = block.classList.contains('data-card-variation');
  if (isDataCardVariation) {
    const [rte1, rte2, rte3, ...cards] = [...block.children];
    const rteContainer = div({ class: 'rte-container' });
    if (rte1 && rte2 && rte3) {
      rteContainer.append(rte1);
      rteContainer.append(rte2);
      rteContainer.append(rte3);
      block.append(rteContainer);
    }

    const dataCardItems = div({ class: 'data-card-items' });
    if (cards.length) {
      dataCardItems.append(...cards);
      block.append(dataCardItems);
    }
    cards.forEach((row) => {
      row.className = 'data-card';
      const [tag, title, description, disclaimer] = [...row.children];
      tag.className = 'data-card-tag';
      title.className = 'data-card-title';
      description.className = 'data-card-description';
      disclaimer.className = 'data-card-disclaimer';

      if (tag) {
        processTag(tag);
      }
    });
  }
}
