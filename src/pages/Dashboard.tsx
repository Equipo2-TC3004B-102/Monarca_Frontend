/**
 * FileName: Dashboard.tsx
 * Description: Renders the main dashboard page with a grid of mosaics linking to different sections of the application based on user permissions, and includes tutorial logic for first-time visitors.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 06/05/2026 [Sergio Jiawei Xuan] Adjusted mosaic row gap to compensate for updated Mosaic wrapper padding.
 */

import { useEffect } from "react";
import {useApp} from "../hooks/app/appContext";
import { Permission, useAuth } from "../hooks/auth/authContext";
import Mosaic from "../components/Mosaic";
import { Tutorial } from "../components/Tutorial";
import { useTranslation } from "react-i18next";

interface DashboardProps {
  title: string;
}

export const Dashboard = ({title}:DashboardProps) => {
  const { setPageTitle } = useApp();
  const { authState } = useAuth();
  const { handleVisitPage, tutorial, setTutorial } = useApp();
  const { t } = useTranslation();

  // Set the page title when the component mounts
  useEffect(() => {
    setPageTitle(title);
  }, [title, setPageTitle]);

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
    <Tutorial page="dashboard" run={tutorial}>
      <div className="flex flex-col lg:flex-row flex-wrap items-center md:justify-center gap-y-12 gap-x-20 py-10 px-1 ml-0">
        {authState.userPermissions.includes("create_request" as Permission) && (
          <Mosaic title={t('dashboard.createRequest')} iconPath="/assets/crear_solicitud_de_viaje.png" link="/requests/create" id="create-request"/>
        )}
        {authState.userPermissions.includes("view_own_requests" as Permission) && (
          <Mosaic title={t('dashboard.travelHistory')} iconPath="/assets/historial_de_viajes.png" link="/history" id="history"/>
        )}
        {authState.userPermissions.includes("upload_vouchers" as Permission) && (
          <Mosaic title={t('dashboard.checkExpenses')} iconPath="/assets/solicitud_de_reembolso.png" link="/refunds" id="upload_vouchers"/>
        )}
        {authState.userPermissions.includes("approve_request" as Permission) && (
          <Mosaic title={t('dashboard.tripsToApprove')} iconPath="/assets/viajes_por_aprobar.png" link="/approvals" id="approve_request"/>
        )}
        {authState.userPermissions.includes("view_approved_request_history" as Permission) && (
          <Mosaic title={t('dashboard.approvedHistory')} iconPath="/assets/historial_de_viajes_aprobados.png" link="/history" id="approved_requests"/>
        )}
        {authState.userPermissions.includes("approve_vouchers" as Permission) && (
          <Mosaic title={t('dashboard.vouchersToApprove')} iconPath="/assets/comprobantes_de_gastos_por_aprobar.png" link="/refunds-review" id="approve_vouchers"/>
        )}
        {/* {authState.userPermissions.includes("approve_vouchers" as Permission) && (
          <Mosaic title="Reembolsos por aprobar" iconPath="/assets/reembolsos_por_aprobar.png" link=""/>
        )} */}
        {authState.userPermissions.includes("check_budgets" as Permission) && (
          <Mosaic title={t('dashboard.tripsToRegister')} iconPath="/assets/historial_de_reembolsos_aprobados.png" link="/history" id="check_budgets"/>
        )}
        {authState.userPermissions.includes("check_budgets" as Permission) && (
          <Mosaic title={t('dashboard.refundsToRegister')} iconPath="/assets/reembolsos_por_aprobar.png" link="/check-refunds" id="check_refunds"/>
        )}
        {authState.userPermissions.includes("submit_reservations" as Permission) && (
          <Mosaic title={t('dashboard.tripsToBook')} iconPath="/assets/viajes_por_reservar.png" link="/bookings" id="bookings"/>
        )}
        {/* {authState.userPermissions.includes("submit_reservations" as Permission) && (
          <Mosaic title="Formulario de ingreso de reservación" iconPath="/assets/formulario_de_ingreso_de_reservacion.png" link=""/>
        )} */}
        {authState.userPermissions.includes("view_assigned_requests_readonly" as Permission) && authState.userPermissions.includes("submit_reservations" as Permission) && (
          <Mosaic title={t('dashboard.reservedHistory')} iconPath="/assets/historial_de_viajes_reservados.png" link="/history" id="reserved_requests"/>
        )}
        {authState.isSystemAdmin && (
          <Mosaic title={t('dashboard.newCompany')} iconPath="/assets/crear_solicitud_de_viaje.png" link="/admin/companies/new" id="create_company"/>
        )}
        {(authState.isSystemAdmin || authState.isCompanyAdmin) && (
          <Mosaic title={t('dashboard.userList')} iconPath="/assets/viajes_por_aprobar.png" link="/admin/users" id="user_list"/>
        )}
        {authState.isCompanyAdmin && (
          <Mosaic title={t('dashboard.rules')} iconPath="/assets/historial_de_viajes.png" link="/admin/rules" id="rules"/>
        )}
      </div>
    </Tutorial>
  );
};
