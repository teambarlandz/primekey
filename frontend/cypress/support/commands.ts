/// <reference types="cypress" />

import '@testing-library/cypress/add-commands';

// Custom commands for Primekey Homes
Cypress.Commands.add('waitForPageLoad', () => {
  cy.location('pathname').should('exist');
  cy.get('body').should('be.visible');
});

Cypress.Commands.add('fillConciergeForm', (data) => {
  if (data.fullName) cy.get('#fullName').type(data.fullName);
  if (data.phone) cy.get('#phone').type(data.phone);
  if (data.email) cy.get('#email').type(data.email);
  if (data.preferredLocation) cy.get('#preferredLocation').type(data.preferredLocation);
  if (data.ndprConsent) cy.get('#ndprConsent').click({ force: true });
});

Cypress.Commands.add('fillLandlordRegistrationForm', (data) => {
  if (data.fullName) cy.get('[name="fullName"]').type(data.fullName);
  if (data.phone) cy.get('[name="phone"]').type(data.phone);
  if (data.email) cy.get('[name="email"]').type(data.email);
  if (data.idType) {
    const idTypeLabels: Record<string, string> = {
      nin: 'National ID (NIN)',
      passport: 'International Passport',
      driver_license: "Driver's License",
      voter_card: "Permanent Voter's Card",
    };
    cy.get('[aria-label="Select ID type"]').click({ force: true });
    cy.contains('[role="option"]', idTypeLabels[data.idType] || data.idType).click({ force: true });
  }
  if (data.idNumber) cy.get('[name="idNumber"]').type(data.idNumber);
  if (data.propertyCount) cy.get('[name="propertyCount"]').clear().type(String(data.propertyCount));
  if (data.ndprConsent) cy.get('#ndprConsent').click({ force: true });
});

// Mock API responses for consistent testing
Cypress.Commands.add('mockConciergeSuccess', () => {
  cy.intercept('POST', '**/crm/submit-concierge/', {
    statusCode: 201,
    body: { success: true, message: 'Concierge lead registered successfully.', data: { id: 'test-id', status: 'active_sla_queue', priority_score: 75, tier: 'high' } },
  }).as('conciergeSubmit');
});

Cypress.Commands.add('mockConciergeError', (statusCode = 400, message = 'Validation failed.') => {
  cy.intercept('POST', '**/crm/submit-concierge/', {
    statusCode,
    body: { success: false, message, errors: { phone: ['Invalid phone number'] } },
  }).as('conciergeSubmitError');
});

declare global {
  namespace Cypress {
    interface Chainable {
      waitForPageLoad(): Chainable<void>;
      fillConciergeForm(data: { fullName?: string; phone?: string; email?: string; preferredLocation?: string; ndprConsent?: boolean }): Chainable<void>;
      fillLandlordRegistrationForm(data: { fullName?: string; phone?: string; email?: string; idType?: string; idNumber?: string; propertyCount?: number; ndprConsent?: boolean }): Chainable<void>;
      mockConciergeSuccess(): Chainable<void>;
      mockConciergeError(statusCode?: number, message?: string): Chainable<void>;
    }
  }
}
