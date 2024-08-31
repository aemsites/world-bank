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
const getLanguageDisplayText = (placeholdersData, lang) => ((window.screen.width >= 768
  && placeholdersData[`${Constants.LANG_PREFIX}${capitalizeFirstLetter(lang)}`])
  ? placeholdersData[`${Constants.LANG_PREFIX}${capitalizeFirstLetter(lang)}`]
  : lang);

// Language toggle based on screen width
const updateLanguageTextContent = (domElement, placeholdersData, lang) => {
  domElement.textContent = getLanguageDisplayText(placeholdersData, lang);
};

// Show/hide Language Selector content on click
const toggleExpandLanguageSelector = (e) => {
  const toggleContainer = e.currentTarget;
  const toggleContent = toggleContainer.querySelector(Constants.LANGUAGE_CONTENT_SELECTOR);
  if (!toggleContainer || !toggleContent) return;
  const toggler = toggleContainer.querySelector(Constants.LANGUAGE_TOGGLE_SELECTOR);
  const isExpanded = toggleContainer.classList.contains(Constants.CONTENT_EXPANDED_ACTIVE);
  if (e.type === Constants.TYPE_CLICK) {
    toggleContainer.classList.toggle(Constants.CONTENT_EXPANDED_ACTIVE);
    toggler.setAttribute(Constants.ATTR_ARIA_EXPANDED, !isExpanded);
    toggler.classList.toggle(Constants.LANGUAGE_TOGGLE_BORDER_CLASS);
    toggleContent.classList.toggle(Constants.CONTENT_EXPANDED);
  }
};

const fetchLanguageSelectorContent = (placeholdersData, metaLangContent, langCode) => {
  const ulElement = ul();
  if (metaLangContent && metaLangContent.split(Constants.COMMA_SEPARATOR).length > 0) {
    const langPairs = metaLangContent.split(Constants.COMMA_SEPARATOR);
    langPairs.forEach((pair) => {
      const [language, url] = pair.split(Constants.PIPE_SEPARATOR).map((part) => part.trim());
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
  const metaLangContent = getMetadata(Constants.LANGUAGE_SELECTOR_META_NAME);

  const languageToggle = div({ 'aria-expanded': 'false' });
  const langSelector = div({ class: Constants.LANGUAGE_CONTAINER_CLASS }, languageToggle);

  // Show only Current Language when no meta content authored
  if (!metaLangContent) {
    updateLanguageTextContent(languageToggle, placeholdersData, lang);
    languageToggle.classList.add(Constants.LANGUAGE_TEXT_CLASS);
  } else {
    const languageMap = fetchLanguageSelectorContent(placeholdersData, metaLangContent, lang);
    const languageSelectorContent = div(
      { class: Constants.LANGUAGE_CONTENT_CLASS },
      languageMap,
    );
    languageToggle.classList.add(Constants.LANAGUAGE_TOGGLE_CLASS);
    langSelector.addEventListener('click', toggleExpandLanguageSelector);
    langSelector.append(languageSelectorContent);
  }
  // Show Language code in Mobile
  const resizeObserver = new ResizeObserver(() => {
    updateLanguageTextContent(languageToggle, placeholdersData, lang);
  });
  resizeObserver.observe(document.body);

  return langSelector;
};

export default getLanguageSelector;
