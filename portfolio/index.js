let reveal = document.querySelectorAll(".reveal");

reveal.forEach((el) => {
  let headings = el.querySelectorAll("div, p, span, img");
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
