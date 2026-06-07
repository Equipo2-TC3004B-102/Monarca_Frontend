/**
 * FileName: CheckRefunds.tsx
 * Description: Page component that displays trips with pending refunds to be reviewed by authorized personnel.
 * Authors: Original Monarca team
 * Last Modification made:
 * 04/06/2026 [Sergio Jiawei Xuan] Refactored fetch to useCallback; connected RefreshButton onClick.
 */

import { useState, useEffect, useCallback } from "react";
import Table from "../../components/Refunds/Table";
import { getRequest } from "../../utils/apiService";
import Button from "../../components/Refunds/Button";
import { toast } from "react-toastify";
import RefreshButton from "../../components/RefreshButton";
import formatDate from "../../utils/formatDate";
import formatMoney from "../../utils/formatMoney";
import GoBack from "../../components/GoBack";
import { useNavigate } from "react-router-dom";
import { Tutorial } from "../../components/Tutorial";
import { useApp } from "../../hooks/app/appContext";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import FilterPanel, { FilterValues, STATUS_OPTIONS_REFUND_SOI } from "../../components/FilterPanel";

/**
 * Trip
 * Interface to define the structure of a trip object used within the component.
 */

/**
 * FunctionName: renderStatus
 * Purpose of the function: Assigns a styled badge and translated text based on the trip status.
 * Input: status (string) - The status string to render, t (TFunction) - The translation function
 * Output: JSX.Element - A styled span element with the translated status text and appropriate styles
 */
const renderStatus = (status: string, t: TFunction) => {
  let statusText = "";
  let styles = "";
  switch (status) {
    case "Pending Review":      statusText = t('status.pendingReview');      styles = "text-[#55447a] font-bold bg-[#bea8ef]"; break;
    case "Denied":              statusText = t('status.denied');              styles = "text-[#680909] font-bold bg-[#eca6a6]"; break;
    case "Cancelled":           statusText = t('status.cancelled');           styles = "text-[#680909] font-bold bg-[#eca6a6]"; break;
    case "Changes Needed":      statusText = t('status.changesNeeded');       styles = "text-[#755619] font-bold bg-[#f1dbb1]"; break;
    case "Pending Reservations":statusText = t('status.pendingReservations'); styles = "text-[#8c5308] font-bold bg-[#f1c180]"; break;
    case "Pending Accounting Approval": statusText = t('status.pendingAccountingApproval'); styles = "text-[var(--dark-blue)] font-bold bg-[#99b5e3]"; break;
    case "Pending Vouchers Approval":   statusText = t('status.pendingVouchersApproval');   styles = "text-[var(--dark-blue)] font-bold bg-[#c6c4fb]"; break;
    case "In Progress":         statusText = t('status.inProgress');          styles = "text-[#138080] font-bold bg-[#b7f1f1]"; break;
    case "Pending Refund Approval": statusText = t('status.pendingRefundApproval'); styles = "text-[#575107] font-bold bg-[#f0eaa5]"; break;
    case "Completed":           statusText = t('status.completed');           styles = "text-[#24390d] font-bold bg-[#c7e6ab]"; break;
    default:                    statusText = status;                          styles = "text-white bg-[#6c757d]";
  }
  return <span className={`text-xs px-2 py-1 rounded-full box-decoration-clone leading-snug ${styles}`}>{statusText}</span>;
}

/**
 * FunctionName: applyFilters
 * Purpose of the function: Filters an array of trip records based on provided filter criteria including status, motive, dates, and location.
 * Input: data (any[]) - Array of trip objects to filter, filters (FilterValues) - Object containing filter criteria
 * Output: any[] - Filtered array of trip objects matching all criteria
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
    if (filters.departureCity && record.origin !== filters.departureCity) return false;

    return true;
  });
};

/**
 * FunctionName: CheckRefunds
 * Purpose of the function: Main page component for viewing and managing refunds to be checked. Displays trips with pending refunds in a filterable table.
 * Input: None - This is a page component with no props
 * Output: JSX.Element - The rendered page with a table of trips and filter panel
 */
export const CheckRefunds = () => {
  const navigate = useNavigate();
  const [allTrips, setAllTrips] = useState<any[]>([]);
  const [displayTrips, setDisplayTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { handleVisitPage, tutorial, setTutorial } = useApp();
  const { t } = useTranslation();

  /**
   * FunctionName: fetchTrips
   * Purpose of the function: Fetches trip data from the API, maps and formats the response data to match the required structure.
   * Input: None - Uses async function inside useEffect
   * Output: Sets allTrips and displayTrips state with formatted trip data
   */
  const fetchTrips = useCallback(async () => {
      try {
        setLoading(true);
        const response = await getRequest("/requests/refund-to-approve-SOI");
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
            date: firstDestination?.departure_date
              ? formatDate(firstDestination.departure_date)
              : "N/A",
            advance_money: formatMoney(trip.advance_money),
            origin:
              trip.destination?.city ||
              trip.destination?.iata_code ||
              t('historial.noDestination'),
            destination:
              firstDestination?.destination?.city ||
              firstDestination?.destination?.iata_code ||
              t('historial.noDestination'),
            arrivalDate: firstDestination?.arrival_date
              ? formatDate(firstDestination.arrival_date)
              : "N/A",
            createdAt: formatDate(trip.createdAt),
          };
        });
        setAllTrips(mapped);
        setDisplayTrips(mapped);
      } catch (err) {
        toast.error(t('refunds.errorLoading'));

        console.error(
          "Error loading trips: ",
          err instanceof Error ? err.message : err
        );
      } finally {
        setLoading(false);
      }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchTrips(); }, [fetchTrips]);

  /**
   * FunctionName: Tutorial Management
   * Purpose of the function: Manages the tutorial state by checking if the user has visited the page before. Shows tutorial on first visit.
   * Input: None - Reads from localStorage
   * Output: Updates tutorial state and calls handleVisitPage to mark page as visited
   */
  useEffect(() => {
      const visitedPages = JSON.parse(localStorage.getItem("visitedPages") || "[]");
      const isPageVisited = visitedPages.includes(location.pathname);

      if (!isPageVisited) {
        setTutorial(true);
      }
      handleVisitPage();
    }, []);

  /**
   * FunctionName: handleSearch
   * Purpose of the function: Applies filter criteria to the list of trips and updates the displayed trips.
   * Input: filters (FilterValues) - Object containing filter criteria
   * Output: Updates displayTrips state with filtered results
   */
  const handleSearch = (filters: FilterValues) => {
    setDisplayTrips(applyFilters(allTrips, filters));
  };

  /**
   * FunctionName: handleReset
   * Purpose of the function: Resets the displayed trips to show all trips without any filters applied.
   * Input: None
   * Output: Updates displayTrips state to display all trips from allTrips
   */
  const handleReset = () => {
    setDisplayTrips(allTrips);
  };

  const columnsSchemaTrips = [
    { key: "status",        header: t('refunds.status'),         width: "w-[18%]", render: (value: string) => renderStatus(value, t) },
    { key: "title",         header: t('refunds.trip'),           width: "w-[10%]" },
    { key: "origin",        header: t('refunds.origin'),         width: "w-[9%]" },
    { key: "date",          header: t('refunds.tripDate'),       width: "w-[9%]" },
    { key: "destination",   header: t('refunds.departurePlace'), width: "w-[9%]" },
    { key: "arrivalDate",   header: t('refunds.requestDate'),    width: "w-[9%]" },
    { key: "advance_money", header: t('refunds.advance'),        width: "w-[5%]" },
    { key: "action",        header: "",                          width: "w-[11%]" },
  ];

  if (loading) {
    return (
      <div className="max-w-full p-6 bg-[var(--color-card-bg)] rounded-lg shadow-xl">
        <p className="text-center">{t('refunds.loading')}</p>
      </div>
    );
  }

  const dataWithActions = displayTrips.map((trip, index: number) => ({
    ...trip,
    action: (
      <Button
        id={`refund-details-${index}`}
        className="bg-[var(--white)] text-[var(--blue)] p-1 rounded-sm cursor-pointer"
        label={t('refunds.register')}
        onClickFunction={() => navigate(`/requests/${trip.id}`)}
      />
    ),
  }));

  return (
      <>
      <Tutorial page="checkRefunds" run={tutorial}>
        <GoBack />
        <div className="flex-1 p-6 bg-[var(--color-card-bg)] rounded-lg shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[var(--color-page-text-title)]">
                {t('refunds.vouchersToRegister')}
            </h2>
            <RefreshButton onClick={fetchTrips} />
          </div>

          {/* Filter panel */}
          <FilterPanel onSearch={handleSearch} onReset={handleReset} statusOptions={STATUS_OPTIONS_REFUND_SOI} />

          <div id="list_requests">
            <Table
              columns={columnsSchemaTrips}
              data={dataWithActions}
              itemsPerPage={7}
            />
        </div>
          </div>
      </Tutorial>
      </>
  );
};

export default CheckRefunds;
