export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // specific logic for columns-divider-variant
  if (block.classList.contains('columns-divider-variant')) {
    block.style.display = 'flex';
    block.style.gap = '20px';

    cols.forEach((col, index) => {
      if (index === 0) {
        col.style.flexBasis = '30%';
      } else {
        col.style.flexBasis = '70%';
      }
    });
  } else {
    // Default to equal column width
    cols.forEach((col) => {
      col.style.flexBasis = `${100 / cols.length}%`;
    });
  }

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
    });
  });
}
