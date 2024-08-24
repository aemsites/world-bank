import { div, a, span, img } from '../../scripts/dom-helpers.js';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

export default function decorate(block) {

  console.log(block);
  testBuild(block);

  //console.log(properties);

}

function testBuild(block) {
  const properties = {};
  const swooshFirst = '/content/dam/wb-md/teaser_innerswoosh.svg'; // todo use decorateicons + icons\swoosh
  const swooshSecond = '/content/dam/wb-md/teaser_outerswoosh.svg'; // todo use decorateicons + icons\swoosh
  console.log(block);
  console.log(block.children);
  [...block.children].forEach((row) => {
    const propEl = row.querySelector('p');
    console.log(propEl);
    if (propEl) {
      if (propEl.children.length == 0) {
        const key = propEl.dataset.aueProp;
        const value = propEl.textContent;
        properties[key] = value;
      } else {
        if (propEl.classList.contains('button-container')) {
          properties['link'] = propEl.querySelector('a').href;
        } else {
          const key = 'teaserBlurb';
          //console.log(propEl.innerHTML);
          //const value = propEl.textContent;
          const value = propEl.innerHTML;
          properties[key] = value;
        }
      }
    } else {
      console.log(row);
      const picEl = row.querySelector('picture > img');
      if (picEl) {
        const key = picEl.dataset.aueProp;
        const value = picEl.src;
        properties[key] = value;
      }
    }
  });

  const imgSrc = properties['imageReference'];
  const swooshSrc = properties['swooshReference'];

  console.log(properties);

  /*
  const teaser = div({ class: 'teaser-container' },
    div({ class: 'background-image' },
      img({ class: 'teaser-background', src: imgSrc })
    ),
    div({ class: 'teaser-swish-wrapper'}, 
      img({ class: 'teaser-swish', src: swooshSrc }),
      div({ class: 'teaser-title-wrapper'},
        div({ class: 'teaser-title'}),
        div({ class: 'button-container'},
          a({ id: 'button', href: properties['link'], class: 'button white'}, 
            span({ class: 'button-text' }, properties['btn-text'])
          )
        )
      )
    )
  );
  */
  const teaser = div({ class: 'teaser-container' },
    div({ class: 'background-image' },
      img({ class: 'teaser-background', src: imgSrc })
    ),
    div({ class: 'teaser-swish-wrapper'},
      div({ class: 'swoosh-bg'}),
      div({ class: 'swoosh-layers'},
        img({ class: 'swoosh first', src: swooshFirst }),
        img({ class: 'swoosh second', src: swooshSecond })
      ),
      div({ class: 'teaser-title-wrapper'},
        div({ class: 'teaser-title'}),
        div({ class: 'button-container'},
          a({ id: 'button', href: properties['link'], class: 'button white'}, 
            span({ class: 'button-text' }, properties['btn-text'])
          )
        )
      )
    )
  );




  console.log(teaser);
  teaser.querySelector('.teaser-title').innerHTML = properties['teaserBlurb'];
  block.innerHTML = '';
  block.appendChild(teaser);
}