/*
 * FootballPlatform
 * 3D INTRO EXPERIENCE
 */

document.addEventListener("DOMContentLoaded", () => {

    const intro = document.getElementById("football3DIntro");

    if (!intro) return;

    const content =
        intro.querySelector(".intro-content");

    const ball =
        intro.querySelector(".intro-ball");

    /* Effet parallaxe */
    intro.addEventListener("mousemove", event => {

        const rect = intro.getBoundingClientRect();

        const x =
            (event.clientX - rect.left) / rect.width - 0.5;

        const y =
            (event.clientY - rect.top) / rect.height - 0.5;

        if (content) {
            content.style.transform =
                `translate3d(${x * 12}px, ${y * 12}px, 0)`;
        }

        if (ball) {
            ball.style.transform =
                `translate3d(${x * -30}px, ${y * -30}px, 40px)`;
        }

    });

    intro.addEventListener("mouseleave", () => {

        if (content) {
            content.style.transform =
                "translate3d(0,0,0)";
        }

        if (ball) {
            ball.style.transform =
                "translate3d(0,0,0)";
        }

    });

    /* Animation d'entrée */
    requestAnimationFrame(() => {
        intro.classList.add("intro-ready");
    });

});
