import {
  div, a, span, img, video, source,
} from '../../scripts/dom-helpers.js';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function createVideoPlayer(videoSrc) {
  const pauseIcon = `${window.hlx.codeBasePath}/icons/SM-Icon_Pause.svg`;
  const playIcon = `${window.hlx.codeBasePath}/icons/MD-Icon_Video.svg`;

  // adding newlines after paren makes this harder to read
  /* eslint-disable function-paren-newline */
  const videoPlayer = div({ class: 'video-container' },
    div({ class: 'video-play', id: 'playButton', tabindex: 0 },
      img({ class: 'play-icon controls', src: playIcon }),
    ),
    div({ class: 'video-pause inactive', id: 'pauseButton' },
      img({ class: 'pause-icon controls', src: pauseIcon }),
    ),
    video({ id: 'videoPlayer' },
      source({ src: videoSrc, type: 'video/mp4' }, 'Your browser does not support the video tag.'),
    ),
  );

  const videoEl = videoPlayer.querySelector('video');
  videoEl.muted = true;
  videoEl.playsInline = true;
  videoEl.loop = true;

  return videoPlayer;
}

function createBackgroundImage(properties) {
  const imgSrc = properties.imageReference;
  const imgAlt = properties.alt;
  const imgBackground = div({ class: 'background-image' },
    img({ class: 'teaser-background', src: imgSrc, alt: imgAlt }),
  );

  return imgBackground;
}

function observeVideo(block, autoplay) {
  const videoPlayerEl = block.querySelector('video');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (!(prefersReducedMotion.matches) && autoplay && (videoPlayerEl.dataset.state !== 'pause')) {
          const playButton = document.getElementById('playButton');
          const pauseButton = document.getElementById('pauseButton');
          playButton.classList.add('inactive');
          playButton.removeAttribute('tabindex');
          pauseButton.classList.remove('inactive');
          pauseButton.setAttribute('tabindex', 0); // hide 'play' button
          videoPlayerEl.play(); // Play the video when it enters the viewport
        }
      } else {
        videoPlayerEl.pause(); // Pause the video when it leaves the viewport
      }
    });
  }, { threshold: 0.5 });
  observer.observe(videoPlayerEl);
}

function attachListeners() {
  const videoPlayer = document.getElementById('videoPlayer');
  const playButton = document.getElementById('playButton');
  const pauseButton = document.getElementById('pauseButton');

  // Play the video when the play button is clicked or a keyboard button pressed
  ['click', 'keydown'].forEach((eventType) => {
    playButton.addEventListener(eventType, (event) => {
      if (eventType === 'keydown' && event.key !== 'Enter') return; // escape non-enter keys
      playButton.classList.add('inactive');
      playButton.removeAttribute('tabindex');
      pauseButton.classList.remove('inactive');
      pauseButton.setAttribute('tabindex', 0);
      videoPlayer.autoplay = true;
      videoPlayer.dataset.state = 'play';
      videoPlayer.play();
    });
  });

  ['click', 'keydown'].forEach((eventType) => {
    pauseButton.addEventListener(eventType, (event) => {
      if (eventType === 'keydown' && event.key !== 'Enter') return; // escape non-enter keys
      playButton.classList.remove('inactive');
      playButton.setAttribute('tabindex', 0);
      pauseButton.classList.add('inactive');
      pauseButton.removeAttribute('tabindex');
      videoPlayer.autoplay = false;
      videoPlayer.dataset.state = 'pause';
      videoPlayer.pause();
    });
  });
}

export default function decorate(block) {
  const properties = {};
  const swooshFirst = `${window.hlx.codeBasePath}/icons/teaser_innerswoosh.svg`;
  const swooshSecond = `${window.hlx.codeBasePath}/icons/teaser_outerswoosh.svg`;

  [...block.children].forEach((row) => {
    const propEl = row.querySelector('p');
    if (propEl) {
      const key = propEl.dataset.aueProp;
      if (propEl.children.length === 0) {
        properties[key] = propEl.textContent;
      } else if (propEl.classList.contains('button-container')) {
        const link = propEl.querySelector('a').href;
        properties[link.includes('html') ? 'link' : 'videoReference'] = link;
      } else {
        properties.teaserBlurb = propEl.innerHTML;
      }
    } else {
      const picEl = row.querySelector('picture > img');
      if (picEl) {
        properties[picEl.dataset.aueProp] = picEl.src;
      }
    }
  });

  const isVideo = (properties.teaserStyle === 'video');
  const teaser = div({ class: 'teaser-container' },
    isVideo ? createVideoPlayer(properties.videoReference) : createBackgroundImage(properties),
    div({ class: 'teaser-swoosh-wrapper' },
      div({ class: 'swoosh-bg' }),
      div({ class: 'swoosh-layers' },
        img({ class: 'swoosh first', src: swooshFirst }),
        img({ class: 'swoosh second', src: swooshSecond }),
      ),
      div({ class: 'teaser-title-wrapper' },
        div({ class: 'teaser-title' }),
        div({ class: 'button-container' },
          a({ id: 'button', href: properties.link, class: `button ${properties['btn-style']}` },
            span({ class: 'button-text' }, properties['btn-text']),
          ),
        ),
      ),
    ),
  );

  teaser.querySelector('.teaser-title').innerHTML = properties.teaserBlurb;
  block.innerHTML = '';
  block.appendChild(teaser);

  // add observer for video
  if (isVideo) observeVideo(block);
  attachListeners();
}
