let reveal = document.querySelectorAll(".reveal");

reveal.forEach((el) => {
  let headings = el.querySelectorAll("div, p, span, img, button");
  let btn = el.querySelector(".btn");

  let tl = gsap
    .timeline()
    .from(headings, {
      y: 80,
      stagger: 0.05,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
    })
    .from(btn, { y: 80, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.6");

  ScrollTrigger.create({
    trigger: el,
    start: "center 100%",
    end: "top 50%",
    markers: false,
    toggleActions: "play none none reverse ",
    animation: tl,
  });
});

gsap.registerPlugin(ScrollTrigger);

const images = document.querySelectorAll(".image-container img");

images.forEach((image) => {
  gsap.to(image, {
    opacity: 1,
    scrollTrigger: {
      trigger: image,
      start: "top center", // When the top of the image hits the center of the viewport
      end: "bottom center", // When the bottom of the image hits the center of the viewport
      scrub: true, // Smoothly animate opacity during scroll
    },
  });
});

const elements = document.querySelectorAll(".idle-animation");

// Loop through each element and create animations
elements.forEach((element, index) => {
  gsap.fromTo(
    element,
    { opacity: 0, y: -20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      delay: 0.5 + index * 0.3, // Delay each element by 0.5 seconds
      scrollTrigger: {
        trigger: element,
      },
    }
  );
});
