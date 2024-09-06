export default async function decorate(block) {
    console.log('loaded org cards js');
    console.log(block.children);

    const [picEl, ...cards] = block.children;
    const bgImg = picEl.querySelector('picture');
    // optimize image
    [...cards].forEach((card) => {
        card.classList.add('organizational-card');
        card.children[0].classList.add('card-acronym');
        card.children[1].classList.add('card-title');
        card.children[2].classList.add('card-mission');
        
        //const learnMoreEl = card.children[3];
        //const href = learnMoreEl.querySelector('a').href;
        //const linkText = learnMoreEl.children[1].textContent;

        // process the button
    })
}