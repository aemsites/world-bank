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
    bottomLineDiv,
    borderLineClassDiv,
    spacingTopClassDiv,
    spacingBottomClassDiv,
  ] = children;

  const getTextContent = (div) => div?.querySelector('p')?.textContent.trim() || '';

  const eyebrowText = getTextContent(eyebrowDiv);
  const prefixText = getTextContent(prefixDiv);
  const mainHeadingText = getTextContent(mainHeadingDiv);
  const headerTag = getTextContent(headerTagDiv) || 'h2';
  const suffixText = getTextContent(suffixDiv);
  const addBottomLine = getTextContent(bottomLineDiv) === 'true';
  const borderLineClass = getTextContent(borderLineClassDiv);
  const spacingTopClass = getTextContent(spacingTopClassDiv);
  const spacingBottomClass = getTextContent(spacingBottomClassDiv);

  headingBlock.innerHTML = '';

  // Add the borderline and spacing classes
  if (borderLineClass) headingBlock.classList.add(borderLineClass);
  if (spacingTopClass) headingBlock.classList.add(spacingTopClass);
  if (spacingBottomClass) headingBlock.classList.add(spacingBottomClass);

  // Create eyebrow text element
  const eyebrow = p({ class: 'eyebrowtext' }, eyebrowText);
  const headerElement = document.createElement(headerTag);
  const prefixSpan = span(prefixText);
  const suffixSpan = span(suffixText);

  headerElement.append(prefixSpan, ` ${mainHeadingText} `, suffixSpan);

  // Append elements to the heading block
  headingBlock.append(eyebrow, headerElement);
  if (addBottomLine) {
    headingBlock.append(hr());
  }
}

export default function decorate(block) {
  updateHeadingStructure(block);
}
