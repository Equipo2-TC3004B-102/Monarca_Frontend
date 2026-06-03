/**
 * FileName: Sidebar.tsx
 * Description: Renders the left navigation sidebar with the application logo, user info,
 *              and permission-based navigation links using SidebarOption items.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 27/05/2026 [Julio Rodriguez]: Moved vouchers-and-refunds link from approve_vouchers (SOI) to approve_request (approver).
 */

// ***************** images *****************
import logo from "../assets/logo.png";

// ***************** components *****************
import SidebarOption from "./SiderbarOption";

import { AuthState, Permission } from "../hooks/auth/authContext";
import { useTranslation } from "react-i18next";

import DarkModeButton from "../components/DarkLightButton";

/**
 * FunctionName: Sidebar, renders the aside navigation panel with logo, user details, and role-gated menu links.
 * Input: user - AuthState object containing userName, userLastName, userRole, and userPermissions.
 * Output: JSX aside element with navigation options filtered by user permissions.
 */
function Sidebar({ user, onNavigate }: { user: AuthState, onNavigate?: () => void; }) {
  const { t, i18n } = useTranslation();
  const toggleLanguage = () => {
    const next = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(next);
    localStorage.setItem('language', next);
  };

  const isAdmin = user.isSystemAdmin || user.isCompanyAdmin;
  return (
    <aside
      id="logo-sidebar"
      className="w-[200px] md:w-[250px] h-full pt-10 bg-[var(--color-card-bg)] text-[var(--color-page-text)] transition-colors duration-500"      aria-label="Sidebar"
    >
      <div className="h-full px-3 pb-4 overflow-y-auto">
        <div className="flex items-center bg-[var(--dark-blue)] mb-6 w-[120px] h-[120px] mx-auto p-4 rounded-lg">
            <img src={logo} className="invert mx-auto" alt="Monarca Logo" />
        </div>
        {/* <div className="flex flex-col items-center justify-center mb-6 text-center">
          <p className="text-[var(--color-page-text-title)] font-bold">{user.userName} {user.userLastName} </p>
        </div> */}
        <ul className="space-y-2 font-medium">
            <SidebarOption
              label={t('sidebar.home')}
              pathIcon="/assets/dashboard.png"
              link="/dashboard"
              onClick={onNavigate}
            />
            {!isAdmin && user.userPermissions.includes("create_request" as Permission) && (
              <SidebarOption label={t('sidebar.createRequest')} pathIcon="/assets/crear_solicitud_de_viaje.png" link="/requests/create" onClick={onNavigate}/>
            )}
            {!isAdmin && user.userPermissions.includes("view_own_requests" as Permission) && (
              <SidebarOption label={t('sidebar.travelHistory')} pathIcon="/assets/historial_de_viajes.png" link="/history" onClick={onNavigate}/>
            )}
            {!isAdmin && user.userPermissions.includes("upload_vouchers" as Permission) && (
              <SidebarOption label={t('sidebar.checkExpenses')} pathIcon="/assets/solicitud_de_reembolso.png" link="/refunds" onClick={onNavigate}/>
            )}
            {!isAdmin && user.userPermissions.includes("approve_request" as Permission) && (
              <SidebarOption label={t('sidebar.tripsToApprove')} pathIcon="/assets/viajes_por_aprobar.png" link="/approvals" onClick={onNavigate}/>
            )}
            {!isAdmin && user.userPermissions.includes("view_approved_request_history" as Permission) && (
              <SidebarOption label={t('sidebar.approvalHistory')} pathIcon="/assets/historial_de_viajes_aprobados.png" link="/history?view=approvals" onClick={onNavigate}/>
            )}
            {!isAdmin && user.userPermissions.includes("approve_request" as Permission) && (
              <SidebarOption label={t('sidebar.vouchersAndRefunds')} pathIcon="/assets/comprobantes_de_gastos_por_aprobar.png" link="/refunds-review" onClick={onNavigate}/>
            )}
            {!isAdmin && user.userPermissions.includes("check_budgets" as Permission) && (
              <SidebarOption label={t('sidebar.tripsToRegister')} pathIcon="/assets/historial_de_reembolsos_aprobados.png" link="/history?view=soi" onClick={onNavigate}/>
            )}
            {!isAdmin && user.userPermissions.includes("check_budgets" as Permission) && (
              <SidebarOption label={t('sidebar.vouchersToRegister')} pathIcon="/assets/reembolsos_por_aprobar.png" link="/check-refunds" onClick={onNavigate}/>
            )}
            {!isAdmin && user.userPermissions.includes("check_budgets" as Permission) && (
              <SidebarOption label={t('sidebar.accountingExport')} pathIcon="/assets/historial_de_reembolsos_aprobados.png" link="/accounting/export" onClick={onNavigate}/>
            )}
            {!isAdmin && user.userPermissions.includes("submit_reservations" as Permission) && (
              <SidebarOption label={t('sidebar.tripsToBook')} pathIcon="/assets/viajes_por_reservar.png" link="/bookings" onClick={onNavigate}/>
            )}
            {/* {user.userPermissions.includes("submit_reservations" as Permission) && (
              <SidebarOption label="Formulario de ingreso de reservación" pathIcon="/assets/formulario_de_ingreso_de_reservacion.png" link=""/>
            )} */}
            {!isAdmin && user.userPermissions.includes("view_travel_agent_history" as Permission) && (
              <SidebarOption label={t('sidebar.reservedHistory')} pathIcon="/assets/historial_de_viajes_reservados.png" link="/history" onClick={onNavigate}/>
            )}
            {user.isSystemAdmin && (
              <SidebarOption label={t('sidebar.newCompany')} pathIcon="/assets/crear_solicitud_de_viaje.png" link="/admin/companies/new" onClick={onNavigate}/>
            )}
            {(user.isSystemAdmin || user.isCompanyAdmin) && (
              <SidebarOption label={t('sidebar.userList')} pathIcon="/assets/viajes_por_aprobar.png" link="/admin/users" onClick={onNavigate}/>
            )}
            {user.isCompanyAdmin && (
              <SidebarOption label={t('sidebar.rules')} pathIcon="/assets/historial_de_viajes.png" link="/admin/rules" onClick={onNavigate}/>
            )}
            {user.isCompanyAdmin && (
              <SidebarOption label={t('sidebar.notifications')} pathIcon="/assets/crear_solicitud_de_viaje.png" link="/admin/notifications" onClick={onNavigate}/>
            )}
            {user.isCompanyAdmin && (
              <SidebarOption label={t('sidebar.auditLogs')} pathIcon="/assets/historial_de_viajes.png" link="/admin/audit-logs" onClick={onNavigate}/>
            )}
            {user.isCompanyAdmin && (
              <SidebarOption label={t('sidebar.companyRequests')} pathIcon="/assets/historial_de_viajes.png" link="/admin/company-requests" onClick={onNavigate}/>
            )}
        </ul>
        <div className="flex gap-7 items-center p-2 mt-10">
            <DarkModeButton className="block md:hidden"></DarkModeButton>
            <button
              type="button"
              title={i18n.language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
              onClick={toggleLanguage}
              className="block md:hidden hover:scale-110 transition-transform mt-3"
            >
              <img
                src={i18n.language === 'es' ? '/assets/flag_es.svg' : '/assets/flag_gb.svg'}
                alt={i18n.language === 'es' ? 'Español' : 'English'}
                className="w-12 h-8 rounded-sm object-cover shadow-sm"
              />
            </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;