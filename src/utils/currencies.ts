/**
 * FileName: currencies.ts
 * Description: Currency options for the travel request form.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 20/04/2026 [Sebastián Borjas] Added support for advance money currency.
 */

import { TFunction } from "i18next";

const currencyMeta = [
  { id: "USD", banxico_id: "SF46405" },
  { id: "EUR", banxico_id: "SF46410" },
  { id: "JPY", banxico_id: "SF46406" },
  { id: "GBP", banxico_id: "SF46407" },
  { id: "CNY", banxico_id: "SF290383" },
  { id: "SDR", banxico_id: "SF46411" },
  { id: "MXN", banxico_id: " " },
];

export const currencyOptions = currencyMeta.map((c) => ({
  ...c,
  name: c.id,
}));

export function makeCurrencyOptions(t: TFunction) {
  return currencyMeta.map((c) => ({
    ...c,
    name: t(`currencies.${c.id}`),
  }));
}
