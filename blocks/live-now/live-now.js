export default async function decorate(block) {
  console.log('live now');
  queryEventData();
}

window.addEventListener('load', () => {
  console.log('window load');
  queryEventData();
})

async function queryEventData() {
  const endpoint = 'https://webapi.worldbank.org/aemsite/wblive/global/search';
  const subkey = 'a02440fa123c4740a83ed288591eafe4';
  const requestMethod = 'POST';
  const contentType = 'application/json';
  const myDateHere = '2024-09-04T09:32:00Z'; // an event should be running here
  const payload = {
    search: '*',
    facets: [
      'topics,count:1000'
    ],
    filter: `hideOnSearch ne 'true' and languageCode eq 'en' and (eventStartDate gt ${myDateHere} or (eventStartDate lt ${myDateHere} and eventEndDate gt ${myDateHere})) and searchType eq 'event'`,
    count: true,
    searchFields: '*',
    top: 10,
    skip: 0,
    orderby: 'eventStartDate ac'
  }

  const response = await fetch(endpoint, {
    method: requestMethod,
    headers: {
      'Accept': '*/*',
      'Access-Control-Allow-Origin': '',
      'Content-Type': contentType,
      'ocp-apim-subscription-key': subkey
    },
    body: JSON.stringify(payload),
  });

  console.log(response);
}

/*
function decorateExampleModals(main) {
    const simpleModalButton = main.querySelector('a.button[href="http://modal-demo.simple"]');
    const customModalButton = main.querySelector('a.button[href="http://modal-demo.custom"]');
  
    // Listens to the simple modal button
    simpleModalButton.addEventListener('click', async (e) => {
      e.preventDefault();
      // Modals can be imported on-demand to prevent loading unnecessary code
      const { default: getModal } = await import('../modal/modal.js');
      const simpleModal = await getModal('simple-modal', () => '<h2>Simple Modal Content</h2>');
      simpleModal.showModal();
    });
  
    // Listens to the custom modal button
    customModalButton.addEventListener('click', async (e) => {
      e.preventDefault();
      const { default: getModal } = await import('../modal/modal.js');
      const customModal = await getModal('custom-modal', () => `
        <h2>Custom Modal</h2>
        <p>This is some content in the custom modal.</p>
        <button name="close-modal">Close Modal</button>
      `, (modal) => {
        modal.querySelector('button[name="close-modal"]').addEventListener('click', () => modal.close());
      });
      customModal.showModal();
    });
  }
    */