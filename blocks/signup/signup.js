import {
  div, p, form, input, label, button, span,
} from '../../scripts/dom-helpers.js';

// Function to handle form validation
function attachFormValidation() {
  document.getElementById('signup-form').addEventListener('submit', (e) => {
    e.preventDefault();

    // Clear any previous error messages
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = '';

    const email = document.getElementById('email').value;
    const agree = document.getElementById('agree').checked;
    // Helper function to validate email format
    function validateEmail(emailId) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(String(emailId).toLowerCase());
    }
    // Basic email validation
    if (!validateEmail(email)) {
      errorMessage.textContent = 'Please enter a valid email address.';
      return;
    }

    if (!agree) {
      errorMessage.textContent = 'Please agree with the terms of the privacy notice.';
      return;
    }

    // Submit the form or perform other actions
    alert('Form submitted successfully!');
  });
}

// Function to create the signup module
function createSignupModule(block) {
  // Create the main container
  const container = div({ class: '-email-signup-container' });

  const content = div(
    { class: 'signup-content' },
    p({ class: 'signup-heading' }, 'Stay current with our latest '),
    p({ class: 'signup-description' }, 'News, stories, and updates on international development straight to your inbox from the World Bank Group.'),
  );
    // Create and append the heading
    //   const heading = h2({ class: 'signup-heading' });
    //   heading.innerHTML = 'Stay current with our latest <strong>Data & Insights</strong>';
    //   content.appendChild(heading);

  // Create and append the description
  // const description = document.createElement('p');
  // description.textContent = 'News, stories,
  // and updates on international development
  // straight to your inbox from the World Bank Group.';
  // content.appendChild(description);

  // Create the form
  //  const form = document.createElement('form');

  // form.id = 'signup-form';

  // Create the input group for email and first name
  /*  const inputGroup = document.createElement('div');
            inputGroup.className = 'input-group';

            const emailInput = document.createElement('input');
            emailInput.type = 'email';
            emailInput.id = 'email';
            emailInput.placeholder = '* Your email';
            emailInput.required = true;
            inputGroup.appendChild(emailInput);

            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.id = 'firstname';
            nameInput.placeholder = 'Your first name';
            inputGroup.appendChild(nameInput);

           // formelement.appendChild(inputGroup);

            // Create the checkbox group
            const checkboxGroup = document.createElement('div');
            checkboxGroup.className = 'input-group checkbox-group';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = 'agree';
            checkbox.required = true;
            checkboxGroup.appendChild(checkbox);

            const checkboxLabel = document.createElement('label');
            checkboxLabel.htmlFor = 'agree';
            checkboxLabel.innerHTML = 
            'I agree with the terms of the <a href="#">
            Privacy Notice</a> and consent to my personal data being processed, 
            to the extent necessary, to subscribe to the selected updates.';
            checkboxGroup.appendChild(checkboxLabel);

            //formelement.appendChild(checkboxGroup);

        */
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

  /*
          // Create and append the submit button
          const submitButton = document.createElement('button');
          submitButton.type = 'submit';
          submitButton.id = 'signup-btn';
          submitButton.innerHTML = '<span class="icon"></span>Sign Up';
         // formelement.appendChild(submitButton);

          // Create and append the error message container
          const errorMessage = document.createElement('div');
          errorMessage.className = 'error-message';
          errorMessage.id = 'error-message';
        //  formelement.appendChild(errorMessage);

          // Append the form to the content wrapper
      */
  // Append the content wrapper to the main container
  container.appendChild(content);
  container.appendChild(formelement);

  // Append the container to the body or a specific element in your HTML
  block.appendChild(container);

  // Attach the form validation logic
  attachFormValidation();
}

export default function decorate(block) {
  // Call the function to create the signup module
  createSignupModule(block);
}
