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
  // eslint-disable-next-line no-unused-vars
  const [rte1, rte2, rte3, ...cards] = [...block.children];

  const dataCardsContainer = div({ class: 'data-cards-container' });
  if (cards.length) {
    dataCardsContainer.append(...cards);
    block.append(dataCardsContainer);
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
