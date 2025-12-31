// JAVASCRIPT LOGIC & ANIMATION

// GSAP Animations
window.addEventListener('load', () => {

    // ScrollTrigger for Cards
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray(".col-card").forEach(card => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 90%",
            },
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        });
    });
});
