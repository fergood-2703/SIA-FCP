// src/pages/CarrerasPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import CarreraModal from "../components/modals/CarreraModal";
import "./CarrerasPage.css";

const NIVELES_FILTRO = [
  "Todos los niveles",
  "Licenciatura",
  "Maestría",
  "Doctorado",
];

const ESTADOS_FILTRO = ["Todos los estados", "Activa", "Inactiva"];

function CarrerasPage() {
  const [carreras, setCarreras] = useState([]);
  const [areas, setAreas] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [nivelFilter, setNivelFilter] = useState("Todos los niveles");
  const [estadoFilter, setEstadoFilter] = useState("Todos los estados");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCarrera, setEditingCarrera] = useState(null);

  useEffect(() => {
    fetchCatalogs();
    fetchCarreras();
  }, []);

  // Cargar áreas para el select
  async function fetchCatalogs() {
    const { data, error } = await supabase
      .from("area_academica")
      .select("id_area, nombre_area")
      .order("nombre_area", { ascending: true });

    if (error) {
      console.error("Error al cargar áreas académicas:", error);
      alert("Ocurrió un error al cargar las áreas académicas.");
      return;
    }

    setAreas(data || []);
  }

  // Cargar carreras
  async function fetchCarreras() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("carrera")
        .select(
          `
          id_carrera,
          nombre_carrera,
          nivel_academico,
          duracion_semestres,
          creditos_totales,
          estado,
          id_area,
          area_academica (
            nombre_area
          )
        `
        )
        .order("id_carrera", { ascending: true });

      if (error) {
        console.error("Error al cargar carreras:", error);
        alert("Ocurrió un error al cargar las carreras: " + error.message);
        return;
      }

      setCarreras(data || []);
    } finally {
      setLoading(false);
    }
  }

  // Filtros y búsqueda
  const filteredCarreras = useMemo(() => {
    const term = search.toLowerCase().trim();

    return carreras.filter((carrera) => {
      const matchSearch =
        !term ||
        carrera.nombre_carrera.toLowerCase().includes(term) ||
        String(carrera.id_carrera).includes(term) ||
        carrera.area_academica?.nombre_area
          ?.toLowerCase()
          .includes(term) ||
        (carrera.estado || "").toLowerCase().includes(term);

      const matchNivel =
        nivelFilter === "Todos los niveles" ||
        carrera.nivel_academico === nivelFilter;

      const matchEstado =
        estadoFilter === "Todos los estados" ||
        (carrera.estado || "Activa") === estadoFilter;

      return matchSearch && matchNivel && matchEstado;
    });
  }, [carreras, search, nivelFilter, estadoFilter]);

  // Abrir / cerrar modal
  function handleOpenNew() {
    setEditingCarrera(null);
    setIsModalOpen(true);
  }

  function handleEdit(carrera) {
    setEditingCarrera(carrera);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingCarrera(null);
  }

  // Guardar (crear / actualizar)
  async function handleSaveCarrera(payload) {
    try {
      setSaving(true);

      if (editingCarrera) {
        const { error } = await supabase
          .from("carrera")
          .update(payload)
          .eq("id_carrera", editingCarrera.id_carrera);

        if (error) {
          console.error("Error al actualizar carrera:", error);
          alert("Error al actualizar la carrera: " + error.message);
          return;
        }
      } else {
        const { error } = await supabase.from("carrera").insert([payload]);

        if (error) {
          console.error("Error al crear carrera:", error);
          alert("Error al crear la carrera: " + error.message);
          return;
        }
      }

      await fetchCarreras();
      handleCloseModal();
    } finally {
      setSaving(false);
    }
  }

  // Eliminar
  async function handleDelete(carrera) {
    const ok = window.confirm(
      `¿Seguro que deseas eliminar la carrera:\n\n${carrera.nombre_carrera}?`
    );
    if (!ok) return;

    const { error } = await supabase
      .from("carrera")
      .delete()
      .eq("id_carrera", carrera.id_carrera);

    if (error) {
      console.error("Error al eliminar carrera:", error);

      if (error.code === "23503") {
        alert(
          "No se puede eliminar esta carrera porque está siendo utilizada por uno o más alumnos.\n\n" +
            "Primero reasigna o da de baja a los alumnos que tengan esta carrera."
        );
      } else {
        alert("Ocurrió un error al eliminar la carrera: " + error.message);
      }
      return;
    }

    setCarreras((prev) =>
      prev.filter((c) => c.id_carrera !== carrera.id_carrera)
    );
  }

  return (
    <main className="carreras-page">
      <header className="carreras-header">
        <div>
          <p className="carreras-badge">Panel de catálogo</p>
          <h1 className="carreras-title">Carreras</h1>
          <p className="carreras-subtitle">
            Administra la oferta de programas educativos vinculados a las áreas
            académicas del campus.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="carreras-btn-primary carreras-btn-new"
        >
          <span className="carreras-btn-plus">＋</span>
          Nueva carrera
        </button>
      </header>

      <section className="carreras-toolbar">
        <div className="carreras-counter">
          {filteredCarreras.length} carreras en la base
        </div>

        <div className="carreras-filters">
          <div className="carreras-search-wrapper">
            <input
              type="text"
              placeholder="Buscar por nombre, área o estado"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="carreras-search-input"
            />
          </div>

          <select
            value={nivelFilter}
            onChange={(e) => setNivelFilter(e.target.value)}
            className="carreras-select"
          >
            {NIVELES_FILTRO.map((nivel) => (
              <option key={nivel} value={nivel}>
                {nivel}
              </option>
            ))}
          </select>

          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
            className="carreras-select"
          >
            {ESTADOS_FILTRO.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="carreras-table-card">
        {loading ? (
          <div className="carreras-empty">Cargando carreras…</div>
        ) : filteredCarreras.length === 0 ? (
          <div className="carreras-empty">
            No se encontraron carreras con los filtros actuales.
          </div>
        ) : (
          <div className="carreras-table-wrapper">
            <table className="carreras-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre de la carrera</th>
                  <th>Nivel académico</th>
                  <th>Duración (semestres)</th>
                  <th>Créditos totales</th>
                  <th>Área académica</th>
                  <th>Estado</th>
                  <th className="carreras-col-actions">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCarreras.map((carrera) => (
                  <tr key={carrera.id_carrera}>
                    <td>{carrera.id_carrera}</td>
                    <td>{carrera.nombre_carrera}</td>
                    <td>{carrera.nivel_academico}</td>
                    <td className="carreras-col-number">
                      {carrera.duracion_semestres}
                    </td>
                    <td className="carreras-col-number">
                      {carrera.creditos_totales}
                    </td>
                    <td>
                      {carrera.area_academica?.nombre_area || "Sin área"}
                    </td>
                    <td>{carrera.estado || "Activa"}</td>
                    <td className="carreras-col-actions">
                      <button
                        type="button"
                        onClick={() => handleEdit(carrera)}
                        className="carreras-btn carreras-btn-edit"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(carrera)}
                        className="carreras-btn carreras-btn-delete"
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

      <CarreraModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveCarrera}
        initialData={editingCarrera}
        saving={saving}
        areas={areas}
      />
    </main>
  );
}

export default CarrerasPage;
