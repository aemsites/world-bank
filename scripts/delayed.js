// add delayed functionality here
import {
  getMetadata,
} from './aem.js';
import {
  div, p, section, a, button,
  span,
} from './dom-helpers.js';
/**
 * Swoosh on page
 */
function pageSwoosh() {
  const pSwoosh = getMetadata('page-swoosh');
  if (!pageSwoosh || pageSwoosh.length < 1) return;
  if (pSwoosh !== 'page-swoosh-no') {
    document.body.classList.add(pSwoosh);
  } else {
    document.body.classList.remove(pSwoosh);
  }
}

const setConsentCookie = (name, value, daysToExpire, cookieSection) => {
  const currDate = new Date();
  currDate.setTime(currDate.getTime() + (daysToExpire * 24 * 60 * 60 * 1000));

  const expiration = `expires=${currDate.toUTCString()}`;
  const url = new URL(window.location.href);
  const domain = `; domain=${url.hostname};`;
  document.cookie = `${name}=${value}; ${expiration}; path=/${domain}`;
  cookieSection.style.display = 'none';
};

const cookiePopUp = () => {
  const cookieSection = section({ class: 'cookie-tooltip' });
  const cookieContainer = div(
    { class: 'container' },
    p(
      `${window.placeholdersData && window.placeholdersData.cookiePopUpText ? window.placeholdersData.cookiePopUpText : 'Alternate Cookie Text'}`,
      a(
        { href: `${window.placeholdersData && window.placeholdersData.cookiePopUpLearnMoreLink ? window.placeholdersData.cookiePopUpLearnMoreLink : '#'}` },
        `${window.placeholdersData && window.placeholdersData.cookiePopUpLearnMoreLinkLabel ? window.placeholdersData.cookiePopUpLearnMoreLinkLabel : 'Click Here'}`,
      ),
    ),
    button(
      {
        type: 'button',
        class: 'close accept-consent',
        'aria-label': `${window.placeholdersData && window.placeholdersData.cookiePopUpCloseAriaLabel ? window.placeholdersData.cookiePopUpCloseAriaLabel : 'Close Cookie Notification'}`,
        onclick: () => setConsentCookie('consent_cookie', '1', 365, cookieSection),
      },
      span(
        { 'aria-hidden': 'true' },
        '×',
      ),
    ),
  );

  cookieSection.append(cookieContainer);
  const footerTag = document.querySelector('footer');
  footerTag.append(cookieSection);
  return cookieSection;
};

const isDisplayCookiePop = (cookieSection) => {
  const consentCookie = document.cookie.replace(/(?:(?:^|.*;\s*)consent_cookie\s*=\s*([^;]*).*$)|^.*$/, '$1');
  if (consentCookie.indexOf('1') < 0) {
    cookieSection.style.display = 'block';
  } else {
    cookieSection.style.display = 'none';
  }
};
function loadDelayed() {
  pageSwoosh();
  const cookieSection = cookiePopUp();
  isDisplayCookiePop(cookieSection);
}

loadDelayed();
