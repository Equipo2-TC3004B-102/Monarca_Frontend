/**
 * main.tsx
 * Description: Frontend application entry point. Initializes the React root,
 * configures React Router routes (public and protected), and sets up TanStack Query provider for server state management.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 19/05/2026 [Julio Rodriguez] Updated admin guard for notifications page to be company-admin only; added new routes for notifications management and travel agent history; integrated new permissions and flags into route protection logic.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import './i18n/i18n';

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CreateTravelRequest from "./pages/CreateTravelRequest.tsx";
import EditTravelRequest from "./pages/EditTravelRequest.tsx";
import AdminUsers from "./pages/Admin/AdminUsers.tsx";
import AdminRules from "./pages/Admin/AdminRules.tsx";
import AdminNewCompany from "./pages/Admin/AdminNewCompany.tsx";
import AdminNotifications from "./pages/Admin/AdminNotifications.tsx";

import {
  ProtectedRoute,
  PermissionProtectedRoute,
  FlagProtectedRoute,
} from "./hooks/auth/authContext";
import "flowbite";

// ******************* Styles ******************
import "./index.css";
import "./App.css";

// ****************** Pages ******************
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import Error from "./pages/Error.tsx";
import Historial from "./pages/Historial/Historial.tsx";
import Bookings from "./pages/Bookings.tsx";
import { Refunds } from "./pages/Refunds/Refunds.tsx";
import { Vouchers } from "./pages/Refunds/Vouchers.tsx";
import Reservations from "./pages/Reservations/Reservations.tsx";
import { Dashboard } from "./pages/Dashboard.tsx";
import RefundsAcceptance from "./pages/Refunds/RefundsAcceptance.tsx";
import { Unauthorized } from "./pages/Unauthorized.tsx";
import RequestInfo from "./pages/RequestInfo.tsx";
import { Approvals } from "./pages/Approvals/Approvals.tsx";
import { RefundsReview } from "./pages/Refunds/RefundsReview.tsx";
import { CheckRefunds } from "./pages/Refunds/CheckRefunds.tsx";
import FlightSearch from "./pages/FlightSearch.tsx";
import { AccountingExport } from "./pages/Accounting/AccountingExport.tsx";

/**
 * router, defines the application's route tree.
 * Input:
 * - Route definitions using React Router v6 createBrowserRouter.
 * Output:
 * - Browser router instance used by <RouterProvider />.
 *
 * Notes:
 * - Public routes: accessible without authentication (Login, Register, Unauthorized, Error).
 * - Protected routes: wrapped by <ProtectedRoute /> (requires authenticated session).
 * - Permission-based routes: wrapped by <PermissionProtectedRoute /> (requires specific permissions).
 */
export const router = createBrowserRouter([
  // Public routes (no authentication required)
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/recuperar-contrasena",
    element: <Register />,
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
  {
    path: "*",
    element: <Error />,
  },

  // Basic protected routes (requires only authentication)
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard title="Inicio" />,
      },
      {
        path: "/flights",
        element: <FlightSearch />,
      },
      {
        path: "/approvals",
        element: <Approvals />,
      },
      {
        path: "/requests/:id",
        element: <RequestInfo />,
      },
      {
        path: "/requests/create",
        element: <CreateTravelRequest />,
      },
      {
        path: "/requests/:id/edit",
        element: <EditTravelRequest />,
      },
      {
        path: "/history",
        element: <Historial />,
      },
      {
        path: "/refunds",
        element: <Refunds />,
      },
      {
        path: "/refunds/:id",
        element: <Vouchers />,
      },
      {
        path: "/check-refunds",
        element: <CheckRefunds />,
      },
      {
        path: "/accounting/export",
        element: <AccountingExport />,
      },
      {
        path: "/bookings",
        element: <Bookings />,
      },
      {
        path: "/bookings/:id",
        element: <Reservations />,
      },
      {
        path: "/refunds-review",
        element: <RefundsReview />,
      },
      {
        path: "/refunds-review/:id",
        element: <RefundsAcceptance />,
      },
      {
        path: "/admin/users",
        element: <FlagProtectedRoute requireCompanyAdmin><AdminUsers /></FlagProtectedRoute>,
      },
      {
        path: "/admin/rules",
        element: <FlagProtectedRoute requireCompanyAdmin><AdminRules /></FlagProtectedRoute>,
      },
      {
        path: "/admin/notifications",
        element: <FlagProtectedRoute requireCompanyAdminOnly><AdminNotifications /></FlagProtectedRoute>,
      },
      {
        path: "/admin/companies/new",
        element: <FlagProtectedRoute requireSystemAdmin><AdminNewCompany /></FlagProtectedRoute>,
      },
      /**
       * Permission-protected routes (approvals module).
       * Requires "approve_trip" permission to access "/approval".
       * Nested permission example: "view_approval_history".
       */
      {
        path: "/approval",
        element: (
          <PermissionProtectedRoute requiredPermissions={["approve_trip"]} />
        ),
        children: [
          {
            path: "",
            element: <div>Trips to Approve</div>,
          },
          {
            path: "history",
            element: (
              <PermissionProtectedRoute
                requiredPermissions={["view_approval_history"]}
              />
            ),
            children: [
              {
                path: "",
                element: <div>Approval History</div>,
              },
            ],
          },
        ],
      },
      
      /**
       * Permission-protected routes (booking module).
       * Requires "book_trip" permission to access "/booking".
       * Nested permission example: "view_booking_history".
       */
      {
        path: "/booking",
        element: (
          <PermissionProtectedRoute requiredPermissions={["book_trip"]} />
        ),
        children: [
          {
            path: "history",
            element: (
              <PermissionProtectedRoute
                requiredPermissions={["view_booking_history"]}
              />
            ),
            children: [
              {
                path: "",
                element: <div>Booking History</div>,
              },
            ],
          },
        ],
      },
    ],
  },
]);

/**
 * queryClient, provides the TanStack Query client instance used for caching,
 * request deduplication, and server-state synchronization.
 */
const queryClient = new QueryClient();

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  document.documentElement.classList.add("dark");
}

/**
 * Application render guard:
 * - Prevents mounting during certain testing environments.
 * - Mounts the app only when root element exists.
 *
 * Notes:
 * - Uses React.StrictMode for development warnings and effect checks.
 * - Wraps the app with QueryClientProvider and RouterProvider.
 */
if (import.meta.env.PROD || !import.meta.env.TEST) {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    createRoot(rootElement).render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </StrictMode>
    );
  }
}