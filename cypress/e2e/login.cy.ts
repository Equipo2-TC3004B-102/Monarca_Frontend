/**
 * FileName: login.cy.ts
 * Description: End-to-end tests for the login functionality of the Monarca application, covering various scenarios such as successful login, validation of required fields, error handling for failed login attempts, and navigation to the forgot password page.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 25/02/2026 [Santiago-Coronado] Added detailed comments and documentation for clarity and maintainability.
 */

/**
 * FunctionName: Login Page, purpose of the function is to test the login functionality of the Monarca application.
 * Input: None (the tests will perform actions on the application)
 * Output: Verification of the expected outcomes for each login scenario, such as successful login, validation of required fields, error handling for failed login attempts, and navigation to the forgot password page.
 */
describe("Login Page", () => {
  beforeEach(() => {
    // Visit the login page before each test
    cy.visit("/");
  });
  // Test case to verify that the login form is displayed correctly with all necessary UI elements
  it("displays the login form correctly", () => {
    // Check main UI elements are present
    cy.contains("INICIO DE SESIÓN").should("be.visible");
    cy.contains("M").should("be.visible");
    cy.contains("ONARCA").should("be.visible");
    cy.get('input[name="email"]').should("be.visible");
    cy.get('input[name="password"]').should("be.visible");
    cy.contains("¿Olvidaste tu contraseña?").should("be.visible");
    cy.contains("Continuar").should("be.visible");
  });
  // Test case to validate that both email and password fields are required for login
  it("requires both email and password fields", () => {
    // Try to submit with empty fields - should show alert
    cy.contains("Continuar").click();
    cy.on("window:alert", (text) => {
      expect(text).to.equal("El Usuario y la Contraseña son obligatorios");
    });

    // Try with only email
    cy.get('input[name="email"]').type("test@example.com");
    cy.contains("Continuar").click();
    cy.on("window:alert", (text) => {
      expect(text).to.equal("El Usuario y la Contraseña son obligatorios");
    });

    // Try with only password
    cy.get('input[name="email"]').clear();
    cy.get('input[name="password"]').type("password123");
    cy.contains("Continuar").click();
    cy.on("window:alert", (text) => {
      expect(text).to.equal("El Usuario y la Contraseña son obligatorios");
    });
  });

  // it("navigates to dashboard on successful login", () => {
  //   // Intercept API request
  //   cy.intercept("POST", "/login", {
  //     statusCode: 200,
  //     body: { status: true },
  //   });

  //   // Fill in login form
  //   cy.get('input[name="email"]').type("test@example.com");
  //   cy.get('input[name="password"]').type("password123");

  //   // Submit form
  //   cy.contains("Continuar").click();

  //   // Should navigate to dashboard
  //   cy.url().should("include", "/dashboard");
  // });
  // Test case to handle login failure scenario
  it("shows error alert on login failure", () => {
    // Intercept API request with failure
    cy.intercept("POST", "/login", {
      statusCode: 200,
      body: { status: false },
    });

    // Fill in login form
    cy.get('input[name="email"]').type("test@example.com");
    cy.get('input[name="password"]').type("password123");

    // Submit form and check for alert
    cy.contains("Continuar").click();
    cy.on("window:alert", (text) => {
      expect(text).to.equal("Error al iniciar sesion");
    });
  });
  // Test case to handle API error scenario
  it("shows error alert on API error", () => {
    // Intercept API request with failure
    cy.intercept("POST", "/login", {
      statusCode: 500,
      body: "Server error",
    });

    // Fill in login form
    cy.get('input[name="email"]').type("test@example.com");
    cy.get('input[name="password"]').type("password123");

    // Submit form and check for alert
    cy.contains("Continuar").click();
    cy.on("window:alert", (text) => {
      expect(text).to.equal("Error");
    });
  });
  // Test case to navigate to the forgot password page
  it("can navigate to forgot password page", () => {
    cy.contains("¿Olvidaste tu contraseña?").click();
    cy.url().should("include", "/register");
  });
});
