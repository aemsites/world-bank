import {
  div, a,
} from '../../scripts/dom-helpers.js';

function createCard(cardData) {
  const [
    imageContainer,
    imageAltText,
    title,
    desc,
    titlelink,
    btn,
    btnLink,
  ] = [...cardData.children];
  const imgElement = imageContainer.querySelector('img');
  imgElement.setAttribute('alt', imageAltText.textContent);
  imageContainer.className = 'card-img';
  title.className = 'title';
  desc.className = 'desc';
  btn.className = 'card-btn';

  const txtContainer = div({ class: 'text-content' }, a({ href: titlelink.textContent }, title), desc, a({ href: btnLink.textContent }, btn));
  cardData.append(txtContainer);
  cardData.className = 'rp-card';

  titlelink.remove();
  btnLink.remove();
  imageAltText.remove();
/*  if (!cardsContainer) {
    cardsContainer = div({ class: 'cards-container' }, RPCard);
  } else {
    cardsContainer.append(RPCard);
  }*/
}

export default async function decorate(block) {
  const [title, linkText, link, ...cards] = [...block.children];

  title.className = 'main-heading';
  const titleButtonWrapper = div(
    { class: 'heading-wrapper' },
    title,
    a({ href: link.textContent, class: 'button primary' }, linkText.textContent),
  );
  const buttonWrapper = div(
    { class: 'button-wrapper' },
    a({ href: link.textContent, class: 'button primary' }, linkText.textContent),
  );
  block.prepend(titleButtonWrapper);
  const cardsContainer = div({ class: 'cards-container' });
  cards.forEach((card) => {
    createCard(card);
    cardsContainer.append(card);
  });
  block.append(cardsContainer);
  block.append(buttonWrapper);
  link.remove();
}
