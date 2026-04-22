/**
 * Refunds.tsx
 * Description: Component displaying a list of active trips where users can submit expense vouchers.
 * Authors: Original Monarca team
 * Last Modification made:
 * 20/04/2026 [Diego de la Vega] Added resilient destination/date fallback mapping
 *                             for request list rendering.
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
 * renderStatus, assigns a styled badge and translated text based on the trip status.
 * Input: status (string) - The raw status string from the database.
 * Output: JSX.Element - A styled span component.
 */
const renderStatus = (status: string) => {
  let statusText = "";
  let styles = "";
  switch (status) {
    case "Pending Review":
      statusText = "En revisión";
      styles = "text-[#55447a] font-bold bg-[#bea8ef]";
      break;
    case "Denied":
      statusText = "Denegado";
      styles = "text-[#680909] font-bold bg-[#eca6a6]";
      break;
    case "Cancelled":
      statusText = "Cancelado";
      styles = "text-[#680909] font-bold bg-[#eca6a6]";
      break;
    case "Changes Needed":
      statusText = "Cambios necesarios";
      styles = "text-[#755619] font-bold bg-[#f1dbb1]";
      break;
    case "Pending Reservations":
      statusText = "Reservas pendientes";
      styles = "text-[#8c5308] font-bold bg-[#f1c180]";
      break;
    case "Pending Accounting Approval":
      statusText = "Contabilidad pendiente";
      styles = "text-[var(--dark-blue)] font-bold bg-[#99b5e3]";
      break;
    case "Pending Vouchers Approval":
      statusText = "Comprobantes pendientes";
      styles = "text-[var(--dark-blue)] font-bold bg-[#c6c4fb]";
      break;
    case "In Progress":
      statusText = "En progreso";
      styles = "text-[#138080] font-bold bg-[#b7f1f1]";
      break;
    case "Pending Refund Approval": 
      statusText = "Reembolso pendiente";
      styles = "text-[#575107] font-bold bg-[#f0eaa5]";
      break;
    case "Completed": 
      statusText = "Completado";
      styles = "text-[#24390d] font-bold bg-[#c7e6ab]";
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
 * Refunds, main component that fetches and lists trips in progress for voucher submission.
 * Input: None
 * Output: JSX.Element - The rendered page with the trips table.
 */
export const Refunds = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { handleVisitPage, tutorial, setTutorial } = useApp();

  /**
   * Fetches all trips from the API and filters those with "In Progress" status.
   * Formats the data for display in the table component.
   */
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);

        const response = await getRequest("/requests/all");
        setTrips(response.filter((trip: Trip) => trip.status === "In Progress").map((trip: any) => {
          const sortedDestinations = [...(trip.requests_destinations || [])].sort(
            (a: any, b: any) => a.destination_order - b.destination_order
          );
          const firstDestination = sortedDestinations[0];

          return {
            ...trip,
            status: renderStatus(trip.status),
            date: firstDestination?.departure_date
              ? formatDate(firstDestination.departure_date)
              : "N/A",
            advance_money: formatMoney(trip.advance_money),
            origin:
              trip.destination?.city ||
              trip.destination?.iata_code ||
              "Destino no disponible",
            createdAt: formatDate(trip.createdAt),
          };
        }));
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
    { key: "status", header: "Estado" },
    { key: "title", header: "Viaje" },
    { key: "date", header: "Fecha del viaje" },
    { key: "origin", header: "Lugar de salida" },
    { key: "advance_money", header: "Anticipo" },
    { key: "createdAt", header: "Fecha de solicitud" },
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
        id={`verify-${index}`}
        className="bg-[var(--white)] text-[var(--blue)] p-1 rounded-sm cursor-pointer"
        label="Verificar"
        onClickFunction={() => navigate(`/refunds/${trip.id}`)}
      />
    ),
  }));

  return (
      <>
      <Tutorial page="refunds" run={tutorial}>
          <GoBack />
          <div className="flex-1 p-6 bg-[#eaeced] rounded-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[var(--blue)]">
                  Comprobar gastos
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

export default Refunds;
