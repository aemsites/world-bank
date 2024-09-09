export default async function decorate(block) {
  console.log('loaded org cards js');
  console.log(block.children);

  const gradOverlayEl = document.createElement('div');
  gradOverlayEl.classList.add('bg-overlay');
  const [picEl, ...cards] = block.children;
  picEl.classList.add('bg-wrapper');
  picEl.appendChild(gradOverlayEl);
  //const bgImg = picEl.querySelector('picture');
  // optimize image
  // todo- move picture element to be a child of bg-wrapper, make empty div the gradient overlay
  [...cards].forEach((card) => {
    card.classList.add('organizational-card', 'collapsed');
    const acronymEl = card.children[0];
    acronymEl.classList.add('card-acronym');
    card.children[1].classList.add('card-title');
    card.children[2].classList.add('card-mission');
    card.children[3].classList.add('card-link-wrapper');
    
    const anchorEl = card.children[3].querySelector('a');
    anchorEl.classList.add('card-link');
    //const href = anchorEl.href;
    //const linkText = anchorEl.linkText;
    //const href = learnMoreEl.querySelector('a').href;
    //const linkText = learnMoreEl.children[1].textContent;

    // process the button

    const collapseBtn = document.createElement('div');
    collapseBtn.classList.add('collapse-btn');
    const minusIcon = document.createElement('img');
    minusIcon.src = `${window.hlx.codeBasePath}/icons/icon-minus.png`;
    collapseBtn.appendChild(minusIcon);
    const expandBtn = document.createElement('div');
    expandBtn.classList.add('expand-btn');
    const plusIcon = document.createElement('img');
    plusIcon.src = `${window.hlx.codeBasePath}/icons/icon-plus.png`;
    expandBtn.appendChild(plusIcon);
    acronymEl.appendChild(expandBtn);
    acronymEl.appendChild(collapseBtn);
  })
}

function collapseCard() {

}

function expandCard() {

}
