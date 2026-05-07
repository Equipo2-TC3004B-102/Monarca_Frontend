/*
 * FileName: notification.ts
 * Description: TypeScript interfaces for company notification settings. Defines the structure of notification preferences for a company, including email and in-app options for various notification types related to travel requests and administrative alerts. These types are used for type safety in API interactions and state management within the frontend application.
 * Authors: Original Monarca team
 * Last Modification made:
 * 05/05/2026 [Santiago Coronado Hernández] Created File to implement notification settings management for admins.
 */

export interface CompanyNotificationSettings {
  id: string;
  id_company: string;
  email_enabled: boolean;
  in_app_enabled: boolean;
  email_requests_created: boolean;
  email_requests_status: boolean;
  email_revisions: boolean;
  email_reservations: boolean;
  email_admin_alerts: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CompanyNotificationSettingsUpdate {
  email_enabled?: boolean;
  in_app_enabled?: boolean;
  email_requests_created?: boolean;
  email_requests_status?: boolean;
  email_revisions?: boolean;
  email_reservations?: boolean;
  email_admin_alerts?: boolean;
}