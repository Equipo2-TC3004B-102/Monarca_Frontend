/**
 * FileName: AdminAuditLogs.tsx
 * Description: Admin view for listing user audit logs scoped to the company admin's company.
 *              Displays who performed an action, which user was affected, the date, and the
 *              report description. Long reports are truncated and can be expanded inline.
 *              Company admins only.
 * Authors: DebugStudio Team
 * Last Modification made:
 * 27/05/2026 [Julio Rodriguez] Added new_status badge and id_request link for request_log entries.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRequest } from "../../utils/apiService";
import { useAuth } from "../../hooks/auth/authContext";
import GoBack from "../../components/GoBack";
import RefreshButton from "../../components/RefreshButton";
import { useTranslation } from "react-i18next";

interface AuditLogUser {
  id: string;
  name: string;
  last_name: string;
  email: string;
}

interface AuditLog {
  id: string;
  id_user: string;
  date: string;
  ip: string | null;
  report: string;
  /** Present on request_log entries: the resulting status after the action. */
  new_status?: string;
  /** Present on request_log entries: UUID of the linked request. */
  id_request?: string;
  user?: AuditLogUser;
}

const ITEMS_PER_PAGE = 10;
const REPORT_TRUNCATE_LENGTH = 80;

type TFunc = (key: string, opts?: Record<string, unknown>) => string;

function humanizeKV(raw: string, t: TFunc): string {
  return raw
    .split(",")
    .map((pair) => {
      const eqIdx = pair.indexOf("=");
      if (eqIdx === -1) return t(`admin.auditLogs.fieldNames.${pair}`, { defaultValue: pair });
      const key = pair.slice(0, eqIdx);
      const val = pair.slice(eqIdx + 1);
      const label = t(`admin.auditLogs.fieldNames.${key}`, { defaultValue: key });
      const translatedVal =
        val === "true"
          ? t("admin.auditLogs.boolTrue", { defaultValue: "Sí" })
          : val === "false"
          ? t("admin.auditLogs.boolFalse", { defaultValue: "No" })
          : val;
      return `${label}: ${translatedVal}`;
    })
    .join(", ");
}

function parseReport(raw: string, t: TFunc): { text: string; requestId: string | null } {
  const sep = raw.indexOf("§");
  if (sep !== -1) {
    const parts = raw.split("§");
    const code = parts[0];
    switch (code) {
      case "USER_CREATED":
        return {
          text: t(`admin.auditLogs.actions.${code}`, {
            email: parts[1] ?? "",
            flags: humanizeKV(parts[2] ?? "", t),
          }),
          requestId: null,
        };
      case "USER_PROFILE_UPDATED":
        return {
          text: t(`admin.auditLogs.actions.${code}`, {
            email: parts[1] ?? "",
            fields: (parts[2] ?? "")
              .split(",")
              .map((f) => t(`admin.auditLogs.fieldNames.${f.trim()}`, { defaultValue: f.trim() }))
              .join(", "),
          }),
          requestId: null,
        };
      case "USER_FLAGS_UPDATED":
        return {
          text: t(`admin.auditLogs.actions.${code}`, {
            email: parts[1] ?? "",
            flags: humanizeKV(parts[2] ?? "", t),
          }),
          requestId: null,
        };
      case "USER_DELETED":
        return {
          text: t(`admin.auditLogs.actions.${code}`, { email: parts[1] ?? "" }),
          requestId: null,
        };
      case "SETTINGS_UPDATED":
        return {
          text: t(`admin.auditLogs.actions.${code}`, {
            fields: humanizeKV(parts[1] ?? "", t),
          }),
          requestId: null,
        };
      case "REQUEST_CREATED":
        return {
          text: t(`admin.auditLogs.actions.${code}`, {
            folio: parts[1] ?? "",
            title: parts[2] ?? "",
          }),
          requestId: parts[3] ?? null,
        };
      case "REQUEST_CANCELLED":
        return {
          text: t(`admin.auditLogs.actions.${code}`, {
            folio: parts[1] ?? "",
            title: parts[2] ?? "",
          }),
          requestId: parts[3] ?? null,
        };
      case "RULE_CREATED":
        return {
          text: t(`admin.auditLogs.actions.${code}`, {
            name: parts[1] ?? "",
            order: parts[2] ?? "",
          }),
          requestId: null,
        };
      case "RULE_UPDATED":
        return {
          text: t(`admin.auditLogs.actions.${code}`, {
            name: parts[1] ?? "",
            fields: (parts[2] ?? "")
              .split(",")
              .map((f) => t(`admin.auditLogs.fieldNames.${f.trim()}`, { defaultValue: f.trim() }))
              .join(", "),
          }),
          requestId: null,
        };
      case "FIRST_LOGIN":
        return {
          text: t(`admin.auditLogs.actions.${code}`, { email: parts[1] ?? "" }),
          requestId: null,
        };
      case "USERS_IMPORTED":
        return {
          text: t(`admin.auditLogs.actions.${code}`, {
            created: parts[1] ?? "0",
            updated: parts[2] ?? "0",
            unchanged: parts[3] ?? "0",
            errors: parts[4] ?? "0",
          }),
          requestId: null,
        };
      default:
        return { text: raw, requestId: null };
    }
  }
  // Legacy format with ||req: separator
  const legacySep = raw.indexOf("||req:");
  if (legacySep !== -1) {
    return { text: raw.slice(0, legacySep), requestId: raw.slice(legacySep + 6) };
  }
  return { text: raw, requestId: null };
}

export default function AdminAuditLogs() {
  const { authState } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const companyId = authState.companyId;

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const fetchLogs = async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getRequest(`/admin/companies/${companyId}/audit-logs`);
      setLogs(data);
      setCurrentPage(1);
      setExpandedIds(new Set());
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        t("admin.auditLogs.errorLoading");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [companyId]);

  const totalPages = Math.ceil(logs.length / ITEMS_PER_PAGE);
  const paginated = logs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const changePage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <>
      <GoBack />
      <div className="flex-1 p-6 bg-[var(--color-card-bg)] rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[var(--color-page-text-title)]">
            {t("admin.auditLogs.title")}
          </h2>
          <RefreshButton onClick={fetchLogs} />
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md text-sm bg-[var(--color-incorrect-bg)] text-[var(--color-incorrect-text)] border border-[var(--color-incorrect-border)]">
            {error}
          </div>
        )}

        <div className="overflow-x-auto mb-4">
          <table className="w-full min-w-[700px] text-sm text-gray-500 border-separate border-spacing-y-2">
            <thead>
              <tr className="text-xs text-white uppercase bg-[#0a2c6d]">
                <th className="px-4 py-2 text-center rounded-l-lg w-40">{t("admin.auditLogs.date")}</th>
                <th className="px-4 py-2 text-center w-44">{t("admin.auditLogs.user")}</th>
                <th className="px-4 py-2 text-center w-48">{t("admin.auditLogs.email")}</th>
                <th className="px-4 py-2 text-center rounded-r-lg">{t("admin.auditLogs.action")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center pt-10 text-gray-500">
                    {t("common.loading")}
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center pt-10 text-[var(--color-page-text)]">
                    {t("common.noData")}
                  </td>
                </tr>
              ) : (
                paginated.map((log) => {
                  const { text: reportText, requestId: parsedRequestId } = parseReport(log.report, t);
                  const effectiveRequestId = parsedRequestId ?? log.id_request ?? null;
                  const isLong = reportText.length > REPORT_TRUNCATE_LENGTH;
                  const isExpanded = expandedIds.has(log.id);
                  const displayText =
                    isLong && !isExpanded
                      ? reportText.slice(0, REPORT_TRUNCATE_LENGTH) + "…"
                      : reportText;

                  return (
                    <tr key={log.id} className="bg-[#4C6997] text-white text-center">
                      <td className="px-4 py-3 rounded-l-lg text-xs">{formatDate(log.date)}</td>
                      <td className="px-4 py-3 text-sm">
                        {log.user ? `${log.user.name} ${log.user.last_name}` : log.id_user}
                      </td>
                      <td className="px-4 py-3 text-xs">{log.user?.email ?? "-"}</td>
                      <td className="px-4 py-3 rounded-r-lg text-center text-xs">
                        <span>{displayText}</span>
                        {log.new_status && (
                          <span className="ml-2 inline-block text-xs px-2 py-0.5 rounded-full font-semibold bg-white/20 border border-white/40 whitespace-nowrap">
                            {log.new_status}
                          </span>
                        )}
                        {isLong && (
                          <button
                            onClick={() => toggleExpand(log.id)}
                            className="ml-2 underline text-[#b8d0ff] hover:text-white transition-colors whitespace-nowrap"
                          >
                            {isExpanded ? t("admin.auditLogs.seeLess") : t("admin.auditLogs.seeMore")}
                          </button>
                        )}
                        {effectiveRequestId && (
                          <button
                            onClick={() => navigate(`/requests/${effectiveRequestId}`)}
                            className="ml-2 px-2 py-0.5 rounded bg-white text-[#0a2c6d] font-semibold hover:bg-[#e8eef8] transition-colors whitespace-nowrap"
                          >
                            {t("admin.auditLogs.viewRequest")}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg bg-[#0a2c6d] text-white disabled:opacity-50"
            >
              &lt;
            </button>
            <span className="text-[var(--color-page-text)] font-medium">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg bg-[#0a2c6d] text-white disabled:opacity-50"
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </>
  );
}
