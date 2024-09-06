export default async function decorate(block) {
    console.log('loaded org cards js');
    //const backgroundImg = block.querySelector('picture');
    console.log(block.children);
    /*
    [...block.children].forEach((row) => {
        const picEl = row.querySelector('picture');
        if (picEl) {
            // optimize image
        } else {
            row.classList.add('organizational-card');
            // reorganize link
        }
    })
    */
    const [picEl, ...cards] = block.children;
    const bgImg = picEl.querySelector('picture');
    // optimize image
    [...cards].forEach((card) => {
        card.classList.add('organizational-card');
        card.children[0].classList.add('card-acronym');
        card.children[1].classList.add('card-title');
        card.children[2].classList.add('card-mission');
        
        const learnMore = card.children[3];
    })
}