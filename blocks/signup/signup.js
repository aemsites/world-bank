import {
  div, p, form, input, label, button, span,
} from '../../scripts/dom-helpers.js';
import { fetchLanguagePlaceholders } from '../../scripts/scripts.js';

const CONSTANTS = {
  SIGNUP_HEADING: 'signupHeading',
  SIGNUP_NEWSLETTER_CHECKBOX: 'signupNewsletterCheckbox',
  SIGNUP_EALERTS_CHECKBOX: 'signupEalertsCheckbox',
  SIGNUP_NAME_PLACEHOLDER: 'signupNamePlaceholder',
  SIGNUP_EMAIL_PLACEHOLDER: 'signupEmailPlaceholder',
  SIGNUP_BUTTON_TEXT: 'signupButtonText',
  SIGNUP_TERMS: 'signupTerms',
  SIGNUP_TERMS_VALIDATION: 'signupTermsValidation',
  SIGNUP_EMAIL_VALIDATION_MESSAGE: 'signupEmailValidationMessage',
  SIGNUP_SUCCESS_MESSAGE: 'signupSuccessMessage',
  SIGNUP_NEWSLETTER_EALERT_ERROR: 'signupNewsletterEalertError',
  SIGNUP_ERROR_MESSAGE: 'signupErrorMessage',
  SIGNUP_SUCCESS_MESSAGE_PROFILE_UPDATE: 'signupSuccessMessageProfileUpdate',
  SIGNUP_ERROR_MESSAGE_EALERT: 'signupErrorMessageEalert',
  SIGNUP_DESCRIPTION: 'signupDescription',
  SIGNUP_THANK_YOU_MESSAGE: 'signupSuccessMessageProfileUpdate',
  SIGNUP_CONFIRMATION_MESSAGE: 'signupSuccessMessage',
  SIGNUP_CONSENT_API_URL: 'signupConsentApiUrl',
  SIGNUP_OCP_APIM_SUBSCRIPTION_KEY: 'signupOcpApimSubscriptionKey',
  SIGNUP_SUBSCRIBE_API_URL: 'signupSubscribeApiUrl',
  SIGNUP_CUSWBG_SUBSCRIPTION_LIST: 'signupCuswbgSubscriptionList',
  SIGNUP_EVENT_SUB_LIST: 'signupEventSubList',
  SIGNUP_EVENT_SUB_UPDATE_LIST: 'signupEventSubUpdateList',
  SIGNUP_SUBSCRIPTION_TYPE: 'signupSubscriptionType',
};

async function callConsentAPI(email, firstName, placeholders) {
  const consentData = {
    dsDataElements: {
      Name: firstName,
      Occupation: '',
    },
    identifier: email,
  };
  const response = await fetch(placeholders[CONSTANTS.SIGNUP_CONSENT_API_URL], {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': placeholders[CONSTANTS.SIGNUP_OCP_APIM_SUBSCRIPTION_KEY],
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(consentData),
  });

  const result = await response.json();
  return result.consent === 'success';
}

async function callSubscriptionAPI(email, firstName, placeholders) {
  const subscriptionData = {
    email,
    firstName,
    cusWbg_subscription_list: placeholders[CONSTANTS.SIGNUP_CUSWBG_SUBSCRIPTION_LIST],
    eventSubList: placeholders[CONSTANTS.SIGNUP_EVENT_SUB_LIST],
    eventSubUpdateList: placeholders[CONSTANTS.SIGNUP_EVENT_SUB_UPDATE_LIST],
    subscriptionType: placeholders[CONSTANTS.SIGNUP_SUBSCRIPTION_TYPE],
  };

  const response = await fetch(placeholders[CONSTANTS.SIGNUP_SUBSCRIBE_API_URL], {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': placeholders[CONSTANTS.SIGNUP_OCP_APIM_SUBSCRIPTION_KEY],
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(subscriptionData),
  });

  const result = await response.json();
  return result.Status;
}

function showConfirmationMessage(formElement, message) {
  formElement.innerHTML = `
    <div class="confirmation-message">
      <p>${message}</p>
    </div>
  `;
}

function showThankYouMessage(formElement, message) {
  formElement.innerHTML = `
    <div class="thank-you-message">
      <p>${message}</p>
    </div>
  `;
}

function attachFormValidation(block, placeholders) {
  document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const errorMessage = block.querySelector('#error-message');
    errorMessage.textContent = '';

    const termErrorMessage = block.querySelector('#term-error-message');
    termErrorMessage.textContent = '';

    const emailInput = block.querySelector('#email');
    const email = emailInput.value;
    const firstName = block.querySelector('#firstname').value || '';
    const agreeInput = block.querySelector('#agree');
    const agree = agreeInput.checked;

    function validateEmail(emailId) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(String(emailId).toLowerCase());
    }

    // Reset previous styles
    emailInput.classList.remove('input-error');

    if (!validateEmail(email)) {
      errorMessage.textContent = placeholders[CONSTANTS.SIGNUP_EMAIL_VALIDATION_MESSAGE] || 'Please enter a valid email.';
      emailInput.classList.add('input-error');
      return;
    }

    if (!agree) {
      termErrorMessage.textContent = placeholders[CONSTANTS.SIGNUP_TERMS_VALIDATION]
      || 'Please agree with the terms.';
      agreeInput.classList.add('input-error');
      return;
    }

    try {
      const consentSuccess = await callConsentAPI(email, firstName, placeholders);
      const subscriptionStatus = await callSubscriptionAPI(email, firstName, placeholders);

      if (consentSuccess && subscriptionStatus === 'Profile Created') {
        showThankYouMessage(block.querySelector('#signup-form'), placeholders[CONSTANTS.SIGNUP_THANK_YOU_MESSAGE]);
      } else if (consentSuccess && subscriptionStatus === 'Not Subscribed') {
        showConfirmationMessage(block.querySelector('#signup-form'), placeholders[CONSTANTS.SIGNUP_CONFIRMATION_MESSAGE]);
      } else {
        errorMessage.textContent = 'An error occurred while processing your request. Please try again later.';
      }
    } catch (error) {
      errorMessage.textContent = 'An unexpected error occurred. Please try again later.';
    }
  });
}

function createSignupModule(block, placeholders) {
  const container = div({ class: 'email-signup-container' });

  const content = div(
    { class: 'signup-content' },
    div({ class: 'main-heading' }, p({ })),
    p({ class: 'signup-description' }, placeholders[CONSTANTS.SIGNUP_DESCRIPTION]),
  );
  content.querySelector('.main-heading p').innerHTML = placeholders[CONSTANTS.SIGNUP_HEADING];

  const formelement = form(
    { id: 'signup-form' },
    div(
      { class: 'input-group' },
      input({
        type: 'email',
        id: 'email',
        placeholder: placeholders[CONSTANTS.SIGNUP_EMAIL_PLACEHOLDER] || '* Your email',
      }),
      input({
        type: 'text',
        id: 'firstname',
        placeholder: placeholders[CONSTANTS.SIGNUP_NAME_PLACEHOLDER] || 'Your first name',
      }),
      button({ type: 'submit', id: 'signup-btn-desktop' }, span({ class: 'icon' }), placeholders[CONSTANTS.SIGNUP_BUTTON_TEXT] || 'Sign up'),
    ),
    div({ class: 'error-message', id: 'error-message' }),
    div(
      { class: 'input-group checkbox-group' },
      input({
        type: 'checkbox',
        id: 'agree',
      }),
      label({
        htmlFor: 'agree',
      }, placeholders[CONSTANTS.SIGNUP_TERMS] || 'I agree with the terms of the Privacy Notice and consent to my personal data being processed, to the extent necessary, to subscribe to the selected updates.'),
    ),
    div({ class: 'error-message', id: 'term-error-message' }),
    button({ type: 'submit', id: 'signup-btn' }, span({ class: 'icon' }), placeholders[CONSTANTS.SIGNUP_BUTTON_TEXT] || 'Sign up'),
  );

  formelement.querySelector('label').innerHTML = placeholders[CONSTANTS.SIGNUP_TERMS];

  container.appendChild(content);
  container.appendChild(formelement);

  block.appendChild(container);

  attachFormValidation(block, placeholders);
}

async function fetchingPlaceholdersData(block) {
  try {
    const listOfAllPlaceholdersData = await fetchLanguagePlaceholders();
    if (!listOfAllPlaceholdersData) return;

    // console.log(listOfAllPlaceholdersData);
    createSignupModule(block, listOfAllPlaceholdersData);
  } catch (error) {
    console.error('Error fetching placeholders data:', error);
  }
}

export default function decorate(block) {
  fetchingPlaceholdersData(block);
}
