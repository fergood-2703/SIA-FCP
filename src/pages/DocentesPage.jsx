// src/pages/DocentesPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import DocenteModal from "../components/modals/DocenteModal";
import "./DocentesPage.css";

function buildNombreCompleto(docente) {
  const partes = [
    docente.nombre,
    docente.apellido_paterno,
    docente.apellido_materno,
  ].filter(Boolean);
  return partes.join(" ");
}

function DocentesPage() {
  const [docentes, setDocentes] = useState([]);
  const [areas, setAreas] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocente, setEditingDocente] = useState(null);

  useEffect(() => {
    fetchCatalogs();
  }, []);

  async function fetchCatalogs() {
    setLoading(true);
    try {
      // 1) Áreas académicas
      const { data: areasData, error: areasError } = await supabase
        .from("area_academica")
        .select("id_area, nombre_area")
        .order("nombre_area", { ascending: true });

      if (areasError) {
        console.error("Error al cargar áreas académicas:", areasError);
        alert(
          "Ocurrió un error al cargar las áreas académicas: " +
            areasError.message
        );
        return;
      }

      setAreas(areasData || []);

      // 2) Docentes con join de área
      const { data: docentesData, error: docentesError } = await supabase
        .from("docente")
        .select(
          `
          id_docente,
          nombre,
          apellido_paterno,
          apellido_materno,
          email,
          telefono,
          fecha_ingreso,
          nivel_academico,
          id_area,
          area_academica (
            nombre_area
          )
        `
        )
        .order("id_docente", { ascending: true });

      if (docentesError) {
        console.error("Error al cargar docentes:", docentesError);
        alert("Ocurrió un error al cargar los docentes: " + docentesError.message);
        return;
      }

      setDocentes(docentesData || []);
    } finally {
      setLoading(false);
    }
  }

  const filteredDocentes = useMemo(() => {
    const term = search.toLowerCase().trim();

    return docentes.filter((d) => {
      const nombreCompleto = buildNombreCompleto(d).toLowerCase();
      const areaNombre = d.area_academica?.nombre_area?.toLowerCase() ?? "";
      const email = d.email?.toLowerCase() ?? "";

      const matchSearch =
        !term ||
        nombreCompleto.includes(term) ||
        areaNombre.includes(term) ||
        email.includes(term) ||
        String(d.id_docente).includes(term);

      return matchSearch;
    });
  }, [docentes, search]);

  function handleOpenNew() {
    setEditingDocente(null);
    setIsModalOpen(true);
  }

  function handleEdit(docente) {
    setEditingDocente(docente);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingDocente(null);
  }

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
          alert("Error al actualizar al docente: " + error.message);
          return;
        }
      } else {
        const { error } = await supabase.from("docente").insert([payload]);

        if (error) {
          console.error("Error al crear docente:", error);
          alert("Error al crear al docente: " + error.message);
          return;
        }
      }

      await fetchCatalogs();
      handleCloseModal();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(docente) {
    const ok = window.confirm(
      `¿Seguro que deseas eliminar al docente:\n\n${buildNombreCompleto(
        docente
      )}?`
    );
    if (!ok) return;

    const { error } = await supabase
      .from("docente")
      .delete()
      .eq("id_docente", docente.id_docente);

    if (error) {
      console.error("Error al eliminar docente:", error);

      if (error.code === "23503") {
        alert(
          "No se puede eliminar este docente porque está asignado a uno o más cursos.\n\n" +
            "Primero reasigna o elimina los cursos que tiene asignados."
        );
      } else {
        alert("Ocurrió un error al eliminar al docente: " + error.message);
      }
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
            Administra el personal académico asignable a los cursos.
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
              placeholder="Buscar por nombre, área o correo"
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
                  <th>Nombre completo</th>
                  <th>Área académica</th>
                  <th>Nivel académico</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Fecha ingreso</th>
                  <th className="docentes-col-actions">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocentes.map((doc) => (
                  <tr key={doc.id_docente}>
                    <td>{doc.id_docente}</td>
                    <td>{buildNombreCompleto(doc)}</td>
                    <td>{doc.area_academica?.nombre_area || "—"}</td>
                    <td>{doc.nivel_academico || "—"}</td>
                    <td>{doc.email || "—"}</td>
                    <td>{doc.telefono || "—"}</td>
                    <td>
                      {doc.fecha_ingreso
                        ? new Date(doc.fecha_ingreso).toLocaleDateString()
                        : "—"}
                    </td>
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
        areas={areas}
      />
    </main>
  );
}

export default DocentesPage;
