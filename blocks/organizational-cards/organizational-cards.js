export default async function decorate(block) {
  const gradOverlayEl = document.createElement('div');
  gradOverlayEl.classList.add('bg-overlay');
  const [picEl, ...cards] = block.children;
  picEl.classList.add('bg-wrapper');
  picEl.appendChild(gradOverlayEl);

  [...cards].forEach((card) => {
    card.classList.add('organizational-card', 'collapsed');
    const acronymEl = card.children[0];
    acronymEl.classList.add('card-acronym');
    card.children[1].classList.add('card-title');
    card.children[2].classList.add('card-mission');
    card.children[3].classList.add('card-link-wrapper');
    
    const anchorEl = card.children[3].querySelector('a');
    anchorEl.classList.add('card-link');
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
    ['click', 'keydown'].forEach((trigger) => {
      collapseBtn.addEventListener(trigger, (event) => {
        if (trigger === 'keydown' && event.key !== 'Enter') return; // escape non-enter keys
        handleExpandCollapse(event);
      });
      expandBtn.addEventListener(trigger, (event) => {
        if (trigger === 'keydown' && event.key !== 'Enter') return; // escape non-enter keys
        closeOpenCards();
        handleExpandCollapse(event);
      });
    });
  });
}

function handleExpandCollapse(event) {
  const button = event.target;
  const card = button.closest('.organizational-card');
  card.classList.toggle('collapsed');
}

function closeOpenCards() {
  const openCards = document.querySelectorAll('.organizational-card:not(.collapsed)');
  [...openCards].forEach((card) => {
    card.classList.add('collapsed');
  });
}