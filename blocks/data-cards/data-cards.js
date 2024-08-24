function processTag(tag) {
  const prefix = 'world-bank:';
  let tagTxt = tag.innerText;
  if (tagTxt) {
    tagTxt = tagTxt.replace(prefix, '');
    tag.classList.add(tagTxt);
    tag.firstElementChild.innerText = tagTxt;
  }
}

export default async function decorate(block) {
  [...block.children].forEach((row) => {
    row.className = 'data-card';
    const [tag, title, description, disclaimer] = [...row.children];
    tag.className = 'data-card-tag';
    title.className = 'data-card-title';
    description.className = 'data-card-description';
    disclaimer.className = 'data-card-disclaimer';

    if (tag) {
      processTag(tag);
    }
  });
}
