/**
 * FileName: forgot-password.cy.js
 * Description: End-to-end tests for the forgot password functionality in the Monarca application.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 25/02/2026 [Santiago-Coronado] Added detailed comments and documentation for clarity and maintainability.
 */

/**
 * FunctionName: Forgot Password Page, purpose of the function is to test the forgot password functionality in the Monarca application.
 * Input: None (the tests will perform actions on the application)
 * Output: Verification that the forgot password form is rendered correctly, email validation works, and appropriate alerts are shown for success and error cases.
 */
// cypress/e2e/forgot-password.cy.js
describe("Forgot Password Page", () => {
    beforeEach(() => {
      cy.visit("/register"); // Change route if you use another one (example: /forgot-password)
    });
    // Test case to verify that the forgot password form is rendered correctly with all necessary UI elements
    it("renders the forgot password form correctly", () => {
      cy.contains("¿Olvidaste tu contraseña?").should("be.visible");
      cy.contains("MONARCA").should("be.visible");
      cy.get('input[type="email"]').should("be.visible");
      cy.contains("Enviar").should("be.visible");
      cy.contains("¿Ya tienes cuenta?").should("be.visible");
      cy.contains("Inicia sesión").should("have.attr", "href", "/");
    });
    // Test case to validate that the email field is required to submit the forgot password form
    it("requires email to submit", () => {
      cy.contains("Enviar").click();
      cy.on("window:alert", (text) => {
        expect(text).to.equal("Por favor ingresa un correo válido");
      });
    });
    // Test case to validate that the email field accepts valid email formats
    it("shows success alert and redirects on successful request", () => {
      cy.intercept("POST", "/forgot-password", {
        statusCode: 200,
        body: { status: true },
      });y9
  
      cy.get('input[type="email"]').type("test@example.com");
      cy.contains("Enviar").click();
      cy.on("window:alert", (text) => {
        expect(text).to.equal("Correo de recuperación enviado");
      });
  
      // Asumiendo que redirige a login
      cy.url().should("include", "/");
    });
    // Test case to handle API response with status false
    it("shows error alert if request fails", () => {
      cy.intercept("POST", "/forgot-password", {
        statusCode: 200,
        body: { status: false },
      });
  
      cy.get('input[type="email"]').type("test@example.com");
      cy.contains("Enviar").click();
      cy.on("window:alert", (text) => {
        expect(text).to.equal("No se pudo enviar el correo");
      });
    });
    // Test case to handle API error scenario
    it("shows generic error on server failure", () => {
      cy.intercept("POST", "/forgot-password", {
        statusCode: 500,
        body: "Internal Server Error",
      });
  
      cy.get('input[type="email"]').type("test@example.com");
      cy.contains("Enviar").click();
      cy.on("window:alert", (text) => {
        expect(text).to.equal("Error del servidor");
      });
    });
  });
  
