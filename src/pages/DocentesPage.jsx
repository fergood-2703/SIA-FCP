// src/pages/DocentesPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import DocenteModal from "../components/modals/DocenteModal";
import "./DocentesPage.css";

function DocentesPage() {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocente, setEditingDocente] = useState(null);
  const [saving, setSaving] = useState(false);

  // Cargar docentes
  useEffect(() => {
    fetchDocentes();
  }, []);

  async function fetchDocentes() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("docente")
        .select("id_docente, nombre_docente")
        .order("id_docente", { ascending: true });

      if (error) {
        console.error("Error al cargar docentes:", error);
        alert("Ocurrió un error al cargar los docentes: " + error.message);
        return;
      }

      setDocentes(data || []);
    } finally {
      setLoading(false);
    }
  }

  // Lista filtrada por búsqueda
  const filteredDocentes = useMemo(() => {
    const term = search.toLowerCase().trim();

    return docentes.filter((doc) => {
      const matchSearch =
        !term ||
        doc.nombre_docente?.toLowerCase().includes(term) ||
        String(doc.id_docente).includes(term);

      return matchSearch;
    });
  }, [docentes, search]);

  // Abrir modal para nuevo docente
  function handleOpenNew() {
    setEditingDocente(null);
    setIsModalOpen(true);
  }

  // Abrir modal para editar docente
  function handleEdit(docente) {
    setEditingDocente(docente);
    setIsModalOpen(true);
  }

  // Cerrar modal
  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingDocente(null);
  }

  // Guardar (crear / actualizar)
  async function handleSaveDocente(payload) {
    try {
      setSaving(true);

      if (editingDocente) {
        const { error } = await supabase
          .from("docente")
          .update(payload)
          .eq("id_docente", editingDocente.id_docente);

        if (error) {
          console.error("Error al actualizar docente:", error);
          alert("Error al actualizar docente: " + error.message);
          return;
        }
      } else {
        const { error } = await supabase.from("docente").insert([payload]);

        if (error) {
          console.error("Error al crear docente:", error);
          alert("Error al crear docente: " + error.message);
          return;
        }
      }

      await fetchDocentes();
      handleCloseModal();
    } finally {
      setSaving(false);
    }
  }

  // Eliminar
  async function handleDelete(docente) {
    const ok = window.confirm(
      `¿Seguro que deseas eliminar al docente:\n\n${docente.nombre_docente}?`
    );
    if (!ok) return;

    const { error } = await supabase
      .from("docente")
      .delete()
      .eq("id_docente", docente.id_docente);

    if (error) {
      console.error("Error al eliminar docente:", error);
      alert("Ocurrió un error al eliminar al docente: " + error.message);
      return;
    }

    setDocentes((prev) =>
      prev.filter((d) => d.id_docente !== docente.id_docente)
    );
  }

  return (
    <main className="docentes-page">
      <header className="docentes-header">
        <div>
          <p className="docentes-badge">Panel de catálogo</p>
          <h1 className="docentes-title">Docentes</h1>
          <p className="docentes-subtitle">
            Administra el listado de docentes del campus.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="docentes-btn-primary docentes-btn-new"
        >
          <span className="docentes-btn-plus">＋</span>
          Nuevo docente
        </button>
      </header>

      <section className="docentes-toolbar">
        <div className="docentes-counter">
          {filteredDocentes.length} docentes en la base
        </div>

        <div className="docentes-filters">
          <div className="docentes-search-wrapper">
            <input
              type="text"
              placeholder="Buscar por nombre o ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="docentes-search-input"
            />
          </div>
        </div>
      </section>

      <section className="docentes-table-card">
        {loading ? (
          <div className="docentes-empty">Cargando docentes…</div>
        ) : filteredDocentes.length === 0 ? (
          <div className="docentes-empty">
            No se encontraron docentes con los filtros actuales.
          </div>
        ) : (
          <div className="docentes-table-wrapper">
            <table className="docentes-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre del docente</th>
                  <th className="docentes-col-actions">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocentes.map((doc) => (
                  <tr key={doc.id_docente}>
                    <td>{doc.id_docente}</td>
                    <td>{doc.nombre_docente}</td>
                    <td className="docentes-col-actions">
                      <button
                        type="button"
                        onClick={() => handleEdit(doc)}
                        className="docentes-btn docentes-btn-edit"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(doc)}
                        className="docentes-btn docentes-btn-delete"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <DocenteModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveDocente}
        initialData={editingDocente}
        saving={saving}
      />
    </main>
  );
}

export default DocentesPage;
