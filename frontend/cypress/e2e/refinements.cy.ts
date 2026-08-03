describe('Primekey Homes - Refinement Features', () => {
  describe('Agent Login & Auth Gate', () => {
    beforeEach(() => {
      cy.visit('/dashboard/agent/login');
      cy.waitForPageLoad();
    });

    it('loads the agent login page', () => {
      cy.contains('Agent Sign In').should('be.visible');
    });

    it('validates phone number format', () => {
      cy.get('input[placeholder*="08012345678"]').type('123');
      cy.contains('button', 'Send Verification Code').click();
      cy.contains(/valid Nigerian phone number/i).should('be.visible');
    });

    it('shows OTP step after valid phone', () => {
      cy.intercept('POST', '**/auth/otp/send/', {
        statusCode: 200,
        body: { success: true, message: 'OTP sent', data: { dev_code: '123456' } },
      }).as('otpSend');

      cy.get('input[placeholder*="08012345678"]').type('08050000000');
      cy.contains('button', 'Send Verification Code').click();
      cy.wait('@otpSend');
      cy.contains(/We sent a 6-digit code to/i).should('be.visible');
    });
  });

  describe('Agent Dashboard Auth Gate', () => {
    it('redirects to login when not authenticated', () => {
      cy.visit('/dashboard/agent');
      cy.waitForPageLoad();
      cy.url().should('include', '/dashboard/agent/login');
    });
  });

  describe('Buyer Inquiry Form', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/properties/properties/demo-listing/', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            id: 'demo-listing',
            title: 'Demo Luxury Listing',
            description: 'A beautiful fully detached duplex in a serene neighborhood.',
            property_type: 'fully_detached_duplex',
            property_type_display: 'Fully Detached Duplex',
            price: '350000000.00',
            currency: 'NGN',
            is_negotiable: true,
            address: '12 Admiralty Way',
            city: 'Lagos',
            state: 'Lagos',
            area: 'Lekki Phase 1',
            bedrooms: 5,
            bathrooms: 6,
            toilets: 6,
            is_serviced: false,
            is_furnished: true,
            status: 'available',
            status_display: 'Available',
            is_featured: true,
            images: [
              { id: 'img-1', image_url: '/assets/hero-primekey-homes.jpg', caption: null, is_primary: true },
            ],
            created_at: '2025-01-01T00:00:00Z',
            updated_at: '2025-01-01T00:00:00Z',
          },
        },
      }).as('propertyDetail');

      cy.visit('/property/demo-listing');
      cy.waitForPageLoad();
    });

    it('shows validation errors for empty required fields', () => {
      cy.contains('button', 'Send inquiry').click();
      // Native HTML required validation prevents submission of an empty form
      cy.get('#inq-name').should('exist');
      cy.contains('Make an inquiry').should('be.visible');
    });

    it('submits a valid inquiry', () => {
      cy.intercept('POST', '**/properties/properties/*/inquiries/', {
        statusCode: 201,
        body: {
          success: true,
          message: 'Inquiry submitted successfully.',
          data: { id: 'inq-1', status: 'active_sla_queue', priority_score: 70, tier: 'HOT', property_title: 'Demo Listing' },
        },
      }).as('inquirySubmit');

      cy.get('#inq-name').type('Jane Doe');
      cy.get('#inq-phone').type('08123456789');
      cy.get('#inq-email').type('jane@example.com');
      cy.get('#inq-message').type("I'm interested in viewing this property");
      cy.get('#inq-name').parents('form').find('input[type="checkbox"]').check();
      cy.get('button[type="submit"]').contains('Send inquiry').click();
      cy.wait('@inquirySubmit');
      cy.contains('Inquiry sent!').should('be.visible');
    });

    it('shows server error message on failed submission', () => {
      cy.intercept('POST', '**/properties/properties/*/inquiries/', {
        statusCode: 400,
        body: { success: false, message: 'Validation failed.', errors: { phone: ['Please enter a valid Nigerian phone number.'] } },
      }).as('inquiryError');

      cy.get('#inq-name').type('Jane Doe');
      cy.get('#inq-phone').type('123');
      cy.get('#inq-message').type("I'm interested in viewing this property");
      cy.get('#inq-name').parents('form').find('input[type="checkbox"]').check();
      cy.get('button[type="submit"]').contains('Send inquiry').click();
      cy.wait('@inquiryError');
      cy.contains('Validation failed.').should('be.visible');
    });
  });
});

export {};
