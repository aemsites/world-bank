import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { fetchLanguageNavigation } from '../../scripts/scripts.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
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
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
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
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  // document.body.style.overflowY = expanded ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');

  const navMenuOverlay = navSections.querySelector('.nav-menu-overlay');
  if (!expanded) {
    navMenuOverlay.classList.add('open');
  } else {
    navMenuOverlay.classList.remove('open');
  }

  // enable nav dropdown keyboard accessibility
  // const navDrops = navSections.querySelectorAll('.nav-drop');

  // Remove this code if below one is uncommented
  // navDrops.forEach((drop) => {
  //   drop.removeAttribute('role');
  //   drop.removeAttribute('tabindex');
  //   drop.removeEventListener('focus', focusNavSection);
  // });

  /* if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('role', 'button');
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
  } */
  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
  }
}

function formatNavigationJsonData(navJson) {
  const structuredData = [];
  let currentLevel0 = null;
  let currentCategory = null;

  navJson.forEach((item) => {
    if (item.Type === 'level0') {
      const level0 = {
        title: item.Title,
        categories: [],
      };
      structuredData.push(level0);
      currentLevel0 = level0;
    } else if (item.Type === 'category' || item.Type === 'footer') {
      const category = {
        title: item.Title,
        type: item.Type,
        items: [],
      };
      currentLevel0.categories.push(category);
      currentCategory = category;
    } else if (item.Type === 'level1' || item.Type === 'level2') {
      currentCategory.items.push(item);
    }
  });
  return structuredData;
}

function showSubMenu(submenuId) {
  const submenus = document.querySelectorAll('.submenu');
  submenus.forEach((submenu) => {
    submenu.style.display = submenu.id === submenuId ? 'block' : 'none';
  });

  const level0Items = document.querySelectorAll('#level0Menu li');
  level0Items.forEach((item) => {
    item.classList.remove('selected');
  });
  document.querySelector(`[onclick="showSubMenu('${submenuId}')"]`).classList.add('selected');
}

function createNavMenu(structuredNav) {
  const menuOverlay = document.createElement('div');
  menuOverlay.className = 'nav-menu-overlay';

  const menu = document.createElement('div');
  menu.className = 'nav-menu';

  const menuColumnLeft = document.createElement('div');
  menuColumnLeft.className = 'nav-menu-column left';
  const listMainNavTitle = document.createElement('ul');
  menuColumnLeft.append(listMainNavTitle);

  const menuColumnRight = document.createElement('div');
  menuColumnRight.className = 'nav-menu-column right';

  structuredNav.forEach((level0Item, index) => {
    const level0MenuItem = document.createElement('li');
    const submenuId = `submenu_${index}`;
    level0MenuItem.textContent = level0Item.title;
    const isSelected = `${index === 0 ? 'selected' : ''}`;
    if (isSelected) level0MenuItem.classList.add(`${isSelected}`);

    level0MenuItem.addEventListener('click', () => showSubMenu(`${submenuId}`));

    listMainNavTitle.appendChild(level0MenuItem);

    // Create submenu
    const submenu = document.createElement('ul');
    submenu.id = submenuId;
    submenu.classList.add('submenu');
    if (index !== 0) submenu.style.display = 'none';

    level0Item.categories.forEach((category) => {
      const categoryItem = document.createElement('li');
      categoryItem.textContent = category.title;

      const categoryList = document.createElement('ul');
      category.items.forEach((subItem) => {
        const subMenuItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = subItem.Link;
        link.textContent = subItem.Title;
        subMenuItem.appendChild(link);
        categoryList.appendChild(subMenuItem);
      });

      categoryItem.appendChild(categoryList);
      submenu.appendChild(categoryItem);
    });

    menuColumnRight.appendChild(submenu);
  });

  menu.append(menuColumnLeft);
  menu.append(menuColumnRight);
  menuOverlay.append(menu);
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
    const structuredNav = formatNavigationJsonData(await fetchLanguageNavigation());
    navSections.append(createNavMenu(structuredNav));

    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }
  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  /* toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));
*/
  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
