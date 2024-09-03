// add delayed functionality here
import {
  getMetadata,
} from './aem.js';
import {
  div, p, section, a, button,
  span,
} from './dom-helpers.js';
import {
  fetchLanguagePlaceholders
} from './scripts.js';
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

async function cookiePopUp() {
  const consentCookie = document.cookie.replace(/(?:(?:^|.*;\s*)consent_cookie\s*=\s*([^;]*).*$)|^.*$/, '$1');
  if (consentCookie.indexOf('1') >= 0) {
    return;
  }

  const cookieSection = section({ class: 'cookie-tooltip' });
  const placeholders = await fetchLanguagePlaceholders();
  const hasCookieText = `${placeholders && placeholders.cookiePopUpText}`;
  if (!hasCookieText) return;
  const cookieContainer = div(
    { class: 'container' },
    p(
      `${hasCookieText ? placeholders.cookiePopUpText : 'Alternate Cookie Text'}`,
      a(
        { href: `${placeholders.cookiePopUpLearnMoreLink || '#'}` },
        `${placeholders.cookiePopUpLearnMoreLinkLabel || 'Click Here'}`,
      ),
    ),
    button(
      {
        type: 'button',
        class: 'close accept-consent',
        'aria-label': `${placeholders.cookiePopUpCloseAriaLabel || 'Close Cookie Notification'}`,
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
}

function loadDelayed() {
  pageSwoosh();
  cookiePopUp();
}

loadDelayed();
