/**
 * authContext.tsx
 * Description: Authentication and authorization context for the frontend. Provides auth state (user info + permissions), login session validation via profile endpoint, logout handling, and route protection components (basic auth + permission-based guards).
 * Authors: Original Moncarca team
 * Last Modification made:
 * 25/02/2026 [Jin Sik Yoon] Added detailed comments and documentation for clarity and maintainability.
 */

import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";

import Layout from "../../components/Layout";
import { getRequest, postRequest } from "../../utils/apiService";
import { AppProvider } from "../app/appContext";

/**
 * Permission, enumerates all supported permission keys used for role-based access control (RBAC).
 * Input: N/A
 * Output: Permission union type - Used to type-check required permissions for protected routes.
 */
export type Permission =
  | "view_dashboard"
  | "create_trip"
  | "approve_trip"
  | "book_trip"
  | "view_reports"
  | "manage_users"
  | "view_approval_history"
  | "view_booking_history";

/**
 * ContextType, defines what the AuthContext provides to consumers.
 * Input: N/A
 * Output: ContextType interface - Describes auth state, state setter, loading flag, and logout handler.
 *
 * Note:
 * - loadingProfile indicates whether the initial session/profile check is still in progress.
 */
export interface ContextType {
  authState: AuthState;
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>;
  loadingProfile: Boolean;
  handleLogout: () => Promise<void>;
}

/**
 * AuthState, represents the authenticated user's session information in the client.
 * Input: N/A
 * Output: AuthState interface - Used in context and components to determine authentication/authorization status.
 */
export interface AuthState {
  isAuthenticated: boolean;
  userId: string;
  userName: string;
  userLastName: string;
  userEmail: string;
  userPermissions: Permission[];
  userRole: string;
}

/**
 * AuthContext, stores authentication state and helpers across the app.
 * Input: Default value is undefined to force usage inside AuthProvider.
 * Output: React context instance providing ContextType.
 */
export const AuthContext = createContext<ContextType | undefined>(undefined);

/**
 * useAuth, custom hook that exposes the AuthContext with runtime safety.
 * Input: None.
 * Output: ContextType - Current auth context value.
 * Throws:
 * - Error if used outside of <AuthProvider />.
 */
export const useAuth = (): ContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/**
 * AuthProvider, initializes and provides auth state to the application.
 * Input:
 * - children (ReactNode): Components that need access to AuthContext.
 * Output: JSX.Element - Context provider wrapper.
 *
 * Business logic:
 * - On mount, it calls /login/profile to detect whether the user already has a valid session (cookie-based auth).
 * - If authenticated, it maps role permissions from the API response to a Permission[] for route guards.
 * - Exposes handleLogout() which calls /login/logout and clears client auth state.
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [loadingProfile, setLoadingProfile] = React.useState<Boolean>(true);
  const [authState, setAuthState] = React.useState<AuthState>({
    isAuthenticated: false,
    userId: "",
    userName: "",
    userLastName: "",
    userRole: "",
    userEmail: "",
    userPermissions: [],
  });

  useEffect(() => {
    /**
     * getAuthState, fetches current session profile data from the backend.
     * Input: None (uses cookie session through Axios instance withCredentials=true).
     * Output: Promise<void> - Updates authState and loadingProfile.
     *
     * Notes:
     * - If the response indicates a valid session, user fields and permissions are populated.
     * - If not valid or the request fails, isAuthenticated is set to false.
     */
    const getAuthState = async () => {
      getRequest("/login/profile")
        .then((response) => {
          if (response?.status) {
            setAuthState({
              isAuthenticated: true,
              userId: response.user.id,
              userName: response.user.name,
              userLastName: response.user.last_name,
              userRole: response.user.role.name,
              userPermissions: response.user.role.permissions.map(
                (permission: { name: string }) => permission.name
              ),
              userEmail: response.user.email,
            });
            setLoadingProfile(false);
          } else {
            setAuthState((prevState) => ({
              ...prevState,
              isAuthenticated: false,
            }));
            setLoadingProfile(false);
          }
        })
        .catch((error) => {
          console.error("Error fetching auth state:", error);
          setAuthState((prevState) => ({
            ...prevState,
            isAuthenticated: false,
          }));
          setLoadingProfile(false);
        });
    };

    getAuthState();
  }, []);

  /**
   * handleLogout, logs out the current user on the backend and clears local auth state.
   * Input: None.
   * Output: Promise<void> - Clears auth state when logout succeeds.
   */
  const handleLogout = async () => {
    const response = await postRequest("/login/logout", {});
    if (response.status) {
      setAuthState({
        isAuthenticated: false,
        userId: "",
        userName: "",
        userLastName: "",
        userRole: "",
        userEmail: "",
        userPermissions: [],
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        setAuthState,
        loadingProfile,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * ProtectedRoute, wraps protected routes that only require authentication.
 * Input: None (reads authentication state through AuthProvider).
 * Output: JSX.Element - Renders nested routes via <Outlet /> inside Layout and AppProvider.
 *
 * Notes:
 * - This component sets up the AuthProvider and AppProvider context scopes for all protected pages.
 * - Layout is applied to provide consistent UI shell (navbar/sidebar/etc.).
 */
export const ProtectedRoute: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <Layout>
          <Outlet />
        </Layout>
      </AppProvider>
    </AuthProvider>
  );
};

/**
 * PermissionProtectedRouteProps, defines route guard requirements based on permissions.
 * Input:
 * - requiredPermissions (Permission[]): Permission keys required to access the route.
 * - requireAll (boolean | undefined): If true, user must have ALL permissions; if false, ANY permission is sufficient.
 * Output: PermissionProtectedRouteProps interface - Used to type-check PermissionProtectedRoute props.
 */
interface PermissionProtectedRouteProps {
  requiredPermissions: Permission[];
  requireAll?: boolean;
}

/**
 * PermissionProtectedRoute, protects routes that require authentication plus specific permissions.
 * Input:
 * - requiredPermissions (Permission[]): Permissions required to access the nested routes.
 * - requireAll (boolean): All vs any permission logic (default true).
 * Output: JSX.Element - Either redirects via <Navigate /> or renders <Outlet /> when authorized.
 *
 * Authorization logic:
 * 1) If user is not authenticated => redirect.
 * 2) If authenticated, evaluate permissions:
 *    - requireAll=true: every permission must be present
 *    - requireAll=false: at least one permission must be present
 * 3) If authorized => render nested routes.
 */
export const PermissionProtectedRoute: React.FC<
  PermissionProtectedRouteProps
> = ({ requiredPermissions, requireAll = true }) => {
  const { authState } = useAuth();

  // First check authentication
  if (!authState.isAuthenticated) {
    return <Navigate to="/example" replace />;
  }

  // Then check permissions
  const hasPermission = requireAll
    ? requiredPermissions.every((permission) =>
        authState.userPermissions.includes(permission)
      )
    : requiredPermissions.some((permission) =>
        authState.userPermissions.includes(permission)
      );

  if (!hasPermission) {
    return <Navigate to="/unauthorized" replace />;
  }

  /**
   * If authenticated and authorized, render nested routes.
   * Note: This currently wraps the Outlet with AuthProvider again. In most cases,
   * AuthProvider should be provided once at a higher level (e.g., ProtectedRoute).
   */
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
};
