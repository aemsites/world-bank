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
}

export default async function decorate(block) {
  const [title, linkText, link, ...cards] = [...block.children];

  title.className = 'main-heading';
  const linkTag = link.getElementsByTagName('a')[0];
  linkTag.innerHTML = linkText.textContent;
  linkTag.className = 'button primary';
  const titleButtonWrapper = div(
    { class: 'heading-wrapper' },
    title,
    link,
  );
  const buttonWrapper = div(
    { class: 'button-wrapper' },
    a({ href: link.textContent, class: 'button primary' }, linkText.textContent),
  );
  linkText.remove();
  block.prepend(titleButtonWrapper);
  const cardsContainer = div({ class: 'cards-container' });
  cards.forEach((card) => {
    createCard(card);
    cardsContainer.append(card);
  });
  block.append(cardsContainer);
  block.append(buttonWrapper);
}
