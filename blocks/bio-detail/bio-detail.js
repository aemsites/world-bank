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

function createSocialMediaLink(linkName, className, iconPath) {
  if (linkName && linkName.textContent.trim()) {
    const anchor = document.createElement('a');
    anchor.href = linkName.textContent.trim();
    anchor.title = linkName.textContent.trim();
    const linkImage = img({ class: className });
    linkImage.src = `${window.hlx.codeBasePath}/icons/${iconPath}`;
    linkImage.alt = iconPath;
    linkImage.width = '15px';
    linkImage.height = '15px';
    anchor.appendChild(linkImage);
    const socialMediaLink = div({ class: 'social-media-link' }, anchor);
    socialMediaLink.addEventListener('click', () => {
      window.location.href = linkName.textContent;
    });
    return socialMediaLink;
  }
  return null;
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
  const nameJobSocial = div({ class: 'name-job-social' }, bioName, jobTitle);
  const socialMedias = div({ class: 'social-media' });
  const socialMediaIcons = [
    { link: x, icon: 'ximage.png' },
    { link: linkedin, icon: 'linkedin.png' },
    { link: insta, icon: 'insta.png' },
  ];

  socialMediaIcons.forEach(({ link, icon }) => {
    const socialMediaLink = createSocialMediaLink(link, 'xlink', icon);
    if (socialMediaLink) {
      socialMedias.append(socialMediaLink);
    }
  });
  nameJobSocial.appendChild(socialMedias);
  const nameJobSocialClone = nameJobSocial.cloneNode(true);
  const secondContainer = div(
    { class: 'second-container' },
    nameJobSocialClone,
    profileImage,
  );

  const mediaResources = div(
    { class: 'media-resources' },
    mediaInquiries,
    resources,
  );
  firstContainer.append(nameJobSocial, mediaResources);

  createStructure(firstContainer, secondContainer, block);
  x.remove();
  linkedin.remove();
  insta.remove();
}

function createResources(block) {
  const listItems = block.querySelectorAll('.resources div p');
  listItems.forEach((link) => {
    const downloadImg = img({ class: 'download-image' });
    downloadImg.src = `${window.hlx.codeBasePath}/icons/download.png`;
    downloadImg.alt = 'download';
    link.insertBefore(downloadImg, link.firstChild);
  });
}

export default async function decorate(block) {
  const [
    profileImage,
    displayName,
    jobTitle,
    xLink,
    linkedinLink,
    instaLink,
    mediaInquiries,
    resources,
  ] = [...block.children];

  profileImage.className = 'profile-image';
  displayName.className = 'display-name';
  jobTitle.className = 'job-title';
  xLink.className = 'x-link';
  linkedinLink.className = 'linkedin-lLink';
  instaLink.className = 'insta-link';
  mediaInquiries.className = 'media-inquiries';
  resources.className = 'resources';

  profileImage.querySelectorAll('div > picture > img').forEach((profileImg) => {
    const optimizedPic = createOptimizedPicture(profileImg.src, profileImg.alt, false, [{ width: '750' }]);
    moveInstrumentation(profileImg, optimizedPic.querySelector('img'));
    profileImg.closest('picture').replaceWith(optimizedPic);
  });

  const mediaTargetDiv = document.querySelector('.media-inquiries');
  const placeholderData = await fetchLanguagePlaceholders();
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
