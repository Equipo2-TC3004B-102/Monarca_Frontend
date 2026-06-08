/**
 * FileName: Approvals.tsx
 * Description: Approvals page component, which displays a list of approvals and allows users to approve or reject them.
 * Authors: Original Monarca team
 * Last Modification made:
 * 04/06/2026 [Sergio Jiawei Xuan] Refactored fetch to useCallback; connected RefreshButton onClick.
 */
import React, { useCallback, useEffect, useState } from "react";
import Table from "../../components/Approvals/Table";
import { getRequest } from "../../utils/apiService";
import RefreshButton from "../../components/RefreshButton";
import formatDate from "../../utils/formatDate";
import GoBack from "../../components/GoBack";
import { Tutorial } from "../../components/Tutorial";
import { useLocation } from "react-router-dom";
import { useApp } from "../../hooks/app/appContext";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import FilterPanel, { FilterValues, STATUS_OPTIONS_TO_APPROVE } from "../../components/FilterPanel";

// columns are built inside the component so they react to language changes
/**
 * FunctionName: renderStatus
 * Purpose of the function: to render the status of the approval.
 * Input: status: string
 * Output: statusText: string, styles: string
 * Author: Original Moncarca team
 * Last Modification made: original Moncarca team
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
      <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${styles}`}>
        {statusText}
      </span>
    )
}

/**
 * FunctionName: applyFilters
 * Purpose of the function: Filters an array of approval records based on provided filter criteria including status, motive, dates, and location.
 * Input: data (any[]) - Array of approval objects to filter, filters (FilterValues) - Object containing filter criteria
 * Output: any[] - Filtered array of approval objects matching all criteria
 */
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
 * FunctionName: Approvals
 * Purpose of the function: Main page component for displaying and managing travel request approvals. Displays approval records in a filterable table.
 * Input: None - This is a page component with no props
 * Output: JSX.Element - The rendered page with a table of approvals and filter panel
 */
export const Approvals: React.FC = () => {
  const [allData, setAllData] = useState<any[]>([]);
  const [displayData, setDisplayData] = useState<any[]>([]);
  const location = useLocation();
  const { handleVisitPage, tutorial, setTutorial } = useApp();
  const { t } = useTranslation();

  const columns = [
    { key: "status", header: t('approvals.status'), width: "w-52", render: (value: string) => renderStatus(value, t) },
    { key: "motive", header: t('approvals.trip') },
    { key: "title", header: t('approvals.motive') },
    { key: "origin", header: t('approvals.origin') },
    { key: "departureDate", header: t('approvals.departureDate') },
    { key: "country", header: t('approvals.departurePlace') },
    { key: "arrivalDate", header: t('approvals.arrivalDate') },
  ];

  // Fetch travel records data from API
  /**
   * FunctionName: fetchTravelRecords
   * Purpose of the function: Fetches travel record approval data from the API, maps and formats the response data to match the required structure.
   * Input: None 
   * Output: Sets allData and displayData state with formatted travel records
   */
  const fetchTravelRecords = useCallback(async () => {
      try {
        const response = await getRequest("/requests/to-approve");
        const mapped = response.map((trip: any) => {
          const sortedDestinations = [...(trip.requests_destinations || [])].sort(
            (a: any, b: any) => a.destination_order - b.destination_order
          );
          const firstDestination = sortedDestinations[0];

          return {
            ...trip,
            status: trip.status,
            _rawCreatedAt: trip.createdAt,
            _rawDepartureDate: firstDestination?.departure_date ?? null,
            origin:
              trip.destination?.city ||
              trip.destination?.iata_code ||
              t('historial.noDestination'),
            country:
              firstDestination?.destination?.city ||
              firstDestination?.destination?.iata_code ||
              t('historial.noDestination'),
            departureDate: firstDestination?.departure_date
              ? formatDate(firstDestination.departure_date)
              : t('historial.noDate'),
            arrivalDate: firstDestination?.arrival_date
              ? formatDate(firstDestination.arrival_date)
              : t('historial.noDate'),
          };
        });
        setAllData(mapped);
        setDisplayData(mapped);
      } catch (error) {
        console.error("Error fetching travel records:", error);
      }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchTravelRecords(); }, [fetchTravelRecords]);

  /**
   * FunctionName: Tutorial Management
   * Purpose of the function: Manages the tutorial state by checking if the user has visited the page before. Shows tutorial on first visit.
   * Input: None
   * Output: Updates tutorial state and calls handleVisitPage to mark page as visited
   */
  useEffect(() => {
    const visitedPages = JSON.parse(localStorage.getItem("visitedPages") || "[]");
    const isPageVisited = visitedPages.includes(location.pathname);

    if (!isPageVisited) {
      setTutorial(true);
    }
    return () => handleVisitPage();
  }, []);

  /**
   * FunctionName: handleSearch
   * Purpose of the function: Applies filter criteria to the list of approvals and updates the displayed approvals.
   * Input: filters (FilterValues) - Object containing filter criteria
   * Output: Updates displayData state with filtered results
   */
  const handleSearch = (filters: FilterValues) => {
    setDisplayData(applyFilters(allData, filters));
  };

  /**
   * FunctionName: handleReset
   * Purpose of the function: Resets the displayed approvals to show all records without any filters applied.
   * Input: None
   * Output: Updates displayData state to display all records from allData
   */
  const handleReset = () => {
    setDisplayData(allData);
  };

  return (
    <>
      <Tutorial page="approvals" run={tutorial}>
        <GoBack />
        <div className="flex-1 p-6 bg-[var(--color-card-bg)] rounded-lg shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[var(--color-page-text-title)]">
              {t('approvals.title')}
            </h2>
            <RefreshButton onClick={fetchTravelRecords} />
          </div>

          {/* Filter panel */}
          <FilterPanel onSearch={handleSearch} onReset={handleReset} statusOptions={STATUS_OPTIONS_TO_APPROVE} />

          <div id="list_requests">
            <Table
              columns={columns}
              data={displayData}
              itemsPerPage={5}
              link={"/requests"}
            />
          </div>
        </div>
      </Tutorial>
    </>
  );
};

export default Approvals;
