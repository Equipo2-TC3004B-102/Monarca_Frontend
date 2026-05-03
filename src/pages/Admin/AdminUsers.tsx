/**
 * FileName: AdminUsers.tsx
 * Description: Admin view for listing all users in the system. System admins see all users
 *              via GET /admin/users; the JSON import button is hidden for system admins
 *              because POST /users/import is scoped to the caller's company.
 * Authors: DebugStudio Team
 * Last Modification:
 * 30/04/2026 [Julio Rodriguez] Changed endpoint to /admin/users; hide import button for system admins.
 */

import React, { useEffect, useRef, useState } from "react";
import { getRequest, postRequest } from "../../utils/apiService";
import { useAuth } from "../../hooks/auth/authContext";
import GoBack from "../../components/GoBack";
import RefreshButton from "../../components/RefreshButton";

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
    } catch {
      setMessage({ text: "Error al cargar usuarios.", error: true });
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
      const summary = [ // Show created/updated counts if available, otherwise default to "No changes"
        result.created > 0 && `${result.created} creado(s)`,
        result.updated > 0 && `${result.updated} actualizado(s)`,
      ].filter(Boolean).join(", ") || "Sin cambios";
      setMessage({
        text: `${summary}.${result.errors?.length ? " Errores: " + result.errors.join(", ") : ""}`,
        error: result.errors?.length > 0,
      });
      await fetchUsers();
    } catch {
      setMessage({ text: "Error al procesar el archivo JSON.", error: true });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return ( // Hide the import users button for system admins since the endpoint is only for company admins
    <>
      <GoBack />
      <div className="flex-1 p-6 bg-[#eaeced] rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[var(--blue)]">Lista de usuarios</h2>
          <div className="flex items-center gap-3">
            {!authState.isSystemAdmin && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="px-4 py-2 bg-[#0a2c6d] text-white text-sm rounded-md hover:bg-[#0d3d94] transition-colors disabled:opacity-50"
              >
                {importing ? "Cargando..." : "Cargar nuevo usuario"}
              </button>
            )}
            <RefreshButton />
          </div>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileUpload} />
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-md text-sm ${message.error ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            {message.text}
          </div>
        )}

        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm text-left text-gray-500 border-separate border-spacing-y-2">
            <thead>
              <tr className="text-xs text-white uppercase bg-[#0a2c6d]">
                <th className="px-4 py-2 text-center rounded-l-lg">Nombre</th>
                <th className="px-4 py-2 text-center">Apellido</th>
                <th className="px-4 py-2 text-center">Correo</th>
                <th className="px-4 py-2 text-center">Usuario</th>
                <th className="px-4 py-2 text-center">Núm. Empleado</th>
                <th className="px-4 py-2 text-center rounded-r-lg">Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center pt-10 text-gray-500">Cargando...</td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center pt-10">No hay datos disponibles</td>
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
                      {u.status === "active" ? "Activo" : "Inactivo"}
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
    </>
  );
}
