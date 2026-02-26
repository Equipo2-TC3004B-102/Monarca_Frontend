/**
 * Mosaic.test.tsx
 * Description: This file contains the test suite for the Mosaic component. It tests title rendering, 
 * icon image attributes, and that the component is wrapped in a Link with the correct href.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 24/02/2026 [Rebeca Davila Araiza] Added detailed comments and documentation for clarity and maintainability.
 */

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Mosaic from "../../components/Mosaic";

describe("Mosaic", () => {
  const props = {
    title: "Pruebas",
    iconPath: "/icon.png",
    link: "/pruebas"
  };

  beforeEach(() => {
    render(
      <MemoryRouter>
        <Mosaic {...props} />
      </MemoryRouter>
    );
  });

  it("renderiza el título bajo el icono", () => {
    expect(screen.getByText(props.title)).toBeInTheDocument();
  });

  it("incluye la imagen con src y alt correctos", () => {
    const img = screen.getByAltText(props.title) as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain(props.iconPath);
  });

  it("envuelve todo en un enlace al destino correcto", () => {
    // the link is obtained and then it verifies its href
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", props.link);
  });
});
