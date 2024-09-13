import { p, span, hr } from '../../scripts/dom-helpers.js';

function updateHeadingStructure(block) {
  const headingBlock = block;
  if (!headingBlock) return;

  const children = [...headingBlock.children];

  const [
    eyebrowDiv,
    prefixDiv,
    mainHeadingDiv,
    headerTagDiv,
    suffixDiv,
    descriptionDiv,
    bottomLineDiv,
  ] = children;

  const getTextContent = (div) => div?.querySelector('p')?.textContent.trim() || '';

  const eyebrowText = getTextContent(eyebrowDiv);
  const prefixText = getTextContent(prefixDiv);
  const mainHeadingText = getTextContent(mainHeadingDiv);
  const headerTag = getTextContent(headerTagDiv) || 'h2';
  const suffixText = getTextContent(suffixDiv);
  const descriptionText = getTextContent(descriptionDiv);
  const addBottomLine = getTextContent(bottomLineDiv) === 'true';

  headingBlock.innerHTML = '';

  // Create eyebrow text element
  const eyebrow = p({ class: 'eyebrowtext' }, eyebrowText);
  const headerElement = document.createElement(headerTag);
  const prefixSpan = span(prefixText);
  const suffixSpan = span(suffixText);

  headerElement.append(prefixSpan, ` ${mainHeadingText} `, suffixSpan);
  const description = p({ class: 'heading-description' }, descriptionText);

  // Append elements to the heading block
  headingBlock.append(eyebrow, headerElement, description);
  if (addBottomLine) {
    headingBlock.append(hr());
  }
}

export default function decorate(block) {
  updateHeadingStructure(block);
}
