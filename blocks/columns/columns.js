export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);
  const anchorContainer = document.createElement('div');
  anchorContainer.className = 'anchor-container'; // Add a class for styling if needed

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
      const paragraphs = col.querySelectorAll('div > p');
      if (paragraphs.length > 0) {
        paragraphs.forEach((para, index) => {
          para.classList.add(`tk-${index + 1}`);
          const anchor = para.querySelector('a');
          if (anchor) {
            anchorContainer.appendChild(para);
          }
        });
      }
      const tk2Paragraph = block.querySelector('.tk-2');

      if (tk2Paragraph) {
        tk2Paragraph.insertAdjacentElement('afterend', anchorContainer);
      }
    });
  });
}
