export default function decorate(block) {
  const props = [...block.children].map((row) => row.firstElementChild);
  const appUrl = props[0].textContent;
  const iframe = document.createElement('iframe');
  iframe.src = appUrl;
  iframe.width = '100%';
  iframe.height = '100%';
  iframe.style.border = 'none';
  block.textContent = '';
  block.append(iframe);
}
