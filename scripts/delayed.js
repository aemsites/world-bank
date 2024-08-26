// add delayed functionality here
import {
  getMetadata,
} from './aem.js';

/**
 * Swoosh on page
 */
function pageSwoosh() {
  const showSwoosh = getMetadata('show-swoosh');
  if (showSwoosh) {
    document.body.classList.add('page-swoosh');
  } else {
    document.body.classList.remove('page-swoosh');
  }
}

function loadDelayed() {
  pageSwoosh();
}

loadDelayed();
