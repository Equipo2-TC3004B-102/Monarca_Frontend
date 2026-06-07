/**
 * FileName: AdminCancelledRequests.tsx
 * Description: Admin view listing all travel requests for the company across all statuses.
 *              Shows folio, title, requester, status, and creation date. Company admins only.
 * Authors: DebugStudio Team
 * Last Modification made:
 * 21/05/2026 [Julio Rodriguez] Initial implementation. Extended to show all requests, not just cancelled ones; added status column.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRequest } from "../../utils/apiService";
import { useAuth } from "../../hooks/auth/authContext";
import GoBack from "../../components/GoBack";
import RefreshButton from "../../components/RefreshButton";
import { useTranslation } from "react-i18next";

interface RequestUser {
  name: string;
  last_name: string;
  email: string;
}

interface CompanyRequest {
  id: string;
  request_num: number;
  title: string;
  status: string;
  createdAt: string;
  user?: RequestUser;
}

const ITEMS_PER_PAGE = 10;

const STATUS_STYLES: Record<string, string> = {
  "Pending Review":             "bg-yellow-100 text-yellow-800",
  "Changes Needed":             "bg-orange-100 text-orange-800",
  "Pending Accounting Approval":"bg-blue-100 text-blue-800",
  "Pending Refund Approval":    "bg-blue-100 text-blue-800",
  "Pending Reservations":       "bg-purple-100 text-purple-800",
  "In Progress":                "bg-green-100 text-green-800",
  "Pending Vouchers Approval":  "bg-indigo-100 text-indigo-800",
  "Completed":                  "bg-emerald-100 text-emerald-800",
  "Denied":                     "bg-red-100 text-red-800",
  "Cancelled":                  "bg-gray-200 text-gray-700",
};

function buildFolio(createdAt: string, requestNum: number) {
  return `${new Date(createdAt).getFullYear()}-${String(requestNum).padStart(3, "0")}`;
}

export default function AdminCompanyRequests() {
  const { authState } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const companyId = authState.companyId;

  const [requests, setRequests] = useState<CompanyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchRequests = async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getRequest(`/admin/companies/${companyId}/requests`);
      setRequests(data);
      setCurrentPage(1);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        t("admin.companyRequests.errorLoading");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [companyId]);

  const STATUS_LABELS: Record<string, string> = {
    "Pending Review":              t("status.pendingReview"),
    "Changes Needed":              t("status.changesNeeded"),
    "Pending Accounting Approval": t("status.pendingAccountingApproval"),
    "Pending Refund Approval":     t("status.pendingRefundApproval"),
    "Pending Reservations":        t("status.pendingReservations"),
    "In Progress":                 t("status.inProgress"),
    "Pending Vouchers Approval":   t("status.pendingVouchersApproval"),
    "Completed":                   t("status.completed"),
    "Denied":                      t("status.denied"),
    "Cancelled":                   t("status.cancelled"),
  };

  const totalPages = Math.ceil(requests.length / ITEMS_PER_PAGE);
  const paginated = requests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const changePage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <>
      <GoBack />
      <div className="flex-1 p-6 bg-[var(--color-card-bg)] rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[var(--color-page-text-title)]">
            {t("admin.companyRequests.title")}
          </h2>
          <RefreshButton onClick={fetchRequests} />
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md text-sm bg-[var(--color-incorrect-bg)] text-[var(--color-incorrect-text)] border border-[var(--color-incorrect-border)]">
            {error}
          </div>
        )}

        <div className="overflow-x-auto mb-4">
          <table className="w-full min-w-[800px] text-sm text-gray-500 border-separate border-spacing-y-2">
            <thead>
              <tr className="text-xs text-white uppercase bg-[#0a2c6d]">
                <th className="px-4 py-2 text-center rounded-l-lg w-28">{t("admin.companyRequests.folio")}</th>
                <th className="px-4 py-2 text-center max-w-[120px]">{t("admin.companyRequests.title_col")}</th>
                <th className="px-4 py-2 text-center w-44">{t("admin.companyRequests.requester")}</th>
                <th className="px-4 py-2 text-center w-52">{t("admin.companyRequests.status")}</th>
                <th className="px-4 py-2 text-center w-36">{t("admin.companyRequests.createdAt")}</th>
                <th className="px-4 py-2 text-center rounded-r-lg w-24">{t("admin.companyRequests.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center pt-10 text-gray-500">
                    {t("common.loading")}
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center pt-10 text-[var(--color-page-text)]">
                    {t("common.noData")}
                  </td>
                </tr>
              ) : (
                paginated.map((r) => (
                  <tr key={r.id} className="bg-[#4C6997] text-white text-center">
                    <td className="px-4 py-3 rounded-l-lg font-mono text-xs">
                      {buildFolio(r.createdAt, r.request_num)}
                    </td>
                    <td className="px-4 py-3 text-sm max-w-[120px] truncate">{r.title}</td>
                    <td className="px-4 py-3 text-sm">
                      {r.user ? `${r.user.name} ${r.user.last_name}` : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold box-decoration-clone leading-snug ${STATUS_STYLES[r.status] ?? "bg-gray-100 text-gray-700"}`}>
                        {STATUS_LABELS[r.status] ?? r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 rounded-r-lg">
                      <button
                        onClick={() => navigate(`/requests/${r.id}`)}
                        className="px-3 py-1 text-xs rounded-md bg-white text-[#0a2c6d] font-semibold hover:bg-[#e8eef8] transition-colors"
                      >
                        {t("admin.companyRequests.view")}
                      </button>
                    </td>
                  </tr>
                ))
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
