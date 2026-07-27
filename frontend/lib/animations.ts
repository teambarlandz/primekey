// lib/animations.ts
import gsap from 'gsap';

// Standard animation tokens for consistency across components
export const ANIMATION_TOKENS = {
  duration: 0.8,
  stagger: 0.15,
  ease: 'power3.out',
  bounceEase: 'back.out(1.7)',
};

// Helper to check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Register GSAP plugins if needed in the future (e.g., ScrollTrigger)
// gsap.registerPlugin(ScrollTrigger);