import { div, a } from '../../scripts/dom-helpers.js';
import { CLASS_MAIN_HEADING } from '../../scripts/scripts.js';

function createCard(cardData) {
  const [imageContainer, imageAltText, title, desc, titlelink, btn, btnLink] = [
    ...cardData.children,
  ];
  const imgElement = imageContainer?.querySelector('img');
  if (imgElement && imageAltText) {
    imgElement.setAttribute('alt', imageAltText.textContent);
    imageContainer.className = 'card-img';
    imageAltText.remove();
  }
  desc.className = 'desc';
  imgElement.addEventListener('click', () => {
    window.location.href = titlelink.textContent;
  });

  const txtContainer = div(
    { class: 'text-content' },
    a({ href: titlelink.textContent, class: 'title' }, title),
    desc,
    a({ href: btnLink.textContent, class: 'card-btn' }, btn),
  );
  cardData.append(txtContainer);
  cardData.className = 'rp-card';

  titlelink.remove();
  btnLink.remove();
}

export default async function decorate(block) {
  const [title, linkText, link, ...cards] = [...block.children];
  title.className = CLASS_MAIN_HEADING;
  const linkTag = link.getElementsByTagName('a')[0];
  linkTag.innerHTML = linkText.textContent;
  linkTag.title = linkText.textContent;
  linkTag.className = 'button primary';
  const titleButtonWrapper = div({ class: 'heading-wrapper' }, title, link);
  const buttonWrapper = div(
    { class: 'button-wrapper' },
    linkTag.cloneNode(true),
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
