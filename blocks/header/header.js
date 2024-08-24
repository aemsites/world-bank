import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { fetchLanguageNavigation, fetchLanguagePlaceholders } from '../../scripts/scripts.js';
import * as Constants from './constants.js';
import {
  p, button, div, a, li, ul, input, span,
} from '../../scripts/dom-helpers.js';
// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 1024px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById(Constants.NAV);
    const navSections = nav.querySelector(Constants.NAV_SECTIONS_WITH_SELECTOR);
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      navSections.querySelector('.default-content-wrapper').focus();
    }
  }
}

function closesideMenu(leftColumn, rightColumn) {
  leftColumn.style.display = 'flex';
  rightColumn.style.display = 'none';
  const submenuElements = rightColumn.getElementsByClassName(Constants.SUBMENU);
  const submenus = Array.from(submenuElements);

  submenus.forEach((submenu) => {
    submenu.style.display = 'none';
  });
  const sidemenuBackButton = rightColumn.querySelector(Constants.MENU_OVERLAY_WITH_SELECTOR);
  sidemenuBackButton.style.display = 'none';
  const currentSubMenu = rightColumn.querySelector(Constants.SUBMENU_MAIN_TITLE_WITH_SELECTOR);
  currentSubMenu.style.display = 'none';
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections
    .querySelectorAll('.nav-sections .nav-menu-overlay .nav-menu > div')
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
  toggleAllNavSections(navSections, expanded ? 'false' : 'true');
  hamButton.setAttribute(
    'aria-label',
    expanded ? Constants.OPEN_NAVIGATION : Constants.CLOSE_NAVIGATION,
  );

  const navMenuOverlay = navSections.querySelector(Constants.NAV_MENU_OVERLAY_WITH_SELECTOR);
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

function formatNavigationJsonData(navJson) {
  const structuredData = [];
  let currentLevel0 = null;
  let currentCategory = null;
  let currentLevel1 = null;

  navJson.forEach((item) => {
    if (item.Type === Constants.LEVEL_0) {
      const level0 = {
        title: item.Title,
        categories: [],
      };
      structuredData.push(level0);
      currentLevel0 = level0;
    } else if (item.Type === Constants.CATEGORY || item.Type === Constants.FOOTER
      || item.Type === Constants.DROPDOWN) {
      const category = {
        ...item,
        items: [],
      };
      currentLevel0.categories.push(category);
      currentCategory = category;
    } else if (item.Type === Constants.LEVEL_1) {
      const level1 = {
        ...item,
        items: [],
      };
      currentCategory.items.push(level1);
      currentLevel1 = level1;
    } else if (item.Type === Constants.LEVEL_2) {
      currentLevel1.items.push(item);
    }
  });
  return structuredData;
}

function showSubMenu(leftColumn, rightColumn, submenuId, submenuTitle, currentIndex) {
  rightColumn.style.display = 'block';
  if (!isDesktop.matches) {
    const sidemenuBackButton = rightColumn.querySelector(Constants.OVERLAY_BACK_WITH_SELECTOR);
    sidemenuBackButton.style.display = 'block';
    const currentSubMenu = rightColumn.querySelector('.submenu-main-title');
    currentSubMenu.textContent = submenuTitle;
    currentSubMenu.style.display = 'flex';
    leftColumn.style.display = 'none';
  }

  const submenus = rightColumn.querySelectorAll(Constants.SUBMENU_WITH_SELECTOR);
  submenus.forEach((submenu) => {
    submenu.style.display = submenu.id === submenuId ? 'flex' : 'none';
  });

  // Update the selected state of the menu items in the left column
  const level0Items = leftColumn.querySelectorAll('li');
  level0Items.forEach((item, index) => {
    if (index === currentIndex) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  });
}
function createCategoriesAndSubMenu(level0Item, submenuId, index, countrySearchPlaceholder) {
  const submenu = ul(
    {
      id: submenuId,
      class: 'submenu',
      style: isDesktop.matches && index === 0 ? 'display: block;' : 'display: none;',
    },
  );

  level0Item.categories.forEach((category) => {
    if (category.Type === Constants.DROPDOWN) {
      const searchBarWrapper = li(
        {},
        ul(
          { textContent: category.Title },
          input({ type: 'search', placeholder: countrySearchPlaceholder }),
        ),
      );
      submenu.appendChild(searchBarWrapper);
    } else {
      const categoryList = ul();
      const categoryItem = li(
        {},
        category.Title,
      );
      category.items.forEach((subItem) => {
        const subMenuItem = li(
          {},
          a({ href: subItem.Link, textContent: subItem.Title }),
        );
        categoryList.appendChild(subMenuItem);
      });
      categoryItem.appendChild(categoryList);
      submenu.appendChild(categoryItem);
    }
  });
  return submenu;
}
function createNavMenu(structuredNav, searchByCountryPlaceholder) {
  // Create menu Overlay and divide in two column
  const listMainNavTitle = ul();
  const menuLeftColumn = div(
    { class: 'nav-menu-column left' },
    listMainNavTitle,
  );

  const menuRightColumn = div(
    { class: 'nav-menu-column right' },
    button({
      class: Constants.NAV_MENU_OVERLAY_BACK,
      onclick: () => closesideMenu(menuLeftColumn, menuRightColumn),
    }),
    p({ class: Constants.SUBMENU_MAIN_TITLE }),
  );

  const navMenu = div(
    { class: 'nav-menu' },
    menuLeftColumn,
    menuRightColumn,
  );

  const menuOverlay = div(
    { class: 'nav-menu-overlay' },
    navMenu,
  );

  // Iterate Over structured nav data to create left & right menu navigation.
  structuredNav.forEach((level0Item, index) => {
    const submenuId = `submenu_${index}`;
    // create left column menu
    const level0MenuItem = li(
      {
        onclick:
        () => showSubMenu(menuLeftColumn, menuRightColumn, submenuId, level0Item.title, index),
      },
      span({ textContent: '' }), // level0MenuItemArrow
      level0Item.title,
    );

    const isSelected = isDesktop.matches && index === 0 ? 'selected' : '';
    if (isSelected) level0MenuItem.classList.add(isSelected);

    listMainNavTitle.appendChild(level0MenuItem);

    // Create right column submenu
    // Iterate over level0 Items and create associated category list
    const subMenu = createCategoriesAndSubMenu(level0Item, submenuId, index, `${searchByCountryPlaceholder}`);
    menuRightColumn.appendChild(subMenu);
  });
  return menuOverlay;
}
/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

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
    // Navigation Data
    const structuredNav = formatNavigationJsonData(
      await fetchLanguageNavigation(),
    );
    const placeholdersJson = await fetchLanguagePlaceholders();
    const searchByCountryPlaceholder = placeholdersJson !== undefined ? placeholdersJson.navMenuSearchByCountryName : 'Search By Country';
    navSections.append(createNavMenu(structuredNav, searchByCountryPlaceholder));

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

  const hamburger = div(
    { class: 'nav-hamburger', onclick: () => toggleMenu(nav, navSections) },
    button(
      { type: 'button', 'aria-controls': 'nav', 'aria-label': Constants.OPEN_NAVIGATION },
      span(
        { class: 'nav-hamburger-icon' },
      ),
    ),
  );
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
