/*
 * FileName: AdminNotifications.tsx
 * Description: Admin page for managing notification settings. Allows toggling email and in-app notifications for various events at the company level.
 *              Fetches current settings on load and provides a form to update preferences with feedback messages on success or error.
 * Authors: Original Monarca team
 * Last Modification made:
 * 05/05/2026 [Santiago Coronado Hernández] Created File and implemented notification settings management for admins.
 */

import { useEffect, useMemo, useState } from "react";
import GoBack from "../../components/GoBack";
import { Button } from "../../components/ui/Button";
import Switch from "../../components/ui/Switch";
import { useAuth } from "../../hooks/auth/authContext";
import { useTranslation } from "react-i18next";
import {
  getCompanyNotificationSettings,
  updateCompanyNotificationSettings,
} from "../../api/companyNotificationSettings";
import type {
  CompanyNotificationSettings,
  CompanyNotificationSettingsUpdate,
} from "../../types/notification";

type MessageState = { text: string; error: boolean } | null;

const defaultSettings: CompanyNotificationSettings = {
  id: "",
  id_company: "",
  email_enabled: true,
  in_app_enabled: true,
  email_requests_created: true,
  email_requests_status: true,
  email_revisions: true,
  email_reservations: true,
  email_admin_alerts: true,
};

const sectionClass = "bg-gray-200 rounded-md";
const labelClass = "block text-sm font-medium text-gray-900";

export default function AdminNotifications() {
  const { authState } = useAuth();
  const { t } = useTranslation();
  const companyId = authState.companyId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<MessageState>(null);
  const [settings, setSettings] = useState<CompanyNotificationSettings>(defaultSettings);

  const canLoad = Boolean(companyId);

  const settingRows: Array<{
    key: keyof CompanyNotificationSettingsUpdate;
    title: string;
    description: string;
  }> = useMemo(() => [
    { key: "email_enabled",          title: t('admin.notifications.emailEnabled'),       description: t('admin.notifications.emailEnabledDesc') },
    { key: "in_app_enabled",         title: t('admin.notifications.inAppEnabled'),        description: t('admin.notifications.inAppEnabledDesc') },
    { key: "email_requests_created", title: t('admin.notifications.requestsCreated'),     description: t('admin.notifications.requestsCreatedDesc') },
    { key: "email_requests_status",  title: t('admin.notifications.requestsStatus'),      description: t('admin.notifications.requestsStatusDesc') },
    { key: "email_revisions",        title: t('admin.notifications.revisions'),           description: t('admin.notifications.revisionsDesc') },
    { key: "email_reservations",     title: t('admin.notifications.reservations'),        description: t('admin.notifications.reservationsDesc') },
    { key: "email_admin_alerts",     title: t('admin.notifications.adminAlerts'),         description: t('admin.notifications.adminAlertsDesc') },
  ], [t]);

  useEffect(() => {
    const loadSettings = async () => {
      if (!companyId) {
        setLoading(false);
        setMessage({ text: t('admin.notifications.errorNoCompany'), error: true });
        return;
      }

      setLoading(true);
      setMessage(null);

      try {
        const data = await getCompanyNotificationSettings(companyId);
        setSettings(data);
      } catch {
        setMessage({ text: t('admin.notifications.errorLoading'), error: true });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [companyId]);

  const updateField = (key: keyof CompanyNotificationSettingsUpdate, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!companyId) return;

    setSaving(true);
    setMessage(null);

    const payload: CompanyNotificationSettingsUpdate = {
      email_enabled: settings.email_enabled,
      in_app_enabled: settings.in_app_enabled,
      email_requests_created: settings.email_requests_created,
      email_requests_status: settings.email_requests_status,
      email_revisions: settings.email_revisions,
      email_reservations: settings.email_reservations,
      email_admin_alerts: settings.email_admin_alerts,
    };

    try {
      const updated = await updateCompanyNotificationSettings(companyId, payload);
      setSettings(updated);
      setMessage({ text: t('admin.notifications.successSaving'), error: false });
    } catch {
      setMessage({ text: t('admin.notifications.errorSaving'), error: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <GoBack />
      <div className="flex-1 p-6 bg-[#eaeced] rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[var(--blue)]">{t('admin.notifications.title')}</h2>
          <p className="text-sm text-gray-600">
            {companyId ? `${t('admin.notifications.activeCompany')} ${companyId}` : t('admin.notifications.companyUnavailable')}
          </p>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-md text-sm ${message.error ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            {message.text}
          </div>
        )}

        <section className={sectionClass}>
          <div className="p-10">
            <form onSubmit={handleSubmit}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-[var(--blue)]">{t('admin.notifications.preferences')}</h3>
                  <p className="text-sm text-gray-600">{t('admin.notifications.preferencesDescription')}</p>
                </div>
                <Button type="submit" disabled={!canLoad || loading || saving}>
                  {saving ? t('common.saving') : t('admin.notifications.saveChanges')}
                </Button>
              </div>

              {loading ? (
                <div className="py-10 text-center text-gray-500">{t('admin.notifications.loadingSettings')}</div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                  {settingRows.map((row) => {
                    const checked = settings[row.key] ?? false;
                    return (
                      <div key={row.key} className="flex items-center justify-between gap-4 rounded-lg bg-white p-4 shadow-sm">
                        <div>
                          <label className={labelClass}>{row.title}</label>
                          <p className="mt-1 text-sm text-gray-600">{row.description}</p>
                        </div>
                        <Switch
                          id={row.key}
                          checked={checked}
                          onChange={(value) => updateField(row.key, value)}
                          disabled={saving}
                          srLabel={row.title}
                          className="flex-shrink-0"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </form>
          </div>
        </section>
      </div>
    </>
  );
}
