/**
 * CheckRefunds.tsx
 * Description: Page component that displays trips with pending refunds to be reviewed by authorized personnel.
 * Authors: Original Monarca team
 * Last Modification made:
 * 04/05/2026 [Rebeca-Davila] Changed colors for dark mode
 */

import { useState, useEffect } from "react";
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
 * Interface to define the structure of a trip object used within the component.
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
 * renderStatus, assigns a styled badge and translated text based on the trip status.
 * Input: status (string)
 * Output: JSX.Element
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
  return <span className={`text-xs px-2 py-1 rounded-sm box-decoration-clone leading-snug ${styles}`}>{statusText}</span>;
}

/**
 * CheckRefunds, main page component for viewing and managing refunds to be checked.
 * Input: None
 * Output: JSX.Element - The rendered page with a table of trips.
 */
export const CheckRefunds = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { handleVisitPage, tutorial, setTutorial } = useApp();
  const { t } = useTranslation();

  /**
   * useEffect hook to fetch trip data from the API on component mount.
   * Maps and formats the response data to match the Trip interface.
   */
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const response = await getRequest("/requests/refund-to-approve-SOI");
        setTrips(response.map((trip: any) => {
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
            createdAt: formatDate(trip.createdAt),
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
    };
    fetchTrips();
  }, []);

  /**
   * useEffect hook to manage the tutorial state based on whether the user has visited the page before.
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
    { key: "status",        header: t('refunds.status'),         width: "w-[22%]", render: (value: string) => renderStatus(value, t) },
    { key: "title",         header: t('refunds.trip'),           width: "w-[16%]" },
    { key: "date",          header: t('refunds.tripDate'),       width: "w-[12%]" },
    { key: "origin",        header: t('refunds.departurePlace'), width: "w-[13%]" },
    { key: "advance_money", header: t('refunds.advance'),        width: "w-[5%]" },
    { key: "createdAt",     header: t('refunds.requestDate'),    width: "w-[21%]" },
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
            <RefreshButton />
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

export default CheckRefunds;
