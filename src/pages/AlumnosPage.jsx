// src/pages/AlumnosPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import AlumnoModal from "../components/modals/AlumnoModal";
import "./AlumnosPage.css";

const ESTADOS_FILTRO = [
  "Todos los estados",
  "Activo",
  "Baja temporal",
  "Egresado",
  "Baja definitiva",
];

function formatNombreCompleto(alumno) {
  return [alumno.nombre, alumno.apellido_paterno, alumno.apellido_materno]
    .filter(Boolean)
    .join(" ");
}

function AlumnosPage() {
  const [alumnos, setAlumnos] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [cursos, setCursos] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("Todos los estados");
  const [carreraFilter, setCarreraFilter] = useState("Todas las carreras");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlumno, setEditingAlumno] = useState(null);

  useEffect(() => {
    fetchCatalogs();
    fetchAlumnos();
  }, []);

  // --------- CATALOGOS (carreras y cursos) -------------------
  async function fetchCatalogs() {
    const [{ data: carrerasData }, { data: cursosData }] = await Promise.all([
      supabase
        .from("carrera")
        .select("id_carrera, nombre_carrera")
        .order("nombre_carrera", { ascending: true }),
      supabase
        .from("curso")
        .select("id_curso, nombre_curso")
        .order("nombre_curso", { ascending: true }),
    ]);

    setCarreras(carrerasData || []);
    setCursos(cursosData || []);
  }

  // --------- CARGA DE ALUMNOS -------------------------------
  async function fetchAlumnos() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("alumno")
        .select(
          `
          id_alumno,
          matricula,
          nombre,
          apellido_paterno,
          apellido_materno,
          email,
          telefono,
          fecha_nacimiento,
          fecha_inscripcion,
          semestre_actual,
          promedio_general,
          estado,
          id_carrera,
          id_curso,
          carrera (
            nombre_carrera
          ),
          curso (
            nombre_curso
          )
        `
        )
        .order("id_alumno", { ascending: true });

      if (error) {
        console.error("Error al cargar alumnos:", error);
        alert("Ocurrió un error al cargar los alumnos: " + error.message);
        return;
      }

      setAlumnos(data || []);
    } finally {
      setLoading(false);
    }
  }

  // --------- FILTROS ----------------------------------------
  const filteredAlumnos = useMemo(() => {
    const term = search.toLowerCase().trim();

    return alumnos.filter((alumno) => {
      const nombreCompleto = formatNombreCompleto(alumno).toLowerCase();
      const carreraNombre = alumno.carrera?.nombre_carrera?.toLowerCase() || "";
      const cursoNombre = alumno.curso?.nombre_curso?.toLowerCase() || "";
      const correo = (alumno.email || "").toLowerCase();

      const matchSearch =
        !term ||
        nombreCompleto.includes(term) ||
        carreraNombre.includes(term) ||
        cursoNombre.includes(term) ||
        correo.includes(term) ||
        alumno.matricula.toLowerCase().includes(term);

      const matchEstado =
        estadoFilter === "Todos los estados" ||
        alumno.estado === estadoFilter;

      const matchCarrera =
        carreraFilter === "Todas las carreras" ||
        alumno.carrera?.nombre_carrera === carreraFilter;

      return matchSearch && matchEstado && matchCarrera;
    });
  }, [alumnos, search, estadoFilter, carreraFilter]);

  // --------- MODAL ------------------------------------------
  function handleOpenNew() {
    setEditingAlumno(null);
    setIsModalOpen(true);
  }

  function handleEdit(alumno) {
    setEditingAlumno(alumno);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingAlumno(null);
  }

  // --------- GUARDAR (crear / actualizar) -------------------
  async function handleSaveAlumno(payload) {
    try {
      setSaving(true);

      if (editingAlumno) {
        const { error } = await supabase
          .from("alumno")
          .update(payload)
          .eq("id_alumno", editingAlumno.id_alumno);

        if (error) {
          console.error("Error al actualizar alumno:", error);
          alert("Error al actualizar el alumno: " + error.message);
          return;
        }
      } else {
        const { error } = await supabase.from("alumno").insert([payload]);

        if (error) {
          console.error("Error al crear alumno:", error);
          if (error.code === "23505") {
            alert(
              "No se pudo crear el alumno. Verifica que la matrícula y el correo no estén duplicados."
            );
          } else {
            alert("Error al crear el alumno: " + error.message);
          }
          return;
        }
      }

      await fetchAlumnos();
      handleCloseModal();
    } finally {
      setSaving(false);
    }
  }

  // --------- ELIMINAR ---------------------------------------
  async function handleDelete(alumno) {
    const ok = window.confirm(
      `¿Seguro que deseas eliminar al alumno:\n\n${formatNombreCompleto(
        alumno
      )} (${alumno.matricula})?`
    );
    if (!ok) return;

    const { error } = await supabase
      .from("alumno")
      .delete()
      .eq("id_alumno", alumno.id_alumno);

    if (error) {
      console.error("Error al eliminar alumno:", error);
      alert("Ocurrió un error al eliminar el alumno: " + error.message);
      return;
    }

    setAlumnos((prev) =>
      prev.filter((a) => a.id_alumno !== alumno.id_alumno)
    );
  }

  // --------- RENDER -----------------------------------------
  const carrerasParaFiltro = [
    "Todas las carreras",
    ...Array.from(
      new Set(
        (carreras || []).map((c) => c.nombre_carrera).filter(Boolean)
      )
    ),
  ];

  return (
    <main className="alumnos-page">
      <header className="alumnos-header">
        <div>
          <p className="alumnos-badge">Gestión de estudiantes</p>
          <h1 className="alumnos-title">Alumnos</h1>
          <p className="alumnos-subtitle">
            Administra la información de los estudiantes, su carrera, curso
            actual y estado académico.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="alumnos-btn-primary alumnos-btn-new"
        >
          <span className="alumnos-btn-plus">＋</span>
          Nuevo alumno
        </button>
      </header>

      <section className="alumnos-toolbar">
        <div className="alumnos-counter">
          {filteredAlumnos.length} alumno
          {filteredAlumnos.length === 1 ? "" : "s"} en la base
        </div>

        <div className="alumnos-filters">
          <div className="alumnos-search-wrapper">
            <input
              type="text"
              placeholder="Buscar por nombre, matrícula, carrera o correo"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="alumnos-search-input"
            />
          </div>

          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
            className="alumnos-select"
          >
            {ESTADOS_FILTRO.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>

          <select
            value={carreraFilter}
            onChange={(e) => setCarreraFilter(e.target.value)}
            className="alumnos-select"
          >
            {carrerasParaFiltro.map((nombre) => (
              <option key={nombre} value={nombre}>
                {nombre}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="alumnos-table-card">
        {loading ? (
          <div className="alumnos-empty">Cargando alumnos…</div>
        ) : filteredAlumnos.length === 0 ? (
          <div className="alumnos-empty">
            No se encontraron alumnos con los filtros actuales.
          </div>
        ) : (
          <div className="alumnos-table-wrapper">
            <table className="alumnos-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Matrícula</th>
                  <th>Nombre completo</th>
                  <th>Carrera</th>
                  <th>Curso actual</th>
                  <th>Sem.</th>
                  <th>Promedio</th>
                  <th>Estado</th>
                  <th className="alumnos-col-actions">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlumnos.map((alumno) => (
                  <tr key={alumno.id_alumno}>
                    <td>{alumno.id_alumno}</td>
                    <td>{alumno.matricula}</td>
                    <td>{formatNombreCompleto(alumno)}</td>
                    <td>{alumno.carrera?.nombre_carrera || "—"}</td>
                    <td>{alumno.curso?.nombre_curso || "—"}</td>
                    <td className="alumnos-col-number">
                      {alumno.semestre_actual ?? "—"}
                    </td>
                    <td className="alumnos-col-number">
                      {alumno.promedio_general ?? "—"}
                    </td>
                    <td>{alumno.estado || "Activo"}</td>
                    <td className="alumnos-col-actions">
                      <button
                        type="button"
                        onClick={() => handleEdit(alumno)}
                        className="alumnos-btn alumnos-btn-edit"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(alumno)}
                        className="alumnos-btn alumnos-btn-delete"
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

      <AlumnoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveAlumno}
        initialData={editingAlumno}
        saving={saving}
        carreras={carreras}
        cursos={cursos}
      />
    </main>
  );
}

export default AlumnosPage;
