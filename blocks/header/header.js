import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import getLanguageSelector from './language-selector.js';
import {
  getNavigationMenu, formatNavigationJsonData, closesideMenu, closesearchbar,
} from './navigation.js';

import {
  fetchLanguagePlaceholders,
  fetchLangDatabyFileName,
} from '../../scripts/scripts.js';
import {
  getLanguage, PATH_PREFIX, fetchLanguageNavigation,
} from '../../scripts/utils.js';
import * as constants from './constants.js';
import {
  button,
  div,
  img,
  span,
  a,
} from '../../scripts/dom-helpers.js';
// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 1024px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById(constants.NAV);
    const navSections = nav.querySelector(constants.NAV_SECTIONS_WITH_SELECTOR);
    const expanded = isDesktop && nav.getAttribute('aria-expanded') === 'true';
    if (expanded) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
    }
  }
}
function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections
    .querySelectorAll('.nav-sections .default-content-wrapper > ul > li')
    .forEach((section) => {
      section.setAttribute('aria-expanded', expanded);
    });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */

function closeSearchBox() {
  const navWrapper = document.querySelector('.nav-wrapper');
  const headerWrapper = document.querySelector('.header-wrapper');
  const searchContainer = headerWrapper.querySelector('.search-container');
  const cancelContainer = navWrapper.querySelector('.cancel-container');
  const overlay = document.querySelector('.overlay');
  const searchImage = document.querySelector('.icon-search');

  searchContainer.style.display = 'none';
  cancelContainer.style.display = 'none';
  searchImage.style.display = 'flex';
  overlay.style.display = 'none';
  document.body.classList.remove('no-scroll');
}

async function overlayLoad(navSections) {
  const langCode = getLanguage();
  const placeholdersData = await fetchLanguagePlaceholders();
  const navOverlay = navSections.querySelector(constants.NAV_MENU_OVERLAY_WITH_SELECTOR);
  if (!navOverlay) {
    const structuredNav = formatNavigationJsonData(window.navigationData[`/${langCode}`]);
    // Add navigation menu to header
    navSections.append(getNavigationMenu(structuredNav, placeholdersData));
  }
  const rightColumn = navSections.querySelector('.nav-menu-column.right');
  const leftColumn = navSections.querySelector('.nav-menu-column.left');
  isDesktop.addEventListener('change', () => closesideMenu(leftColumn, rightColumn));
  document.body.addEventListener('click', (e) => closesearchbar(e, navSections));
  document.body.addEventListener('keydown', (e) => closesearchbar(e, navSections));
}

async function toggleMenu(nav, navSections, forceExpanded = null) {
  if (window.navigationData) {
    await overlayLoad(navSections);
  } else {
    return;
  }
  const expanded = forceExpanded !== null
    ? !forceExpanded
    : nav.getAttribute('aria-expanded') === 'true';
  const hamButton = nav.querySelector('.nav-hamburger button');
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(
    navSections,
    expanded || isDesktop.matches ? 'false' : 'true',
  );
  hamButton.setAttribute(
    'aria-label',
    expanded ? constants.OPEN_NAVIGATION : constants.CLOSE_NAVIGATION,
  );
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('role', 'hamButton');
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('role');
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  const navMenuOverlay = navSections.querySelector(
    constants.NAV_MENU_OVERLAY_WITH_SELECTOR,
  );

  const hamburgerDiv = nav.querySelector('.nav-hamburger');
  const hamburgerButton = hamburgerDiv.querySelector('button');
  const hamburgerIcon = hamburgerDiv.querySelector('.nav-hamburger-icon');
  const skiptomain = document.getElementById('skip-to-main-content');

  if (!expanded) {
    hamburgerDiv.setAttribute('tabindex', '-1');
    navMenuOverlay.querySelector('.nav-menu').setAttribute('aria-hidden', 'false');
    document.querySelector('main').setAttribute('inert', 'true');
    document.querySelector('footer').setAttribute('inert', 'true');
    hamburgerButton.setAttribute('tabindex', '-1');
    hamburgerIcon.setAttribute('tabindex', '0');
    skiptomain.setAttribute('tabindex', '-1');
    hamburgerIcon.focus();
  } else {
    hamburgerDiv.removeAttribute('tabindex');
    navMenuOverlay.querySelector('.nav-menu').setAttribute('aria-hidden', 'true');
    document.querySelector('main').removeAttribute('inert');
    document.querySelector('footer').removeAttribute('inert');
    hamburgerDiv.removeAttribute('tabindex');
    hamburgerButton.removeAttribute('tabindex');
    hamburgerIcon.removeAttribute('tabindex');
    skiptomain.removeAttribute('tabindex');
    hamburgerButton.focus();
  }

  if (!expanded) {
    document.body.classList.add('no-scroll');
    navMenuOverlay.classList.add(constants.OPEN);
    navMenuOverlay.scrollTop = 0;
  } else {
    document.body.classList.remove('no-scroll');
    navMenuOverlay.classList.remove(constants.OPEN);
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener(constants.KEY_DOWN, closeOnEscape);
  } else {
    window.removeEventListener(constants.KEY_DOWN, closeOnEscape);
  }

  const headerWrapper = document.querySelector('.header-wrapper');
  const searchContainer = headerWrapper.querySelector('.search-container');
  if (searchContainer) {
    closeSearchBox();
  }
  const rightColumn = navSections.querySelector('.nav-menu-column.right');
  const leftColumn = navSections.querySelector('.nav-menu-column.left');
  closesideMenu(leftColumn, rightColumn);
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
let listOfAllPlaceholdersData = [];
let searchContainer;

function makeImageClickableNSettingAltText() {
  const logoImage = document.querySelector('.nav-brand img');
  const anchor = document.createElement('a');
  Object.assign(anchor, {
    href: listOfAllPlaceholdersData.logoUrl || 'https://main--world-bank--aemsites.aem.live/ext/en/home',
    title: logoImage?.alt,
  });
  const picture = document.querySelector('.nav-brand picture');
  if (picture) anchor.appendChild(picture);
  const targetElement = document.querySelector('.nav-brand .default-content-wrapper');
  targetElement?.appendChild(anchor);
}

function handleEnterKey(event) {
  if (event.key !== 'Enter') return;
  const inputValue = document.querySelector('.search-container input').value;
  const url = (listOfAllPlaceholdersData.searchRedirectUrl || 'https://www.worldbank.org/en/search?q=') + inputValue;
  if (inputValue) window.location.href = url;
}

function createSearchBox() {
  const navWrapper = document.querySelector('.nav-wrapper');
  const headerWrapper = document.querySelector('.header-wrapper');
  const navTools = document.querySelector('.nav-tools p');
  searchContainer = headerWrapper.querySelector('.search-container');
  let cancelContainer = navWrapper.querySelector('.cancel-container');
  let overlay = document.querySelector('.overlay');
  const searchImage = document.querySelector('.icon-search');
  document.body.classList.add('no-scroll');
  if (searchContainer) {
    const isVisible = searchContainer.style.display !== 'none';
    searchContainer.style.display = isVisible ? 'none' : 'flex';
    if (cancelContainer) {
      cancelContainer.style.display = isVisible ? 'none' : 'flex';
    }
    overlay.style.display = isVisible ? 'none' : 'block';

    searchImage.style.display = isVisible ? 'block' : 'none';
  } else {
    cancelContainer = div(
      {
        class: 'cancel-container',
        role: 'button',
        tabindex: 0,
        'aria-label': 'close Search Box',
      },
    );
    const cancelImg = img({ class: 'cancel-image' });
    cancelImg.src = `${window.hlx.codeBasePath}/icons/cancel.svg`;
    cancelImg.alt = 'cancel';
    cancelImg.style.cssText = 'display: flex; cursor: pointer;';
    cancelContainer.addEventListener('click', () => {
      closeSearchBox();
    });
    cancelContainer.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        closeSearchBox();
      }
    });
    cancelContainer.appendChild(cancelImg);
    navTools.appendChild(cancelContainer);
    // Hide search icon
    searchImage.style.display = 'none';
    searchContainer = div({ class: 'search-container' });
    overlay = div({ class: 'overlay' });
    document.body.appendChild(overlay);
    const searchInputContainer = div({ class: 'search-input-container' });
    const searchInputBox = document.createElement('input');
    const searchIcon = img({ class: 'search-icon' });
    searchIcon.src = `${window.hlx.codeBasePath}/icons/search-white.svg`;
    searchIcon.alt = 'search';
    searchIcon.addEventListener('click', () => {
      if (searchInputBox.value) {
        window.location.href = (listOfAllPlaceholdersData.searchRedirectUrl || 'https://www.worldbank.org/en/search?q=') + searchInputBox.value;
      }
    });

    Object.assign(searchInputBox, {
      type: 'search',
      id: 'search-input',
      name: 'myInput',
      placeholder: listOfAllPlaceholdersData.searchVariable || 'Search worldbank.org',
      value: '',
      autocomplete: 'off',
    });
    searchInputBox.addEventListener('keydown', handleEnterKey);
    searchInputContainer.append(searchInputBox, searchIcon);
    const searchContainerWrapper = div({ class: 'search-input-wrapper' });
    searchContainerWrapper.append(searchInputContainer);
    searchContainer.appendChild(searchContainerWrapper);
    headerWrapper.appendChild(searchContainer);
  }
}

function settingAltTextForSearchIcon() {
  const searchImage = document.querySelector('.icon-search');
  searchImage.style.cursor = 'pointer';
  searchImage.addEventListener('click', () => {
    createSearchBox();
  });
  searchImage.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      createSearchBox();
      e.currentTarget.nextElementSibling.focus();
    }
  });
  searchImage.setAttribute('title', listOfAllPlaceholdersData.searchAltText || 'Search');
}

async function fetchingPlaceholdersData(placeholdersData) {
  listOfAllPlaceholdersData = await fetchLanguagePlaceholders();
  const hamburger = document.querySelector('.nav-hamburger');
  hamburger.setAttribute('title', placeholdersData.hamburgerAltText);
  makeImageClickableNSettingAltText();
  settingAltTextForSearchIcon();
}

async function setTrendingDataAsUrl(tdElement, placeholderData) {
  const trendingDataJson = await fetchLangDatabyFileName(constants.TRENDING_DATA_FILENAME);
  const randomTd = trendingDataJson[Math.floor(Math.random() * trendingDataJson.length)];
  const trendingText = placeholderData.trendingData || 'Trending Data';
  const trendinEl = span(trendingText);
  const trendingFact = span(randomTd.Text);
  tdElement.innerHTML = trendinEl.outerHTML + trendingFact.outerHTML;
  return a({ href: randomTd.Link, target: '_blank' }, tdElement);
}

async function changeTrendingData(navSections, placeholderData) {
  if (!navSections) return;
  const trendingDataWrapper = navSections.querySelector('.default-content-wrapper');
  const trendingDataDiv = await setTrendingDataAsUrl(navSections.querySelector('.default-content-wrapper > p:nth-child(2)'), placeholderData);
  trendingDataWrapper.append(trendingDataDiv);
}

const setAccessibilityAttrForSearchIcon = (contentWrapper) => {
  const [iconTag] = [...contentWrapper.children];
  const iconSpan = iconTag.querySelector('span');
  iconSpan.setAttribute('role', 'button');
  iconSpan.setAttribute('aria-label', 'Perform a search query');
  iconSpan.setAttribute('tabindex', 0);
};

const closeSearchOnFocusOut = (e, navTools) => {
  if (searchContainer && searchContainer.style.display !== 'none') {
    const cancelContainer = navTools.querySelector('.cancel-container');
    const searchImage = navTools.querySelector('.icon-search');
    const isClickInside = searchContainer.contains(e.target)
      || cancelContainer.contains(e.target)
      || searchImage.contains(e.target);
    if (!isClickInside) {
      closeSearchBox();
    }
  }
};

function handleMainMenuFocus(block, navSections, hamburger) {
  block.addEventListener('keydown', (e) => {
    const allowedKeys = ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'Tab'];
    if (!allowedKeys.includes(e.key)) return;

    const leftColumn = navSections.querySelector('.nav-menu-column.left');
    const rightColumn = navSections.querySelector('.nav-menu-column.right');
    const closeIcon = hamburger.querySelector('.nav-hamburger-icon');
    const focused = document.activeElement;

    const isLeftColumn = leftColumn.contains(focused);
    const isRightColumn = rightColumn.contains(focused);
    const isNavCloseIcon = closeIcon.contains(focused);

    const getNextElement = (elements, direction) => {
      const currentIndex = Array.from(elements).indexOf(focused);
      const nextIndex = currentIndex + (direction === 'down' ? 1 : -1);
      return elements[nextIndex];
    };

    if (isLeftColumn && e.key === 'ArrowRight') {
      rightColumn.querySelector('ul.submenu[aria-expanded="true"] a')?.focus();
    }

    if (isRightColumn && e.key === 'ArrowLeft') {
      leftColumn.querySelector('ul > li.selected')?.focus();
    }

    if (isRightColumn && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      const links = rightColumn.querySelectorAll(
        'ul.submenu[aria-expanded="true"] a',
      );
      const direction = e.key === 'ArrowDown' ? 'down' : 'up';
      getNextElement(links, direction)?.focus();
    }

    if (isLeftColumn && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      const items = leftColumn.querySelectorAll('ul > li');
      const direction = e.key === 'ArrowDown' ? 'down' : 'up';
      getNextElement(items, direction)?.focus();
    }

    if (isNavCloseIcon && e.key === 'Tab') {
      // initial focus doesn't seem to have the desired effect
      // so we're manually setting the enter to the first element
      const enterEvent = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: 'Enter',
        code: 'Enter',
        charCode: 13,
        keyCode: 13,
        which: 13,
      });

      const firstLi = leftColumn.querySelector('ul > li');
      firstLi.dispatchEvent(enterEvent);
    }
  });
}

export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const langCode = getLanguage();
  const navPath = navMeta
    ? new URL(navMeta, window.location).pathname
    : `${PATH_PREFIX}/${langCode}/nav`;
  const fragment = await loadFragment(navPath);
  const placeholdersData = await fetchLanguagePlaceholders();
  fetchLanguageNavigation(`/${langCode}`);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment !== null && fragment.firstElementChild) {
    nav.append(fragment.firstElementChild);
  }

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand?.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections
      .querySelectorAll(':scope .default-content-wrapper > ul > li')
      .forEach((navSection) => {
        if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
        navSection.addEventListener('click', () => {
          if (isDesktop.matches) {
            const expanded = navSection.getAttribute('aria-expanded') === 'true';
            toggleAllNavSections(navSections);
            navSection.setAttribute(
              'aria-expanded',
              expanded ? 'false' : 'true',
            );
          }
        });
      });
  }

  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    const contentWrapper = nav.querySelector('.nav-tools > div[class = "default-content-wrapper"]');
    setAccessibilityAttrForSearchIcon(contentWrapper);
    const languageSelector = await getLanguageSelector(placeholdersData, langCode);
    contentWrapper.prepend(languageSelector);

    // Close Search Container on Focus out
    document.addEventListener('click', (e) => {
      closeSearchOnFocusOut(e, navTools);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (searchContainer && searchContainer.style.display !== 'none' && searchContainer.contains(e.target)) {
          closeSearchBox();
        }
      }
    });
  }

  // hamburger for mobile
  const hamburger = div(
    { class: 'nav-hamburger', onclick: () => { toggleMenu(nav, navSections); } },
    button(
      {
        type: 'button',
        'aria-controls': 'nav',
        'aria-label': constants.OPEN_NAVIGATION,
      },
      span({ class: 'nav-hamburger-icon' }),
    ),
  );
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
  if (isDesktop.matches) await changeTrendingData(navSections, placeholdersData);
  fetchingPlaceholdersData(placeholdersData);
  handleMainMenuFocus(block, navSections, hamburger);
}
