/**
 * FileName: TravelHistory.cy.ts
 * Description: End-to-end tests for the travel history functionality in the Monarca application, covering the flow of logging in as a requester, navigating to the travel history page, viewing travel details, and verifying that all relevant information is displayed correctly.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 25/02/2026 [Santiago-Coronado] Added detailed comments and documentation for clarity and maintainability.
 */

/**
 * FunctionName: Travel History as Requester, purpose of the function is to test the travel history functionality for a requester user in the Monarca application.
 * Input: None (the tests will perform actions on the application)
 * Output: Verification that the travel history page is displayed correctly and all relevant information is visible.
 */
// This test assumes that you have at least one travel request in the history for the requester user.
describe("Travel History as Requester", () => {
    // Before all tests, log in as a requester to ensure we have the necessary permissions to access the travel history functionality
    before("Login as a requester", () => {
        cy.visit("/");
        cy.get('input[name="email"]').type("requester1@monarca.com");
        cy.get('input[name="password"]').type("password");
        cy.contains("Continuar").click();
        cy.url().should("include", "/dashboard");
    });
    // Test case to navigate to the travel history page, view travel details, and verify that all relevant information is displayed correctly
    it("View travel history", () => {
        cy.get('a[data-cy="mosaic-historial-de-viajes"]').should("be.visible");
        cy.get('a[data-cy="mosaic-historial-de-viajes"]').click();
        cy.url().should("include", "/history");
        cy.contains("Historial de viajes").should("be.visible");
        cy.get('button[id="details-0"]').should("be.visible");
        cy.get('button[id="details-0"]').click();
        cy.url().should("include", "/requests/581c998a-9f67-4431-b6ab-635ec9794ba7");
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
        cy.get('input[id="revision-comment-0"]').should("be.visible");
        cy.get('p[id="class-file-0"]').should("be.visible");
        cy.get('p[id="amount-file-0"]').should("be.visible");
        cy.get('p[id="date-file-0"]').should("be.visible");
        cy.get('p[id="status-file-0"]').should("be.visible");
        cy.get('a[id="download-file-xml-0"]').should("be.visible");
        cy.get('a[id="download-file-pdf-0"]').should("be.visible");
        cy.get('input[id="total_vouchers"]').should("be.visible");
        cy.get('input[id="advance_money"]').should("be.visible");
        cy.get('input[id="balance"]').should("be.visible");
    });
});