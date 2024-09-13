function updateHeadingStructure(block) {
     const headingBlock = block;
    if (!headingBlock) return;

    const [eyebrowDiv, prefixDiv, mainHeadingDiv, headerTagDiv, suffixDiv, descriptionDiv, bottomLineDiv] = headingBlock.children;

    // Extract text content from the relevant divs
    const eyebrowText = eyebrowDiv.querySelector('p').textContent;
    const prefixText = prefixDiv.querySelector('p').textContent;
    const mainHeadingText = mainHeadingDiv.querySelector('p').textContent;
    const headerTag = headerTagDiv.querySelector('p').textContent; // e.g., 'h2'
    const suffixText = suffixDiv.querySelector('p').textContent;
    const descriptionText = descriptionDiv.querySelector('p').textContent;
    const addBottomLine = bottomLineDiv.querySelector('p').textContent === 'true';

    // Clear the current contents of the heading block
    headingBlock.innerHTML = '';

    // Create elements
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

    // Append the header content: <h2> <span class="prefix">prefix text</span> main heading <span class="suffix">suffix Text</span></h2>
    headerElement.appendChild(prefixSpan);
    headerElement.appendChild(document.createTextNode(` ${mainHeadingText} `));
    headerElement.appendChild(suffixSpan);

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

    console.log(headingBlock);
}

export default function decorate(block) {
    // Execute the update
    updateHeadingStructure(block);
}
