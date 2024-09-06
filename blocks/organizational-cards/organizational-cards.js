export default async function decorate(block) {
    console.log('loaded org cards js');
    console.log(block.children);

    const [picEl, ...cards] = block.children;
    picEl.classList.add('bg-wrapper');
    const bgImg = picEl.querySelector('picture');
    // optimize image
    [...cards].forEach((card) => {
        card.classList.add('organizational-card');
        card.children[0].classList.add('card-acronym');
        card.children[1].classList.add('card-title');
        card.children[2].classList.add('card-mission');
        card.children[3].classList.add('card-link-wrapper');
        
        console.log(`button: ${card.children[3]}`);
        const anchorEl = card.children[3].querySelector('a');
        console.log(`anchor el: ${anchorEl}`);
        anchorEl.classList.add('card-link');
        //const href = anchorEl.href;
        //const linkText = anchorEl.linkText;
        //const href = learnMoreEl.querySelector('a').href;
        //const linkText = learnMoreEl.children[1].textContent;

        // process the button
    })
}

function collapseCard() {

}

function expandCard() {

}
