/**
 * FileName: Bookings.tsx
 * Description: Bookings page that lists travel requests pending reservation. Fetches data 
 * from the API, formats and enriches each row (status badge, destination, departure date), 
 * and provides navigation to the reservation flow.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 04/06/2026 [Sergio Jiawei Xuan] Refactored fetch to useCallback; connected RefreshButton onClick.
 */

import { useEffect, useState, useCallback } from "react";
import RefreshButton from "../components/RefreshButton";
import Table from "../components/Refunds/Table";
import { getRequest } from "../utils/apiService";
import formatDate from "../utils/formatDate";
import { Link } from "react-router-dom";
import GoBack from "../components/GoBack";
import { Tutorial } from "../components/Tutorial";
import { useApp } from "../hooks/app/appContext";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";

/**
 * columns, defines the table columns used by the Table component on the Bookings page.
 * Input: N/A
 * Output: Array<{ key: string; header: string }> - Configuration for table rendering.
 */
// columns defined inside component to react to language changes

/**
 * renderStatus, maps backend status strings to a Spanish label and corresponding UI styles.
 * Input:
 * - status (string): Status value returned by the backend for a travel request.
 * Output: JSX.Element - A styled <span> badge showing the translated status.
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
  return (
    <span className={`text-xs p-1 rounded-sm ${styles}`}>{statusText}</span>
  );
};

/**
 * Bookings, renders the "Viajes por Reservar" page.
 * Input: None.
 * Output: JSX.Element - Page layout including table of trips pending reservation, refresh button, and tutorial wrapper.
 *
 * Business logic:
 * - On mount, fetches trips from "/requests/to-reserve".
 * - Enriches each trip with UI-specific fields:
 *   - status badge (renderStatus)
 *   - country (destination city or fallback label)
 *   - departureDate (first destination departure date or fallback label)
 *   - action link to booking details
 * - Triggers tutorial logic based on visited pages stored in localStorage.
 */
const Bookings = () => {
  const [dataWithActions, setDataWithActions] = useState([]);
  const { handleVisitPage, tutorial, setTutorial } = useApp();
  const { t } = useTranslation();

  const columns = [
    { key: "status", header: t('bookings.status'), render: (value: string) => renderStatus(value, t) },
    { key: "title", header: t('bookings.trip') },
    { key: "country", header: t('bookings.departurePlace') },
    { key: "departureDate", header: t('bookings.departureDate') },
    { key: "action", header: "" },
  ];

  /**
   * Fetch travel records that are pending reservation and transform them to a table-friendly format.
   * Input: None.
   * Output: Promise<void> - Updates local state with enriched data.
   */
  const fetchTravelRecords = useCallback(async () => {
      try {
        const response = await getRequest("/requests/to-reserve");
        setDataWithActions(
          response.map((trip: any) => {
            const sortedDestinations = [...(trip.requests_destinations || [])].sort(
              (a: any, b: any) => a.destination_order - b.destination_order
            );
            const firstDestination = sortedDestinations[0];

            return {
              ...trip,
              status: trip.status,
              country:
                trip.destination?.city ||
                trip.destination?.iata_code ||
                t('historial.noDestination'),
              departureDate: firstDestination?.departure_date
                ? formatDate(firstDestination.departure_date)
                : t('historial.noDate'),
              action: (
                <Link
                  to={`/bookings/${trip.id}`}
                  className="bg-[var(--white)] text-[var(--blue)] p-1 rounded-sm cursor-pointer"
                >
                  {t('bookings.reserve')}
                </Link>
              ),
            };
          })
        );
      } catch (error) {
        console.error("Error fetching travel records:", error);
      }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchTravelRecords(); }, [fetchTravelRecords]);

  /**
   * Tutorial onboarding logic:
   * - Reads visited pages from localStorage.
   * - If current path was not visited, enables tutorial.
   * - Stores the current page as visited through handleVisitPage().
   * Input: None.
   * Output: void - Updates tutorial state and localStorage tracking.
   */
  useEffect(() => {
      // Get the visited pages from localStorage
      const visitedPages = JSON.parse(localStorage.getItem("visitedPages") || "[]");
      // Check if the current page is already in the visited pages
      const isPageVisited = visitedPages.includes(location.pathname);
  
      // If the page is not visited, set the tutorial to true
      if (!isPageVisited) {
        setTutorial(true);
      }
      // Add the current page to the visited pages
      handleVisitPage();
    }, []);

  return (
    <>
    <Tutorial page="bookings" run={tutorial}>
      <GoBack />
      <div className="flex-1 p-6 bg-[var(--color-card-bg)] rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[var(--color-page-text-title)]">
            {t('bookings.title')}
          </h2>
          <RefreshButton onClick={fetchTravelRecords} />
        </div>

        <div id="list_requests">
          <Table columns={columns} data={dataWithActions} itemsPerPage={5} />
        </div>
      </div>
    </Tutorial>
    </>
  );
};

export default Bookings;