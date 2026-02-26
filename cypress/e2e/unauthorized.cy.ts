/**
 * FileName: unauthorized.cy.ts
 * Description: End-to-end tests for the unauthorized page in the Monarca application, covering the flow of visiting the unauthorized page and verifying that all expected elements are displayed correctly.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 25/02/2026 [Santiago-Coronado] Added detailed comments and documentation for clarity and maintainability.
 */

/**
 * FunctionName: Unauthorized Page E2E, purpose of the function is to test the unauthorized page in the Monarca application.
 * Input: None (the tests will perform actions on the application)
 * Output: Verification that the unauthorized page is displayed correctly with all expected elements.
 */
describe('Unauthorized Page E2E', () => {
  // Before each test, visit the unauthorized page to ensure we are on the correct page for testing
  beforeEach(() => {
    cy.visit('/unauthorized');
  });
  // Test case to verify that the title and messages on the unauthorized page are displayed correctly
  it('muestra el título y mensajes correctos', () => {
    cy.get('h1').should('contain.text', 'Acceso no autorizado');
    cy.contains("No tienes permiso para acceder a esta página.").should('be.visible');
    cy.contains('Contacta a un administrador si crees que esto es un error.').should('be.visible');
  });
  // Test case to verify that the links on the unauthorized page are present and have the correct href attributes
  it('tiene dos enlaces con los href correctos', () => {
    cy.get('a').should('have.length', 2);
    cy.contains('Ir al Panel')
      .should('have.attr', 'href', '/dashboard');
    cy.contains('Ir a la Página de Iniciar Sesión')
      .should('have.attr', 'href', '/');
  });
});
