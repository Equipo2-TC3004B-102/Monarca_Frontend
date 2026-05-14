/**
 * FileName: CreateRequest.cy.ts
 * Description: End-to-end tests for creating a travel request in the Monarca application.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 11/05/2026 [Diego de la Vega] Updated CreateRequest tests for login flow reliability
 */

/**
 * FunctionName: Create Travel Request as Requester, purpose of the function is to test the end-to-end flow of creating a travel request in the Monarca application.
 * Input: None (the tests will perform actions on the application)
 * Output: Verification that a travel request is created successfully.
 */
describe("Create Travel Request as Requester", () => {
    // Before all tests, log in as a requester to ensure we have the necessary permissions to create a travel request
    before("Login as a requester", () => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.window().then((win) => {
            win.localStorage.removeItem("visitedPages");
        });

        // Intercept API calls with full URL to match cross-domain requests
        cy.intercept("POST", "http://localhost:3002/login").as("loginRequest");
        cy.intercept("GET", "http://localhost:3002/login/profile").as("profileRequest");

        cy.visit("/");
        cy.get('input[name="email"]').type("requester1@monarca.com");
        cy.get('input[name="password"]').type("password");
        cy.contains("Continuar").click();
        cy.wait("@loginRequest");
        cy.wait("@profileRequest");
        cy.url().should("include", "/dashboard");
    });
    // Test case to create a new travel request and verify that it was created successfully
    it("Create a new travel request", () => {
        cy.get('a[data-cy="mosaic-crear-solicitud-de-viaje"]').should("be.visible");
        cy.get('a[data-cy="mosaic-crear-solicitud-de-viaje"]').click();
        cy.url().should("include", "/requests/create");
        cy.contains("Datos del Viaje").should("be.visible");
        cy.get('input[name="motive"]').should("be.visible");
        cy.get('input[id="title"]').should("be.visible");
        cy.get('button[id="id_origin_city"]').should("be.visible");
        cy.get('button[id="priority"]').should("be.visible");
        cy.get('input[name="advance_money"]').should("be.visible");
        cy.get('textarea[name="requirements"]').should("be.visible");
        cy.get('button[id="destination-0"]').should("be.visible");
        cy.get('input[id="details-0"]').should("be.visible");
        cy.get('input[id="departure-0"]').should("be.visible");
        cy.get('input[id="arrival-0"]').should("be.visible");
        cy.get('input[id="stay-days-0"]').should("be.visible");
        cy.get('button[id="hotel-0"]').should("be.visible");
        cy.get('button[id="plane-0"]').should("be.visible");
        cy.get('button[type="submit"]').should("be.visible");
        cy.get('input[name="motive"]').type("Business trip");
        cy.get('input[id="title"]').type("Trip to New York");
        cy.get('button[id="id_origin_city"]').click();
        cy.contains('span', 'Mexico City, Mexico').click();
        cy.get('button[id="priority"]').click();
        cy.contains('span', 'Alta').click();
        cy.get('input[name="advance_money"]').type("1000");
        cy.get('textarea[name="requirements"]').type("Plane and hotel booking required");
        cy.get('button[id="destination-0"]').click();
        cy.contains('span', 'New York, USA').click();
        cy.get('input[id="details-0"]').type("Details about the trip");
        cy.get('input[id="departure-0"]').type("2025-11-01");
        cy.get('input[id="arrival-0"]').type("2025-11-10");
        cy.get('button[type="submit"]').click();
        cy.contains('¡Solicitud de viaje creada exitosamente!').should('be.visible');
    });
});