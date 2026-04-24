(function () {
  "use strict";

  var App = window.App || {};

  function initCursor() {
    var cursor = document.querySelector(".cursor");
    if (!cursor) return;
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

    var x = window.innerWidth / 2;
    var y = window.innerHeight / 2;
    var tx = x;
    var ty = y;

    document.addEventListener("mousemove", function (e) {
      x = e.clientX;
      y = e.clientY;
    });

    document.addEventListener("mousedown", function () { cursor.classList.add("is-down"); });
    document.addEventListener("mouseup", function () { cursor.classList.remove("is-down"); });

    // Hover-trigger elements
    var hoverTargets = "a, button, [data-card], [data-step], .method__step, .reality-card";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest && e.target.closest(hoverTargets)) {
        cursor.classList.add("is-hover");
      }
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest && e.target.closest(hoverTargets)) {
        cursor.classList.remove("is-hover");
      }
    });

    function tick() {
      tx += (x - tx) * 0.22;
      ty += (y - ty) * 0.22;
      cursor.style.transform = "translate3d(" + tx + "px, " + ty + "px, 0)";
      requestAnimationFrame(tick);
    }
    tick();
  }

  function initMethodTabs() {
    var steps = document.querySelectorAll(".method__step");
    var panels = document.querySelectorAll(".method__panel");
    if (!steps.length || !panels.length) return;

    function activate(n) {
      steps.forEach(function (s) {
        var active = s.dataset.step === String(n);
        s.classList.toggle("is-active", active);
        s.setAttribute("aria-selected", active ? "true" : "false");
      });
      panels.forEach(function (p) {
        p.classList.toggle("is-active", p.dataset.panel === String(n));
      });
    }

    steps.forEach(function (s) {
      s.addEventListener("mouseenter", function () { activate(s.dataset.step); });
      s.addEventListener("click", function () { activate(s.dataset.step); });
      s.addEventListener("focus", function () { activate(s.dataset.step); });
      s.setAttribute("tabindex", "0");
    });
  }

  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        var href = link.getAttribute("href");
        if (!href || href === "#") return;
        var target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function boot() {
    initCursor();
    initMethodTabs();
    initSmoothAnchors();

    if (App.initScroll) App.initScroll();
    if (App.initHero) App.initHero();
    if (App.initTimeline) App.initTimeline();
    if (App.initParticles) App.initParticles();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
