import {
  div, p, form, input, label, button, span,
} from '../../scripts/dom-helpers.js';
import { fetchLanguagePlaceholders } from '../../scripts/scripts.js';
import { CONSTANTS } from './constants.js';
import { getMetadata } from '../../scripts/aem.js';

async function callApi(url, data, errorMessage) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': 'a02440fa123c4740a83ed288591eafe4',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(errorMessage, error);
    throw error;
  }
}

function attachFormValidation() {
  document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = '';

    const email = document.getElementById('email').value;
    const firstName = document.getElementById('firstname').value;
    const agree = document.getElementById('agree').checked;

    function validateEmail(emailId) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(String(emailId).toLowerCase());
    }

    if (!validateEmail(email)) {
      errorMessage.textContent = 'Please enter a valid email address.';
      return;
    }

    if (!agree) {
      errorMessage.textContent = 'Please agree with the terms of the privacy notice.';
      return;
    }

    try {
      // Call the Consent API
      const consentData = {
        dsDataElements: {
          Name: firstName || "N/A",
          Occupation: ""
        },
        identifier: email
      };

      await callApi(
        'https://webapi.worldbank.org/api/aem/campaign/consent',
        consentData,
        'Failed to send consent data'
      );

      // Call the Subscription API
      const subscriptionData = {
        email,
        firstName,
        cusWbg_subscription_list: "World Bank in China:@Purnw0I-i4j3sxYUHKXmmngLM2fEKqUbg8EBD6liWZBFDJYtct9fjZ9-cyVWwRwXRIabgDXU5FnxMPuj6GrFJqgZu5VHGH01lAJPDjiq6Asmtbtz",
        eventSubList: "EVTRTEVTWbgNlRewampConf",
        eventSubUpdateList: "EVTExtNlUpdNotify",
        subscriptionType: "country"
      };

      await callApi(
        'https://webapi.worldbank.org/api/aem/campaign/subscribe',
        subscriptionData,
        'Failed to send subscription data'
      );

      alert('Form submitted successfully!');
    } catch (error) {
      errorMessage.textContent = 'An error occurred while submitting the form. Please try again later.';
    }
  });
}

function createSignupModule(block) {
  const container = div({ class: 'email-signup-container' });

  const content = div(
    { class: 'signup-content' },
    p({ class: 'signup-heading' }, 'Stay current with our latest '),
    p({ class: 'signup-description' }, 'News, stories, and updates on international development straight to your inbox from the World Bank Group.'),
  );

  const formelement = form(
    { id: 'signup-form' },
    div(
      { class: 'input-group' },
      input({
        type: 'email',
        id: 'email',
        placeholder: '* Your email',
        required: true,
      }),
      input({
        type: 'text',
        id: 'firstname',
        placeholder: 'Your first name',
      }),
    ),
    div(
      { class: 'input-group checkbox-group' },
      input({
        type: 'checkbox',
        id: 'agree',
        required: true,
      }),
      label({
        htmlFor: 'agree',
      }, 'I agree with the terms of the Privacy Notice and consent to my personal data being processed, to the extent necessary, to subscribe to the selected updates.'),
    ),
    button({ type: 'submit', id: 'signup-btn' }, span({ class: 'icon' }), 'Sign up'),
    div({ class: 'error-message', id: 'error-message' }),
  );

  container.appendChild(content);
  container.appendChild(formelement);

  block.appendChild(container);

  attachFormValidation();
}

async function fetchingPlaceholdersData(block) {
  try {
    const listOfAllPlaceholdersData = await fetchLanguagePlaceholders();
    if (!listOfAllPlaceholdersData) return;

    const signupDivs = block.querySelectorAll('.email-signup-container');
    if (!signupDivs.length) return;

    signupDivs.forEach((signupDiv) => {
      const elementsToUpdate = [
        { selector: '.signup-heading', key: CONSTANTS.SIGNUP_HEADING },
        { selector: '.signup-description', key: CONSTANTS.SIGNUP_DESCRIPTION },
        { selector: '#email', key: CONSTANTS.SIGNUP_EMAIL_PLACEHOLDER, attribute: 'placeholder' },
        { selector: '#firstname', key: CONSTANTS.SIGNUP_NAME_PLACEHOLDER, attribute: 'placeholder' },
        { selector: '#signup-btn', key: CONSTANTS.SIGNUP_BUTTON_TEXT, attribute: 'innerText' },
        { selector: '#agree + label', key: CONSTANTS.SIGNUP_TERMS, attribute: 'innerHTML' }
      ];

      elementsToUpdate.forEach(({ selector, key, attribute = 'innerHTML' }) => {
        const element = signupDiv.querySelector(selector);
        if (element) {
          element[attribute] = listOfAllPlaceholdersData[key];
        } else {
          console.error(`${selector} element not found.`);
        }
      });
    });
  } catch (error) {
    console.error('Error fetching placeholders data:', error);
  }
}

export default function decorate(block) {
  createSignupModule(block);
  fetchingPlaceholdersData(block);
}
