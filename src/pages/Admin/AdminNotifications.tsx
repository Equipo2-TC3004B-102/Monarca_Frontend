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

const settingRows: Array<{
  key: keyof CompanyNotificationSettingsUpdate;
  title: string;
  description: string;
}> = [
  {
    key: "email_enabled",
    title: "Habilitar correo",
    description: "Permite enviar notificaciones por email para la empresa.",
  },
  {
    key: "in_app_enabled",
    title: "Habilitar notificaciones internas",
    description: "Muestra notificaciones dentro de la aplicación.",
  },
  {
    key: "email_requests_created",
    title: "Solicitud creada",
    description: "Notifica por email cuando se crea una solicitud.",
  },
  {
    key: "email_requests_status",
    title: "Cambio de estado de solicitud",
    description: "Notifica por email cuando una solicitud cambia de estado.",
  },
  {
    key: "email_revisions",
    title: "Revisión creada",
    description: "Notifica por email cuando se genera una revisión.",
  },
  {
    key: "email_reservations",
    title: "Reservación creada",
    description: "Notifica por email cuando se crea una reservación.",
  },
  {
    key: "email_admin_alerts",
    title: "Alertas administrativas",
    description: "Notifica por email eventos administrativos relevantes.",
  },
];

const sectionClass = "bg-[var(--color-page-bg)] rounded-md";
const labelClass = "block text-sm font-medium text-[var(--color-page-text)]";

export default function AdminNotifications() {
  const { authState } = useAuth();
  const companyId = authState.companyId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<MessageState>(null);
  const [settings, setSettings] = useState<CompanyNotificationSettings>(defaultSettings);

  const canLoad = Boolean(companyId);

  const visibleRows = useMemo(
    () => settingRows,
    [],
  );

  useEffect(() => {
    const loadSettings = async () => {
      if (!companyId) {
        setLoading(false);
        setMessage({
          text: "No se pudo identificar la empresa actual.",
          error: true,
        });
        return;
      }

      setLoading(true);
      setMessage(null);

      try {
        const data = await getCompanyNotificationSettings(companyId);
        setSettings(data);
      } catch {
        setMessage({ text: "Error al cargar las notificaciones.", error: true });
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
      setMessage({ text: "Configuración de notificaciones guardada.", error: false });
    } catch {
      setMessage({ text: "Error al guardar la configuración.", error: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <GoBack />
      <div className="flex-1 p-6 bg-[var(--color-card-bg)] rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[var(--color-page-text-title)]">Notificaciones</h2>
          <p className="text-sm text-gray-600">
            {companyId ? `Empresa activa: ${companyId}` : "Empresa no disponible"}
          </p>
        </div>

        {message && (
          <div
            className={`mb-4 p-3 rounded-md text-sm ${
              message.error ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <section className={sectionClass}>
          <div className="p-10">
            <form onSubmit={handleSubmit}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-page-text-title)]">Preferencias por empresa</h3>
                  <p className="text-sm text-gray-600">Controla qué eventos generan notificaciones.</p>
                </div>
                <Button type="submit" disabled={!canLoad || loading || saving}>
                  {saving ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>

              {loading ? (
                <div className="py-10 text-center text-gray-500">Cargando configuración...</div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                  {visibleRows.map((row) => {
                    const checked = settings[row.key] ?? false;

                    return (
                      <div key={row.key} className="flex items-start justify-between gap-4 rounded-lg bg-[var(--color-card-bg)] p-4 shadow-sm">
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