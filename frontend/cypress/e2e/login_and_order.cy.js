describe('User flow: login, search chef, add food, place order', () => {
    beforeEach(() => {
      cy.request('POST', 'http://localhost:1800/api/test/seed');
    });
  
    afterEach(() => {
      cy.request('POST', 'http://localhost:1800/api/test/cleanup');
    });
  
    it('logs in and places an order successfully', () => {
      cy.visit('/');
  
      // 1. Click the hamburger (make sure it has a role or unique class)
    cy.get('.hamburger').click();

    // 2. Click "Sign In" from the sidebar
    cy.contains('li', 'Sign In').click();

    // 3. Fill out email and password
    cy.get('input[name="email"]').type('client@test.com');
    cy.get('input[name="password"]').type('testpassword');

    // 4. Click the "Sign In" button
    cy.get('button[type="submit"]').contains('Sign In').click();

    // 5. Assert we're logged in (adjust based on your app)
    cy.url().should('include', '/home');

    // 1. Set search category to "Name"
  cy.get('select.search-select').select('name');

  // 2. Type in the chef’s name (adjust based on test data)
  cy.get('input.search-input').type('Chef Mike');

  // 3. Click the Search button
  cy.get('button.search-button').click();

  // 4. Wait for chefs to load and click the chef card
  cy.get('.chef-card').should('contain', 'Chef Mike').click();

  // 5. Assert navigation to chef page
  cy.url().should('include', '/chef/');
  cy.contains('Chef Mike'); // or some identifying content on the chef’s page

  // 1. Click the first "Add" (+) button on a food item
cy.get('.food-card').first().within(() => {
    cy.get('button').contains('+').click();
  });
  
  // 2. Click on the 🛒 cart icon (make sure user is logged in for it to show)
  cy.get('.cart-icon').click();
  
  // 3. Wait for cart popup to show, confirm item is there
  cy.get('.cart-popup').should('be.visible');
  cy.get('.cart-item').should('have.length.greaterThan', 0);
  
  
  // 5. Click "Order" button to submit the order
  cy.get('.order-button').click();
  
  // 6. Assert success (depends on how you show success message or redirection)
  cy.contains('✅ Order placed successfully!').should('exist');  

  cy.get('.hamburger').click();

  cy.contains('li', 'Logout').click();

  cy.url().should('include', '/');


  cy.contains('Continue as Guest').should('exist');  



    });
  });
  