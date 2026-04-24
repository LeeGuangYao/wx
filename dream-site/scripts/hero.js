(function () {
  "use strict";

  window.App = window.App || {};

  window.App.initHero = function initHero() {
    if (typeof gsap === "undefined") return;

    var chars = gsap.utils.toArray(".hero-char");
    if (!chars.length) return;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Initial state
    gsap.set(chars, {
      opacity: 0,
      y: 50,
      filter: "blur(14px)"
    });

    // Stagger entrance
    var entrance = gsap.to(chars, {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 0.95,
      ease: "power3.out",
      stagger: 0.11,
      delay: 0.3
    });

    if (reduced) return;

    // After entrance completes, add a gentle floating loop per char.
    entrance.eventCallback("onComplete", function () {
      chars.forEach(function (ch, i) {
        var floatY = 3 + Math.random() * 4;         // 3–7 px
        var floatDur = 3.2 + Math.random() * 1.6;   // 3.2–4.8s
        var opAmp = 0.1 + Math.random() * 0.1;      // 0.1–0.2 amplitude
        var opDur = 2.8 + Math.random() * 1.4;

        gsap.to(ch, {
          y: -floatY,
          duration: floatDur,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: i * 0.08
        });

        gsap.to(ch, {
          opacity: 1 - opAmp,
          duration: opDur,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: i * 0.07
        });
      });
    });
  };
})();
