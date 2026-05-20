/**
 * AccountingExport.tsx
 * Description: Page for SOI users to generate and download accounting poliza JSON files
 *              for completed trips. Shows a table of completed requests with a generate
 *              button per row. On success the poliza JSON is auto-downloaded as a file.
 * Authors: DebugStudio Team
 * Last Modification made:
 * 20/05/2026 [Julio Rodriguez] Created page.
 */

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import GoBack from "../../components/GoBack";
import RefreshButton from "../../components/RefreshButton";
import formatDate from "../../utils/formatDate";
import formatMoney from "../../utils/formatMoney";
import { getRequest } from "../../utils/apiService";

interface CompletedRequest {
  id: string;
  request_num: number;
  createdAt: string;
  title: string;
  advance_money: number;
  currency: string | null;
  user?: {
    name: string;
    last_name: string;
    employee_num: string | null;
  };
}

/**
 * buildFolio — Formats a request into its YYYY-NNN folio.
 */
function buildFolio(req: CompletedRequest): string {
  const year = new Date(req.createdAt).getFullYear();
  return `${year}-${req.request_num.toString().padStart(3, "0")}`;
}

/**
 * downloadJson — Triggers a browser download of a JSON object as a .json file.
 */
function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * AccountingExport, main component. Fetches completed requests and renders
 * a table where the SOI can generate and download poliza JSON per trip.
 */
export const AccountingExport = () => {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<CompletedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getRequest("/accounting/requests/completed");
      setRequests(data);
    } catch {
      toast.error(t("accounting.errorLoad"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  /**
   * handleGenerate — Calls the poliza endpoint and triggers a JSON file download.
   */
  const handleGenerate = async (req: CompletedRequest) => {
    if (generatingId) return;
    setGeneratingId(req.id);
    try {
      const data = await getRequest(`/accounting/requests/${req.id}/poliza`);
      const folio = buildFolio(req);
      downloadJson(data, `poliza_${folio}.json`);
      toast.success(t("accounting.polizaReady"));
    } catch (err) {
      const rawMsg = (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
      const apiMessage =
        typeof rawMsg === "string"
          ? rawMsg
          : Array.isArray(rawMsg)
          ? (rawMsg as string[]).join(", ")
          : null;
      toast.error(apiMessage ?? t("accounting.errorGenerate"));
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <>
      <GoBack />
      <div className="max-w-full p-6 bg-[var(--color-card-bg)] rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-page-text-title)]">
              {t("accounting.title")}
            </h1>
            <p className="text-sm text-[var(--color-page-text)] mt-1">{t("accounting.subtitle")}</p>
          </div>
          <RefreshButton onClick={fetchRequests} />
        </div>

        {loading ? (
          <p className="text-[var(--color-page-text)]">{t("accounting.loading")}</p>
        ) : requests.length === 0 ? (
          <p className="text-[var(--color-page-text)]">{t("accounting.noRequests")}</p>
        ) : (
          <div className="overflow-x-auto mb-4">
            <table className="w-full min-w-[900px] text-sm text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-xs text-white uppercase bg-[#0a2c6d]">
                  <th className="px-4 py-2 rounded-l-lg">{t("accounting.tableHeaders.folio")}</th>
                  <th className="px-4 py-2">{t("accounting.tableHeaders.employee")}</th>
                  <th className="px-4 py-2">{t("accounting.tableHeaders.title")}</th>
                  <th className="px-4 py-2 text-right">{t("accounting.tableHeaders.advance")}</th>
                  <th className="px-4 py-2">{t("accounting.tableHeaders.date")}</th>
                  <th className="px-4 py-2 text-center rounded-r-lg">{t("accounting.tableHeaders.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => {
                  const folio = buildFolio(req);
                  const employeeName = req.user
                    ? `${req.user.name} ${req.user.last_name}`
                    : "—";
                  const isGenerating = generatingId === req.id;
                  return (
                    <tr key={req.id} className="bg-[#4C6997] text-white text-center">
                      <td className="px-4 py-3 rounded-l-lg font-mono font-semibold text-left">
                        {folio}
                      </td>
                      <td className="px-4 py-3 text-left">{employeeName}</td>
                      <td className="px-4 py-3 max-w-xs truncate text-left">{req.title}</td>
                      <td className="px-4 py-3 text-right">
                        {Number(req.advance_money) > 0
                          ? formatMoney(req.advance_money)
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-left">{formatDate(req.createdAt)}</td>
                      <td className="px-4 py-3 rounded-r-lg text-center">
                        <button
                          onClick={() => handleGenerate(req)}
                          disabled={isGenerating || generatingId !== null}
                          className="px-3 py-1.5 rounded text-sm font-medium text-white bg-[var(--dark-blue)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                        >
                          {isGenerating
                            ? t("accounting.generating")
                            : t("accounting.generateButton")}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};
