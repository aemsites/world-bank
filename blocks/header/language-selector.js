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

// Handle Screen resize for Language Selector ul > li content
const handleResize = (entries, placeholdersData, language) => {
  entries.forEach((entry) => {
    if (entry.target) {
      const aElement = entry.target.querySelector('a');
      if (aElement) {
        updateLanguageTextContent(aElement, placeholdersData, language);
      }
    }
  });
};

// Create a ResizeObserver instance with a callback
const createResizeObserver = (placeholdersData, language) => new ResizeObserver((entries) => {
  handleResize(entries, placeholdersData, language);
});

// Show/hide Language Selector content on click
const toggleExpandLanguageSelector = (e) => {
  const toggleContainer = e.currentTarget;
  const toggleContent = toggleContainer.querySelector(Constants.LANGUAGE_CONTENT_SELECTOR);
  if (!toggleContainer || !toggleContent) return;
  const toggler = toggleContainer.querySelector(Constants.LANGUAGE_TOGGLE_SELECTOR);
  const horizontalLine = toggleContainer.querySelector(Constants.HORIZONTAL_LINE_CLASS_SELECTOR);
  const isExpanded = toggleContainer.classList.contains(Constants.CONTENT_EXPANDED_ACTIVE);
  if (e.type === Constants.TYPE_CLICK) {
    toggleContainer.classList.toggle(Constants.CONTENT_EXPANDED_ACTIVE);
    toggler.setAttribute(Constants.ATTR_ARIA_EXPANDED, !isExpanded);
    toggleContent.classList.toggle(Constants.CONTENT_EXPANDED);
    horizontalLine.classList.toggle(Constants.HORIZONTAL_LINE_EXPAND_CLASS);
  }
};

const fetchLanguageSelectorContent = (placeholdersData, metaLangContent, langCode) => {
  const ulElement = ul();
  if (metaLangContent && metaLangContent.split(Constants.COMMA_SEPARATOR).length > 0) {
    const langPairs = metaLangContent.split(Constants.COMMA_SEPARATOR);
    langPairs.forEach((pair) => {
      const [language, url] = pair.split(Constants.PIPE_SEPARATOR).map((part) => part.trim());
      const liElement = li(
        { class: `${langCode === language ? Constants.SHOW_SELECTED_CLASS : ''}` },
        a(
          { href: `${url}` },
          getLanguageDisplayText(placeholdersData, language),
        ),
      );
      ulElement.append(liElement);
      // ResizeObserver for the liElement to show language code for mobile
      const resizeObserver = createResizeObserver(placeholdersData, language);
      resizeObserver.observe(liElement);
    });
  } else {
    const liElement = li(
      { class: Constants.SHOW_SELECTED_CLASS },
      a(
        { href: window.location.href },
        getLanguageDisplayText(placeholdersData, langCode),
      ),
    );
    ulElement.append(liElement);
    // ResizeObserver for the liElement to show language code for mobile
    const resizeObserver = createResizeObserver(placeholdersData, langCode);
    resizeObserver.observe(liElement);
  }
  return ulElement;
};

// Create and return Language Selector DOM Element
const getLanguageSelector = (placeholdersData, lang) => {
  const metaLangContent = getMetadata(Constants.LANGUAGE_SELECTOR_META_NAME);
  const languageMap = fetchLanguageSelectorContent(placeholdersData, metaLangContent, lang);

  const languageSelectorContent = div(
    { class: Constants.LANGUAGE_CONTENT_CLASS },
    languageMap,
  );

  const languageToggle = div(
    {
      class: Constants.LANAGUAGE_TOGGLE_CLASS,
      'aria-expanded': 'false',
    },
  );

  const langSelector = div(
    {
      class: Constants.LANGUAGE_CONTAINER_CLASS,
      onclick: (e) => toggleExpandLanguageSelector(e),
    },
    languageToggle,
    div({ class: Constants.HORIZONTAL_LINE_CLASS }),
  );
  langSelector.append(languageSelectorContent);

  // Show Language code in Mobile
  const resizeObserver = new ResizeObserver(() => {
    updateLanguageTextContent(languageToggle, placeholdersData, lang);
  });

  resizeObserver.observe(langSelector);

  return langSelector;
};

export default getLanguageSelector;
