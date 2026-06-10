/**
 * RefundsReview.tsx
 * Description: Component that displays a table of trip requests awaiting voucher approval by the assigned approver.
 * Authors: Original Monarca team
 * Last Modification made:
 * 04/06/2026 [Sergio Jiawei Xuan] Refactored fetch to useCallback; connected RefreshButton onClick.
 */

import { useEffect, useState, useCallback } from "react";
import Table from "../../components/Refunds/Table";
import RefreshButton from "../../components/RefreshButton";
import formatDate from "../../utils/formatDate";
import formatMoney from "../../utils/formatMoney";
import { toast } from "react-toastify";
import { getRequest } from "../../utils/apiService";
import { useNavigate } from "react-router-dom";
import GoBack from "../../components/GoBack";
import Button from "../../components/Refunds/Button";
import { Tutorial } from "../../components/Tutorial";
import { useApp } from "../../hooks/app/appContext";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";

interface Destination {
  id: string;
  country?: string;
  city?: string;
  iata_code?: string;
}

interface RequestDestination {
  id: string;
  id_destination: string;
  id_request: string;
  destination_order: number;
  stay_days: number;
  arrival_date: string;
  departure_date: string;
  is_hotel_required: boolean;
  is_plane_required: boolean;
  is_last_destination: boolean;
  details: string;
  destination: Destination;
}

interface Trip {
  id: string;
  id_user: string;
  id_origin_city: string;
  id_admin: string;
  id_SOI: string;
  id_travel_agency: string | null;
  title: string;
  motive: string;
  advance_money: number;
  status: string;
  requirements: string;
  priority: string;
  createdAt: string;
  requests_destinations: RequestDestination[];
  destination: Destination;
  date?: string;
  origin?: string;
  formattedAdvance?: string;
  formattedCreatedAt?: string;
  action?: React.ReactNode;
}

/**
 * FunctionName: renderStatus, returns a styled badge based on the request status.
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
  return <span className={`text-xs px-2 py-1 rounded-full font-semibold box-decoration-clone leading-snug ${styles}`}>{statusText}</span>;
}


/**
 * FunctionName: RefundsReview, main component to manage and list requests for final verification.
 * Input: None
 * Output: JSX.Element
 */
export const RefundsReview = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { handleVisitPage, tutorial } = useApp();
  const { t } = useTranslation();

  /**
   * FunctionName: fetchTrips, gets trip requests in Pending Vouchers Approval assigned to the current approver.
   * Input: None
   * Output: Promise<void>
   */
  const fetchTrips = useCallback(async () => {
      try {
        setLoading(true);

        const response = await getRequest("/requests/vouchers-to-approve");

        const processedTrips = response.map((trip: Trip) => {
          const sortedDestinations = [...trip.requests_destinations].sort(
            (a, b) => a.destination_order - b.destination_order
          );

          const firstDestination =
            sortedDestinations.length > 0 ? sortedDestinations[0] : null;

          return {
            ...trip,
            status: trip.status,
            date: firstDestination
              ? formatDate(firstDestination.departure_date)
              : "N/A",
            formattedAdvance: formatMoney(trip.advance_money),
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
            formattedCreatedAt: formatDate(trip.createdAt),
          };
        });

        setTrips(processedTrips);
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
   * FunctionName: Effect to handle tutorial logic and page visit tracking.
   */
  useEffect(() => {
      const visitedPages = JSON.parse(localStorage.getItem("visitedPages") || "[]");
      const isPageVisited = visitedPages.includes(location.pathname);
  
      if (!isPageVisited) {
      }

      handleVisitPage();
    }, []);

  const columnsSchemaTrips = [
    { key: "status",            header: t('refunds.status'),         width: "w-[16%]", render: (value: string) => renderStatus(value, t) },
    { key: "title",             header: t('refunds.trip'),           width: "w-[14%]" },
    { key: "origin",            header: t('refunds.origin'),         width: "w-[10%]" },
    { key: "date",              header: t('refunds.tripDate'),       width: "w-[11%]" },
    { key: "destination",       header: t('refunds.departurePlace'), width: "w-[10%]" },
    { key: "arrivalDate",       header: t('refunds.requestDate'),    width: "w-[11%]" },
    { key: "formattedAdvance",  header: t('refunds.advance'),        width: "w-[10%]" },
    { key: "action",            header: t('historial.details'),      width: "w-[18%]" },
  ];

  if (loading) {
    return (
      <div className="max-w-full p-6 bg-[var(--color-card-bg)] rounded-lg shadow-xl">
        <p className="text-center">{t('refunds.loading')}</p>
      </div>
    );
  }

  const dataWithActions = trips.map((trip) => ({
    id: trip.id,
    title: trip.title,
    status: trip.status,
    date: trip.date,
    origin: trip.origin,
    formattedAdvance: trip.formattedAdvance,
    formattedCreatedAt: trip.formattedCreatedAt,
    action: (
      <Button
        className="bg-[var(--white)] text-[var(--blue)] p-1 rounded-sm cursor-pointer"
        label={t('refunds.viewVouchers')}
        onClickFunction={() => navigate(`/refunds-review/${trip.id}`)}
      />
    ),
  }));

  return (
    <>
    <Tutorial page="refundsReview" run={tutorial}>
      <GoBack />
      <div className="flex-1 p-6 bg-[var(--color-card-bg)] rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[var(--color-page-text-title)]">
            {t('refunds.vouchersAndRefunds')}
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

export default RefundsReview;
