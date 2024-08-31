// add delayed functionality here
import {
  getMetadata,
} from './aem.js';

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

function loadDelayed() {
  pageSwoosh();
}

loadDelayed();
