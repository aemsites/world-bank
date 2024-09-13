import { p, span, h2, hr } from "../../scripts/dom-helpers";

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

  // Clear the current contents of the heading block
  headingBlock.innerHTML = '';

  // Create eyebrow text element
  const eyebrow = p({ class: 'eyebrowtext' }, eyebrowText);

  // Create header element dynamically
  const headerElement = domEl(headerTag, 
    span({ class: 'prefix' }, prefixText), 
    ` ${mainHeadingText} `, 
    span({ class: 'suffix' }, suffixText)
  );

  // Create description element
  const description = p({ class: 'heading-description' }, descriptionText);

  // Append elements to the heading block
  headingBlock.append(eyebrow, headerElement, description);

  // Append horizontal line if "true" is found in the last div
  if (addBottomLine) {
    headingBlock.appendChild(hr());
  }
}

export default function decorate(block) {
  updateHeadingStructure(block);
}
