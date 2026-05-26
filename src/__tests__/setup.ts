/**
 * FileName: setup.ts
 * Description: Sets up the testing environment for the application by importing necessary testing libraries and configurations, ensuring that tests have access to custom matchers and utilities for DOM testing.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 25/05/2026 [Diego de la Vega] Configured a robust react-i18next mock that resolves nested keys using es.json translations with the help of Gemini AI.
 */

import "@testing-library/jest-dom";
import { vi } from "vitest";
import es from "../i18n/locales/es.json";

// Helper function to resolve dotted keys from the JSON structure
function resolveKey(key: string): string {
  const parts = key.split(".");
  let current: any = es;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return key;
    }
  }
  return typeof current === "string" ? current : key;
}

vi.mock("react-i18next", () => {
  return {
    useTranslation: () => {
      return {
        t: (key: string, options?: any) => {
          let value = resolveKey(key);
          if (options) {
            Object.keys(options).forEach((optKey) => {
              value = value.replace(`{{${optKey}}}`, String(options[optKey]));
            });
          }
          return value;
        },
        i18n: {
          changeLanguage: () => Promise.resolve(),
          language: "es",
        },
      };
    },
    initReactI18next: {
      type: "3rdParty",
      init: () => { },
    },
  };
});

// Extend Vitest's expect matchers with Jest-DOM matchers for TypeScript
declare module "vitest" {
  interface Assertion<T = any> extends jest.Matchers<void, T> {}
  interface AsymmetricMatchersContaining extends jest.Matchers<void, any> {}
}
