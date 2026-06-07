/**
 * FileName: Refunds.tsx
 * Description: Component displaying a list of active trips where users can submit expense vouchers.
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

/**
 * Trip
 * Interface that represents the structure of a trip record from the backend.
 */
interface Trip {
  id: number | string;
  tripName: string;
  amount: number;
  date: string;
  destination: string;
  requestDate: string;
  status: string;
}

/**
 * FunctionName: renderStatus, assigns a styled badge and translated text based on the trip status.
 * Input: status (string) - The raw status string from the database, t (TFunction) - The translation function
 * Output: JSX.Element - A styled span component.
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
  return <span className={`text-xs px-2 py-1 rounded-full inline-block leading-tight ${styles}`}>{statusText}</span>;
}

/**
 * FunctionName: Refunds, Main component that fetches and lists trips in progress for voucher submission.
 * Input: None
 * Output: JSX.Element - The rendered page with the trips table.
 */
export const Refunds = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { handleVisitPage, tutorial, setTutorial } = useApp();
  const { t } = useTranslation();

  /**
   * Fetches all trips from the API and filters those with "In Progress" status.
   * Formats the data for display in the table component.
   */
  const fetchTrips = useCallback(async () => {
      try {
        setLoading(true);

        const response = await getRequest("/requests/user");
        setTrips(response.filter((trip: Trip) => trip.status === "In Progress").map((trip: any) => {
          const sortedDestinations = [...(trip.requests_destinations || [])].sort(
            (a: any, b: any) => a.destination_order - b.destination_order
          );
          const firstDestination = sortedDestinations[0];

          return {
            ...trip,
            status: trip.status,
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
          };
        }));
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
   * Check if the user has visited the page before to trigger the tutorial.
   */
  useEffect(() => {
      const visitedPages = JSON.parse(localStorage.getItem("visitedPages") || "[]");
      const isPageVisited = visitedPages.includes(location.pathname);
  
      if (!isPageVisited) {
        setTutorial(true);
      }
      handleVisitPage();
    }, []);

  const columnsSchemaTrips = [
    { key: "status",        header: t('refunds.status'),         width: "w-[20%]", render: (value: string) => renderStatus(value, t) },
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

  const dataWithActions = trips.map((trip, index: number) => ({
    ...trip,
    action: (
      <Button
        id={`verify-${index}`}
        className="bg-[var(--white)] text-[var(--blue)] p-1 rounded-sm cursor-pointer"
        label={t('refunds.verify')}
        onClickFunction={() => navigate(`/refunds/${trip.id}`)}
      />
    ),
  }));

  return (
      <>
      <Tutorial page="refunds" run={tutorial}>
          <GoBack />
          <div className="flex-1 p-6 bg-[var(--color-card-bg)] rounded-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[var(--color-page-text-title)]">
                  {t('refunds.checkExpenses')}
              </h2>
              <RefreshButton onClick={fetchTrips} />
            </div>

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

export default Refunds;
