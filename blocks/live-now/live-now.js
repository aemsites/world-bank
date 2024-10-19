import { fetchLanguagePlaceholders } from '../../scripts/scripts.js';
import { toCamelCase } from '../../scripts/aem.js';
import { getLanguage } from '../../scripts/utils.js';

const MODAL_TITLE = 'live-now-title';
const MODAL_HEADER = 'live-now-header';
const MODAL_JOIN_TXT = 'live-now-join';
const MODAL_CID = 'live-now-cid';

// set session cookie
function setSessionCookie(name, value) {
  document.cookie = `${name}=${value}; path=/`;
}

// get existing session cookie
function getSessionCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// check cookie for event guid
function hasModalBeenDisplayed(cookieName, guid) {
  const eventCookie = getSessionCookie(cookieName);
  if (!eventCookie) return false; // no cookie found, modal for event hasn't been seen

  const eventList = eventCookie.split(','); // split stored GUIDs into an array
  return eventList.includes(guid); // check if the event GUID is in the array
}

// record event guid if modal displays
function addGuidToCookie(cookieName, guid) {
  let eventCookie = getSessionCookie(cookieName);
  if (eventCookie) {
    eventCookie += `,${guid}`; // append guid to cookie
  } else {
    eventCookie = guid; // first guid/cookie
  }
  setSessionCookie(cookieName, eventCookie); // create or update the cookie
}

// retrieve event data from API
async function queryEventData(dateTime) {
  const endpoint = 'https://webapi.worldbank.org/aemsite/wblive/global/search';
  const subkey = 'a02440fa123c4740a83ed288591eafe4';
  const requestMethod = 'POST';
  const contentType = 'application/json';
  const estDateString = dateTime.toLocaleString('en-US', { timeZone: 'America/New_York' });
  const estDate = new Date(estDateString);
  const utcDate = estDate.toISOString();
  const langCode = getLanguage() || 'en';

  const payload = {
    search: '*',
    facets: [
      'topics,count:1000',
    ],
    filter: `hideOnSearch ne 'true' and languageCode eq '${langCode}' and (eventStartDate gt ${utcDate} or (eventStartDate lt ${utcDate} and eventEndDate gt ${utcDate})) and searchType eq 'event'`,
    count: true,
    searchFields: '*',
    top: 10,
    skip: 0,
    orderby: 'eventStartDate asc',
  };

  const response = await fetch(endpoint, {
    method: requestMethod,
    headers: {
      Accept: '*/*',
      'Content-Type': contentType,
      'ocp-apim-subscription-key': subkey,
    },
    body: JSON.stringify(payload),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let result = '';

  if (!reader) { throw new Error('Stream reader is null or invalid.'); }
  /* eslint-disable-next-line no-constant-condition */
  while (true) {
    /* eslint-disable-next-line no-await-in-loop */
    const { done, value } = await reader.read();
    if (done || value == null) {
      break;
    }

    result += decoder.decode(value, { stream: true });
  }

  const jsonData = await JSON.parse(result);
  return jsonData;
}

/**
 * Creates a modal with id modalId, or if that id already exists, returns the existing modal.
 * To show the modal, call `modal.showModal()`.
 * @param modalId
 * @param createContent Callback called when the modal is first opened; should return html string
 * for the modal content
 * @param addEventListeners Optional callback called when the modal is first opened;
 * should add event listeners to body if needed
 * @returns {HTMLElement} The <dialog> element
 */
function getModal(modalId, createContent, addEventListeners) {
  const closeSvg = `${window.hlx.codeBasePath}/icons/close_x.svg`;
  let dialogElement = document.getElementById(modalId);

  if (!dialogElement) {
    dialogElement = document.createElement('dialog');
    dialogElement.id = modalId;
    dialogElement.classList.add(modalId);

    const contentHTML = createContent?.() || '';

    dialogElement.innerHTML = `
        <button name='close' tabindex='0'><img src='${closeSvg}' class='close-x' alt='Close icon'></img></button>
        ${contentHTML}
    `;

    document.body.appendChild(dialogElement);

    dialogElement.querySelector('button[name="close"]')
      .addEventListener('click', () => {
        dialogElement.close();
      });

    addEventListeners?.(dialogElement);
  }
  return dialogElement;
}

// build the 'live now' modal
async function buildModal(title, thumbnailPath, url) {
  const broadcastSvg = `${window.hlx.codeBasePath}/icons/broadcast.svg`;
  const discussionSvg = `${window.hlx.codeBasePath}/icons/discussion.svg`;
  const playSvg = `${window.hlx.codeBasePath}/icons/video_play.svg`;

  // retrieve correct language data. fallback to en.
  const phData = await fetchLanguagePlaceholders();
  const modalTitle = phData[toCamelCase(MODAL_TITLE)] || 'Live Now';
  const modalHeader = phData[toCamelCase(MODAL_HEADER)] || 'WORLD BANK LIVE';
  const joinMsg = phData[toCamelCase(MODAL_JOIN_TXT)] || 'Join Now';
  const cidCode = phData[toCamelCase(MODAL_CID)] || '?intcid=wbw_xpl_liveoverlay_en_ext';
  const wbModal = `
    <div class='modal-content-wrapper'>
      <div class='modal-column-left'>
        <div class='modal-title'>
          <img src='${broadcastSvg}' alt='Broadcast symbol'></img>
          <div class='modal-title-txt'>${modalTitle}</div>
        </div>
        <div class='event-title'>
          <div class='wblive-header'>
            <img src='${discussionSvg}' alt='Discussion symbol'></img>
            <div class='wblive-header-txt'>${modalHeader}</div>
          </div>
          <a href='${url}${cidCode}' target='_blank' class='event-title-txt'>${title}</a>
        </div>
      </div>
      <div class='modal-column-right'>
        <img src='${thumbnailPath}' class='event-thumbnail'></img>
        <a class='join-event-btn' href='${url}${cidCode}' target='_blank' tabindex='0'>
          <div class='event-play'>
            <img src='${playSvg}' alt='Play symbol'></img>
          </div>
          <div class='join-btn-txt'>${joinMsg}</div>
        </a>
      </div>
    </div>
  `;

  const customModal = getModal('livenow-modal', () => wbModal);
  customModal.showModal();
  return customModal;
}

// Function to close the dialog if clicked outside of it
function dismissOnClick(modal, event) {
  if (!modal) return;
  const rect = modal.getBoundingClientRect();
  const isInDialog = (
    event.clientX >= rect.left
    && event.clientX <= rect.right
    && event.clientY >= rect.top
    && event.clientY <= rect.bottom
  );

  // Close if the click is outside the dialog
  if (!isInDialog) {
    modal.close();
  }
}

// retrieve needed data
export default async function decorate(block) {
  const testMode = (block.classList.contains('test-mode'));
  const sessionCookieName = 'wbEventGuid';
  const currentDateTime = new Date();
  const currentDateTimeInEST = new Date(currentDateTime.toLocaleString('en-US', { timeZone: 'America/New_York' }));

  const eventData = await queryEventData(currentDateTime);
  const events = eventData.value;

  const filteredEvents = events.filter((event) => {
    const startDate = new Date(event.eventStartDate);
    const endDate = new Date(event.eventEndDate);
    return currentDateTimeInEST >= startDate && currentDateTimeInEST <= endDate;
  });

  let liveNowModal;
  // only build the modal if there's a matching event or we're in test mode
  if ((filteredEvents.length > 0 || testMode)) {
    const event = filteredEvents[0] ? filteredEvents[0] : events[0];
    // and if modal has not been seen
    if (!(hasModalBeenDisplayed(sessionCookieName, event.guid))) {
      liveNowModal = await buildModal(
        event.title,
        event.eventCardImageReference,
        event.canonicalURL,
        event.guid,
      );
      addGuidToCookie(sessionCookieName, event.guid);
    } else {
      return;
    }
  }

  document.addEventListener('click', (event) => { dismissOnClick(liveNowModal, event); });
}
