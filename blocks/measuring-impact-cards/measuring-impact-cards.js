import { div, a, p } from '../../scripts/dom-helpers.js';
import { moveInstrumentation, fetchLanguagePlaceholders } from '../../scripts/scripts.js';

const capitalizeFirstLetter = (str) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const splitIndicatorTag = (indicatorTag, index = 0) => {
  if (indicatorTag && indicatorTag.indexOf('-') < 0) return indicatorTag;
  const prefix = index === 1 ? 'theme' : 'impactCard';
  const indicator = indicatorTag.split('-')
    .map((part) => `${prefix}${capitalizeFirstLetter(part)}`)
    .map((part) => part.trim().replace(/[^a-zA-Z0-9]/g, ''));
  return indicator[index];
};

const getShortendIndicatorName = (indicatorTag, placeholdersData) => {
  const indicatorKey = splitIndicatorTag(indicatorTag);
  return placeholdersData[indicatorKey] ? placeholdersData[indicatorKey] : indicatorKey;
};

const getColorCode = (indicatorTag, placeholdersData) => {
  const indicatorColorKey = splitIndicatorTag(indicatorTag, 1);
  return placeholdersData[indicatorColorKey] ? placeholdersData[indicatorColorKey]
    : indicatorColorKey;
};

const getImpactCardWrapper = (impactCard, placeholdersData) => {
  const [indicatorTag, icon, title, description, cardLink] = [...impactCard.children];
  const colorCode = getColorCode(indicatorTag.textContent, placeholdersData);
  const impactCardWrapper = div({ class: 'impact-card-wrapper', style: `border-top: 2px solid ${colorCode}` });
  moveInstrumentation(impactCard, impactCardWrapper);

  const impactCardIcon = div({ class: 'impact-card-img' });
  const impactCardContent = div(
    { class: 'impact-card-content' },
    p(title.textContent),
    p(description.textContent),
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

  impactCardWrapper.append(a(
    { href: link },
    p({ class: 'impact-indicator' }, getShortendIndicatorName(indicatorTag.textContent, placeholdersData)),
    impactCardBody,
  ));

  // Remove default one's
  impactCard.innerHTML = '';
  impactCard.remove();

  return impactCardWrapper;
};

export default async function decorate(block) {
  const impactCardList = Array.from(block.children);
  if (impactCardList && impactCardList.length > 0) {
    const placeholdersData = await fetchLanguagePlaceholders();
    impactCardList.forEach((impactCard) => {
      const impactCardContentWrapper = getImpactCardWrapper(impactCard, placeholdersData);
      block.append(impactCardContentWrapper);
    });
  }
}
