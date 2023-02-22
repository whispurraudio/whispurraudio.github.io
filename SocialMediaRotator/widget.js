// This widget contains content from @lx who made the Top Events Rotator
// (https://github.com/StreamElements/widgets/blob/master/TopEventsRotator/widget.js)
// which was an inspiration for this widget.
// Thank you very much @lx for helping me developing this widget.

let socials = []
socials.push({
    name: "WhispurrAudio",
    icon: "twitter",
    showImage: "fontawesome",
    order: "iconfirst"
});
socials.push({
    name: "WhispurrAudio",
    icon: "youtube",
    showImage: "fontawesome",
    order: "iconfirst"
});

let timeline;
let slides;
let slideTime;

let next = 0;
let amount = 0;

let rotatorBehaviour;
let sleepTime;
let useIconColor;
let timeIn;
let timeDisplay;
let timeOut;
let timeInBetween;
let timeDelay;
let iterations;

document.addEventListener("DOMContentLoaded", function () {
    rotatorBehaviour = "repeat";
    iterations = 0;
    sleepTime = 10;
    useIconColor = "separate";
    animationIn = "slideInRight";
    animationOut = "slideOutLeft";
    timeIn = 0.5;
    timeDisplay = 5;
    timeOut = 0.5;
    timeInBetween = 0.5;
    timeDelay = 0.5;
    slideTime = timeIn + timeDisplay + timeOut + timeInBetween;

    init();
    startSlides();
});

function init() {
    timeline = gsap.timeline({repeat: (iterations - 1), repeatDelay: timeDelay, paused: true, onComplete: sleep});

    let slide;
    let i = 1;
    for (var social of socials) {
        const usernameOrderStyle = (social.order === "socialfirst") ? 'order: -1;' : 'order: 1;';

        slide = `<div class="slides" id="slide${i}">` +
            `${(social.showImage === "url")
                ? `<span class="slidesContent imageWrapper"><img class="image" src="${social.image}"></img></span>`
                : `<span class="slidesContent faWrapper fab fa-${social.icon}"></span>`}` +
            `<span class="slidesContent username" style="${usernameOrderStyle}">${social.name}</span>` +
            `</div>`;

        $("#container").append(slide);

        timeline.set('#slide' + i, {
            visibility: 'visible',
            classList: 'slides animateIn',
            zIndex: i
        }, (i - 1) * slideTime);
        timeline.set('#slide' + i, {classList: 'slides animateOut'}, "+=" + (timeIn + timeDisplay));
        timeline.set('#slide' + i, {visibility: 'hidden', classList: 'slides'}, "+=" + timeOut);

        i++;
    }
    amount = i;
}

function startSlides() {
    if (timeline.progress() === 1) {
        timeline.restart();
    } else {
        timeline.play();
    }
}

function sleep() {
    if (rotatorBehaviour === "sleep") {
        setTimeout(startSlides, (sleepTime * 1000));
    }
}
