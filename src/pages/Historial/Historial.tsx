/**
 * FileName: Historial.tsx
 * Description: This file contains the Historial component used in the Refunds section of the application.
 * It provides a customizable history page with travel records and related actions.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 13/05/2026 [Julio Rodriguez] Tied history filters to their endpoint instead of user permissions to prevent
 *                              null crash on travel_agency and incorrect filtering for multi-role users.
 */

import Table from "../../components/Refunds/Table";
import { useState, useEffect } from "react";
import { getRequest } from "../../utils/apiService";
import formatDate from "../../utils/formatDate";
import { Permission, useAuth } from "../../hooks/auth/authContext";
import RefreshButton from "../../components/RefreshButton";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Refunds/Button";
import GoBack from "../../components/GoBack";
import { Tutorial } from "../../components/Tutorial";
import { useApp } from "../../hooks/app/appContext";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";

/**
 * renderStatus, converts API status strings to localized display text with appropriate styling.
 * Input: status (string)
 * Output: JSX element - styled status badge
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
      <span className={`text-xs p-1 rounded-sm box-decoration-clone leading-snug ${styles}`}>
        {statusText}
      </span>
    )
}

/**
 * Historial, displays a paginated table of travel request history with status indicators, filtering by user permissions, and detailed action buttons.
 * Input: none
 * Output: JSX element - complete travel history page with table and tutorial overlay
 */
export const Historial = () => {
  // State to store travel records with formatted data and action buttons
  const [dataWithActions, setDataWithActions] = useState([]);
  const { authState } = useAuth();
  const navigate = useNavigate();
  const { handleVisitPage, tutorial, setTutorial } = useApp();
  const { t } = useTranslation();

  /**
   * Fetches travel records from API with permission-based filtering and formats data for display.
   * Input: none
   * Output: void (updates dataWithActions state)
   */
  // Fetch travel records data from API
  useEffect(() => {
    const fetchTravelRecords = async () => {
      try {
        const endpoint =
          authState.userPermissions.includes("view_own_requests" as Permission)
            ? "/requests/user"
            : authState.userPermissions.includes("check_budgets" as Permission)
            ? "/requests/to-approve-SOI"
            : authState.userPermissions.includes("view_approved_request_history" as Permission)
            ? "/requests/approved-history"
            : "/requests/all"
        let response = await getRequest(endpoint);
        if (endpoint === "/requests/approved-history") {
          response = response.filter((record: any) => !["Pending Review", "Denied", "Cancelled"].includes(record.status) && record.id_admin === authState.userId);
        }
        if (endpoint === "/requests/all") {
          const travelAgentsIds = response.flatMap((request: any) => (request.travel_agency?.users ?? []).map((user: any) => user.id));
          response = response.filter((record: any) => !["Pending Review", "Denied", "Cancelled", "Changes Needed", "Pending Reservations"].includes(record.status) && travelAgentsIds.includes(authState.userId));
        }
        if (endpoint === "/requests/to-approve-SOI") {
          response = response.filter((record: any) => ["Pending Accounting Approval"].includes(record.status) && record.id_SOI === authState.userId);
        }
        // Data with actions (edit buttons)
        setDataWithActions(response?.map((record: any, index: number) => {
          const sortedDestinations = [...(record.requests_destinations || [])].sort(
            (a: any, b: any) => a.destination_order - b.destination_order
          );
          const firstDestination = sortedDestinations[0];

          return {
            ...record,
            status: record.status,
            createdAt: formatDate(record.createdAt),
            country:
              record.destination?.city ||
              record.destination?.iata_code ||
              t('historial.noDestination'),
            departureDate: firstDestination?.departure_date
              ? formatDate(firstDestination.departure_date)
              : t('historial.noDate'),
            index,
            action: record.id,
          };
        }));
        //   action: record.status == "Changes Needed" && (
        //     <Button
        //       label="Editar"
        //       onClickFunction={() => {
        //         navigate(`/requests/${record.id}/edit`);
        //       }}
        //     />
        //   ),
        // })));
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

  // Columns schema for travel history table
  const columnsSchema = [
    { key: "status", header: t('historial.status'), render: (value: string) => renderStatus(value, t) },
    { key: "title", header: t('historial.trip') },
    { key: "motive", header: t('historial.motive') },
    { key: "departureDate", header: t('historial.departureDate') },
    { key: "country", header: t('historial.departurePlace') },
    { key: "createdAt", header: t('historial.requestDate') },
    { key: "action", header: t('historial.details'), render: (id: string) => (
      <Button
        className="bg-[var(--white)] text-[var(--blue)] p-1 rounded-sm cursor-pointer"
        label={t('historial.viewDetails')}
        onClickFunction={() => navigate(`/requests/${id}`)}
      />
    )},
  ];

  return (
    <>
    <Tutorial page="history" run={tutorial}>
        <GoBack />
        <div className="max-w-full p-6 bg-[#eaeced] rounded-lg shadow-xl">
          <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[#0a2c6d]">
                {t('historial.title')}
              </h2>
              <RefreshButton />
          </div>

          {/* Travel history table component */}
          <div id="list_requests">
            <Table columns={columnsSchema} data={dataWithActions} itemsPerPage={5} />
          </div>
        </div>
      </Tutorial>
    </>
  );
};

export default Historial;
