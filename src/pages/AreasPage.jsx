// src/pages/AreasPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import AreaModal from "../components/modals/AreaModal";
import "./AreasPage.css";

function AreasPage() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [saving, setSaving] = useState(false);

  // Cargar áreas
  useEffect(() => {
    fetchAreas();
  }, []);

  async function fetchAreas() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("area_academica")
        .select("id_area, nombre_area")
        .order("id_area", { ascending: true });

      if (error) {
        console.error("Error al cargar áreas académicas:", error);
        alert("Ocurrió un error al cargar las áreas académicas: " + error.message);
        return;
      }

      setAreas(data || []);
    } finally {
      setLoading(false);
    }
  }

  const filteredAreas = useMemo(() => {
    const term = search.toLowerCase().trim();

    return areas.filter((area) => {
      const matchSearch =
        !term ||
        area.nombre_area?.toLowerCase().includes(term) ||
        String(area.id_area).includes(term);

      return matchSearch;
    });
  }, [areas, search]);

  function handleOpenNew() {
    setEditingArea(null);
    setIsModalOpen(true);
  }

  function handleEdit(area) {
    setEditingArea(area);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingArea(null);
  }

  async function handleSaveArea(payload) {
    try {
      setSaving(true);

      if (editingArea) {
        const { error } = await supabase
          .from("area_academica")
          .update(payload)
          .eq("id_area", editingArea.id_area);

        if (error) {
          console.error("Error al actualizar área académica:", error);
          alert("Error al actualizar el área académica: " + error.message);
          return;
        }
      } else {
        const { error } = await supabase
          .from("area_academica")
          .insert([payload]);

        if (error) {
          console.error("Error al crear área académica:", error);
          alert("Error al crear el área académica: " + error.message);
          return;
        }
      }

      await fetchAreas();
      handleCloseModal();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(area) {
    const ok = window.confirm(
      `¿Seguro que deseas eliminar el área académica:\n\n${area.nombre_area}?`
    );
    if (!ok) return;

    const { error } = await supabase
      .from("area_academica")
      .delete()
      .eq("id_area", area.id_area);

    if (error) {
      console.error("Error al eliminar área académica:", error);
      alert("Ocurrió un error al eliminar el área académica: " + error.message);
      return;
    }

    setAreas((prev) => prev.filter((a) => a.id_area !== area.id_area));
  }

  return (
    <main className="areas-page">
      <header className="areas-header">
        <div>
          <p className="areas-badge">Panel de catálogo</p>
          <h1 className="areas-title">Áreas académicas</h1>
          <p className="areas-subtitle">
            Administra las áreas académicas disponibles para asignar a los cursos.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="areas-btn-primary areas-btn-new"
        >
          <span className="areas-btn-plus">＋</span>
          Nueva área académica
        </button>
      </header>

      <section className="areas-toolbar">
        <div className="areas-counter">
          {filteredAreas.length} áreas académicas en la base
        </div>

        <div className="areas-filters">
          <div className="areas-search-wrapper">
            <input
              type="text"
              placeholder="Buscar por nombre o ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="areas-search-input"
            />
          </div>
        </div>
      </section>

      <section className="areas-table-card">
        {loading ? (
          <div className="areas-empty">Cargando áreas académicas…</div>
        ) : filteredAreas.length === 0 ? (
          <div className="areas-empty">
            No se encontraron áreas académicas con los filtros actuales.
          </div>
        ) : (
          <div className="areas-table-wrapper">
            <table className="areas-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre del área académica</th>
                  <th className="areas-col-actions">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAreas.map((area) => (
                  <tr key={area.id_area}>
                    <td>{area.id_area}</td>
                    <td>{area.nombre_area}</td>
                    <td className="areas-col-actions">
                      <button
                        type="button"
                        onClick={() => handleEdit(area)}
                        className="areas-btn areas-btn-edit"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(area)}
                        className="areas-btn areas-btn-delete"
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

      <AreaModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveArea}
        initialData={editingArea}
        saving={saving}
      />
    </main>
  );
}

export default AreasPage;
