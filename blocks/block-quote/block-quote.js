import { blockquote } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  const quote = blockquote({ }, block.innerText);

  block.innerText = '';
  block.append(quote);
}
