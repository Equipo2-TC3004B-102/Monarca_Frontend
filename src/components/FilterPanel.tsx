import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getRequest } from "../utils/apiService";

export interface FilterValues {
  status: string;
  motive: string;
  tripDate: string;
  requestDateRange: string;
  departureCountry: string;
  departureCity: string;
}

const EMPTY_FILTERS: FilterValues = {
  status: "",
  motive: "",
  tripDate: "",
  requestDateRange: "",
  departureCountry: "",
  departureCity: "",
};

interface Destination {
  id: string;
  country: string;
  city: string;
}

interface FilterPanelProps {
  onSearch: (filters: FilterValues) => void;
  onReset: () => void;
}

const STATUS_OPTIONS = [
  { value: "Completed", labelKey: "status.completed" },
  { value: "Denied", labelKey: "status.denied" },
  { value: "In Progress", labelKey: "status.inProgress" },
  { value: "Pending Accounting Approval", labelKey: "status.pendingAccountingApproval" },
  { value: "Pending Reservations", labelKey: "status.pendingReservations" },
  { value: "Pending Review", labelKey: "status.pendingReview" },
];

const REQUEST_DATE_OPTIONS = [
  { value: "today", labelKey: "filters.today" },
  { value: "yesterday", labelKey: "filters.yesterday" },
  { value: "last7", labelKey: "filters.last7Days" },
  { value: "last30", labelKey: "filters.last30Days" },
];

const base = "border border-[var(--color-border)] rounded-md px-3 py-2 text-sm bg-[var(--color-card-bg)] text-[var(--color-page-text)] focus:outline-none focus:ring-2 focus:ring-[#0a2c6d]";
const inputClass = `w-56 ${base}`;
const selectClassNarrow = `w-40 ${base}`;
const inputClassNarrow = `w-40 ${base}`;
const labelClass = "block text-xs font-semibold text-[var(--color-page-text-title)] mb-1";

const FilterPanel: React.FC<FilterPanelProps> = ({ onSearch, onReset }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>(EMPTY_FILTERS);
  const [destinations, setDestinations] = useState<Destination[]>([]);

  useEffect(() => {
    getRequest("/destinations")
      .then((data: Destination[]) => setDestinations(data))
      .catch(() => {});
  }, []);

  const countries = [...new Set(destinations.map((d) => d.country))].sort();
  const cityOptions = [
    ...new Map(
      destinations
        .filter((d) => !filters.departureCountry || d.country === filters.departureCountry)
        .sort((a, b) => a.city.localeCompare(b.city))
        .map((d) => [d.city, d])
    ).values(),
  ];

  const set = (key: keyof FilterValues, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const handleCountryChange = (country: string) => {
    setFilters((prev) => ({ ...prev, departureCountry: country, departureCity: "" }));
  };

  const handleReset = () => {
    setFilters(EMPTY_FILTERS);
    onReset();
  };

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2 bg-[#0a2c6d] text-white text-sm font-medium rounded-lg hover:bg-[#0d3a8a] transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm2 4a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm2 4a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
        {t("filters.title")}
        <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="mt-2 p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-card-bg)] shadow-sm">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className={labelClass}>{t("filters.status")}</label>
              <select className={`w-72 ${base}`} value={filters.status} onChange={(e) => set("status", e.target.value)}>
                <option value="">{t("filters.allStatuses")}</option>
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>{t("filters.motive")}</label>
              <input
                type="text"
                className={inputClass}
                placeholder={t("filters.motivePlaceholder")}
                value={filters.motive}
                onChange={(e) => set("motive", e.target.value)}
              />
            </div>

            <div>
              <label className={labelClass}>{t("filters.tripDate")}</label>
              <input
                type="date"
                className={inputClassNarrow}
                value={filters.tripDate}
                onChange={(e) => set("tripDate", e.target.value)}
              />
            </div>

            <div>
              <label className={labelClass}>{t("filters.requestDate")}</label>
              <select className={selectClassNarrow} value={filters.requestDateRange} onChange={(e) => set("requestDateRange", e.target.value)}>
                <option value="">{t("filters.allDates")}</option>
                {REQUEST_DATE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>{t("filters.departureCountry")}</label>
              <select className={`w-60 ${base}`} value={filters.departureCountry} onChange={(e) => handleCountryChange(e.target.value)}>
                <option value="">{t("filters.allCountries")}</option>
                {countries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>{t("filters.departureCity")}</label>
              <select
                key={filters.departureCountry}
                className={`w-60 ${base}`}
                value={filters.departureCity}
                onChange={(e) => set("departureCity", e.target.value)}
              >
                <option value="">{t("filters.allCities")}</option>
                {cityOptions.map((d) => (
                  <option key={d.id} value={d.city}>{d.city}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-1 justify-end items-center gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-[var(--color-page-text-title)] border border-[var(--color-page-text-title)] rounded-lg hover:bg-[var(--color-button)] hover:text-[var(--color-text-button)] transition-colors"
              >
                {t("filters.reset")}
              </button>
              <button
                onClick={() => onSearch(filters)}
                className="px-4 py-2 text-sm font-medium text-white bg-[#0a2c6d] rounded-lg hover:bg-[#0d3a8a] transition-colors"
              >
                {t("filters.search")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
