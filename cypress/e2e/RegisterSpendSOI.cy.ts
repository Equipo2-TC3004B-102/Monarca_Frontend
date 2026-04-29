/**
 * FileName: RegisterSpendSOI.cy.ts
 * Description: End-to-end tests for the spend registration functionality for SOI (Supervisor of Internal Operations) in the Monarca application, covering the flow of logging in as an SOI, navigating to the spend registration page, viewing travel details, and marking a spend request as registered.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 25/02/2026 [Santiago-Coronado] Added detailed comments and documentation for clarity and maintainability.
 */

/**
 * FunctionName: Register Spend as SOI, purpose of the function is to test the spend registration functionality for SOI (Supervisor of Internal Operations) in the Monarca application.
 * Input: None (the tests will perform actions on the application)
 * Output: Verification that the spend registration process works correctly for SOI users.
 */
// This test assumes that you have at least one travel request in the history for the SOI user.
describe("Register Spend as SOI", () => {
    // Before all tests, log in as an SOI to ensure we have the necessary permissions to access the spend registration functionality
    before("Login as SOI", () => {
    cy.visit("/");
    cy.get('input[name="email"]').type("soi1@monarca.com");
    cy.get('input[name="password"]').type("password");
    cy.contains("Continuar").click();
    cy.url().should("include", "/dashboard");
    });
    // Test case to navigate to the spend registration page, view travel details, and mark a spend request as registered
    it("Register a new spend", () => {
        cy.get('a[data-cy="mosaic-viajes-por-registrar"]').should("be.visible");
        cy.get('a[data-cy="mosaic-viajes-por-registrar"]').click();
        cy.url().should("include", "/history");
        cy.contains("Historial de viajes").should("be.visible");
        cy.get('button[id="details-0"]').should("be.visible");
        cy.get('button[id="details-0"]').click();
        cy.get('input[id="id"]').should("be.visible");
        cy.get('input[id="admin"]').should("be.visible");
        cy.get('input[id="id_origin_city"]').should("be.visible");
        cy.get('input[id="destinations"]').should("be.visible");
        cy.get('input[id="motive"]').should("be.visible");
        cy.get('input[id="advance_money_str"]').should("be.visible");
        cy.get('input[id="formatted_status"]').should("be.visible");
        cy.get('input[id="requirements"]').should("be.visible");
        cy.get('input[id="priority"]').should("be.visible");
        cy.get('input[id="createdAt"]').should("be.visible");
        cy.get('input[id="destination-0"]').should("be.visible");
        cy.get('input[id="departure-0"]').should("be.visible");
        cy.get('input[id="arrival-0"]').should("be.visible");
        cy.get('input[id="details-0"]').should("be.visible");
        cy.get('p[id="hotel-0"]').should("be.visible");
        cy.get('p[id="plane-0"]').should("be.visible");
        cy.get('p[id="stay-days-0"]').should("be.visible");
        cy.get('button[id="register-spend"]').should("be.visible");
        cy.get('button[id="register-spend"]').click();
        cy.contains('Solicitud marcada como registrada').should('be.visible');
    });
});