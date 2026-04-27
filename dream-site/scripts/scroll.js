(function () {
  "use strict";

  window.App = window.App || {};

  window.App.initScroll = function initScroll() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    // --- Nav scroll state
    var nav = document.getElementById("nav");
    if (nav) {
      ScrollTrigger.create({
        start: "top -40",
        end: 99999,
        onUpdate: function (self) {
          if (self.scroll() > 40) nav.classList.add("is-scrolled");
          else nav.classList.remove("is-scrolled");
        }
      });
    }

    // --- Why tiles
    gsap.utils.toArray(".why-tile").forEach(function (item, i) {
      gsap.to(item, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        delay: i * 0.12,
        scrollTrigger: {
          trigger: ".why-tiles",
          start: "top 82%",
          toggleActions: "play none none none"
        }
      });
    });

    // --- Why equation + lead reveal
    gsap.from(".why-equation, .why-lead", {
      opacity: 0,
      y: 24,
      filter: "blur(10px)",
      duration: 1,
      ease: "power3.out",
      stagger: 0.18,
      scrollTrigger: {
        trigger: ".why-equation",
        start: "top 80%",
        toggleActions: "play none none none"
      }
    });

    // --- Reality cards
    gsap.utils.toArray(".reality-card").forEach(function (card, i) {
      gsap.to(card, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        delay: i * 0.12,
        scrollTrigger: {
          trigger: ".reality-grid",
          start: "top 78%",
          toggleActions: "play none none none"
        }
      });
    });

    // --- Section heads universal fade-in
    gsap.utils.toArray(".section__head").forEach(function (head) {
      gsap.from(head, {
        opacity: 0,
        y: 24,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: head,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      });
    });

    // --- Ending lines
    gsap.utils.toArray(".ending__title span").forEach(function (span, i) {
      gsap.from(span, {
        opacity: 0,
        y: 30,
        filter: "blur(12px)",
        duration: 1,
        ease: "power3.out",
        delay: i * 0.18,
        scrollTrigger: {
          trigger: ".section--ending",
          start: "top 70%",
          toggleActions: "play none none none"
        }
      });
    });

    gsap.from(".ending__kicker, .ending__sub", {
      opacity: 0,
      y: 12,
      duration: 0.8,
      ease: "power2.out",
      stagger: 0.15,
      scrollTrigger: {
        trigger: ".section--ending",
        start: "top 75%",
        toggleActions: "play none none none"
      }
    });

    // --- Active nav highlight
    var navLinks = document.querySelectorAll(".nav__links a[data-nav]");
    navLinks.forEach(function (link) {
      var href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      var target = document.querySelector(href);
      if (!target) return;

      ScrollTrigger.create({
        trigger: target,
        start: "top 50%",
        end: "bottom 50%",
        onToggle: function (self) {
          if (self.isActive) {
            navLinks.forEach(function (l) { l.classList.remove("is-active"); });
            link.classList.add("is-active");
          }
        }
      });
    });
  };
})();
