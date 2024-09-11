import { div } from '../../scripts/dom-helpers.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
export default function decorate(block) {
  console.log(block.children);
  const pTag = block.querySelector('p');
  block.appendChild(pTag);
  moveInstrumentation(pTag, block);

}
