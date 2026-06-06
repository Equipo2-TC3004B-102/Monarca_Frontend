/**
 * FileName: currencies.ts
 * Description: Currency options for the travel request form.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 01/06/2026 [Julio Rodriguez] Created utility for currency options, including Banxico IDs for exchange rate fetching and i18n support.
 */

import { TFunction } from "i18next";

const currencyMeta = [
  { id: "MXN", banxico_id: " ",        symbol: "$",   fullName: "Peso mexicano" },
  { id: "USD", banxico_id: "SF46405",  symbol: "$",   fullName: "Dólar estadounidense" },
  { id: "EUR", banxico_id: "SF46410",  symbol: "€",   fullName: "Euro" },
  { id: "GBP", banxico_id: "SF46407",  symbol: "£",   fullName: "Libra esterlina" },
  { id: "JPY", banxico_id: "SF46406",  symbol: "¥",   fullName: "Yen japonés" },
  { id: "CNY", banxico_id: "SF290383", symbol: "¥",   fullName: "Yuan chino" },
  { id: "SDR", banxico_id: "SF46411",  symbol: "SDR", fullName: "Derechos especiales de giro" },
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
