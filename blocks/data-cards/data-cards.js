export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  ul.classList.add('data-cards');
  const paragraphs = block.querySelectorAll('p');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.classList.add('data-card');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div, index) => {
      if (index === 0) {
        div.className = 'data-card-tag';
      } else if (index === 1) {
        div.className = 'data-card-title';
      } else if (index === 2) {
        const hr = document.createElement('hr');
        hr.style.border = '1px solid lightgrey';
        div.className = 'data-card-description';
        div.insertAdjacentElement('afterend', hr);
      } else if (index === 3) {
        div.className = 'data-card-disclaimer';
      }
      paragraphs.forEach((p) => {
        let text = p.textContent;
        const prefix = 'world-bank:';

        // Check if the text starts with the prefix and remove it
        if (text.startsWith(prefix)) {
          text = text.replace(prefix, ''); // Remove 'world-bank:' from the text
          text = text.toUpperCase();
          p.textContent = text;

          // Create a new <hr> element
          const hr = document.createElement('hr');

          // Assign HR color based on the content
          if (text.includes('PROSPERITY')) {
            hr.style.borderColor = 'purple';
          } else if (text.includes('PEOPLE')) {
            hr.style.borderColor = 'yellow';
          } else if (text.includes('PLANET')) {
            hr.style.borderColor = 'green';
          } else if (text.includes('INFRASTRUCTURE')) {
            hr.style.borderColor = 'maroon';
          } else if (text.includes('DIGITAL')) {
            hr.style.borderColor = 'gray';
          } else if (text.includes('CROSS-CUTTING AREAS')) {
            hr.style.borderColor = 'blue';
          }
          // Insert the <hr> after the <p> tag
          p.insertAdjacentElement('afterend', hr);
        }
      });
    });
    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);
}
