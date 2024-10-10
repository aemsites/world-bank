function handleExpandCollapse(event) {
  const button = event.target;
  const card = button.closest('.organizational-card');
  card.classList.toggle('collapsed');
  const isCollapsed = card.classList.contains('collapsed');
  card.setAttribute('aria-expanded', !isCollapsed);
  // set the focus on minus icon when card is expanded
  if (!isCollapsed) {
    card.querySelector('.collapse-btn').focus();
  } else {
    card.querySelector('.expand-btn').focus();
  }
}

function closeOpenCards() {
  const openCards = document.querySelectorAll('.organizational-card:not(.collapsed)');
  [...openCards].forEach((card) => {
    card.classList.add('collapsed');
    card.setAttribute('aria-expanded', false);
  });
}

export default async function decorate(block) {
  const gradOverlayEl = document.createElement('div');
  gradOverlayEl.classList.add('bg-overlay');
  const [picEl, ...cards] = block.children;
  picEl.classList.add('bg-wrapper');
  picEl.appendChild(gradOverlayEl);

  [...cards].forEach((card) => {
    const contentWrapper = document.createElement('div');
    contentWrapper.classList.add('card-content-wrapper');
    card.classList.add('organizational-card', 'collapsed');
    const acronymEl = card.children[0];
    acronymEl.classList.add('card-acronym');
    card.children[1].classList.add('card-title');
    card.children[2].classList.add('card-mission', 'left-justify-content');
    card.children[3].classList.add('card-link-wrapper', 'left-justify-content');
    const anchorEl = card.children[3].querySelector('a');
    anchorEl.classList.add('card-link');
    anchorEl.setAttribute('aria-label', `${anchorEl.innerText} - ${card.children[1].innerText}`);
    const collapseBtn = document.createElement('div');
    collapseBtn.classList.add('collapse-btn');
    collapseBtn.tabIndex = 0;
    collapseBtn.setAttribute('role', 'button');
    collapseBtn.setAttribute('aria-label', `Collapse ${card.children[1].innerText}`);
    const minusIcon = document.createElement('img');
    minusIcon.src = `${window.hlx.codeBasePath}/icons/icon-minus.svg`;
    minusIcon.setAttribute('alt', 'Collapse icon');
    minusIcon.width = 20;
    minusIcon.height = 20;
    collapseBtn.appendChild(minusIcon);

    const expandBtn = document.createElement('div');
    expandBtn.classList.add('expand-btn');
    expandBtn.tabIndex = 0;
    expandBtn.setAttribute('role', 'button');
    expandBtn.setAttribute('aria-label', `Expand ${card.children[1].innerText}`);
    const plusIcon = document.createElement('img');
    plusIcon.src = `${window.hlx.codeBasePath}/icons/icon-plus.svg`;
    plusIcon.setAttribute('alt', 'Expand icon');
    plusIcon.width = 20;
    plusIcon.height = 20;
    expandBtn.appendChild(plusIcon);
    acronymEl.after(expandBtn);
    acronymEl.after(collapseBtn);
    ['click', 'keydown'].forEach((trigger) => {
      collapseBtn.addEventListener(trigger, (event) => {
        if (trigger === 'keydown' && event.key !== 'Enter') return; // escape non-enter keys
        handleExpandCollapse(event);
      });
      expandBtn.addEventListener(trigger, (event) => {
        if (trigger === 'keydown' && event.key !== 'Enter') return;
        closeOpenCards();
        handleExpandCollapse(event);
      });
    });

    // move card children to content wrapper
    while (card.firstChild) {
      contentWrapper.appendChild(card.firstChild);
    }
    card.appendChild(contentWrapper);
  });
}
