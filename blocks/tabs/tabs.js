// eslint-disable-next-line import/no-unresolved
import { toClassName } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { div } from '../../scripts/dom-helpers.js';

export default async function decorate(block) {
  const tablist = div({ class: 'tabs-list', role: 'tablist' });

  // decorate tabs and tabpanels
  const tabs = [...block.children].map((child) => child.firstElementChild);

  tabs.forEach((tab, i) => {
    const id = toClassName(tab.textContent);

    // decorate tabpanel
    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    // build tab button
    const button = document.createElement('button');
    button.className = 'tabs-tab';
    button.id = `tab-${id}`;
    button.innerHTML = tab.innerHTML;
    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      tabpanel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });
    tablist.append(button);
    tab.remove();
  });

  block.querySelectorAll('[role=tabpanel] a').forEach(async (link) => {
    const path = link ? link.getAttribute('href') : '';

    if (path === '') return;
    const tabPanel = link.closest('[role=tabpanel]');
    const fragment = await loadFragment(path);

    // decorate footer DOM
    const content = div({}, fragment);
    tabPanel.innerHTML = '';
    tabPanel.append(content);
  });
  block.prepend(tablist);
}
