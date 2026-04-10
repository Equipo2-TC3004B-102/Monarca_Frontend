/**
 * RefundsReview.tsx
 * Description: Component that displays a table of trip requests awaiting final voucher approval by an administrator.
 * Authors: Original Monarca team
 * Last Modification made:
 * 25/02/2026 [Diego Ortega] Added specified format.
 */

import { useEffect, useState } from "react";
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

interface Destination {
  id: string;
  country: string;
  city: string;
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
 * renderStatus, returns a styled badge based on the request status.
 * Input: status (string)
 * Output: JSX.Element
 */
const renderStatus = (status: string) => {
  let statusText = "";
  let styles = "";
  switch (status) {
    case "Pending Review":
      statusText = "Under Review";
      styles = "text-[#55447a] bg-[#bea8ef]";
      break;
    case "Denied":
      statusText = "Denied";
      styles = "text-[#680909] bg-[#eca6a6]";
      break;
    case "Cancelled":
      statusText = "Cancelled";
      styles = "text-[#680909] bg-[#eca6a6]";
      break;
    case "Changes Needed":
      statusText = "Changes Needed";
      styles = "text-[#755619] bg-[#f1dbb1]";
      break;
    case "Pending Reservations":
      statusText = "Pending Reservations";
      styles = "text-[#8c5308] bg-[#f1c180]";
      break;
    case "Pending Accounting Approval":
      statusText = "Pending Accounting Approval";
      styles = "text-[var(--dark-blue)] bg-[#99b5e3]";
      break;
    case "Pending Vouchers Approval":
      statusText = "Pending Vouchers Approval";
      styles = "text-[var(--dark-blue)] bg-[#c6c4fb]";
      break;
    case "In Progress":
      statusText = "In Progress";
      styles = "text-[var(--dark-blue)] bg-[#b7f1f1]";
      break;
    case "Pending Refund Approval": 
      statusText = "Pending Refund Approval";
      styles = "text-[#575107] bg-[#f0eaa5]";
      break;
    case "Completed": 
      statusText = "Completed";
      styles = "text-[#24390d] bg-[#c7e6ab]";
      break;
    default:
      statusText = status;
      styles = "text-white bg-[#6c757d]";
    }
    return (
      <span className={`text-xs p-1 rounded-sm ${styles}`}>
        {statusText}
      </span>
    )
}


/**
 * RefundsReview, main component to manage and list requests for final verification.
 * Input: None
 * Output: JSX.Element
 */
export const RefundsReview = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { handleVisitPage, tutorial } = useApp();

  /**
   * fetchTrips, gets all trip requests and filters those awaiting voucher approval.
   * Input: None
   * Output: Promise<void>
   */
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);

        const response = await getRequest("/requests/all");

        const processedTrips = response.filter((trip: Trip) => trip.status === "Pending Vouchers Approval").map((trip: Trip) => {
          const sortedDestinations = [...trip.requests_destinations].sort(
            (a, b) => a.destination_order - b.destination_order
          );

          const firstDestination =
            sortedDestinations.length > 0 ? sortedDestinations[0] : null;

          return {
            ...trip,
            status: renderStatus(trip.status),
            date: firstDestination
              ? formatDate(firstDestination.departure_date)
              : "N/A",
            formattedAdvance: formatMoney(trip.advance_money),
            origin: trip.destination.city,
            formattedCreatedAt: formatDate(trip.createdAt),
          };
        });

        setTrips(processedTrips);
      } catch (err) {
        toast.error(
          "Error loading trips. Please try again later."
        );

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
   * Effect to handle tutorial logic and page visit tracking.
   */
  useEffect(() => {
      const visitedPages = JSON.parse(localStorage.getItem("visitedPages") || "[]");
      const isPageVisited = visitedPages.includes(location.pathname);
  
      if (!isPageVisited) {
      }

      handleVisitPage();
    }, []);

  const columnsSchemaTrips = [
    { key: "status", header: "Status" },
    { key: "title", header: "Trip Name" },
    { key: "date", header: "Travel Date" },
    { key: "origin", header: "Departure Location" },
    { key: "formattedAdvance", header: "Advance Payment" },
    { key: "formattedCreatedAt", header: "Request Date" },
    { key: "action", header: "" },
  ];

  if (loading) {
    return (
      <div className="max-w-full p-6 bg-[#eaeced] rounded-lg shadow-xl">
        <p className="text-center">Loading trip data...</p>
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
        className="bg-[var(--white)] text-[var(--blue)] p-1 rounded-sm"
        label="See vouchers"
        onClickFunction={() => navigate(`/refunds-review/${trip.id}`)}
      />
    ),
  }));

  return (
    <>
    <Tutorial page="refundsReview" run={tutorial}>
      <GoBack />
      <div className="flex-1 p-6 bg-[#eaeced] rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[var(--blue)]">
            Refund Requests to be Approved
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

export default RefundsReview;
