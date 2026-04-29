/**
 * FileName: approve-request.cy.js
 * Description: End-to-end tests for the Aprovador role in the Monarca application, covering the full flow of approving, denying, and requesting changes for travel requests, 
 * as well as verifying vouchers. This test suite ensures that all functionalities related to the Aprovador role are working as expected.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 25/02/2026 [Santiago-Coronado] Added detailed comments and documentation for clarity and maintainability.
 */


/**
 * FunctionName: Aprovador Role - Full End-to-End Flow, to test the complete workflow of the Aprovador role in the Monarca application.
 * Input: None (the tests will perform actions on the application)
 * Output: Verification of the expected outcomes for each action performed by the Aprovador role, such as successful login, viewing request details, approving/denying requests, and verifying vouchers.
 */
describe("Aprovador Role - Full End-to-End Flow", () => {
  // Function (command) to perform login as Aprovador
  Cypress.Commands.add("loginAsAprovador", () => {
    cy.visit("/");
    cy.get('input[name="email"]').type("approver1@monarca.com");
    cy.get('input[name="password"]').type("password");
    cy.contains("Continuar").click();
  });

  // Function (command) to perform login and open the first request
  Cypress.Commands.add("loginAsAprovadorAndOpenFirstRequest", () => {
    cy.loginAsAprovador();
    cy.contains("Viajes por aprobar").first().click();
    cy.url().should("include", "/approvals");

    cy.contains("Ver detalles").should("be.visible").click();
    cy.url().should("include", "/requests");
    cy.contains("Información de Solicitud").should("be.visible");
  });
  // Before each test, ensure the user is logged in and on the dashboard
  it("logs in and verifies dashboard elements", () => {
    cy.loginAsAprovador();

    cy.url().should("include", "/dashboard");
    cy.contains("Aprobador").should("be.visible");
    cy.contains("Viajes por aprobar").should("be.visible");
    cy.contains("Historial de viajes aprobados").should("be.visible");
    cy.contains("Comprobantes de gastos por aprobar").should("be.visible");
  });
  // Test case to view details of a pending trip
  it("views details of a pending trip", () => {
    cy.loginAsAprovadorAndOpenFirstRequest();
    cy.contains("Solicitante").should("be.visible");
    cy.contains("Información de Solicitud").should("be.visible");
  });
  // Test case to deny a request directly using the Denegar button
  it("denies a request directly with Denegar button", () => {
    cy.loginAsAprovadorAndOpenFirstRequest();
    cy.contains("Denegar").click();
    cy.contains("Solicitud denegada").should("be.visible");
  });
  // Test case to request changes with a comment
  it("requests changes with comment", () => {
    cy.loginAsAprovadorAndOpenFirstRequest();
    cy.get('textarea').type("Por favor, ajusta las fechas del viaje.");
    cy.contains("Solicitar cambios").click();
    cy.contains("Se han solicitado cambios").should("be.visible");
  });
  // Test case to approve a request after selecting an agency and writing a comment
  it("approves a request after selecting an agency and writing comment", () => {
    cy.loginAsAprovadorAndOpenFirstRequest();
    cy.get('select').select("Global Travels UUID Inc.");
    cy.get('textarea').type("Aprobado por la agencia seleccionada.");
    cy.contains("Aprobar").click();
    cy.contains("Solicitud aprobada").should("be.visible");
  });
  // Test case to navigate to the history of approved trips and view details
  it("navigates to 'Historial de viajes aprobados' and views details", () => {
    cy.loginAsAprovador();
    cy.contains("Historial de viajes aprobados").first().click();

    cy.url().should("include", "/history");
    cy.contains("Historial de viajes").should("be.visible");
    cy.get('button[id="details-0"]').click();
    cy.url().should("include", "/requests");
    cy.contains("Solicitante").should("be.visible");
    cy.contains("Información de Solicitud").should("be.visible");
  });
  // Test case to complete voucher verification in the "Comprobantes de gastos por aprobar" section
  it("completes voucher verification in 'Comprobantes de gastos por aprobar'", () => {
    cy.loginAsAprovador();

    cy.contains("Comprobantes de gastos por aprobar").first().click();
    cy.url().should("include", "/refunds-review");
    cy.contains("Solicitudes de Reembolso por Aprobar").should("be.visible");

    cy.contains("Ver comprobantes").should("be.visible").click();
    cy.url().should("include", "/refunds-review");

    cy.contains("Información de Solicitud").should("be.visible");
    cy.contains("Empleado").should("be.visible");
    cy.contains("Comprobante de Solicitud").should("be.visible");

    cy.contains("Completar Comprobación").should("be.visible").click();
  });
});
