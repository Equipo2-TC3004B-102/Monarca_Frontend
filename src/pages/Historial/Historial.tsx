/**
 * FileName: Historial.tsx
 * Description: This file contains the Historial component used in the Refunds section of the application.
 * It provides a customizable history page with travel records and related actions.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 19/05/2026 [Julio Rodriguez] Route travel agents to dedicated /requests/ta-history endpoint;
 *                              replace endpoint-string filters with permission-based filters.
 * 28/05/2026 [Sergio] Add filter panel for status, motive, trip date, request date and departure place.
 */

import Table from "../../components/Refunds/Table";
import { useState, useEffect } from "react";
import { getRequest } from "../../utils/apiService";
import formatDate from "../../utils/formatDate";
import { Permission, useAuth } from "../../hooks/auth/authContext";
import RefreshButton from "../../components/RefreshButton";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "../../components/Refunds/Button";
import GoBack from "../../components/GoBack";
import { Tutorial } from "../../components/Tutorial";
import { useApp } from "../../hooks/app/appContext";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import FilterPanel, {
  FilterValues,
  STATUS_OPTIONS_ALL,
  STATUS_OPTIONS_APPROVED_HISTORY,
  STATUS_OPTIONS_SOI,
  STATUS_OPTIONS_RESERVED,
  STATUS_OPTIONS_TA_HISTORY,
} from "../../components/FilterPanel";

/**
 * renderStatus, converts API status strings to localized display text with appropriate styling.
 * Input: status (string)
 * Output: JSX element - styled status badge
 */
const renderStatus = (status: string, t: TFunction) => {
  let statusText = "";
  let styles = "";
  switch (status) {
    case "Pending Review":
      statusText = t('status.pendingReview');
      styles = "text-[#55447a] font-bold bg-[#bea8ef]";
      break;
    case "Denied":
      statusText = t('status.denied');
      styles = "text-[#680909] font-bold bg-[#eca6a6]";
      break;
    case "Cancelled":
      statusText = t('status.cancelled');
      styles = "text-[#680909] font-bold bg-[#eca6a6]";
      break;
    case "Changes Needed":
      statusText = t('status.changesNeeded');
      styles = "text-[#755619] font-bold bg-[#f1dbb1]";
      break;
    case "Pending Reservations":
      statusText = t('status.pendingReservations');
      styles = "text-[#8c5308] font-bold bg-[#f1c180]";
      break;
    case "Pending Accounting Approval":
      statusText = t('status.pendingAccountingApproval');
      styles = "text-[var(--dark-blue)] font-bold bg-[#99b5e3]";
      break;
    case "Pending Vouchers Approval":
      statusText = t('status.pendingVouchersApproval');
      styles = "text-[var(--dark-blue)] font-bold bg-[#c6c4fb]";
      break;
    case "In Progress":
      statusText = t('status.inProgress');
      styles = "text-[#138080] font-bold bg-[#b7f1f1]";
      break;
    case "Pending Refund Approval":
      statusText = t('status.pendingRefundApproval');
      styles = "text-[#575107] font-bold bg-[#f0eaa5]";
      break;
    case "Completed":
      statusText = t('status.completed');
      styles = "text-[#24390d] font-bold bg-[#c7e6ab]";
      break;
    default:
      statusText = status;
      styles = "text-white bg-[#6c757d]";
    }
    return (
      <span className={`text-xs p-1 rounded-sm box-decoration-clone leading-snug ${styles}`}>
        {statusText}
      </span>
    )
}

const applyFilters = (data: any[], filters: FilterValues) => {
  const now = new Date();
  return data.filter((record) => {
    if (filters.status && record.status !== filters.status) return false;

    if (filters.motive && !record.motive?.toLowerCase().includes(filters.motive.toLowerCase())) return false;

    if (filters.tripDate && record._rawDepartureDate) {
      if (!record._rawDepartureDate.startsWith(filters.tripDate)) return false;
    }

    if (filters.requestDateRange && record._rawCreatedAt) {
      const date = new Date(record._rawCreatedAt);
      if (filters.requestDateRange === "today") {
        if (date.toDateString() !== now.toDateString()) return false;
      } else if (filters.requestDateRange === "yesterday") {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        if (date.toDateString() !== yesterday.toDateString()) return false;
      } else if (filters.requestDateRange === "last7") {
        const cutoff = new Date(now);
        cutoff.setDate(now.getDate() - 7);
        if (date < cutoff) return false;
      } else if (filters.requestDateRange === "last30") {
        const cutoff = new Date(now);
        cutoff.setDate(now.getDate() - 30);
        if (date < cutoff) return false;
      }
    }

    if (filters.departureCountry && record.destination?.country !== filters.departureCountry) return false;
    if (filters.departureCity && record.country !== filters.departureCity) return false;

    return true;
  });
};

/**
 * Historial, displays a paginated table of travel request history with status indicators, filtering by user permissions, and detailed action buttons.
 * Input: none
 * Output: JSX element - complete travel history page with table and tutorial overlay
 */
export const Historial = () => {
  const [allData, setAllData] = useState<any[]>([]);
  const [displayData, setDisplayData] = useState<any[]>([]);
  const { authState } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleVisitPage, tutorial, setTutorial } = useApp();
  const { t } = useTranslation();

  /**
   * Fetches travel records from API with permission-based filtering and formats data for display.
   * Input: none
   * Output: void (updates allData and displayData states)
   */
  useEffect(() => {
    const fetchTravelRecords = async () => {
      try {
        const view = searchParams.get("view");
        const endpoint =
          view === "approvals" && authState.userPermissions.includes("view_approved_request_history" as Permission)
            ? "/requests/approved-history"
            : view === "soi" && authState.userPermissions.includes("check_budgets" as Permission)
            ? "/requests/to-approve-SOI"
            : authState.userPermissions.includes("view_assigned_requests_readonly" as Permission) &&
              authState.userPermissions.includes("submit_reservations" as Permission)
            ? "/requests/reserved-history"
            : authState.userPermissions.includes("view_own_requests" as Permission)
            ? "/requests/user"
            : authState.userPermissions.includes("view_approved_request_history" as Permission)
            ? "/requests/approved-history"
            : authState.userPermissions.includes("check_budgets" as Permission)
            ? "/requests/to-approve-SOI"
            : authState.userPermissions.includes("view_travel_agent_history" as Permission)
            ? "/requests/ta-history"
            : "/requests/all"
        let response = await getRequest(endpoint);
        // approved-history is already filtered by the backend (scoped to current approver, excludes Pending Review/Denied/Cancelled)
        if (endpoint === "/requests/reserved-history") {
          response = response.filter((record: any) => !["Pending Review", "Denied", "Cancelled", "Changes Needed", "Pending Reservations"].includes(record.status));
        }
        // to-approve-SOI is already filtered by the backend (scoped to current SOI, status = Pending Accounting Approval)
        const mapped = response?.map((record: any, index: number) => {
          const sortedDestinations = [...(record.requests_destinations || [])].sort(
            (a: any, b: any) => a.destination_order - b.destination_order
          );
          const firstDestination = sortedDestinations[0];

          return {
            ...record,
            status: record.status,
            _rawCreatedAt: record.createdAt,
            _rawDepartureDate: firstDestination?.departure_date ?? null,
            createdAt: formatDate(record.createdAt),
            country:
              record.destination?.city ||
              record.destination?.iata_code ||
              t('historial.noDestination'),
            departureDate: firstDestination?.departure_date
              ? formatDate(firstDestination.departure_date)
              : t('historial.noDate'),
            index,
            action: record.id,
          };
        });
        setAllData(mapped);
        setDisplayData(mapped);
      } catch (error) {
        console.error("Error fetching travel records:", error);
      }
    };

    fetchTravelRecords();
  }, [searchParams]);

  useEffect(() => {
      const visitedPages = JSON.parse(localStorage.getItem("visitedPages") || "[]");
      const isPageVisited = visitedPages.includes(location.pathname);

      if (!isPageVisited) {
        setTutorial(true);
      }
      return () => handleVisitPage();
    }, []);

  const handleSearch = (filters: FilterValues) => {
    setDisplayData(applyFilters(allData, filters));
  };

  const handleReset = () => {
    setDisplayData(allData);
  };

  const view = searchParams.get("view");
  const statusOptions = (() => {
    if (view === "approvals" && authState.userPermissions.includes("view_approved_request_history" as Permission))
      return STATUS_OPTIONS_APPROVED_HISTORY;
    if (view === "soi" && authState.userPermissions.includes("check_budgets" as Permission))
      return STATUS_OPTIONS_SOI;
    if (
      authState.userPermissions.includes("view_assigned_requests_readonly" as Permission) &&
      authState.userPermissions.includes("submit_reservations" as Permission)
    )
      return STATUS_OPTIONS_RESERVED;
    if (authState.userPermissions.includes("view_own_requests" as Permission))
      return STATUS_OPTIONS_ALL;
    if (authState.userPermissions.includes("view_approved_request_history" as Permission))
      return STATUS_OPTIONS_APPROVED_HISTORY;
    if (authState.userPermissions.includes("check_budgets" as Permission))
      return STATUS_OPTIONS_SOI;
    if (authState.userPermissions.includes("view_travel_agent_history" as Permission))
      return STATUS_OPTIONS_TA_HISTORY;
    return STATUS_OPTIONS_ALL;
  })();

  // Columns schema for travel history table
  const columnsSchema = [
    { key: "status", header: t('historial.status'), render: (value: string) => renderStatus(value, t) },
    { key: "title", header: t('historial.trip') },
    { key: "motive", header: t('historial.motive') },
    { key: "departureDate", header: t('historial.departureDate') },
    { key: "country", header: t('historial.departurePlace') },
    { key: "createdAt", header: t('historial.requestDate') },
    { key: "action", header: t('historial.details'), render: (id: string) => (
      <Button
        className="bg-[var(--white)] text-[var(--blue)] p-1 rounded-sm cursor-pointer"
        label={t('historial.viewDetails')}
        onClickFunction={() => navigate(`/requests/${id}`)}
      />
    )},
  ];

  return (
    <>
    <Tutorial page="history" run={tutorial}>
        <GoBack />
        <div className="max-w-full p-6 bg-[var(--color-card-bg)] rounded-lg shadow-xl">
          <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[var(--color-page-text-title)]">
                {t('historial.title')}
              </h2>
              <RefreshButton />
          </div>

          {/* Filter panel */}
          <FilterPanel onSearch={handleSearch} onReset={handleReset} statusOptions={statusOptions} />

          {/* Travel history table component */}
          <div id="list_requests">
            <Table columns={columnsSchema} data={displayData} itemsPerPage={5} />
          </div>
        </div>
      </Tutorial>
    </>
  );
};

export default Historial;
