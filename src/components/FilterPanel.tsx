import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export interface FilterValues {
  status: string;
  motive: string;
  tripDate: string;
  requestDateRange: string;
  departurePlace: string;
}

const EMPTY_FILTERS: FilterValues = {
  status: "",
  motive: "",
  tripDate: "",
  requestDateRange: "",
  departurePlace: "",
};

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

const DEPARTURE_PLACES = ["Mexico City", "Paris", "New York"];

const REQUEST_DATE_OPTIONS = [
  { value: "today", labelKey: "filters.today" },
  { value: "yesterday", labelKey: "filters.yesterday" },
  { value: "last7", labelKey: "filters.last7Days" },
  { value: "last30", labelKey: "filters.last30Days" },
];

const selectClass =
  "w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0a2c6d]";
const inputClass =
  "w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0a2c6d]";
const labelClass = "block text-xs font-semibold text-[var(--color-page-text-title)] mb-1";

const FilterPanel: React.FC<FilterPanelProps> = ({ onSearch, onReset }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>(EMPTY_FILTERS);

  const set = (key: keyof FilterValues, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const handleReset = () => {
    setFilters(EMPTY_FILTERS);
    onReset();
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2 bg-[#0a2c6d] text-white text-sm font-medium rounded-lg hover:bg-[#0d3a8a] transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm2 4a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm2 4a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
        {t("filters.title")}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="mt-2 p-4 border border-gray-200 rounded-lg bg-[var(--color-card-bg)] shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>{t("filters.status")}</label>
              <select
                className={selectClass}
                value={filters.status}
                onChange={(e) => set("status", e.target.value)}
              >
                <option value="">{t("filters.allStatuses")}</option>
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </option>
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
                className={inputClass}
                value={filters.tripDate}
                onChange={(e) => set("tripDate", e.target.value)}
              />
            </div>

            <div>
              <label className={labelClass}>{t("filters.requestDate")}</label>
              <select
                className={selectClass}
                value={filters.requestDateRange}
                onChange={(e) => set("requestDateRange", e.target.value)}
              >
                <option value="">{t("filters.allDates")}</option>
                {REQUEST_DATE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>{t("filters.departurePlace")}</label>
              <select
                className={selectClass}
                value={filters.departurePlace}
                onChange={(e) => set("departurePlace", e.target.value)}
              >
                <option value="">{t("filters.allPlaces")}</option>
                {DEPARTURE_PLACES.map((place) => (
                  <option key={place} value={place}>
                    {place}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-4 justify-end">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-[#0a2c6d] border border-[#0a2c6d] rounded-lg hover:bg-gray-100 transition-colors"
            >
              {t("filters.reset")}
            </button>
            <button
              onClick={handleSearch}
              className="px-4 py-2 text-sm font-medium text-white bg-[#0a2c6d] rounded-lg hover:bg-[#0d3a8a] transition-colors"
            >
              {t("filters.search")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
