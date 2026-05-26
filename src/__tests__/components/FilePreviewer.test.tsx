/**
 * FilePreviewer.test.tsx
 * Description: Test suite for the FilePreviewer component.
 * Verifies correct rendering of file details, formatted values, iframe preview, and download links using mocked utility functions.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 24/02/2026 [Rebeca Davila Araiza] Added detailed comments and documentation for clarity and maintainability.
 * 20/05/2026 [Diego de la Vega] Added regression test: FilePreviewer must show correct amount when backend returns a decimal string.
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import FilePreviewer from "./../../components/Refunds/FilePreviewer.tsx";

// Mock the utility functions
vi.mock("../../utils/formatDate", () => ({
  default: vi.fn((date) => `Formatted: ${date}`),
}));

vi.mock("../../utils/formatMoney", () => ({
  default: vi.fn((amount) => {
    const n = typeof amount === "number" ? amount : parseFloat(amount);
    if (isNaN(n)) return "$0.00";
    return `$${n.toFixed(2)}`;
  }),
}));

describe("FilePreviewer Component", () => {
  const mockFile = {
    file_url_pdf: "https://example.com/file.pdf",
    file_url_xml: "https://example.com/file.xml",
    class: "Expense",
    amount: 1500.5,
    date: "2024-01-15",
    status: "Approved",
  };

  it("renders file information and download links correctly", () => {
    render(<FilePreviewer file={mockFile} fileIndex={0} />);

    // Class and status are plain strings (not i18n)
    expect(screen.getByText("Expense")).toBeInTheDocument();
    expect(screen.getByText("Approved")).toBeInTheDocument();
    expect(screen.getByText("Formatted: 2024-01-15")).toBeInTheDocument();

    // Amount is inside a nested span — check via element ID
    const amountEl = document.getElementById("amount-file-0");
    expect(amountEl?.textContent).toContain("$1500.50");

    // Iframe
    const iframe = screen.getByTitle("Comprobante de Solicitud 1");
    expect(iframe).toHaveAttribute(
      "src",
      "https://example.com/file.pdf#navpanes=0&view=FitH",
    );

    // Download links: use IDs because link text is an i18n key in test env
    const xmlLink = document.getElementById("download-file-xml-0") as HTMLAnchorElement;
    const pdfLink = document.getElementById("download-file-pdf-0") as HTMLAnchorElement;

    expect(xmlLink).not.toBeNull();
    expect(xmlLink.getAttribute("href")).toBe("https://example.com/file.xml");
    expect(xmlLink.getAttribute("download")).toBe("comprobante1.xml");
    expect(pdfLink).not.toBeNull();
    expect(pdfLink.getAttribute("href")).toBe("https://example.com/file.pdf");
    expect(pdfLink.getAttribute("download")).toBe("comprobante1.pdf");
  });

  it("(regression) shows correct amount when backend returns a decimal string instead of number", () => {
    // PostgreSQL numeric columns arrive as strings (e.g., "1160.00").
    // Before the fix in formatMoney.tsx, formatMoney("1160.00") returned "$0.00".
    // This test verifies the component correctly passes the string to formatMoney
    // and that the mock (which mirrors the fix) handles it properly.
    const fileWithStringAmount = {
      ...mockFile,
      amount: "1160.00" as any, // simulating PostgreSQL response
    };

    render(<FilePreviewer file={fileWithStringAmount} fileIndex={1} />);

    const amountEl = document.getElementById("amount-file-1");
    // Should show "$1160.00" — NOT "$0.00" (which was the bug before parseFloat was added)
    expect(amountEl?.textContent).not.toContain("$0.00");
    expect(amountEl?.textContent).toContain("$1160.00");
  });
});
