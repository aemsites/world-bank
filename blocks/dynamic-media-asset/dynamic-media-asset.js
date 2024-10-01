import img from '../../scripts/dom-helpers.js';

export default async function decorate(block) {
  const href = block.querySelector('a').getAttribute('href');
  block.innerHTML = '';
  block.append(img(href));
}
