/*
 * FileName: companyNotificationSettings.ts
 * Description: API service for managing company notification settings. Provides functions to fetch current settings and update preferences via GET and PATCH requests to the backend. 
 *              Utilizes typed interfaces for request payloads and responses to ensure type safety in interactions with the notification settings API endpoints.
 * Authors: Original Monarca team
 * Last Modification made:
 * 05/05/2026 [Santiago Coronado Hernández] Created File and implemented notification settings management for admins.
 */

import { getRequest, patchRequest } from "../utils/apiService";
import type {
  CompanyNotificationSettings,
  CompanyNotificationSettingsUpdate,
} from "../types/notification";

export const getCompanyNotificationSettings = async (
  idCompany: string,
): Promise<CompanyNotificationSettings> => {
  return getRequest(`/company-notification-settings/${idCompany}`);
};

export const updateCompanyNotificationSettings = async (
  idCompany: string,
  payload: CompanyNotificationSettingsUpdate,
): Promise<CompanyNotificationSettings> => {
  return patchRequest(
    `/company-notification-settings/${idCompany}`,
    payload as Record<string, unknown>,
  );
};