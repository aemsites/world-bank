function decorateCard(block) {
  [...block.children].forEach((row) => {
    row.className = 'data-card';
    const [tag, title, description, disclaimer] = [...row.children];
    tag.className = 'data-card-tag';
    title.className = 'data-card-title';
    description.className = 'data-card-description';
    disclaimer.className = 'data-card-disclaimer';
  });
}

/*
function decorateCard() {
  [...block.children].forEach((row) => {
    const liEl = li({ class: 'data-card' });

    while (row.firstElementChild) {
      liEl.append(row.firstElementChild);
    }

    const [tag, title, description, disclaimer] = [...liEl.children];
    tag.className = 'data-card-tag';
    title.className = 'data-card-title';
    description.className = 'data-card-description';
    disclaimer.className = 'data-card-disclaimer';
    const hrEl = hr({ style: 'border: 1px solid lightgrey' });
    description.insertAdjacentElement('afterend', hrEl);

    [...liEl.children].forEach(() => {
      paragraphs.forEach((p) => {
        let text = p.textContent;
        const prefix = 'world-bank:';

        if (text.startsWith(prefix)) {
          text = text.replace(prefix, ''); // Remove 'world-bank:' from the text

          // check if the text is in placeholder
          if (placeholder[text]) {
            text = placeholder[text];
            p.textContent = placeholder[text];
          }

          // Create a new <hr> element
          const hrTag = hr();
          const placeholderKeys = Object.keys(placeholder);

          // Assign HR color based on the placeholder key
          if (placeholderKeys.includes(text)) {
            if (text === 'prosperity') {
              hrTag.style.borderColor = 'purple';
            } else if (text === 'people') {
              hrTag.style.borderColor = 'yellow';
            } else if (text === 'planet') {
              hrTag.style.borderColor = 'green';
            } else if (text === 'infrastructure') {
              hrTag.style.borderColor = 'maroon';
            } else if (text === 'digital') {
              hrTag.style.borderColor = 'gray';
            } else if (text === 'cross-cutting areas') {
              hrTag.style.borderColor = 'blue';
            }
          } else {
            hrTag.style.borderColor = 'gray';
          }

          // Insert the <hr> after the <p> tag
          p.insertAdjacentElement('afterend', hrTag);
        }
      });
    });

    ulEl.append(liEl);
  });
  block.textContent = '';
  block.append(ulEl);
}

*/

export default async function decorate(block) {
  decorateCard(block);
}
