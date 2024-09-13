function updateHeadingStructure(block) {
  const headingBlock = block;
  if (!headingBlock) return;

  const children = [...headingBlock.children];
  if (children.length < 7) return;
  const [
    eyebrowDiv,
    prefixDiv,
    mainHeadingDiv,
    headerTagDiv,
    suffixDiv,
    descriptionDiv,
    bottomLineDiv,
  ] = children;

  const getTextContent = (div) => div?.querySelector('p')?.textContent || '';

  const eyebrowText = getTextContent(eyebrowDiv);
  const prefixText = getTextContent(prefixDiv);
  const mainHeadingText = getTextContent(mainHeadingDiv);
  const headerTag = getTextContent(headerTagDiv) || 'h2';
  const suffixText = getTextContent(suffixDiv);
  const descriptionText = getTextContent(descriptionDiv);
  const addBottomLine = getTextContent(bottomLineDiv) === 'true';

  headingBlock.innerHTML = '';

  const eyebrow = document.createElement('p');
  eyebrow.classList.add('eyebrowtext');
  eyebrow.textContent = eyebrowText;

  const headerElement = document.createElement(headerTag);
  const prefixSpan = document.createElement('span');
  prefixSpan.classList.add('prefix');
  prefixSpan.textContent = prefixText;

  const suffixSpan = document.createElement('span');
  suffixSpan.classList.add('suffix');
  suffixSpan.textContent = suffixText;

  headerElement.append(prefixSpan, ` ${mainHeadingText} `, suffixSpan);

  const description = document.createElement('p');
  description.classList.add('heading-description');
  description.textContent = descriptionText;

  // Append elements to the heading block
  headingBlock.append(eyebrow, headerElement, description);

  // Append horizontal line if "true" is found in the last div
  if (addBottomLine) {
    const hr = document.createElement('hr');
    headingBlock.appendChild(hr);
  }
}

export default function decorate(block) {
  updateHeadingStructure(block);
}
