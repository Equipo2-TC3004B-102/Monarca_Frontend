/**
 * FileName: travel-agent.cy.ts
 * Description: End-to-end tests for the travel agent role in the Monarca application, covering the full booking flow for various scenarios such as booking only a flight, booking a multi-destination trip with both flight and hotel, booking only a hotel, and booking a single destination with both flight and hotel.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 25/02/2026 [Santiago-Coronado] Added detailed comments and documentation for clarity and maintainability.
 */

/**
 * FunctionName: Travel Agent - Full Booking Flow, purpose of the function is to test the full booking flow for travel agents in the Monarca application.
 * Input: None (the tests will perform actions on the application)
 * Output: Verification that the booking process works correctly for travel agents.
 */
describe("Travel Agent - Full Booking Flow", () => {
  // Before each test, log in as a travel agent to ensure we have the necessary permissions to access the booking functionality
  beforeEach(() => {
    cy.visit("/");
    cy.get('input[name="email"]').type("travelagent1@monarca.com");
    cy.get('input[name="password"]').type("password");
    cy.contains("Continuar").click();
    cy.url().should("include", "/dashboard");
    cy.contains("Agente de Viajes").should("be.visible");
  });
  // Helper function to assert that the success toast message is displayed after submitting reservations
  const assertToast = () => {
    cy.contains("enviadas correctamente", { timeout: 6000 }).should(
      "be.visible"
    );
  };
  // Test case to book only a flight and verify that the booking is successful
  it("1. Reserva solo vuelo", () => {
    cy.contains("Viajes por reservar").click();
    cy.contains("a", "Reservar").first().click();
    cy.contains("Asignar reservaciones").should("be.visible");

    cy.get('input[placeholder="Ingresa el título de la reservación"]').type(
      "Vuelo CDMX-NY"
    );
    cy.get('textarea[placeholder="Escribe tus comentarios"]').type(
      "Vuelo sin escalas"
    );

    cy.fixture("vuelo.pdf", "base64").then((fileContent) => {
      cy.get('input[type="file"]').first().attachFile({
        fileContent,
        fileName: "vuelo.pdf",
        mimeType: "application/pdf",
        encoding: "base64",
      });
    });

    cy.contains("Enviar reservaciones").click();
    assertToast();
  });
  // Test case to book a multi-destination trip with both flight and hotel for two destinations, and verify that the booking is successful
  it("2. Reserva multidestino (vuelo y hotel para dos destinos)", () => {
    cy.contains("Viajes por reservar").click();
    cy.contains("a", "Reservar").first().click();
    cy.contains("Asignar reservaciones").should("be.visible");

    // Two blocks of destination: cy.get().eq(0) y .eq(1)
    for (let i = 0; i < 2; i++) {
      const hotelIndex = i * 2; // hotel inputs come first
      const vueloIndex = i * 2 + 1; // then flight inputs

      // Hotel
      cy.get('input[placeholder="Ingresa el título de la reservación"]')
        .eq(hotelIndex)
        .type(`Hotel destino ${i + 1}`);
      cy.get('textarea[placeholder="Escribe tus comentarios"]')
        .eq(hotelIndex)
        .type(`Hotel para destino ${i + 1}`);
      cy.fixture("hotel_receipt.pdf", "base64").then((fileContent) => {
        cy.get('input[type="file"]').eq(hotelIndex).attachFile({
          fileContent,
          fileName: "hotel_receipt.pdf",
          mimeType: "application/pdf",
          encoding: "base64",
        });
      });

      // Flight
      cy.get('input[placeholder="Ingresa el título de la reservación"]')
        .eq(vueloIndex)
        .type(`Vuelo destino ${i + 1}`);
      cy.get('textarea[placeholder="Escribe tus comentarios"]')
        .eq(vueloIndex)
        .type(`Vuelo para destino ${i + 1}`);
      cy.fixture("vuelo.pdf", "base64").then((fileContent) => {
        cy.get('input[type="file"]').eq(vueloIndex).attachFile({
          fileContent,
          fileName: "vuelo.pdf",
          mimeType: "application/pdf",
          encoding: "base64",
        });
      });
    }

    cy.contains("Enviar reservaciones").click();
    assertToast();
  });
  // Test case to book only a hotel and verify that the booking is successful
  it("3. Reserva solo hotel", () => {
    cy.contains("Viajes por reservar").click();
    cy.contains("a", "Reservar").first().click();
    cy.contains("Asignar reservaciones").should("be.visible");

    cy.get('input[placeholder="Ingresa el título de la reservación"]').type(
      "Hotel CDMX"
    );
    cy.get('textarea[placeholder="Escribe tus comentarios"]').type(
      "Hotel cerca del centro"
    );

    cy.fixture("hotel_receipt.pdf", "base64").then((fileContent) => {
      cy.get('input[type="file"]').first().attachFile({
        fileContent,
        fileName: "hotel_receipt.pdf",
        mimeType: "application/pdf",
        encoding: "base64",
      });
    });

    cy.contains("Enviar reservaciones").click();
    assertToast();
  });
  // Test case to book a single destination with both flight and hotel, and verify that the booking is successful
  it("4. Reserva vuelo y hotel (1 destino)", () => {
    cy.contains("Viajes por reservar").click();
    cy.contains("a", "Reservar").first().click();
    cy.contains("Asignar reservaciones").should("be.visible");

    // Hotel
    cy.get('input[placeholder="Ingresa el título de la reservación"]')
      .eq(0)
      .type("Hotel París");
    cy.get('textarea[placeholder="Escribe tus comentarios"]')
      .eq(0)
      .type("Cerca de la torre Eiffel");
    cy.fixture("hotel_receipt.pdf", "base64").then((fileContent) => {
      cy.get('input[type="file"]').eq(0).attachFile({
        fileContent,
        fileName: "hotel_receipt.pdf",
        mimeType: "application/pdf",
        encoding: "base64",
      });
    });

    // Flight
    cy.get('input[placeholder="Ingresa el título de la reservación"]')
      .eq(1)
      .type("Vuelo París");
    cy.get('textarea[placeholder="Escribe tus comentarios"]')
      .eq(1)
      .type("Vuelo con escala en Madrid");
    cy.fixture("vuelo.pdf", "base64").then((fileContent) => {
      cy.get('input[type="file"]').eq(1).attachFile({
        fileContent,
        fileName: "vuelo.pdf",
        mimeType: "application/pdf",
        encoding: "base64",
      });
    });

    cy.contains("Enviar reservaciones").click();
    assertToast();
  });
});
