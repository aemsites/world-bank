import { div, img } from '../../scripts/dom-helpers.js';

import { fetchLanguagePlaceholders } from '../../scripts/scripts.js';

function createStructure(firstContainer, secondContainer, block) {
  const sectionsContainer = div(
    { class: 'sections-container' },
    firstContainer,
    secondContainer,
  );
  block.append(sectionsContainer);
}

function createSocialMediaLink(linkName, className, iconPath) {
  if (linkName && linkName.textContent) {
    const anchor = document.createElement('a');
    anchor.href = linkName.textContent;
    anchor.title = linkName.textContent;
    const linkImage = img({ class: className });
    linkImage.src = `${window.hlx.codeBasePath}/icons/${iconPath}`;
    anchor.appendChild(linkImage);
    const socialMediaLink=  div({ class: 'social-media-link' }, anchor);
    socialMediaLink.addEventListener('click',()=>{
      window.location.href = linkName.textContent;
    })
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

function createResources() {
  const listItems = document.querySelectorAll('.resources div p');
  listItems.forEach((link) => {
    const downloadImg = img({ class: 'download-image' });
    downloadImg.src = `${window.hlx.codeBasePath}/icons/download.png`;
    downloadImg.alt = 'download';
    link.insertBefore(downloadImg, link.firstChild);
  });
}

function createMetaTag(
  firstName,
  surName,
  upiId,
  isLeader,
  isExpert,
  isSrManager,
  expertiseTopics,
) {
  const listOfMetaTags = [
    { name: 'firstname', value: firstName },
    { name: 'surname', value: surName },
    { name: 'upi-id', value: upiId },
    { name: 'is-leader', value: isLeader },
    { name: 'is-expert', value: isExpert },
    { name: 'is-sr-manager', value: isSrManager }];
  listOfMetaTags.forEach((metaData) => {
    const meta = document.createElement('meta');
    meta.name = metaData.name;
    meta.content = metaData.value.textContent;
    document.head.appendChild(meta);
  });
  firstName.remove();
  surName.remove();
  upiId.remove();
  isLeader.remove();
  isExpert.remove();
  isSrManager.remove();
  expertiseTopics.remove();
}

export default async function decorate(block) {
  const [
    profileImage,
    displayName,
    firstName,
    surName,
    upiId,
    isLeader,
    isExpert,
    isSrManager,
    expertiseTopics,
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
  createMetaTag(
    firstName,
    surName,
    upiId,
    isLeader,
    isExpert,
    isSrManager,
    expertiseTopics,
  );

  createResources();
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
