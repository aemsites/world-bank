import { div, img } from '../../scripts/dom-helpers.js';
import { fetchLanguagePlaceholders, moveInstrumentation } from '../../scripts/scripts.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

function createStructure(firstContainer, secondContainer, block) {
  const sectionsContainer = div(
    { class: 'sections-container' },
    firstContainer,
    secondContainer,
  );
  block.append(sectionsContainer);
}

function createSocialMediaLink(link, className, iconPath) {
  if (!link || !link.textContent.trim()) return null;

  const href = link.textContent.trim();
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.title = href;

  const linkImage = img({ class: className });
  linkImage.src = `${window.hlx.codeBasePath}/icons/${iconPath}`;
  linkImage.alt = iconPath;

  anchor.appendChild(linkImage);

  return div({ class: 'social-media-link' }, anchor);
}

function createPersonBio(
  bioName,
  jobTitle,
  x,
  linkedin,
  insta,
  profileImage,
  mediaInquiries,
  resources,
  block,
) {
  const firstContainer = div({ class: 'first-container' });

  const socialMediaLinks = [
    { link: x, icon: 'ximage.png' },
    { link: linkedin, icon: 'linkedin.png' },
    { link: insta, icon: 'insta.png' },
  ];

  const socialMedias = div({ class: 'social-media' });
  socialMediaLinks.forEach(({ link, icon }) => {
    const socialMediaLink = createSocialMediaLink(link, 'social-media-icon', icon);
    if (socialMediaLink) socialMedias.appendChild(socialMediaLink);
  });

  const nameJobSocial = div({ class: 'name-job-social' }, bioName, jobTitle, socialMedias);
  const secondContainer = div({ class: 'second-container' }, nameJobSocial.cloneNode(true), profileImage);

  const mediaResources = div({ class: 'media-resources' }, mediaInquiries, resources);
  firstContainer.append(nameJobSocial, mediaResources);

  createStructure(firstContainer, secondContainer, block);

  [x, linkedin, insta].forEach((link) => link?.remove());
}

function createResources(block) {
  block.querySelectorAll('.resources div p').forEach((link) => {
    const downloadImg = img({ class: 'download-image' });
    downloadImg.src = `${window.hlx.codeBasePath}/icons/download.png`;
    downloadImg.alt = 'download';
    link.insertBefore(downloadImg, link.firstChild);
  });
}

export default async function decorate(block) {
  const [profileImage, displayName, jobTitle, xLink, linkedinLink,
    instaLink, mediaInquiries,
    resources] = [...block.children];

  const classNames = {
    profileImage: 'profile-image',
    displayName: 'display-name',
    jobTitle: 'job-title',
    xLink: 'x-link',
    linkedinLink: 'linkedin-link',
    instaLink: 'insta-link',
    mediaInquiries: 'media-inquiries',
    resources: 'resources',
  };

  profileImage.className = classNames.profileImage;
  displayName.className = classNames.displayName;
  jobTitle.className = classNames.jobTitle;
  xLink.className = classNames.xLink;
  linkedinLink.className = classNames.linkedinLink;
  instaLink.className = classNames.instaLink;
  mediaInquiries.className = classNames.mediaInquiries;
  resources.className = classNames.resources;

  profileImage.querySelectorAll('div > picture > img').forEach((profileImg) => {
    const optimizedPic = createOptimizedPicture(profileImg.src, 'profile-img', false, [{ width: '750', loading: 'lazy' }]);
    moveInstrumentation(profileImg, optimizedPic.querySelector('img'));
    profileImg.closest('picture').replaceWith(optimizedPic);
  });

  const [placeholderData] = await Promise.all([fetchLanguagePlaceholders()]);

  const mediaTargetDiv = document.querySelector('.media-inquiries');
  mediaTargetDiv.insertBefore(
    div({ class: 'title' }, placeholderData.biodetailMediaText),
    mediaTargetDiv.firstChild,
  );

  const resourcesTargetDiv = document.querySelector('.resources');
  resourcesTargetDiv.insertBefore(
    div({ class: 'title' }, placeholderData.biodetailResourcesText),
    resourcesTargetDiv.firstChild,
  );

  createResources(block);

  createPersonBio(
    displayName,
    jobTitle,
    xLink,
    linkedinLink,
    instaLink,
    profileImage,
    mediaInquiries,
    resources,
    block,
  );
}
