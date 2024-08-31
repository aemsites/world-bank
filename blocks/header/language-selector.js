import {
  li, ul, a, div,
} from '../../scripts/dom-helpers.js';
import { getMetadata } from '../../scripts/aem.js';
import * as Constants from './constants.js';

function capitalizeFirstLetter(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
// Get Language Selector Display Text based on screen size
const getLanguageDisplayText = (placeholdersData, lang, isConsiderResize) => ((
  (window.screen.width >= 768 || !isConsiderResize)
  && placeholdersData[`${Constants.langPrefix}${capitalizeFirstLetter(lang)}`])
  ? placeholdersData[`${Constants.langPrefix}${capitalizeFirstLetter(lang)}`]
  : lang);

// Language toggle based on screen width
const updateLanguageTextContent = (domElement, placeholdersData, lang) => {
  domElement.textContent = getLanguageDisplayText(placeholdersData, lang, true);
};

// Show/hide Language Selector content on click
const toggleExpandLanguageSelector = (e) => {
  const toggleContainer = e.currentTarget;
  const toggleContent = toggleContainer.querySelector(Constants.languageContentSelector);
  if (!toggleContainer || !toggleContent) return;
  const toggler = toggleContainer.querySelector(Constants.languageToggleSelector);
  const isExpanded = toggleContainer.classList.contains(Constants.contentExpandedActive);
  if (e.type === Constants.typeClick) {
    toggleContainer.classList.toggle(Constants.contentExpandedActive);
    toggler.setAttribute(Constants.attrAriaExpanded, !isExpanded);
    toggler.classList.toggle(Constants.languageToggleBorderClass);
    toggleContent.classList.toggle(Constants.contentExpanded);
  }
};

const fetchLanguageSelectorContent = (placeholdersData, metaLangContent, langCode) => {
  const ulElement = ul();
  if (metaLangContent && metaLangContent.split(Constants.commaSeparator).length > 0) {
    const langPairs = metaLangContent.split(Constants.commaSeparator);
    langPairs.forEach((pair) => {
      const [language, url] = pair.split(Constants.pipeSeparator).map((part) => part.trim());
      if (langCode === language) return;
      const liElement = li(
        a(
          { href: `${url}` },
          getLanguageDisplayText(placeholdersData, language, false),
        ),
      );
      ulElement.append(liElement);
    });
  }
  return ulElement;
};

// Create and return Language Selector DOM Element
const getLanguageSelector = (placeholdersData, lang) => {
  const metaLangContent = getMetadata(Constants.languageSelectorMetaName);

  const languageToggle = div({ 'aria-expanded': 'false' });
  const langSelector = div({ class: Constants.languageContainerClass }, languageToggle);

  // Show only Current Language when no meta content authored
  if (!metaLangContent) {
    updateLanguageTextContent(languageToggle, placeholdersData, lang);
    languageToggle.classList.add(Constants.languageTextClass);
  } else {
    const languageMap = fetchLanguageSelectorContent(placeholdersData, metaLangContent, lang);
    const languageSelectorContent = div(
      { class: Constants.languageContentClass },
      languageMap,
    );
    languageToggle.classList.add(Constants.languageToggleClass);
    langSelector.addEventListener('click', toggleExpandLanguageSelector);
    langSelector.append(languageSelectorContent);
  }
  // Show Language code in Mobile
  const resizeObserver = new ResizeObserver(() => {
    updateLanguageTextContent(languageToggle, placeholdersData, lang);
  });

  setTimeout(() => {
    if (langSelector) {
      resizeObserver.observe(langSelector.parentElement.parentElement.parentElement);
    }
  }, 0);

  return langSelector;
};

export default getLanguageSelector;
