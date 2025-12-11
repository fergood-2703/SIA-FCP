// src/pages/CursosPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import CourseModal from "../components/modals/CourseModal";
import "./CursosPage.css";

// Opciones para filtros
const NIVELES_FILTRO = ["Todos los niveles", "Diplomado", "Licenciatura", "Posgrado"];
const MODALIDADES_FILTRO = [
  "Todas las modalidades",
  "Presencial",
  "En línea",
  "Mixta",
];

function CursosPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [nivelFilter, setNivelFilter] = useState("Todos los niveles");
  const [modalidadFilter, setModalidadFilter] = useState("Todas las modalidades");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [saving, setSaving] = useState(false);

  // catálogos
  const [areas, setAreas] = useState([]);
  const [docentes, setDocentes] = useState([]);

  // Cargar cursos + catálogos
  useEffect(() => {
    fetchCourses();
    fetchCatalogs();
  }, []);

  async function fetchCourses() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("curso")
        .select(
          `
          id_curso,
          nombre_curso,
          nivel,
          modalidad,
          duracion_semanas,
          creditos,
          cupo_maximo,
          estado_curso,
          id_area,
          id_docente,
          area_academica (
            nombre_area
          ),
          docente (
            nombre_docente
          )
        `
        )
        .order("id_curso", { ascending: true });

      if (error) {
        console.error("Error al cargar cursos:", error);
        alert("Ocurrió un error al cargar los cursos: " + error.message);
        return;
      }

      setCourses(data || []);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCatalogs() {
    // Áreas académicas
    const { data: areasData, error: areasError } = await supabase
      .from("area_academica")
      .select("id_area, nombre_area")
      .order("nombre_area", { ascending: true });

    if (areasError) {
      console.error("Error al cargar áreas:", areasError);
    } else {
      setAreas(areasData || []);
    }

    // Docentes
    const { data: docentesData, error: docentesError } = await supabase
      .from("docente")
      .select("id_docente, nombre_docente")
      .order("nombre_docente", { ascending: true });

    if (docentesError) {
      console.error("Error al cargar docentes:", docentesError);
    } else {
      setDocentes(docentesData || []);
    }
  }

  // Lista filtrada (por búsqueda, nivel y modalidad)
  const filteredCourses = useMemo(() => {
    const searchTerm = search.toLowerCase().trim();

    return courses.filter((curso) => {
      const matchSearch =
        !searchTerm ||
        curso.nombre_curso?.toLowerCase().includes(searchTerm) ||
        String(curso.id_curso).includes(searchTerm);

      const matchNivel =
        nivelFilter === "Todos los niveles" || curso.nivel === nivelFilter;

      const matchModalidad =
        modalidadFilter === "Todas las modalidades" ||
        curso.modalidad === modalidadFilter;

      return matchSearch && matchNivel && matchModalidad;
    });
  }, [courses, search, nivelFilter, modalidadFilter]);

  // Abrir modal para nuevo curso
  function handleOpenNew() {
    setEditingCourse(null);
    setIsModalOpen(true);
  }

  // Abrir modal para editar curso
  function handleEdit(course) {
    setEditingCourse(course);
    setIsModalOpen(true);
  }

  // Cerrar modal
  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingCourse(null);
  }

  // Guardar (crear / actualizar)
  async function handleSaveCourse(payload) {
    try {
      setSaving(true);

      if (editingCourse) {
        const { error } = await supabase
          .from("curso")
          .update(payload)
          .eq("id_curso", editingCourse.id_curso);

        if (error) {
          console.error("Error al actualizar curso:", error);
          alert("Error al actualizar curso: " + error.message);
          return;
        }
      } else {
        const { error } = await supabase.from("curso").insert([payload]);

        if (error) {
          console.error("Error al crear curso:", error);
          alert("Error al crear curso: " + error.message);
          return;
        }
      }

      await fetchCourses();
      handleCloseModal();
    } finally {
      setSaving(false);
    }
  }

  // Eliminar
  async function handleDelete(course) {
    const ok = window.confirm(
      `¿Seguro que deseas eliminar el curso:\n\n${course.nombre_curso}?`
    );
    if (!ok) return;

    const { error } = await supabase
      .from("curso")
      .delete()
      .eq("id_curso", course.id_curso);

    if (error) {
      console.error("Error al eliminar curso:", error);
      alert("Ocurrió un error al eliminar el curso: " + error.message);
      return;
    }

    setCourses((prev) => prev.filter((c) => c.id_curso !== course.id_curso));
  }

  return (
    <main className="cursos-page">
      <header className="cursos-header">
        <div>
          <p className="cursos-badge">Panel de catálogo</p>
          <h1 className="cursos-title">Cursos</h1>
          <p className="cursos-subtitle">
            Consulta, filtra y actualiza la oferta académica del campus.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="cursos-btn-primary cursos-btn-new"
        >
          <span className="cursos-btn-plus">＋</span>
          Nuevo curso
        </button>
      </header>

      <section className="cursos-toolbar">
        <div className="cursos-counter">
          {filteredCourses.length} cursos en la base
        </div>

        <div className="cursos-filters">
          <div className="cursos-search-wrapper">
            <input
              type="text"
              placeholder="Buscar por nombre o ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="cursos-search-input"
            />
          </div>

          <select
            value={nivelFilter}
            onChange={(e) => setNivelFilter(e.target.value)}
            className="cursos-select"
          >
            {NIVELES_FILTRO.map((nivel) => (
              <option key={nivel} value={nivel}>
                {nivel}
              </option>
            ))}
          </select>

          <select
            value={modalidadFilter}
            onChange={(e) => setModalidadFilter(e.target.value)}
            className="cursos-select"
          >
            {MODALIDADES_FILTRO.map((mod) => (
              <option key={mod} value={mod}>
                {mod}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="cursos-table-card">
        {loading ? (
          <div className="cursos-empty">Cargando cursos…</div>
        ) : filteredCourses.length === 0 ? (
          <div className="cursos-empty">
            No se encontraron cursos con los filtros actuales.
          </div>
        ) : (
          <div className="cursos-table-wrapper">
            <table className="cursos-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Nivel</th>
                  <th>Modalidad</th>
                  <th>Duración (sem)</th>
                  <th>Créditos</th>
                  <th>Cupo máx.</th>
                  <th>Estado</th>
                  <th>Área académica</th>
                  <th>Docente</th>
                  <th className="cursos-col-actions">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((curso) => (
                  <tr key={curso.id_curso}>
                    <td>{curso.id_curso}</td>
                    <td>{curso.nombre_curso}</td>
                    <td>{curso.nivel}</td>
                    <td>{curso.modalidad}</td>
                    <td className="cursos-col-number">
                      {curso.duracion_semanas ?? "—"}
                    </td>
                    <td className="cursos-col-number">
                      {curso.creditos ?? "—"}
                    </td>
                    <td className="cursos-col-number">
                      {curso.cupo_maximo ?? "—"}
                    </td>
                    <td>{curso.estado_curso ?? "—"}</td>
                    <td>{curso.area_academica?.nombre_area ?? "—"}</td>
                    <td>{curso.docente?.nombre_docente ?? "—"}</td>
                    <td className="cursos-col-actions">
                      <button
                        type="button"
                        onClick={() => handleEdit(curso)}
                        className="cursos-btn cursos-btn-edit"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(curso)}
                        className="cursos-btn cursos-btn-delete"
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

      <CourseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveCourse}
        initialData={editingCourse}
        saving={saving}
        areas={areas}
        docentes={docentes}
      />
    </main>
  );
}

export default CursosPage;
