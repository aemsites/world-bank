import { div, ul, li } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);
  const anchorContainer = document.createElement('div');
  anchorContainer.className = 'anchor-container'; // Add a class for styling if needed

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
      const paragraphs = col.querySelectorAll('div > p');
      if (paragraphs.length > 0) {
        paragraphs.forEach((para, index) => {
          para.classList.add(`tk-${index + 1}`);
          const anchor = para.querySelector('a');
          if (anchor) {
            anchorContainer.appendChild(para);
          }
        });
      }
      const tk2Paragraph = block.querySelector('.tk-2');

      if (tk2Paragraph) {
        tk2Paragraph.insertAdjacentElement('afterend', anchorContainer);
      }
    });
  });

  // Feature card variation
  const featureCard = block.classList.contains('columns-feature-card');
  if (featureCard) {
    const cardsContainer = block.firstElementChild;
    const cardsList = ul({ class: 'columns-feature-card-list' });
    const cards = [...cardsContainer.children];
    cards.forEach((card) => {
      // eslint-disable-next-line no-unused-vars
      const [_title, thumbnail, description, ...button] = [...card.children];
      const picture = thumbnail.querySelector('picture');
      thumbnail.replaceWith(picture);
      description.classList.add('columns-feature-card-description');

      const cardContent = div({ class: 'columns-feature-card-content' }, description, ...button);
      const cardGroup = div({ class: 'columns-feature-card-group' }, picture, cardContent);
      card.appendChild(cardGroup);

      const cardLi = li({ class: 'columns-feature-card-item' }, ...card.children);
      cardsList.appendChild(cardLi);
    });
    block.innerHTML = '';
    block.appendChild(cardsList);
  }
}
