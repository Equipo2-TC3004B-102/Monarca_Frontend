/**
 * FileName: AdminRules.tsx
 * Description: Admin page for managing approval rules (ApprovalLevels). Displays existing levels
 *              in a paginated table and provides a form to create new levels with optional inline actor.
 *              Uses GET/POST/PATCH/DELETE /approval-engine/levels. company_id is derived server-side from JWT.
 * Authors: Original Monarca team
 * Last Modification made:
 * 13/05/2026 [Julio Rodriguez] Added CECO selector to inline actor form; loads CECOs from /admin/companies/:id/cost-centers.
 *                              Added edit and delete functionality with pending-request reassignment error handling.
 *                              Added ApprovalLevelActor management section per level (Tarea E).
 *                              Fixed ceco_id DTO validator: @IsString instead of @IsUUID in approval-level-actor.dto.ts.
 *                              Show company name (not UUID) in header via GET /admin/companies/:id/info.
 *                              CECO selector always visible in create form (not hidden behind actor_type).
 * 20/05/2026 [Rebeca Davila] Added a tutorial for first-time visitors to the list of rules
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRequest, postRequest, patchRequest, deleteRequest } from "../../utils/apiService";
import { useAuth } from "../../hooks/auth/authContext";
import GoBack from "../../components/GoBack";
import RefreshButton from "../../components/RefreshButton";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useTranslation } from "react-i18next";
import { Tutorial } from "../../components/Tutorial";
import { useApp } from "../../hooks/app/appContext";

interface CostCenter {
  id: string;
  name: string | null;
}

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

interface ApprovalLevelActor {
  id: string;
  approval_level_id: string;
  actor_type: string;
  target_type: string | null;
  target_id: string | null;
  is_required: boolean;
  selection_mode: string;
  ceco_id: string | null;
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
  actor_type: "",
  selection_mode: "any",
  actor_ceco_id: "",
};

const emptyEditForm = {
  name: "",
  min_amount_mon: "",
  max_amount_mon: "",
  required_approvals: 1,
  is_active: true,
};

const emptyActorForm = {
  actor_type: "",
  selection_mode: "any",
  ceco_id: "",
  is_required: true,
};

const ITEMS_PER_PAGE = 5;
const labelClass = "block mb-2 text-sm font-medium text-[var(--color-page-text)] ";
const selectClass = "bg-[var(--color-card-bg)] border border-[var(--color-border)] text-gray-500 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5";

export default function AdminRules() {
  const { authState } = useAuth();
  const { t } = useTranslation();
  const companyId = authState.companyId;
  const canLoad = Boolean(companyId);

  const { handleVisitPage, tutorial, setTutorial } = useApp();

  const [rules, setRules] = useState<ApprovalRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [editLevel, setEditLevel] = useState<ApprovalRule | null>(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [levelToDelete, setLevelToDelete] = useState<ApprovalRule | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [cecos, setCecos] = useState<CostCenter[]>([]);
  const [companyName, setCompanyName] = useState<string | null>(null);

  // Actors section state
  const [selectedLevelForActors, setSelectedLevelForActors] = useState<ApprovalRule | null>(null);
  const [actors, setActors] = useState<ApprovalLevelActor[]>([]);
  const [loadingActors, setLoadingActors] = useState(false);
  const [actorForm, setActorForm] = useState(emptyActorForm);
  const [showActorForm, setShowActorForm] = useState(false);
  const [editActor, setEditActor] = useState<ApprovalLevelActor | null>(null);
  const [actorToDelete, setActorToDelete] = useState<ApprovalLevelActor | null>(null);
  const [savingActor, setSavingActor] = useState(false);
  const [deletingActor, setDeletingActor] = useState(false);

  const navigate = useNavigate();

  const fetchRules = async () => {
    setLoading(true);
    try {
      const data = await getRequest("/approval-engine/levels");
      setRules(data);
      setCurrentPage(1);
    } catch {
      setMessage({ text: t('admin.rules.errorLoading'), error: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
    if (companyId) {
      getRequest(`/admin/companies/${companyId}/cost-centers`)
        .then((data) => setCecos(data))
        .catch(() => {});
      getRequest(`/admin/companies/${companyId}/info`)
        .then((data) => setCompanyName(data.name ?? null))
        .catch(() => {});
    }
  }, []);

  const totalPages = Math.ceil(rules.length / ITEMS_PER_PAGE);
  const paginated = rules.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const changePage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canLoad) {
      setMessage({ text: "No se pudo identificar la empresa actual.", error: true });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const payload: Record<string, unknown> = {
        code: form.code,
        name: form.name,
        level_order: Number(form.level_order),
        required_approvals: Number(form.required_approvals),
        ...(form.description && { description: form.description }),
        ...(form.applies_to && { applies_to: form.applies_to }),
        ...(form.min_amount_mon !== "" && { min_amount_mon: Number(form.min_amount_mon) }),
        ...(form.max_amount_mon !== "" && { max_amount_mon: Number(form.max_amount_mon) }),
        ...(form.actor_type && {
          actor: {
            actor_type: form.actor_type,
            selection_mode: form.selection_mode,
            is_required: true,
            ...(form.actor_ceco_id && { ceco_id: form.actor_ceco_id }),
          },
        }),
      };
      await postRequest("/approval-engine/levels", payload);
      setMessage({ text: t('admin.rules.successCreate'), error: false });
      setForm(emptyForm);
      setShowForm(false);
      await fetchRules();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? t('admin.rules.errorCreate');
      setMessage({ text: msg, error: true });
    } finally {
      setSaving(false);
    }
  };

  const handleEditOpen = (level: ApprovalRule) => {
    setEditLevel(level);
    setEditForm({
      name: level.name,
      min_amount_mon: level.min_amount_mon !== null ? String(level.min_amount_mon) : "",
      max_amount_mon: level.max_amount_mon !== null ? String(level.max_amount_mon) : "",
      required_approvals: level.required_approvals,
      is_active: level.is_active,
    });
    setLevelToDelete(null);
    setSelectedLevelForActors(null);
    setMessage(null);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setEditForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editLevel) return;
    setSaving(true);
    setMessage(null);
    try {
      const payload: Record<string, unknown> = {
        name: editForm.name,
        required_approvals: Number(editForm.required_approvals),
        is_active: editForm.is_active,
        ...(editForm.min_amount_mon !== "" && { min_amount_mon: Number(editForm.min_amount_mon) }),
        ...(editForm.max_amount_mon !== "" && { max_amount_mon: Number(editForm.max_amount_mon) }),
      };
      await patchRequest(`/approval-engine/levels/${editLevel.id}`, payload);
      setMessage({ text: t('admin.rules.successEdit'), error: false });
      setEditLevel(null);
      await fetchRules();
    } catch {
      setMessage({ text: t('admin.rules.errorEdit'), error: true });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = (level: ApprovalRule) => {
    setLevelToDelete(level);
    setEditLevel(null);
    setSelectedLevelForActors(null);
    setMessage(null);
  };

  const handleDelete = async () => {
    if (!levelToDelete) return;
    setDeleting(true);
    setMessage(null);
    try {
      await deleteRequest(`/approval-engine/levels/${levelToDelete.id}`);
      setMessage({ text: t('admin.rules.successDelete'), error: false });
      setLevelToDelete(null);
      await fetchRules();
    } catch (err: unknown) {
      const code = (err as { response?: { data?: { code?: string } } })?.response?.data?.code;
      if (code === 'APPROVAL_LEVEL_HAS_PENDING_REQUESTS') {
        setMessage({ text: t('admin.rules.errorNoPendingSubstitute'), error: true });
      } else {
        setMessage({ text: t('admin.rules.errorDelete'), error: true });
      }
      setLevelToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  // ─── Actors handlers ────────────────────────────────────────────────────────

  const fetchActors = async (levelId: string) => {
    setLoadingActors(true);
    try {
      const data = await getRequest(`/approval-engine/levels/${levelId}/actors`);
      setActors(data);
    } catch {
      setActors([]);
    } finally {
      setLoadingActors(false);
    }
  };

  const handleOpenActors = (level: ApprovalRule) => {
    setSelectedLevelForActors(level);
    setEditLevel(null);
    setLevelToDelete(null);
    setShowActorForm(false);
    setEditActor(null);
    setActorToDelete(null);
    setMessage(null);
    fetchActors(level.id);
  };

  const handleActorFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setActorForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleAddActor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedLevelForActors) return;
    setSavingActor(true);
    try {
      const payload: Record<string, unknown> = {
        approval_level_id: selectedLevelForActors.id,
        actor_type: actorForm.actor_type,
        selection_mode: actorForm.selection_mode,
        is_required: actorForm.is_required,
        ...(actorForm.ceco_id && { ceco_id: actorForm.ceco_id }),
      };
      await postRequest("/approval-engine/actors", payload);
      setMessage({ text: t('admin.rules.successAddActor'), error: false });
      setActorForm(emptyActorForm);
      setShowActorForm(false);
      await fetchActors(selectedLevelForActors.id);
    } catch {
      setMessage({ text: t('admin.rules.errorAddActor'), error: true });
    } finally {
      setSavingActor(false);
    }
  };

  const handleEditActorOpen = (actor: ApprovalLevelActor) => {
    setEditActor(actor);
    setActorForm({
      actor_type: actor.actor_type,
      selection_mode: actor.selection_mode,
      ceco_id: actor.ceco_id ?? "",
      is_required: actor.is_required,
    });
    setShowActorForm(false);
    setActorToDelete(null);
  };

  const handleEditActorSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editActor || !selectedLevelForActors) return;
    setSavingActor(true);
    try {
      const payload: Record<string, unknown> = {
        actor_type: actorForm.actor_type,
        selection_mode: actorForm.selection_mode,
        is_required: actorForm.is_required,
        ceco_id: actorForm.ceco_id || null,
      };
      await patchRequest(`/approval-engine/actors/${editActor.id}`, payload);
      setMessage({ text: t('admin.rules.successEditActor'), error: false });
      setEditActor(null);
      setActorForm(emptyActorForm);
      await fetchActors(selectedLevelForActors.id);
    } catch {
      setMessage({ text: t('admin.rules.errorEditActor'), error: true });
    } finally {
      setSavingActor(false);
    }
  };

  const handleDeleteActorConfirm = (actor: ApprovalLevelActor) => {
    setActorToDelete(actor);
    setEditActor(null);
    setShowActorForm(false);
  };

  const handleDeleteActor = async () => {
    if (!actorToDelete || !selectedLevelForActors) return;
    setDeletingActor(true);
    try {
      await deleteRequest(`/approval-engine/actors/${actorToDelete.id}`);
      setMessage({ text: t('admin.rules.successDeleteActor'), error: false });
      setActorToDelete(null);
      await fetchActors(selectedLevelForActors.id);
    } catch {
      setMessage({ text: t('admin.rules.errorDeleteActor'), error: true });
      setActorToDelete(null);
    } finally {
      setDeletingActor(false);
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
      <Tutorial page="adminRules" run={tutorial}>
      <GoBack />
      <div className="flex-1 p-6 bg-[var(--color-card-bg)] rounded-lg shadow-xl">
        <div className="flex items-center flex-wrap gap-2 lg:gap-0 justify-between mb-4">
          <h2 className="text-2xl font-bold text-[var(--color-page-text-title)]">{t('admin.rules.title')}</h2>
          <p className="text-sm text-gray-600">
            {companyId ? `${t('admin.notifications.activeCompany')} ${companyName ?? companyId}` : t('admin.notifications.companyUnavailable')}
          </p>
          <div className="flex items-center gap-3">
            <button
              id="btn_notifications"
              onClick={() => navigate('/admin/notifications')}
              className="px-3 py-2 bg-[var(--color-page-bg)] text-[var(--color-page-text)] text-sm rounded-md cursor-pointer transition-colors"
            >
              {t('admin.rules.notifications')}
            </button>
            <button
              id="btn_newRule"
              onClick={() => { setShowForm(!showForm); setMessage(null); }}
              disabled={!canLoad}
              className="px-4 py-2 bg-[#0a2c6d] text-white text-sm rounded-md cursor-pointer hover:bg-[#0d3d94] transition-colors disabled:opacity-50"
            >
              {showForm ? t('common.cancel') : t('admin.rules.createRule')}
            </button>
            <RefreshButton />
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-md text-sm ${message.error ? "bg-[var(--color-incorrect-bg)] text-[var(--color-incorrect-text)]" : 
            "bg-[var(--color-correct-bg)] text-[var(--color-correct-text)]"}`}>
            {message.text}
          </div>
        )}

        {showForm && (
          <section className="bg-[var(--color-page-bg)] rounded-md mb-6">
            <div className="p-10">
              <h3 className="text-2xl font-bold text-[var(--color-page-text-title)] mt-0 mb-4">{t('admin.rules.newRule')}</h3>
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
                    <label className={labelClass}>Tipo de aprobador (opcional)</label>
                    <select name="actor_type" value={form.actor_type} onChange={handleChange} className={selectClass}>
                      <option value="">Sin aprobador definido</option>
                      <option value="MANAGER">Gerente directo</option>
                      <option value="USER">Usuario específico</option>
                    </select>
                  </div>
                  {form.actor_type && (
                    <div>
                      <label className={labelClass}>Modo de selección</label>
                      <select name="selection_mode" value={form.selection_mode} onChange={handleChange} className={selectClass}>
                        <option value="any">Cualquiera</option>
                        <option value="all">Todos</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label className={labelClass}>CECO al que aplica</label>
                    <select name="actor_ceco_id" value={form.actor_ceco_id} onChange={handleChange} className={selectClass}>
                      <option value="">Todos los CECOs</option>
                      {cecos.map((c) => (
                        <option key={c.id} value={c.id}>{c.id}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <Button type="submit" disabled={saving} className="mt-6">
                  {saving ? t('common.saving') : t('admin.rules.saveRule')}
                </Button>
              </form>
            </div>
          </section>
        )}

        {editLevel && (
          <section className="bg-gray-200 rounded-md mb-6">
            <div className="p-10 bg-[var(--color-page-bg)]">
              <h3 className="text-2xl font-bold text-[var(--color-page-text-title)] mt-0 mb-4">{t('admin.rules.editTitle')}</h3>
              <form onSubmit={handleEditSubmit}>
                <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>{t('admin.rules.levelName')}</label>
                    <Input name="name" value={editForm.name} onChange={handleEditChange} required />
                  </div>
                  <div>
                    <label className={labelClass}>{t('admin.rules.minAmount')}</label>
                    <Input name="min_amount_mon" type="number" min={0} value={editForm.min_amount_mon} onChange={handleEditChange} placeholder={t('admin.rules.noMinimum')} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('admin.rules.maxAmount')}</label>
                    <Input name="max_amount_mon" type="number" min={0} value={editForm.max_amount_mon} onChange={handleEditChange} placeholder={t('admin.rules.noMaximum')} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('admin.rules.requiredApprovals')}</label>
                    <Input name="required_approvals" type="number" min={1} value={editForm.required_approvals} onChange={handleEditChange} required />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      id="edit-is-active"
                      type="checkbox"
                      name="is_active"
                      checked={editForm.is_active}
                      onChange={handleEditChange}
                      className="w-4 h-4"
                    />
                    <label htmlFor="edit-is-active" className="text-sm font-medium text-[var(--color-page-text)]">
                      {t('admin.rules.active')}
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button type="submit" disabled={saving}>
                    {saving ? t('common.saving') : t('admin.rules.editRule')}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setEditLevel(null)}
                    className="px-4 py-2 bg-gray-400 text-white text-sm rounded-md hover:bg-gray-500 transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {levelToDelete && (
          <section className="bg-red-50 border border-red-200 rounded-md mb-6 p-6">
            <p className="text-sm font-semibold text-red-800 mb-1">
              {t('admin.rules.confirmDelete', { name: levelToDelete.name })}
            </p>
            <p className="text-xs text-red-600 mb-4">{t('admin.rules.confirmDeleteWarning')}</p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? t('admin.rules.deleting') : t('admin.rules.deleteRule')}
              </button>
              <button
                onClick={() => setLevelToDelete(null)}
                disabled={deleting}
                className="px-4 py-2 bg-gray-400 text-white text-sm rounded-md hover:bg-gray-500 transition-colors disabled:opacity-50"
              >
                {t('common.cancel')}
              </button>
            </div>
          </section>
        )}

        {/* ─── Actors section ────────────────────────────────────────────── */}
        {selectedLevelForActors && (
          <section className="bg-[var(--color-page-bg)] border border-[var(--color-border)] rounded-md mb-6 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[var(--color-page-text-title)]">
                {t('admin.rules.actorsTitle', { name: selectedLevelForActors.name })}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowActorForm(!showActorForm); setEditActor(null); setActorForm(emptyActorForm); setActorToDelete(null); }}
                  className="px-3 py-1.5 bg-[#0a2c6d] text-white text-xs rounded-md hover:bg-[#0d3d94] transition-colors"
                >
                  {showActorForm ? t('common.cancel') : t('admin.rules.addActor')}
                </button>
                <button
                  onClick={() => { setSelectedLevelForActors(null); setActors([]); setShowActorForm(false); setEditActor(null); setActorToDelete(null); }}
                  className="px-3 py-1.5 bg-gray-400 text-white text-xs rounded-md hover:bg-gray-500 transition-colors"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>

            {/* Add actor form */}
            {showActorForm && (
              <form onSubmit={handleAddActor} className="bg-[var(--color-page-bg)] rounded-md p-4 mb-4 border border-[var(--color-border)]">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className={labelClass}>{t('admin.rules.actorType')}</label>
                    <select name="actor_type" value={actorForm.actor_type} onChange={handleActorFormChange} className={selectClass} required>
                      <option value="">—</option>
                      <option value="MANAGER">Gerente directo</option>
                      <option value="USER">Usuario específico</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('admin.rules.selectionMode')}</label>
                    <select name="selection_mode" value={actorForm.selection_mode} onChange={handleActorFormChange} className={selectClass}>
                      <option value="any">Cualquiera</option>
                      <option value="all">Todos</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>CECO</label>
                    <select name="ceco_id" value={actorForm.ceco_id} onChange={handleActorFormChange} className={selectClass}>
                      <option value="">Todos los CECOs</option>
                      {cecos.map((c) => (
                        <option key={c.id} value={c.id}>{c.id}{c.name ? ` — ${c.name}` : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      id="actor-is-required"
                      type="checkbox"
                      name="is_required"
                      checked={actorForm.is_required}
                      onChange={handleActorFormChange}
                      className="w-4 h-4"
                    />
                    <label htmlFor="actor-is-required" className="text-sm font-medium text-[var(--color-page-text)]">
                      {t('admin.rules.isRequired')}
                    </label>
                  </div>
                </div>
                <Button type="submit" disabled={savingActor || !actorForm.actor_type} className="mt-3">
                  {savingActor ? t('common.saving') : t('admin.rules.addActor')}
                </Button>
              </form>
            )}

            {/* Edit actor form */}
            {editActor && (
              <form onSubmit={handleEditActorSubmit} className="bg-white rounded-md p-4 mb-4 border border-yellow-200">
                <p className="text-xs font-semibold text-yellow-700 mb-3">{t('admin.rules.editRule')}: {editActor.actor_type}</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className={labelClass}>{t('admin.rules.actorType')}</label>
                    <select name="actor_type" value={actorForm.actor_type} onChange={handleActorFormChange} className={selectClass} required>
                      <option value="">—</option>
                      <option value="MANAGER">Gerente directo</option>
                      <option value="USER">Usuario específico</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('admin.rules.selectionMode')}</label>
                    <select name="selection_mode" value={actorForm.selection_mode} onChange={handleActorFormChange} className={selectClass}>
                      <option value="any">Cualquiera</option>
                      <option value="all">Todos</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>CECO</label>
                    <select name="ceco_id" value={actorForm.ceco_id} onChange={handleActorFormChange} className={selectClass}>
                      <option value="">Todos los CECOs</option>
                      {cecos.map((c) => (
                        <option key={c.id} value={c.id}>{c.id}{c.name ? ` — ${c.name}` : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      id="edit-actor-is-required"
                      type="checkbox"
                      name="is_required"
                      checked={actorForm.is_required}
                      onChange={handleActorFormChange}
                      className="w-4 h-4"
                    />
                    <label htmlFor="edit-actor-is-required" className="text-sm font-medium text-gray-900">
                      {t('admin.rules.isRequired')}
                    </label>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button type="submit" disabled={savingActor || !actorForm.actor_type}>
                    {savingActor ? t('common.saving') : t('admin.rules.editRule')}
                  </Button>
                  <button
                    type="button"
                    onClick={() => { setEditActor(null); setActorForm(emptyActorForm); }}
                    className="px-3 py-1.5 bg-gray-400 text-white text-xs rounded-md hover:bg-gray-500 transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            )}

            {/* Delete actor confirmation */}
            {actorToDelete && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <p className="text-sm font-semibold text-red-800 mb-3">
                  {t('admin.rules.confirmDelete', { name: actorToDelete.actor_type })}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteActor}
                    disabled={deletingActor}
                    className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {deletingActor ? t('admin.rules.deleting') : t('admin.rules.deleteRule')}
                  </button>
                  <button
                    onClick={() => setActorToDelete(null)}
                    disabled={deletingActor}
                    className="px-3 py-1.5 bg-gray-400 text-white text-xs rounded-md hover:bg-gray-500 transition-colors disabled:opacity-50"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* Actors mini-table */}
            {loadingActors ? (
              <p className="text-sm text-gray-500">{t('common.loading')}</p>
            ) : actors.length === 0 ? (
              <p className="text-sm text-gray-500 italic">{t('admin.rules.noActors')}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-gray-600 border-separate border-spacing-y-1">
                  <thead>
                    <tr className="text-xs text-white uppercase bg-[#4C6997]">
                      <th className="px-3 py-2 rounded-l-lg">{t('admin.rules.actorType')}</th>
                      <th className="px-3 py-2">{t('admin.rules.selectionMode')}</th>
                      <th className="px-3 py-2">CECO</th>
                      <th className="px-3 py-2">{t('admin.rules.isRequired')}</th>
                      <th className="px-3 py-2 rounded-r-lg">{t('admin.rules.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actors.map((actor) => (
                      <tr key={actor.id} className="bg-white text-gray-700">
                        <td className="px-3 py-2 rounded-l-lg">{actor.actor_type}</td>
                        <td className="px-3 py-2">{actor.selection_mode}</td>
                        <td className="px-3 py-2">{actor.ceco_id ?? "—"}</td>
                        <td className="px-3 py-2">{actor.is_required ? "✓" : "—"}</td>
                        <td className="px-3 py-2 rounded-r-lg">
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEditActorOpen(actor)}
                              className="px-2 py-1 bg-[#c7e6ab] text-[#24390d] text-xs rounded hover:bg-[#b0d490] transition-colors font-semibold"
                            >
                              {t('admin.rules.editRule')}
                            </button>
                            <button
                              onClick={() => handleDeleteActorConfirm(actor)}
                              className="px-2 py-1 bg-[#eca6a6] text-[#680909] text-xs rounded hover:bg-[#e08080] transition-colors font-semibold"
                            >
                              {t('admin.rules.deleteRule')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        <div className="overflow-x-auto mb-4">
          <table id="rules_list" className="w-full min-w-[1300px] lg:min-w-[900px] table-fixed text-sm text-left text-gray-500 border-separate border-spacing-y-2">
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
                <th className="px-4 py-2 text-center">{t('admin.users.status')}</th>
                <th className="px-4 py-2 text-center rounded-r-lg">{t('admin.rules.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center pt-10 text-gray-500">{t('common.loading')}</td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center pt-10">{t('common.noData')}</td>
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
                  <td className="px-4 py-3">
                    <span className={`text-xs p-1 rounded-sm font-bold ${r.is_active ? "bg-[#c7e6ab] text-[#24390d]" : "bg-[#eca6a6] text-[#680909]"}`}>
                      {r.is_active ? t('admin.rules.active') : t('admin.rules.inactive')}
                    </span>
                  </td>
                  <td className="px-4 py-3 rounded-r-lg">
                    <div id="rules_buttons" className="flex justify-center gap-1 flex-wrap">
                      <button
                        onClick={() => handleOpenActors(r)}
                        className="px-2 py-1 bg-[#d0e8ff] text-[#0a2c6d] text-xs rounded hover:bg-[#b8d8f8] transition-colors font-semibold"
                      >
                        {t('admin.rules.manageActors')}
                      </button>
                      <button
                        onClick={() => handleEditOpen(r)}
                        className="px-2 py-1 bg-[#c7e6ab] text-[#24390d] text-xs rounded hover:bg-[#b0d490] transition-colors font-semibold"
                      >
                        {t('admin.rules.editRule')}
                      </button>
                      <button
                        onClick={() => handleDeleteConfirm(r)}
                        className="px-2 py-1 bg-[#eca6a6] text-[#680909] text-xs rounded hover:bg-[#e08080] transition-colors font-semibold"
                      >
                        {t('admin.rules.deleteRule')}
                      </button>
                    </div>
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
      </Tutorial>
    </>
  );
}
