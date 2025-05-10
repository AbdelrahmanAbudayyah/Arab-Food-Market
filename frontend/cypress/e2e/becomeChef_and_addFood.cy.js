describe('User flow: signUp, add food,edit food ,log out', () => {
     beforeEach(() => {
       cy.request('POST', 'http://localhost:1800/api/test/seed');
     });
  
    afterEach(() => {
      cy.request('POST', 'http://localhost:1800/api/test/cleanup');
    });
  
    it('chef sign up and add food to his menu successfully', () => {
      cy.visit('/');
  
      // 1. Click the hamburger (make sure it has a role or unique class)
    cy.get('.hamburger').click();

    // 2. Click "Sign In" from the sidebar
    cy.contains('li', 'Become a Chef').click();

    // 3. Fill out email and password ...
    cy.get('input[name="email"]').type('chef11@test.com');
    cy.get('input[name="password"]').type('testpassword');
    cy.get('input[name=name]').type('chef abood');
    cy.get('input[name=state]').type('wa');
    cy.get('input[name=city]').type('renton');
    cy.get('input[name=bio]').type('jordanian chef');

    // 4. Click the "become a chef" button
    cy.get('button[type="submit"]').contains('Become a chef').click();

    // 5. Assert we're logged in (adjust based on your app)
    cy.url().should('include', '/home');

   cy.contains('chef abood'); // or some identifying content on the chef’s page
   cy.contains('jordanian chef');

   cy.get('.edit-button').contains('Edit Mode').click();

   cy.get('button').contains('Add Food Item').click();

   // 3. Fill out food information ...
   cy.get('input[name=name]').type('shawerma');
   cy.get('input[name=description]').type('chiken shawerma with pickels');
   cy.get('input[name=price]').type(10);

   cy.get('button[type="submit"]').contains('Add Item').click();

   cy.get('.food-card').first().within(() => {
    cy.contains('shawerma').should('exist');  
  });
  
  cy.get('.hamburger').click();

  cy.contains('li', 'Logout').click();

  cy.url().should('include', '/');

  cy.contains('Continue as Guest').should('exist');  



    });
  });
  