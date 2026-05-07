/**
 * FileName: AdminNewCompany.tsx
 * Description: Page for Ditta system admins to create a new company and its initial
 *              company admin user in one operation. Calls POST /admin/companies/setup.
 * Authors: DebugStudio Team
 * Last Modification:
 * 30/04/2026 [Julio Rodriguez] Created view for system admin to generate a company entry in the database.
 */

import React, { useState } from "react";
import { postRequest } from "../../utils/apiService";
import GoBack from "../../components/GoBack";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useTranslation } from "react-i18next";

interface SetupResult {
  company: { id: string; name: string; local_currency: string };
  admin: { id: string; email: string; name: string; last_name: string };
}

const emptyForm = {
  name: "",
  local_currency: "",
  adminName: "",
  adminLastName: "",
  adminEmail: "",
};

const labelClass = "block mb-2 text-sm font-medium text-gray-900";

export default function AdminNewCompany() {
  const { t } = useTranslation();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [result, setResult] = useState<SetupResult | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setResult(null);

    try {
      const data = await postRequest("/admin/companies/setup", {
        name: form.name,
        local_currency: form.local_currency,
        admin: {
          name: form.adminName,
          last_name: form.adminLastName || undefined,
          email: form.adminEmail,
        },
      });
      setResult(data);
      setMessage({ text: t('admin.newCompany.successMessage'), error: false });
      setForm(emptyForm);
    } catch {
      setMessage({ text: t('admin.newCompany.errorMessage'), error: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <GoBack />
      <div className="flex-1 p-6 bg-[#eaeced] rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-[var(--blue)] mb-6">{t('admin.newCompany.title')}</h2>

        {message && (
          <div className={`mb-4 p-3 rounded-md text-sm ${message.error ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            {message.text}
          </div>
        )}

        {result && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-900">
            <p className="font-bold mb-2">{t('admin.newCompany.credentialsLabel')}</p>
            <p><span className="font-medium">{t('admin.newCompany.companyLabel')}</span> {result.company.name} <span className="text-blue-500 font-mono text-xs ml-1">({result.company.id})</span></p>
            <p><span className="font-medium">{t('admin.newCompany.currencyLabel')}</span> {result.company.local_currency}</p>
            <p><span className="font-medium">{t('admin.newCompany.adminEmailLabel')}</span> {result.admin.email}</p>
            <p><span className="font-medium">{t('admin.newCompany.tempPasswordLabel')}</span> <span className="font-mono">password</span></p>
          </div>
        )}

        <section className="bg-gray-200 rounded-md">
          <div className="p-10">
            <form onSubmit={handleSubmit}>
              <h3 className="text-lg font-bold text-[var(--blue)] mb-4">{t('admin.newCompany.companyData')}</h3>
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 mb-8">
                <div>
                  <label className={labelClass}>{t('admin.newCompany.companyName')}</label>
                  <Input name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div>
                  <label className={labelClass}>{t('admin.newCompany.localCurrency')}</label>
                  <Input name="local_currency" value={form.local_currency} onChange={handleChange} required />
                </div>
              </div>

              <h3 className="text-lg font-bold text-[var(--blue)] mb-4">{t('admin.newCompany.companyAdmin')}</h3>
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                <div>
                  <label className={labelClass}>{t('admin.newCompany.firstName')}</label>
                  <Input name="adminName" value={form.adminName} onChange={handleChange} required />
                </div>
                <div>
                  <label className={labelClass}>{t('admin.newCompany.lastName')} <span className="text-gray-400 font-normal">{t('admin.newCompany.optional')}</span></label>
                  <Input name="adminLastName" value={form.adminLastName} onChange={handleChange} />
                </div>
                <div>
                  <label className={labelClass}>{t('admin.newCompany.emailAddress')}</label>
                  <Input name="adminEmail" type="email" value={form.adminEmail} onChange={handleChange} required />
                </div>
              </div>

              <Button type="submit" disabled={saving} className="mt-8">
                {saving ? t('admin.newCompany.creating') : t('admin.newCompany.create')}
              </Button>
            </form>
          </div>
        </section>
      </div>
    </>
  );
}
