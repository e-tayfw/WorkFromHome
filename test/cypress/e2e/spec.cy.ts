/// <reference types="cypress" />

describe('Login Spec', () => {
  it('logs in the user', () => {
    // Visit the local development frontend
    cy.visit('http://localhost:3000');
    
    // Fill in the username
    cy.get('input[name="username"]')
      .type('Chandra.Kong@allinone.com.sg');

    // Select the user type from the dropdown
    cy.get('select[name="userType"]')
      .select('Manager'); // Selects the option with the value 'Manager'

    // Click the submit button
    cy.get('button[type="submit"]')
      .click();
  });
});
