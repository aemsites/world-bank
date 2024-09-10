import { div, img } from "../../scripts/dom-helpers.js";

import { fetchLanguagePlaceholders } from "../../scripts/scripts.js";

function createStructure(firstContainer, secondContainer) {
  const sectionsContainer = div(
    { class: "sections-container" },
    firstContainer,
    secondContainer
  );
  document.querySelector(".bio-detail.block").append(sectionsContainer);
}

function createPersonBio(
  bioName,
  jobTitle,
  x,
  linkedin,
  insta,
  profileImage,
  mediaInquiries,
  resources
) {
  const firstContainer = div({ class: "first-container" });
  const nameJobSocial = div({ class: "name-job-social" }, bioName, jobTitle);
  const linksList = [x, linkedin, insta];
  const socialMedias = div({ class: "social-media" });
  linksList.forEach((linkName, i) => {
    const anchor = document.createElement("a");
    Object.assign(anchor, {
      href: linkName.textContent,
      title: linkName.textContent,
    });
    console.log(linkName.textContent, "textcontent is", linkName, i);
    if (i === 0 && linkName.textContent !== "") {
      const linkImage = img({ class: "xlink" });
      linkImage.src = `${window.hlx.codeBasePath}/icons/ximage.png`;
      anchor.appendChild(linkImage);
      socialMedias.append(div({ class: "social-media-link" }, anchor));
    } else if (i === 1 && linkName.textContent) {
      const linkImage = img({ class: "xlink" });
      linkImage.src = `${window.hlx.codeBasePath}/icons/linkedin.png`;
      anchor.appendChild(linkImage);
      socialMedias.append(div({ class: "social-media-link" }, anchor));
    } else if (i === 2 && linkName.textContent) {
      const linkImage = img({ class: "xlink" });
      linkImage.src = `${window.hlx.codeBasePath}/icons/insta.png`;
      anchor.appendChild(linkImage);
      socialMedias.append(div({ class: "social-media-link" }, anchor));
    }
  });
  nameJobSocial.appendChild(socialMedias);
  const nameJobSocialClone = nameJobSocial.cloneNode(true);
  const secondContainer = div(
    { class: "second-container" },
    nameJobSocialClone,
    profileImage
  );

  const mediaResources = div(
    { class: "media-resources" },
    mediaInquiries,
    resources
  );
  firstContainer.append(nameJobSocial, mediaResources);

  createStructure(firstContainer, secondContainer);
  x.remove();
  linkedin.remove();
  insta.remove();
}

function createResources() {
  const listItems = document.querySelectorAll(".resources li a");
  listItems.forEach((link) => {
    const downloadImg = img({ class: "download-image" });
    downloadImg.src = `${window.hlx.codeBasePath}/icons/download.png`;
    downloadImg.alt = "download";
    link.insertBefore(downloadImg, link.firstChild);
  });
}
export default async function decorate(block) {
  const [
    profileImage,
    bioName,
    jobTitle,
    xLink,
    linkedinLink,
    instaLink,
    mediaInquiries,
    resources,
  ] = [...block.children];

  profileImage.className = "profile-image";
  bioName.className = "bio-name";
  jobTitle.className = "job-title";
  xLink.className = "x-link";
  linkedinLink.className = "linkedin-lLink";
  instaLink.className = "insta-link";
  mediaInquiries.className = "media-inquiries";
  resources.className = "resources";

  const mediaTargetDiv = document.querySelector(".media-inquiries");
  const placeholderData = await fetchLanguagePlaceholders();
  mediaTargetDiv.insertBefore(
    div({ class: "title" }, placeholderData.biodetailMediaText),
    mediaTargetDiv.firstChild
  );

  const resourcesTargetDiv = document.querySelector(".resources");
  resourcesTargetDiv.insertBefore(
    div({ class: "title" }, placeholderData.biodetailResourcesText),
    resourcesTargetDiv.firstChild
  );

  createResources();
  createPersonBio(
    bioName,
    jobTitle,
    xLink,
    linkedinLink,
    instaLink,
    profileImage,
    mediaInquiries,
    resources
  );
}
