import {
    div,a
  } from '../../scripts/dom-helpers.js';

function createCard(cardData){
  let cardsContainer= document.querySelector('.cards-container');
  const [imageContainer,imageAltText,title,desc,titlelink,btn,btnLink] = [...cardData.children];  
  const imgElement = imageContainer.querySelector('img');
  imgElement.setAttribute('alt', imageAltText.textContent);
  imageContainer.className = 'card-img'; 
  title.className="title";
  desc.className="desc";
  btn.className="card-btn";

  var RPCard = div(
      { class: 'rp-card' }, imageContainer,
      div({class:"text-content"},a({ href: titlelink.textContent}, title),desc,a({ href: btnLink.textContent}, btn))
);
titlelink.remove();
btnLink.remove();
imageAltText.remove();
  if(!cardsContainer){
   cardsContainer = div({class: 'cards-container'},RPCard);    
  }
  else{
    cardsContainer.append(RPCard)
  }
  document.querySelector('.research-publications-cards').append(cardsContainer)
}

export default async function decorate(block) {
  const [title, button,link, rpFirstCard,rpSecondCard] = [...block.children];    
  title.className= 'title'
    const titleButtonWrapper = div(
        { class: 'title-button-wrapper' },
        title,
        a({ href: link.textContent ,class:"title-button"}, button)
  );
  const buttonWrapper = div(
    { class: 'button-wrapper' },
    a({ href: link.textContent ,class:"title-button"}, button.textContent)
);
  block.append(titleButtonWrapper)
  const cardsArray =[rpFirstCard,rpSecondCard];
  cardsArray.forEach((cardData)=>{
  createCard(cardData);
  })
  block.append(buttonWrapper);
  link.remove();
}
