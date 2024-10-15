import {
  div, a, span, img, video, source, button,
  h1,
} from '../../scripts/dom-helpers.js';
import { readBlockConfig } from '../../scripts/aem.js';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function createVideoPlayer(videoSrc) {
  const pauseIcon = `${window.hlx.codeBasePath}/icons/video-pause.svg`;
  const playIcon = `${window.hlx.codeBasePath}/icons/video-play.svg`;

  // adding newlines after paren makes this harder to read
  /* eslint-disable function-paren-newline */
  const videoPlayer = div({ class: 'video-container' },
    div({ class: 'video-play', id: 'playButton', tabindex: 0 },
      button({ class: 'video-play-btn', 'aria-label': 'video-play-btn' }, img({
        class: 'play-icon controls', src: playIcon, width: 28, height: 28, alt: 'play animation',
      })),
    ),
    div({ class: 'video-pause inactive', id: 'pauseButton' },
      button({ class: 'video-pause-btn', 'aria-label': 'video-pause-btn' }, img({
        class: 'pause-icon controls', src: pauseIcon, width: 28, height: 28, alt: 'pause animation',
      })),
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
  let missingSrc;
  if (!properties.imageref) missingSrc = true;
  const imgSrc = (!missingSrc) ? properties.imageref : '';
  const imgAlt = (properties.imagealt) ? properties.imagealt : '';
  const imgBackground = div({ class: 'background-image' },
    img({ class: 'teaser-background', src: imgSrc, alt: imgAlt }),
  );

  if (missingSrc) imgBackground.classList.add('inactive'); // hide img bg on initial authoring

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
  const rteElementTag = Array.from(block.querySelectorAll('p'))
    .find((el) => el.textContent.trim() === 'teaserBlurb');
  const rteElement = rteElementTag.parentElement.nextElementSibling;
  const rteContent = rteElement.querySelector('p').innerHTML;
  const sampleVideo = 'https://publish-p136806-e1403562.adobeaemcloud.com/content/dam/wb-md/wb-sample.mp4';

  const properties = readBlockConfig(block);
  const swooshFirst = `${window.hlx.codeBasePath}/icons/teaser_innerswoosh.svg`;
  const swooshSecond = `${window.hlx.codeBasePath}/icons/teaser_outerswoosh.svg`;
  const isVideo = (properties.teaserstyle && properties.teaserstyle === 'video');
  const videoAutoplay = (properties.videobehavior && properties.videobehavior === 'autoplay');
  const buttonText = (properties['btn-text']) ? properties['btn-text'] : 'Button';
  const buttonStyle = (properties['btn-style']) ? properties['btn-style'] : 'dark-bg';
  const buttonLink = (properties['btn-link']) ? properties['btn-link'] : '';
  const videoReference = isVideo ? properties.videoreference : sampleVideo;
  const teaser = div({ class: 'teaser-container' },
    isVideo ? createVideoPlayer(videoReference) : createBackgroundImage(properties),
    div({ class: 'teaser-swoosh-wrapper' },
      div({ class: 'swoosh-bg' }),
      div({ class: 'swoosh-layers' },
        img({ class: 'swoosh first', src: swooshFirst, alt: 'background swoosh first' }),
        img({ class: 'swoosh second', src: swooshSecond, alt: 'background swoosh second' }),
      ),
      div({ class: 'teaser-title-wrapper' },
        h1({ class: 'teaser-title' }),
        div({ class: 'button-container' },
          a({ id: 'button', href: buttonLink, class: `button ${buttonStyle}` },
            span({ class: 'button-text' }, buttonText),
          ),
        ),
      ),
    ),
  );

  teaser.querySelector('.teaser-title').innerHTML = properties.teaserblurb ? rteContent : 'Authorable RTE text';
  block.innerHTML = '';
  block.appendChild(teaser);

  // add observer for video and listeners for play/pause
  if (isVideo) observeVideo(block, videoAutoplay);
  if (isVideo) attachListeners();
}
