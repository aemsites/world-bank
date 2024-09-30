import {
  a, div, li, ul, p,
} from '../../scripts/dom-helpers.js';
import {
  fetchLangDatabyFileName,
} from '../../scripts/scripts.js';

export default async function decorate(block) {
  const listType = block.firstElementChild.textContent.trim();
  block.firstElementChild.remove();
  const jsonData = await fetchLangDatabyFileName(`leadership/${listType}`);

  const container = div({ class: 'list-container' });
  const ulElement = ul();

  // Iterate over the JSON data to create list items
  jsonData.forEach((leader) => {
    if (leader && leader.Link) {
      const liItem = li({ class: 'leader-item' });
      const link = a({ href: leader.Link, target: '_blank' }, div({ class: 'leader-name' }, p({}, `${leader.Name}`)));
      const jobTitle = div({ class: 'leader-title' }, p({}, `${leader.Title}`));
      liItem.append(link, jobTitle);
      ulElement.appendChild(liItem);
    }
  });
  // Append the list to the container
  container.appendChild(ulElement);

  // Append the container to the block
  block.appendChild(container);
}
