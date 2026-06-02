/**
 * FileName: Dashboard.tsx
 * Description: Renders the main dashboard page with a grid of mosaics linking to different sections of the application based on user permissions, and includes tutorial logic for first-time visitors.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 19/05/2026 [Julio Rodriguez]: Hide travel history mosaic for admin users; use view_travel_agent_history for TA history mosaic; add notifications mosaic for company admins only.
 */

import { useEffect } from "react";
import { useApp } from "../hooks/app/appContext";
import { Permission, useAuth } from "../hooks/auth/authContext";
import Mosaic from "../components/Mosaic";
import { Tutorial } from "../components/Tutorial";
import { useTranslation } from "react-i18next";

interface DashboardProps {
  title: string;
}

export const Dashboard = ({ title }: DashboardProps) => {
  const { setPageTitle } = useApp();
  const { authState } = useAuth();
  const { handleVisitPage, tutorial, setTutorial } = useApp();
  const { t } = useTranslation();
  const isAdmin = authState.isSystemAdmin || authState.isCompanyAdmin;

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
      <div
        className="relative -mx-10 -mt-10 -mb-10 px-10 pt-10 pb-16 min-h-full overflow-hidden"
        style={{
          fontFamily: "Montserrat, sans-serif",
          background:
            "linear-gradient(135deg, #00296b 0%, #0466cb 28%, #4d9aff 55%, #cfe2ff 78%, #ffffff 100%)",
        }}
      >
        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .anim-fade { animation: fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) backwards; }
        `}</style>

        {/* Wave layers */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
          viewBox="0 0 1440 900"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,520 C240,440 480,640 720,560 C960,480 1200,620 1440,540 L1440,900 L0,900 Z"
            fill="rgba(255,255,255,0.18)"
          />
          <path
            d="M0,640 C300,560 540,740 800,660 C1060,580 1240,720 1440,660 L1440,900 L0,900 Z"
            fill="rgba(255,255,255,0.35)"
          />
          <path
            d="M0,760 C260,700 520,840 800,780 C1080,720 1260,820 1440,780 L1440,900 L0,900 Z"
            fill="rgba(255,255,255,0.6)"
          />
          <path
            d="M0,300 C200,260 380,360 600,320 C820,280 1040,360 1240,310 C1340,290 1400,310 1440,300 L1440,0 L0,0 Z"
            fill="rgba(255,255,255,0.06)"
          />
        </svg>

        {/* Header */}
        <div
          className="relative z-10 mb-12 anim-fade"
          style={{ animationDelay: "0.05s" }}
        >
          <span
            className="text-white/80 text-[0.7rem] tracking-[0.35em] uppercase block mb-3"
            style={{ fontWeight: 600 }}
          >
            {t("dashboard.panelTitle", "Panel principal")}
          </span>
          <h1
            className="text-white text-[2.25rem] lg:text-[2.75rem] leading-[1.05]"
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            {t("dashboard.welcome", "Bienvenido")},{" "}
            <span style={{ color: "#cfe2ff" }}>
              {authState?.userName || t("dashboard.traveler", "viajero")}
            </span>
          </h1>
          <p className="text-white/70 text-sm mt-3 max-w-xl">
            {t("dashboard.subtitle", "Selecciona una sección para continuar con tus gestiones de viaje.")}
          </p>
        </div>

        {/* Mosaic grid */}
        <div
          className="relative z-10 flex flex-col lg:flex-row flex-wrap items-center md:justify-center gap-y-16 gap-x-10 anim-fade"
          style={{ animationDelay: "0.2s" }}
        >
          {!isAdmin && authState.userPermissions.includes("create_request" as Permission) && (
            <Mosaic title={t('dashboard.createRequest')} iconPath="/assets/crear_solicitud_de_viaje.png" link="/requests/create" id="create-request"/>
          )}
          {!isAdmin && authState.userPermissions.includes("view_own_requests" as Permission) && (
            <Mosaic title={t('dashboard.travelHistory')} iconPath="/assets/historial_de_viajes.png" link="/history" id="history"/>
          )}
          {!isAdmin && authState.userPermissions.includes("upload_vouchers" as Permission) && (
            <Mosaic title={t('dashboard.checkExpenses')} iconPath="/assets/solicitud_de_reembolso.png" link="/refunds" id="upload_vouchers"/>
          )}
          {!isAdmin && authState.userPermissions.includes("approve_request" as Permission) && (
            <Mosaic title={t('dashboard.tripsToApprove')} iconPath="/assets/viajes_por_aprobar.png" link="/approvals" id="approve_request"/>
          )}
          {!isAdmin && authState.userPermissions.includes("view_approved_request_history" as Permission) && (
            <Mosaic title={t('dashboard.approvedHistory')} iconPath="/assets/historial_de_viajes_aprobados.png" link="/history?view=approvals" id="approved_requests"/>
          )}
          {!isAdmin && authState.userPermissions.includes("approve_vouchers" as Permission) && (
            <Mosaic title={t('dashboard.vouchersToApprove')} iconPath="/assets/comprobantes_de_gastos_por_aprobar.png" link="/refunds-review" id="approve_vouchers"/>
          )}
          {!isAdmin && authState.userPermissions.includes("check_budgets" as Permission) && (
            <Mosaic title={t('dashboard.tripsToRegister')} iconPath="/assets/historial_de_reembolsos_aprobados.png" link="/history?view=soi" id="check_budgets"/>
          )}
          {!isAdmin && authState.userPermissions.includes("check_budgets" as Permission) && (
            <Mosaic title={t('dashboard.refundsToRegister')} iconPath="/assets/reembolsos_por_aprobar.png" link="/check-refunds" id="check_refunds"/>
          )}
          {!isAdmin && authState.userPermissions.includes("check_budgets" as Permission) && (
            <Mosaic title={t('dashboard.accountingExport')} iconPath="/assets/historial_de_reembolsos_aprobados.png" link="/accounting/export" id="accounting_export"/>
          )}
          {!isAdmin && authState.userPermissions.includes("submit_reservations" as Permission) && (
            <Mosaic title={t('dashboard.tripsToBook')} iconPath="/assets/viajes_por_reservar.png" link="/bookings" id="bookings"/>
          )}
          {!isAdmin && authState.userPermissions.includes("view_travel_agent_history" as Permission) && (
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
          {authState.isCompanyAdmin && (
            <Mosaic title={t('dashboard.notifications')} iconPath="/assets/crear_solicitud_de_viaje.png" link="/admin/notifications" id="notifications"/>
          )}
        </div>
      </div>
    </Tutorial>
  );
};
