/**
 * CheckRefunds.tsx
 * Description: Page component that displays trips with pending refunds to be reviewed by authorized personnel.
 * Authors: Original Monarca team
 * Last Modification made:
 * 25/02/2026 [Diego Ortega] Added Specified Format.
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
 * CheckRefunds, main page component for viewing and managing refunds to be checked.
 * Input: None
 * Output: JSX.Element - The rendered page with a table of trips.
 */
export const CheckRefunds = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { handleVisitPage, tutorial, setTutorial } = useApp();

  /**
   * useEffect hook to fetch trip data from the API on component mount.
   * Maps and formats the response data to match the Trip interface.
   */
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const response = await getRequest("/requests/refund-to-approve-SOI");
        setTrips(response.map((trip: any) => ({
          ...trip,
          status: renderStatus(trip.status),
          date: formatDate(trip.requests_destinations.sort((a: any, b: any) => a.destination_order - b.destination_order)[0].departure_date),
          advance_money: formatMoney(trip.advance_money),
          origin: trip.destination.city,
          createdAt: formatDate(trip.createdAt),
        })));
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
    { key: "status", header: "Status" },
    { key: "title", header: "Trip Name" },
    { key: "date", header: "Travel Date" },
    { key: "origin", header: "Departure Location" },
    { key: "advance_money", header: "Advance" },
    { key: "createdAt", header: "Request Date" },
    { key: "action", header: "" },
  ];
  
  if (loading) {
    return (
      <div className="max-w-full p-6 bg-[#eaeced] rounded-lg shadow-xl">
        <p className="text-center">Loading trip data...</p>
      </div>
    );
  }

  const dataWithActions = trips.map((trip, index: number) => ({
    ...trip,
    action: (
      <Button
        id={`refund-details-${index}`}
        className="bg-[var(--white)] text-[var(--blue)] p-1 rounded-sm"
        label="Register"
        onClickFunction={() => navigate(`/requests/${trip.id}`)}
      />
    ),
  }));

  return (
      <>
      <Tutorial page="checkRefunds" run={tutorial}>
        <GoBack />
        <div className="flex-1 p-6 bg-[#eaeced] rounded-lg shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[var(--blue)]">
                Trips with refunds to review
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
