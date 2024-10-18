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

function createSocialMediaLink(linkName, className, iconPath, name) {
  if (linkName && linkName.textContent.trim()) {
    const anchor = document.createElement('a');
    anchor.href = linkName.textContent.trim();
    anchor.title = name;
    const linkImage = img({ class: className });
    linkImage.src = `${window.hlx.codeBasePath}/icons/${iconPath}`;
    linkImage.alt = name;
    linkImage.width = '50';
    linkImage.height = '50';
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
  const pElement = block.querySelector('.display-name p');
  const h1Element = document.createElement('h1');
  h1Element.textContent = pElement.textContent;
  pElement.parentNode.replaceChild(h1Element, pElement);
  const firstContainer = div({ class: 'first-container' });
  const nameJobSocial = div({ class: 'name-job-social' }, bioName, jobTitle);
  const socialMedias = div({ class: 'social-media' });
  const socialMediaIcons = [
    { link: x, icon: 'profileiconx.svg', name: 'X' },
    { link: linkedin, icon: 'profileiconin.svg', name: 'linkedin' },
    { link: insta, icon: 'profileiconinsta.svg', name: 'instagram' },
  ];

  socialMediaIcons.forEach(({ link, icon, name }) => {
    const socialMediaLink = createSocialMediaLink(link, 'xlink', icon, name);
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
  const profileImg = profileImage.querySelector('div > picture > img');
  const optimizedPic = createOptimizedPicture(profileImg.src, displayName.innerText, true);
  const newProfilePic = optimizedPic.querySelector('img');
  newProfilePic.width = 460;
  newProfilePic.height = 460;
  newProfilePic.title = displayName.innerText.trim();
  moveInstrumentation(profileImg, newProfilePic);
  profileImg.closest('picture').replaceWith(optimizedPic);

  const mediaTargetDiv = block.querySelector('.media-inquiries');
  mediaTargetDiv.querySelectorAll('a').forEach((a) => {
    a.dataset.customlink = 'sm:body';
    a.dataset.text = a.textContent;
  });
  const placeholderData = await fetchLanguagePlaceholders();
  mediaTargetDiv.insertBefore(
    div({ class: 'title' }, placeholderData.biodetailMediaText),
    mediaTargetDiv.firstChild,
  );

  if (resources.textContent.trim()) {
    const resourcesTargetDiv = block.querySelector('.resources');
    resourcesTargetDiv.insertBefore(
      div({ class: 'title' }, placeholderData.biodetailResourcesText),
      resourcesTargetDiv.firstChild,
    );
    createResources(block);
  }
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
