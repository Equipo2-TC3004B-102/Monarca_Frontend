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
  adminEmployeeNum: "",
};

const labelClass = "block mb-2 text-sm font-medium text-gray-900";

export default function AdminNewCompany() {
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
          employee_num: form.adminEmployeeNum || undefined,
        },
      });
      setResult(data);
      setMessage({ text: "Empresa creada exitosamente.", error: false });
      setForm(emptyForm);
    } catch {
      setMessage({ text: "Error al crear la empresa. Verifica los datos e intenta de nuevo.", error: true });
    } finally {
      setSaving(false);
    }
  };

  // Layout for the created company credentials and the form to create a new company. The credentials section only shows after a successful creation, and the form resets after submission.
  return (
    <>
      <GoBack />
      <div className="flex-1 p-6 bg-[#eaeced] rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-[var(--blue)] mb-6">Nueva empresa</h2>

        {message && (
          <div className={`mb-4 p-3 rounded-md text-sm ${message.error ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            {message.text}
          </div>
        )}

        {result && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-900">
            <p className="font-bold mb-2">Credenciales generadas — comparte con el administrador de empresa:</p>
            <p><span className="font-medium">Empresa:</span> {result.company.name} <span className="text-blue-500 font-mono text-xs ml-1">({result.company.id})</span></p>
            <p><span className="font-medium">Moneda:</span> {result.company.local_currency}</p>
            <p><span className="font-medium">Admin email:</span> {result.admin.email}</p>
            <p><span className="font-medium">Contraseña temporal:</span> <span className="font-mono">password</span></p>
          </div>
        )}

        <section className="bg-gray-200 rounded-md">
          <div className="p-10">
            <form onSubmit={handleSubmit}>
              <h3 className="text-lg font-bold text-[var(--blue)] mb-4">Datos de la empresa</h3>
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 mb-8">
                <div>
                  <label className={labelClass}>Nombre de la empresa</label>
                  <Input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Ej. Acme Corp"
                  />
                </div>
                <div>
                  <label className={labelClass}>Moneda local</label>
                  <Input
                    name="local_currency"
                    value={form.local_currency}
                    onChange={handleChange}
                    required
                    placeholder="Ej. MXN"
                  />
                </div>
              </div>

              <h3 className="text-lg font-bold text-[var(--blue)] mb-4">Administrador de empresa</h3>
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                <div>
                  <label className={labelClass}>Nombre</label>
                  <Input
                    name="adminName"
                    value={form.adminName}
                    onChange={handleChange}
                    required
                    placeholder="Ej. María"
                  />
                </div>
                <div>
                  <label className={labelClass}>Apellido <span className="text-gray-400 font-normal">(opcional)</span></label>
                  <Input
                    name="adminLastName"
                    value={form.adminLastName}
                    onChange={handleChange}
                    placeholder="Ej. García"
                  />
                </div>
                <div>
                  <label className={labelClass}>Correo electrónico</label>
                  <Input
                    name="adminEmail"
                    type="email"
                    value={form.adminEmail}
                    onChange={handleChange}
                    required
                    placeholder="admin@empresa.com"
                  />
                </div>
                <div>
                  <label className={labelClass}>Número de empleado <span className="text-gray-400 font-normal">(opcional)</span></label>
                  <Input
                    name="adminEmployeeNum"
                    value={form.adminEmployeeNum}
                    onChange={handleChange}
                    placeholder="Ej. EMP-ADMIN-01"
                  />
                </div>
              </div>

              <Button type="submit" disabled={saving} className="mt-8">
                {saving ? "Creando empresa..." : "Crear empresa"}
              </Button>
            </form>
          </div>
        </section>
      </div>
    </>
  );
}
