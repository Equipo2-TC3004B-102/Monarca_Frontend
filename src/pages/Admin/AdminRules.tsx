/*
 * FileName: AdminRules.tsx
 * Description: Admin page for managing approval rules. Displays existing rules in a paginated table and provides a form to create new rules with fields for
 *              code, name, description, applicability, order, amount thresholds, required approvals, and company association.
 *              Includes navigation to notification settings and handles API interactions for fetching and creating rules.
 * Authors: Original Monarca team
 * Last Modification made:
 * 05/05/2026 [Santiago Coronado Hernández] Added useNavigate to make button in rules section that points to notifications settings.
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRequest, postRequest } from "../../utils/apiService";
import GoBack from "../../components/GoBack";
import RefreshButton from "../../components/RefreshButton";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useTranslation } from "react-i18next";

interface ApprovalRule {
  id: string;
  code: string;
  name: string;
  description: string;
  applies_to: string;
  level_order: number;
  min_amount_mon: number | null;
  max_amount_mon: number | null;
  required_approvals: number;
  is_active: boolean;
}

const emptyForm = {
  code: "",
  name: "",
  description: "",
  applies_to: "travel",
  level_order: 1,
  min_amount_mon: "",
  max_amount_mon: "",
  required_approvals: 1,
  company_id: "",
};

const ITEMS_PER_PAGE = 5;
const labelClass = "block mb-2 text-sm font-medium text-gray-900";
const selectClass = "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5";

export default function AdminRules() {
  const { t } = useTranslation();
  const [rules, setRules] = useState<ApprovalRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const fetchRules = async () => {
    setLoading(true);
    try {
      const data = await getRequest("/rules");
      setRules(data);
      setCurrentPage(1);
    } catch {
      setMessage({ text: t('admin.rules.errorLoading'), error: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRules(); }, []);

  const totalPages = Math.ceil(rules.length / ITEMS_PER_PAGE);
  const paginated = rules.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const changePage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await postRequest("/rules", {
        ...form,
        level_order: Number(form.level_order),
        required_approvals: Number(form.required_approvals),
        min_amount_mon: form.min_amount_mon !== "" ? Number(form.min_amount_mon) : null,
        max_amount_mon: form.max_amount_mon !== "" ? Number(form.max_amount_mon) : null,
      });
      setMessage({ text: t('admin.rules.successCreate'), error: false });
      setForm(emptyForm);
      setShowForm(false);
      await fetchRules();
    } catch {
      setMessage({ text: t('admin.rules.errorCreate'), error: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <GoBack />
      <div className="flex-1 p-6 bg-[#eaeced] rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[var(--blue)]">{t('admin.rules.title')}</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/notifications')}
              className="px-3 py-2 bg-[#f0f4ff] text-[#0a2c6d] text-sm rounded-md hover:bg-[#ebf0ff] transition-colors"
            >
              {t('admin.rules.notifications')}
            </button>
            <button
              onClick={() => { setShowForm(!showForm); setMessage(null); }}
              className="px-4 py-2 bg-[#0a2c6d] text-white text-sm rounded-md hover:bg-[#0d3d94] transition-colors"
            >
              {showForm ? t('common.cancel') : t('admin.rules.createRule')}
            </button>
            <RefreshButton />
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-md text-sm ${message.error ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            {message.text}
          </div>
        )}

        {showForm && (
          <section className="bg-gray-200 rounded-md mb-6">
            <div className="p-10">
              <h3 className="text-2xl font-bold text-[var(--blue)] mt-0 mb-4">{t('admin.rules.newRule')}</h3>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                  <div>
                    <label className={labelClass}>{t('admin.rules.code')}</label>
                    <Input name="code" value={form.code} onChange={handleChange} required placeholder={t('admin.rules.codePlaceholder')} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('admin.rules.levelName')}</label>
                    <Input name="name" value={form.name} onChange={handleChange} required placeholder={t('admin.rules.levelNamePlaceholder')} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>{t('admin.rules.levelDescription')}</label>
                    <Input name="description" value={form.description} onChange={handleChange} placeholder={t('admin.rules.levelDescriptionPlaceholder')} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('admin.rules.appliesTo')}</label>
                    <select name="applies_to" value={form.applies_to} onChange={handleChange} className={selectClass}>
                      <option value="travel">{t('admin.rules.travel')}</option>
                      <option value="refund">{t('admin.rules.refund')}</option>
                      <option value="all">{t('admin.rules.all')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('admin.rules.levelOrder')}</label>
                    <Input name="level_order" type="number" min={1} value={form.level_order} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className={labelClass}>{t('admin.rules.minAmount')}</label>
                    <Input name="min_amount_mon" type="number" min={0} value={form.min_amount_mon} onChange={handleChange} placeholder={t('admin.rules.noMinimum')} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('admin.rules.maxAmount')}</label>
                    <Input name="max_amount_mon" type="number" min={0} value={form.max_amount_mon} onChange={handleChange} placeholder={t('admin.rules.noMaximum')} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('admin.rules.requiredApprovals')}</label>
                    <Input name="required_approvals" type="number" min={1} value={form.required_approvals} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className={labelClass}>{t('admin.rules.companyId')}</label>
                    <Input name="company_id" value={form.company_id} onChange={handleChange} required placeholder={t('admin.rules.companyIdPlaceholder')} />
                  </div>
                </div>
                <Button type="submit" disabled={saving} className="mt-6">
                  {saving ? t('common.saving') : t('admin.rules.saveRule')}
                </Button>
              </form>
            </div>
          </section>
        )}

        <div className="overflow-x-auto mb-4">
          <table className="w-full table-fixed text-sm text-left text-gray-500 border-separate border-spacing-y-2">
            <thead>
              <tr className="text-xs text-white uppercase bg-[#0a2c6d]">
                <th className="px-4 py-2 text-center rounded-l-lg">{t('admin.rules.code')}</th>
                <th className="px-4 py-2 text-center">{t('admin.rules.levelName')}</th>
                <th className="px-4 py-2 text-center">{t('admin.rules.description')}</th>
                <th className="px-4 py-2 text-center">{t('admin.rules.appliesTo')}</th>
                <th className="px-4 py-2 text-center">{t('admin.rules.order')}</th>
                <th className="px-4 py-2 text-center">{t('admin.rules.minAmountShort')}</th>
                <th className="px-4 py-2 text-center">{t('admin.rules.maxAmountShort')}</th>
                <th className="px-4 py-2 text-center">{t('admin.rules.approvals')}</th>
                <th className="px-4 py-2 text-center rounded-r-lg">{t('admin.users.status')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center pt-10 text-gray-500">{t('common.loading')}</td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center pt-10">{t('common.noData')}</td>
                </tr>
              ) : paginated.map((r) => (
                <tr key={r.id} className="bg-[#4C6997] text-white text-center">
                  <td className="px-4 py-3 rounded-l-lg">{r.code}</td>
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="px-4 py-3">{r.description ?? "-"}</td>
                  <td className="px-4 py-3">{r.applies_to}</td>
                  <td className="px-4 py-3">{r.level_order}</td>
                  <td className="px-4 py-3">{r.min_amount_mon ?? "-"}</td>
                  <td className="px-4 py-3">{r.max_amount_mon ?? "-"}</td>
                  <td className="px-4 py-3">{r.required_approvals}</td>
                  <td className="px-4 py-3 rounded-r-lg">
                    <span className={`text-xs p-1 rounded-sm font-bold ${r.is_active ? "bg-[#c7e6ab] text-[#24390d]" : "bg-[#eca6a6] text-[#680909]"}`}>
                      {r.is_active ? t('admin.rules.active') : t('admin.rules.inactive')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-4">
            <button onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 rounded-lg bg-[#0a2c6d] text-white disabled:opacity-50">&lt;</button>
            <span className="text-[#0a2c6d] font-medium">{currentPage} / {totalPages}</span>
            <button onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 rounded-lg bg-[#0a2c6d] text-white disabled:opacity-50">&gt;</button>
          </div>
        )}
      </div>
    </>
  );
}
