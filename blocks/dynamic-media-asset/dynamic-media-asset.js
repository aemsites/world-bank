import { createOptimizedPicture } from '../../scripts/aem.js';

export default async function decorate(block) {
  const href = block.querySelector('a').getAttribute('href');
  const altText = block.querySelector('p[data-aue-prop="dm_alttext"]').textContent;
  block.innerHTML = '';
  block.append(createOptimizedPicture(href, altText, 'lazy', [{ width: '800' }]));
}
