import { div, a, p } from '../../scripts/dom-helpers.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function processImpactCard(impactCard) {
  const [indicatorTag, icon, title, description, cardLink] = [...impactCard.children];
  const impactCardWrapper = div({ class: 'impact-card-wrapper' });
  moveInstrumentation(impactCard, impactCardWrapper);

  const impactCardIcon = div({ class: 'impact-card-img' });
  const impactCardContent = div(
    { class: 'impact-card-content' },
    p({ class: 'impact-card-title' }, title.textContent),
    p({ class: 'impact-card-description' }, description.textContent),
  );

  const link = cardLink.textContent ? cardLink.textContent : '#';
  cardLink.remove();
  if (icon) {
    impactCardIcon.innerHTML = icon.innerHTML;
  }

  const impactCardBody = div(
    { class: 'impact-card-body-content' },
    impactCardIcon,
    impactCardContent,
  );

//   impactCardWrapper.append(a(
//     { href: link },
//     p({ class: 'impact-indicator' }, indicatorTag.textContent),
//     impactCardBody,
//   ));

  impactCardWrapper.append(
    p({ class: 'impact-indicator' }, indicatorTag.textContent),
    impactCardBody,
  );

  // Remove default one's
  impactCard.innerHTML = '';
  impactCard.remove();

  return impactCardWrapper;
}
export default async function decorate(block) {
  const impactCardList = Array.from(block.children);
  if (impactCardList && impactCardList.length > 0) {
    impactCardList.forEach((impactCard) => {
      const impactCardContentWrapper = processImpactCard(impactCard);
      block.append(impactCardContentWrapper);
    });
  }
}
