/**
 * Production-Grade Native Hardware-Accelerated Animation Manager
 * Uses Web Animations API & CSS Compositor for 60 FPS performance.
 */

export const prefersReducedMotion = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Staggered entrance reveal for lists, grids, and cards
 */
export const staggerReveal = (targets, options = {}) => {
  if (prefersReducedMotion() || !targets || targets.length === 0) return;

  const elements = Array.from(targets);
  const duration = options.duration ? options.duration * 1000 : 300;
  const stagger = options.stagger ? options.stagger * 1000 : 40;

  elements.forEach((el, index) => {
    if (!el) return;
    el.animate(
      [
        { opacity: 0, transform: "translateY(16px)" },
        { opacity: 1, transform: "translateY(0)" }
      ],
      {
        duration: duration,
        delay: index * stagger,
        easing: "cubic-bezier(0.2, 0, 0, 1)",
        fill: "forwards"
      }
    );
  });
};

/**
 * Smooth page / section entrance transition
 */
export const animatePageEntrance = (element, options = {}) => {
  if (prefersReducedMotion() || !element) return;

  const duration = options.duration ? options.duration * 1000 : 250;
  element.animate(
    [
      { opacity: 0, transform: "translateY(12px)" },
      { opacity: 1, transform: "translateY(0)" }
    ],
    {
      duration: duration,
      easing: "cubic-bezier(0.2, 0, 0, 1)",
      fill: "forwards"
    }
  );
};

/**
 * Onboarding step transition timeline
 */
export const animateStepTransition = (element, direction = "forward") => {
  if (prefersReducedMotion() || !element) return;

  const xOffset = direction === "forward" ? 24 : -24;
  element.animate(
    [
      { opacity: 0, transform: `translateX(${xOffset}px)` },
      { opacity: 1, transform: "translateX(0)" }
    ],
    {
      duration: 220,
      easing: "cubic-bezier(0.2, 0, 0, 1)",
      fill: "forwards"
    }
  );
};

/**
 * Modal / Dialog scale-fade entrance
 */
export const animateModalEntrance = (element) => {
  if (prefersReducedMotion() || !element) return;

  element.animate(
    [
      { opacity: 0, transform: "scale(0.95) translateY(8px)" },
      { opacity: 1, transform: "scale(1) translateY(0)" }
    ],
    {
      duration: 250,
      easing: "cubic-bezier(0.2, 0, 0, 1)",
      fill: "forwards"
    }
  );
};

export const killAnimations = () => {};

/**
 * Scale + fade + rotate entrance for decorative floating elements (landing hero doodles).
 * Deliberately overshoots slightly (back-out) so elements decelerate into place.
 */
export const animateDoodleEntrance = (targets, options = {}) => {
  if (prefersReducedMotion() || !targets) return;
  const elements = Array.from(targets).filter(Boolean);
  const stagger = options.stagger ? options.stagger * 1000 : 120;
  const baseDelay = options.delay ?? 300;

  elements.forEach((el, index) => {
    el.animate(
      [
        { opacity: 0, transform: "scale(0.6) rotate(-14deg)" },
        { opacity: 1, transform: "scale(1) rotate(0deg)" }
      ],
      {
        duration: 700,
        delay: baseDelay + index * stagger,
        easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        fill: "both"
      }
    );
  });
};

/**
 * Draws an underline under a headline word by scaling it in from the left.
 */
export const animateUnderlineDraw = (el, options = {}) => {
  if (prefersReducedMotion() || !el) return;
  el.animate(
    [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
    {
      duration: 500,
      delay: options.delay ?? 500,
      easing: "cubic-bezier(0.65, 0, 0.35, 1)",
      fill: "both"
    }
  );
};

/**
 * Subtle scroll-linked parallax (10-20px range) for hero background elements.
 * Returns a cleanup function to remove the scroll listener.
 */
export const initScrollParallax = (targets, options = {}) => {
  if (prefersReducedMotion() || typeof window === "undefined" || !targets) {
    return () => {};
  }
  const elements = Array.from(targets).filter(Boolean);
  if (elements.length === 0) return () => {};

  const distance = options.distance ?? 16;
  let ticking = false;

  const update = () => {
    const progress = Math.min(window.scrollY / 600, 1);
    elements.forEach((el, index) => {
      const direction = index % 2 === 0 ? 1 : -1;
      el.style.transform = `translateY(${progress * distance * direction}px)`;
    });
    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
};

/**
 * Gentle infinite float loop for a small illustration (e.g. 404 page icon).
 */
export const animateFloatLoop = (el, options = {}) => {
  if (prefersReducedMotion() || !el) return;
  el.animate(options.keyframes || [
    { transform: "translateY(0) rotate(-3deg)" },
    { transform: "translateY(-10px) rotate(3deg)" },
    { transform: "translateY(0) rotate(-3deg)" }
  ], {
    duration: options.duration ?? 3200,
    easing: "ease-in-out",
    iterations: Infinity
  });
};

export default {
  staggerReveal,
  animatePageEntrance,
  animateStepTransition,
  animateModalEntrance,
  animateDoodleEntrance,
  animateUnderlineDraw,
  initScrollParallax,
  animateFloatLoop,
  killAnimations,
  prefersReducedMotion,
};
