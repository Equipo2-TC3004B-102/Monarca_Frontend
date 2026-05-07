/**
 * FileName: Approvals.tsx
 * Description: Approvals page component, which displays a list of approvals and allows users to approve or reject them.
 * Authors: Original Monarca team
 * Last Modification made:
 * 20/04/2026 [Diego de la Vega] Added destination/date fallback rendering for requests with partial destination payloads.
 */
import React, { useEffect, useState } from "react";
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
      <span className={`text-xs p-1 rounded-sm ${styles}`}>
        {statusText}
      </span>
    )
}

/**
 * FunctionName: Approvals
 * Purpose of the function: to display the approvals page.
 * Input: none
 * Output: none
 * Author: Original Moncarca team
 * Last Modification made: original Moncarca team
 */
export const Approvals: React.FC = () => {
  const [dataWithActions, setDataWithActions] = useState([]);
  const location = useLocation();
  const { handleVisitPage, tutorial, setTutorial } = useApp();
  const { t } = useTranslation();

  const columns = [
    { key: "status", header: t('approvals.status'), render: (value: string) => renderStatus(value, t) },
    { key: "motive", header: t('approvals.trip') },
    { key: "title", header: t('approvals.motive') },
    { key: "departureDate", header: t('approvals.departureDate') },
    { key: "country", header: t('approvals.departurePlace') },
  ];

  // Fetch travel records data from API
  useEffect(() => {
    const fetchTravelRecords = async () => {
      try {
        const response = await getRequest("/requests/to-approve");
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
            };
          })
        );
      } catch (error) {
        console.error("Error fetching travel records:", error);
      }
    };

    fetchTravelRecords();
  }, []);

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
    return () => handleVisitPage();
  }, []);
    

  return (
    <>
      <Tutorial page="approvals" run={tutorial}>
        <GoBack />
        <div className="flex-1 p-6 bg-[#eaeced] rounded-lg shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[var(--blue)]">
              {t('approvals.title')}
            </h2>
            <RefreshButton />
          </div>

          <div id="list_requests">
            <Table
              columns={columns}
              data={dataWithActions}
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
