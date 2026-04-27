(function () {
  "use strict";

  window.App = window.App || {};

  window.App.initTimeline = function initTimeline() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    var curve = document.getElementById("timelineCurve");
    var area = document.getElementById("timelineArea");
    var nodes = gsap.utils.toArray(".timeline__node");
    var labels = gsap.utils.toArray(".timeline__label");
    var root = document.getElementById("timeline");
    if (!curve || !root) return;

    var length = curve.getTotalLength();
    curve.style.strokeDasharray = length + " " + length;
    curve.style.strokeDashoffset = length;

    // Initial state for the filled area
    gsap.set(area, { opacity: 0 });

    // Scrub the curve drawing while the timeline section is in view
    gsap.to(curve, {
      strokeDashoffset: 0,
      ease: "none",
      scrollTrigger: {
        trigger: root,
        start: "top 80%",
        end: "bottom 30%",
        scrub: 0.8
      }
    });

    gsap.to(area, {
      opacity: 1,
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: root,
        start: "top 70%",
        end: "bottom 40%",
        scrub: true
      }
    });

    // Activate nodes + labels at staggered thresholds
    var thresholds = [0.15, 0.5, 0.88];

    nodes.forEach(function (node, i) {
      gsap.fromTo(
        node,
        { opacity: 0, scale: 0.4 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: "back.out(1.6)",
          scrollTrigger: {
            trigger: root,
            start: "top " + (80 - i * 8) + "%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    labels.forEach(function (label, i) {
      ScrollTrigger.create({
        trigger: root,
        start: "top " + (72 - i * 10) + "%",
        onEnter: function () { label.classList.add("is-visible"); },
        onLeaveBack: function () { label.classList.remove("is-visible"); }
      });
    });
  };
})();
