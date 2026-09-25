describe('Primekey Homes - Critical User Paths', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForPageLoad();
  });

  describe('Landing Page', () => {
    it('loads successfully with hero section', () => {
      cy.contains('h1', 'Find your next home').should('be.visible');
      cy.contains('a', 'Browse properties').should('be.visible');
    });

    it('navigates to search page', () => {
      cy.contains('a', 'Browse properties').click();
      cy.url().should('include', '/search');
      cy.contains('h1', 'Discover Premium Properties').should('be.visible');
    });
  });

  describe('Search Page', () => {
    beforeEach(() => {
      cy.visit('/search');
      cy.waitForPageLoad();
    });

    it('displays search hero and filter panel', () => {
      cy.contains('h1', 'Discover Premium Properties').should('be.visible');
      cy.contains('button', 'Apply Filters').should('be.visible');
    });

    it('filters properties by location', () => {
      cy.get('[data-testid="location-filter"]').should('be.visible').type('Lekki');
      cy.contains('button', 'Apply Filters').click();
      cy.contains('Available Properties').should('be.visible');
    });

    it('opens concierge modal when no results', () => {
      // Type a location that won't match any listing
      cy.get('[data-testid="location-filter"]').should('be.visible').clear().type('NonExistentLocation123');
      cy.contains('button', 'Apply Filters').click();
      // Should show empty state with concierge CTA
      cy.contains('No instant public listings').should('be.visible');
      cy.contains('button', 'Request Concierge Match').click();
      cy.contains("We'll Find Your Property").should('be.visible');
    });
  });

  describe('Concierge Modal Flow', () => {
    beforeEach(() => {
      cy.visit('/search');
      cy.waitForPageLoad();
      // Force empty results to open concierge
      cy.get('[data-testid="location-filter"]').should('be.visible').clear().type('NonExistentLocation123');
      cy.contains('button', 'Apply Filters').click();
      cy.contains('button', 'Request Concierge Match').click();
      cy.contains("We'll Find Your Property").should('be.visible');
    });

    it('shows validation errors for empty required fields', () => {
      cy.contains('button', 'Activate Concierge Sourcing').click();
      cy.contains('Full name must be at least 2 characters').should('be.visible');
      cy.contains('Please enter a valid Nigerian phone number').should('be.visible');
      cy.contains('You must accept the NDPR privacy policy').should('be.visible');
    });

    it('submits valid concierge request', () => {
      cy.mockConciergeSuccess();
      cy.fillConciergeForm({
        fullName: 'John Doe',
        phone: '08012345678',
        email: 'john@example.com',
        preferredLocation: 'Lekki Phase 1',
        ndprConsent: true,
      });
      cy.contains('button', 'Activate Concierge Sourcing').click();
      cy.wait('@conciergeSubmit');
      cy.contains('Concierge Activated!').should('be.visible');
    });

    it('shows error for invalid phone', () => {
      cy.fillConciergeForm({
        fullName: 'John Doe',
        phone: '123',
        email: 'john@example.com',
        preferredLocation: 'Lekki Phase 1',
        ndprConsent: true,
      });
      cy.contains('button', 'Activate Concierge Sourcing').click();
      cy.contains('valid Nigerian phone number').should('be.visible');
    });
  });

  describe('Landlord Landing Page', () => {
    beforeEach(() => {
      cy.visit('/landlord');
      cy.waitForPageLoad();
    });

    it('loads with hero and value props', () => {
      cy.contains('h1', 'List your property').should('be.visible');
      cy.contains('Zero brokerage').should('be.visible');
    });

    it('navigates to registration form', () => {
      cy.contains('a', 'List your property free').first().click();
      cy.url().should('include', '/landlord/register');
      cy.contains('h1', 'Landlord Registration').should('be.visible');
    });
  });

  describe('Landlord Registration Flow', () => {
    beforeEach(() => {
      cy.visit('/landlord/register');
      cy.waitForPageLoad();
    });

    it('shows validation errors for empty required fields', () => {
      cy.contains('button', 'Submit Registration').click();
      cy.contains('Full name must be at least 2 characters').should('be.visible');
      cy.contains('Please enter a valid Nigerian phone number').should('be.visible');
      cy.contains('You must accept the NDPR privacy policy').should('be.visible');
    });

    it('submits valid landlord registration', () => {
      cy.intercept('POST', '**/landlords/register/', {
        statusCode: 201,
        body: { success: true, message: 'Registration submitted for verification.', data: { id: 'landlord-1', verification_status: 'pending' } },
      }).as('landlordRegister');

      cy.fillLandlordRegistrationForm({
        fullName: 'Test Landlord',
        phone: '08012345678',
        email: 'landlord@test.com',
        idType: 'nin',
        idNumber: '12345678901',
        propertyCount: 1,
        ndprConsent: true,
      });
      cy.contains('button', 'Submit Registration').click();
      cy.wait('@landlordRegister');
      cy.url().should('include', '/landlord/intake');
    });

    it('rejects registration without consent', () => {
      cy.fillLandlordRegistrationForm({
        fullName: 'Test Landlord',
        phone: '08012345678',
        email: 'landlord@test.com',
        idType: 'nin',
        idNumber: '12345678901',
        propertyCount: 1,
        ndprConsent: false,
      });
      cy.contains('button', 'Submit Registration').click();
      cy.contains('You must accept the NDPR privacy policy').should('be.visible');
    });
  });
});

export {};
