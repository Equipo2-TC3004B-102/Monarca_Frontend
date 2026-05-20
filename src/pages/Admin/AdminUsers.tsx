/**
 * FileName: AdminUsers.tsx
 * Description: Admin view for listing all users in the system. System admins see all users
 *              via GET /admin/users; the JSON import button is hidden for system admins
 *              because POST /users/import is scoped to the caller's company.
 * Authors: DebugStudio Team
 * Last Modification made:
 * 05/05/2026 [Julio Rodriguez] Added companyId guard and company indicator using authState.companyId pattern.
 * 20/05/2026 [Rebeca Davila] Added a tutorial for first-time visitors to the list of users
 */

import React, { useEffect, useRef, useState } from "react";
import { getRequest, postRequest } from "../../utils/apiService";
import { useAuth } from "../../hooks/auth/authContext";
import GoBack from "../../components/GoBack";
import RefreshButton from "../../components/RefreshButton";
import { useTranslation } from "react-i18next";
import { Tutorial } from "../../components/Tutorial";
import { useApp } from "../../hooks/app/appContext";

interface User {
  id: string;
  name: string;
  last_name: string;
  email: string;
  user_name: string;
  status: string;
  employee_num: string;
}

const ITEMS_PER_PAGE = 5;

export default function AdminUsers() {
  const { authState } = useAuth();
  const { t } = useTranslation();
  const companyId = authState.companyId;
  const canLoad = Boolean(companyId);
  
  const { handleVisitPage, tutorial, setTutorial } = useApp();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getRequest("/admin/users");
      setUsers(data);
      setCurrentPage(1);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? t('admin.users.errorLoading');
      setMessage({ text: msg, error: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const paginated = users.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const changePage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setMessage(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const payload = Array.isArray(parsed) ? parsed : [parsed];
      const result = await postRequest("/users/import", payload as unknown as Record<string, unknown>);
      const summary = [
        result.created > 0 && `${result.created} ${t('admin.users.importCreated')}`,
        result.updated > 0 && `${result.updated} ${t('admin.users.importUpdated')}`,
      ].filter(Boolean).join(", ") || t('admin.users.noChanges');
      setMessage({
        text: `${summary}.${result.errors?.length ? ` ${t('admin.users.importErrors')}: ` + result.errors.join(", ") : ""}`,
        error: result.errors?.length > 0,
      });
      await fetchUsers();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? t('admin.users.errorProcessing');
      setMessage({ text: msg, error: true });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
      // Get the visited pages from localStorage
      const visitedPages = JSON.parse(localStorage.getItem("visitedPages") || "[]");
      // Check if the current page is already in the visited pages
      const isPageVisited = visitedPages.includes(location.pathname);
  
      // If the page is not visited, set the tutorial to true
      if (!isPageVisited) {
        setTutorial(true);
      }
      // Add the current page to the visited pages
      handleVisitPage();
    }, []);

  return (
    <>
      <Tutorial page="adminUsers" run={tutorial}>
      <GoBack />
      <div className="flex-1 p-6 bg-[var(--color-card-bg)] rounded-lg shadow-xl">
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[var(--color-page-text-title)]">{t('admin.users.title')}</h2>
            <div className="flex items-center gap-3">
              {!authState.isSystemAdmin && (
                <button
                  id="btn_loadUsers"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importing || !canLoad}
                  className="px-4 py-2 bg-[#0a2c6d] text-white text-sm rounded-md hover:bg-[#0d3d94] transition-colors disabled:opacity-50"
                >
                  {importing ? t('admin.users.importing') : t('admin.users.loadUser')}
                </button>
              )}
              <RefreshButton />
            </div>
          </div>
          <p className="text-sm text-gray-600">
            {companyId ? `${t('admin.notifications.activeCompany')} ${companyId}` : t('admin.notifications.companyUnavailable')}
          </p>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileUpload} />
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-md text-sm ${message.error ? "bg-[var(--color-incorrect-bg)] text-[var(--color-incorrect-text)] border border-[var(--color-incorrect-border)]" : 
          "bg-[var(--color-correct-bg)] text-[var(--color-correct-text)] "}`}>
            {message.text}
          </div>
        )}

        <div className="overflow-x-auto mb-4">
          <table id="users_list" className="w-full min-w-[900px] table-fixed text-sm text-left text-gray-500 border-separate border-spacing-y-2">
            <thead>
              <tr className="text-xs text-white uppercase bg-[#0a2c6d]">
                <th className="px-4 py-2 text-center rounded-l-lg">{t('admin.users.name')}</th>
                <th className="px-4 py-2 text-center">{t('admin.users.lastName')}</th>
                <th className="px-4 py-2 text-center">{t('admin.users.email')}</th>
                <th className="px-4 py-2 text-center">{t('admin.users.username')}</th>
                <th className="px-4 py-2 text-center">{t('admin.users.employeeNum')}</th>
                <th className="px-4 py-2 text-center rounded-r-lg">{t('admin.users.status')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center pt-10 text-gray-500">{t('common.loading')}</td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center pt-10">{t('common.noData')}</td>
                </tr>
              ) : paginated.map((u) => (
                <tr key={u.id} className="bg-[#4C6997] text-white text-center">
                  <td className="px-4 py-3 rounded-l-lg">{u.name}</td>
                  <td className="px-4 py-3">{u.last_name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{u.user_name}</td>
                  <td className="px-4 py-3">{u.employee_num ?? "-"}</td>
                  <td className="px-4 py-3 rounded-r-lg">
                    <span className={`text-xs p-1 rounded-sm font-bold ${u.status === "active" ? "bg-[#c7e6ab] text-[#24390d]" : "bg-[#eca6a6] text-[#680909]"}`}>
                      {u.status === "active" ? t('admin.users.active') : t('admin.users.inactive')}
                    </span>
                  </td>
                </tr>
              ))}
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
            <span className="text-[#0a2c6d] font-medium">{currentPage} / {totalPages}</span>
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
      </Tutorial>
    </>
  );
}
