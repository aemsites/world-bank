import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import getLanguageSelector from './language-selector.js';
import { getNavigationMenu, formatNavigationJsonData } from './navigation.js';

import {
  fetchLanguageNavigation,
  fetchLanguagePlaceholders,
  getLanguage,
} from '../../scripts/scripts.js';
import * as Constants from './constants.js';
import {
  button,
  div,
  img,
  span,
} from '../../scripts/dom-helpers.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 1024px)');
function closesideMenu(leftColumn, rightColumn) {
  leftColumn.style.display = 'flex';
  leftColumn.style.display = 'flex';
  if (!isDesktop.matches) {
    rightColumn.style.display = 'none';
  } else {
    rightColumn.style.display = 'flex';
  }
  const submenuElements = rightColumn.getElementsByClassName(Constants.SUBMENU);
  const submenus = Array.from(submenuElements);
  leftColumn.querySelectorAll('li').forEach((leftColumnItem, index) => {
    leftColumnItem.classList.remove('selected');
    if (index === 0) leftColumnItem.classList.add('selected');
  });
  submenus.forEach((submenu, index) => {
    if (isDesktop.matches && index === 0) {
      submenu.style.display = 'flex';
    } else {
      submenu.style.display = 'none';
    }
  });
  const sidemenuBackButton = rightColumn.querySelector(
    '.nav-menu-overlay-back',
  );
  sidemenuBackButton.style.display = 'none';
  const currentSubMenu = rightColumn.querySelector(
    Constants.SUBMENU_MAIN_TITLE_WITH_SELECTOR,
  );
  currentSubMenu.style.display = 'none';
}

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById(Constants.NAV);
    const navSections = nav.querySelector(Constants.NAV_SECTIONS_WITH_SELECTOR);
    const navSectionExpanded = navSections.querySelector(
      '[aria-expanded="true"]',
    );
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      navSections.querySelector('.default-content-wrapper').focus();
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
function toggleMenu(nav, navSections, forceExpanded = null) {
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
    expanded ? Constants.OPEN_NAVIGATION : Constants.CLOSE_NAVIGATION,
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
  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
  }

  const navMenuOverlay = navSections.querySelector(
    Constants.NAV_MENU_OVERLAY_WITH_SELECTOR,
  );
  if (!expanded) {
    navMenuOverlay.classList.add(Constants.OPEN);
  } else {
    navMenuOverlay.classList.remove(Constants.OPEN);
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener(Constants.KEY_DOWN, closeOnEscape);
  } else {
    window.removeEventListener(Constants.KEY_DOWN, closeOnEscape);
  }
}
/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
let listOfAllPlaceholdersData = [];

function makeImageClickableNSettingAltText() {
  const logoImage = document.querySelector('.nav-brand img');
  const anchor = document.createElement('a');
  Object.assign(anchor, {
    href: listOfAllPlaceholdersData.logoUrl,
    title: logoImage.alt,
  });
  anchor.appendChild(document.querySelector('.nav-brand picture'));
  document
    .querySelector('.nav-brand .default-content-wrapper')
    .appendChild(anchor);
}

function handleEnterKey(event) {
  if (event.key !== 'Enter') return;
  const inputValue = document.querySelector('.search-container input').value;
  const url = listOfAllPlaceholdersData.searchRedirectUrl + inputValue;
  if (inputValue) window.location.href = url;
}

function createSearchBox() {
  const navWrapper = document.querySelector('.nav-wrapper');
  const headerWrapper = document.querySelector('.header-wrapper');
  const navTools = document.querySelector('.nav-tools p');
  let searchContainer = navWrapper.querySelector('.search-container');
  let cancelContainer = navWrapper.querySelector('.cancel-container');
  let overlay = document.querySelector('.overlay');
  const searchImage = document.querySelector('.icon-search');
  const hamBurgerIcon = navWrapper.querySelector('.nav-hamburger');
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
    hamBurgerIcon.style.pointerEvents = 'none';
    cancelContainer = div({ class: 'cancel-container' });
    const cancelImg = img({ class: 'cancel-image' });
    cancelImg.src = `${window.hlx.codeBasePath}/icons/cancel.svg`;
    cancelImg.alt = 'cancel';
    cancelImg.style.cssText = 'display: flex; cursor: pointer;';
    cancelContainer.addEventListener('click', () => {
      searchContainer.style.display = 'none';
      cancelContainer.style.display = 'none';
      searchImage.style.display = 'block'; // Show search icon again
      overlay.style.display = 'none';
      hamBurgerIcon.style.pointerEvents = 'all';
      document.body.classList.remove('no-scroll');
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
    searchIcon.addEventListener('input', () => {
      if (searchInputBox.value) {
        window.location.href = listOfAllPlaceholdersData.searchRedirectUrl + searchInputBox.value;
      }
    });

    Object.assign(searchInputBox, {
      type: 'search',
      id: 'search-input',
      name: 'myInput',
      placeholder: listOfAllPlaceholdersData.searchVariable,
      value: '',
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
  searchImage.setAttribute('title', listOfAllPlaceholdersData.searchAltText);
}

async function fetchingPlaceholdersData(placeholdersData) {
  listOfAllPlaceholdersData = await fetchLanguagePlaceholders();
  const hamburger = document.querySelector('.nav-hamburger');
  hamburger.setAttribute('title', placeholdersData.hamburgerAltText);
  makeImageClickableNSettingAltText();
  settingAltTextForSearchIcon();
}

export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const langCode = getLanguage();
  const navPath = navMeta
    ? new URL(navMeta, window.location).pathname
    : `/${langCode}/nav`;
  const fragment = await loadFragment(navPath);
  const placeholdersData = await fetchLanguagePlaceholders();

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
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    const structuredNav = formatNavigationJsonData(
      await fetchLanguageNavigation(`/${langCode}`),
    );
    // Add navigation menu to header
    navSections.append(getNavigationMenu(structuredNav, placeholdersData));

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
    const languageSelector = getLanguageSelector(placeholdersData, langCode);
    contentWrapper.prepend(languageSelector);
  }

  const rightColumn = nav.querySelector('.nav-menu-column.right');
  const leftColumn = nav.querySelector('.nav-menu-column.left');
  // hamburger for mobile
  const hamburger = div(
    { class: 'nav-hamburger', onclick: () => { toggleMenu(nav, navSections); closesideMenu(leftColumn, rightColumn); } },
    button(
      {
        type: 'button',
        'aria-controls': 'nav',
        'aria-label': Constants.OPEN_NAVIGATION,
      },
      span({ class: 'nav-hamburger-icon' }),
    ),
  );
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  isDesktop.addEventListener('change', () => closesideMenu(leftColumn, rightColumn));
  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
  fetchingPlaceholdersData(placeholdersData);
}
