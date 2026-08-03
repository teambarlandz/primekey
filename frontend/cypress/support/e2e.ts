/// <reference types="cypress" />

import './commands';

beforeEach(() => {
  cy.viewport(1280, 720);
});

// Force prefers-reduced-motion on every page load so GSAP entrance
// animations resolve instantly, keeping animated (opacity-0) elements
// visible and actionable for Cypress assertions and clicks.
Cypress.on('window:before:load', (win) => {
  const originalMatchMedia = win.matchMedia.bind(win);
  win.matchMedia = (query: string) => {
    const mq = originalMatchMedia(query);
    if (query.includes('prefers-reduced-motion')) {
      return {
        ...mq,
        matches: true,
      } as MediaQueryList;
    }
    return mq;
  };
});
