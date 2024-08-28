import { div } from '../../scripts/dom-helpers.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);
  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });

  // Feature card variation
  const featureCard = block.classList.contains('columns-feature-card');
  if (featureCard) {
    const cardsContainer = block.firstElementChild;
    const cards = [...cardsContainer.children];

    cards.forEach((card) => {
      // eslint-disable-next-line no-unused-vars
      const [_title, thumbnail, description, ...button] = [...card.children];
      thumbnail?.classList.add('columns-feature-card-thumbnail');
      description?.classList.add('columns-feature-card-description');

      if (!description || ![...button].length) return;
      const cardContent = div({ class: 'columns-feature-card-content' }, description, ...button);

      card.appendChild(cardContent);
      moveInstrumentation(description, cardContent);
      [...button].forEach((btn) => {
        moveInstrumentation(btn, cardContent);
      });
    });
  }
}
