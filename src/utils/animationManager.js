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

export default {
  staggerReveal,
  animatePageEntrance,
  animateStepTransition,
  animateModalEntrance,
  killAnimations,
  prefersReducedMotion,
};
