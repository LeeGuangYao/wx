(function () {
  "use strict";

  window.App = window.App || {};

  window.App.initParticles = async function initParticles() {
    var el = document.getElementById("particles");
    if (!el) return;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // tsParticles slim bundle auto-registers itself. Wait for it if needed.
    var tries = 0;
    while (typeof tsParticles === "undefined" && tries < 40) {
      await new Promise(function (r) { setTimeout(r, 50); });
      tries++;
    }
    if (typeof tsParticles === "undefined") return;

    try {
      await tsParticles.load({
        id: "particles",
        options: {
          fullScreen: { enable: false },
          background: { color: "transparent" },
          fpsLimit: 60,
          detectRetina: true,
          particles: {
            number: {
              value: reduced ? 40 : 110,
              density: { enable: true, area: 900 }
            },
            color: {
              value: ["#7c5cff", "#00e5ff", "#3b82ff", "#ffffff"]
            },
            shape: { type: "circle" },
            opacity: {
              value: { min: 0.1, max: 0.55 },
              animation: {
                enable: true,
                speed: 0.5,
                sync: false,
                startValue: "random"
              }
            },
            size: {
              value: { min: 0.4, max: 1.8 }
            },
            move: {
              enable: !reduced,
              speed: 0.28,
              direction: "none",
              random: true,
              straight: false,
              outModes: { default: "out" }
            },
            links: { enable: false }
          },
          interactivity: {
            events: {
              onHover: { enable: !reduced, mode: "bubble" },
              resize: true
            },
            modes: {
              bubble: {
                distance: 120,
                size: 2.4,
                duration: 2,
                opacity: 0.8
              }
            }
          }
        }
      });
    } catch (err) {
      console.warn("tsParticles failed:", err);
    }
  };
})();
