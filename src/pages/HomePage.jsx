// src/pages/HomePage.jsx
import "./HomePage.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

// ICONOS (Material Design, desde react-icons)
import {
  MdMenuBook,
  MdPeopleAlt,
  MdSchool,
  MdPersonOutline,
  MdApartment,
  MdArrowForwardIos,
} from "react-icons/md";


// Paletas de colores para las donas
const ESTADO_COLORS = ["#2563eb", "#16a34a", "#f97316", "#e11d48", "#6b7280"];
const CARRERA_COLORS = ["#0ea5e9", "#22c55e", "#a855f7", "#f97316", "#facc15"];

// Genera el conic-gradient para la dona
function buildConicGradient(data, colors) {
  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
  if (!total) {
    return "conic-gradient(#e5e7eb 0 100%)";
  }

  let current = 0;
  const segments = data.map((item, index) => {
    const fraction = (item.value || 0) / total;
    const next = current + fraction * 100;
    const color = colors[index % colors.length];
    const segment = `${color} ${current}% ${next}%`;
    current = next;
    return segment;
  });

  return `conic-gradient(${segments.join(", ")})`;
}

function HomePage() {
  const [metrics, setMetrics] = useState({
    cursos: 0,
    cursosActivos: 0,
    docentes: 0,
    areas: 0,
    alumnos: 0,
    carreras: 0,
  });
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  const [lastCourses, setLastCourses] = useState([]);
  const [loadingLastCourses, setLoadingLastCourses] = useState(true);

  // datos para las gráficas
  const [alumnosEstadoData, setAlumnosEstadoData] = useState([]);
  const [alumnosCarreraData, setAlumnosCarreraData] = useState([]);
  const [topCursos, setTopCursos] = useState([]);
  const [loadingCharts, setLoadingCharts] = useState(true);

  // Cargar métricas, últimos cursos y gráficas al entrar
  useEffect(() => {
    fetchMetrics();
    fetchLastCourses();
    fetchChartData();
  }, []);

  // ========== MÉTRICAS ======================================
  async function fetchMetrics() {
    try {
      setLoadingMetrics(true);

      const [
        { count: totalCursos, error: cursosError },
        { count: cursosActivos, error: cursosActivosError },
        { count: totalDocentes, error: docentesError },
        { count: totalAreas, error: areasError },
        { count: totalAlumnos, error: alumnosError },
        { count: totalCarreras, error: carrerasError },
      ] = await Promise.all([
        supabase.from("curso").select("*", { count: "exact", head: true }),
        supabase
          .from("curso")
          .select("*", { count: "exact", head: true })
          .eq("estado_curso", "Activo"),
        supabase.from("docente").select("*", { count: "exact", head: true }),
        supabase
          .from("area_academica")
          .select("*", { count: "exact", head: true }),
        supabase.from("alumno").select("*", { count: "exact", head: true }),
        supabase.from("carrera").select("*", { count: "exact", head: true }),
      ]);

      if (
        cursosError ||
        cursosActivosError ||
        docentesError ||
        areasError ||
        alumnosError ||
        carrerasError
      ) {
        console.error("Error al cargar métricas:", {
          cursosError,
          cursosActivosError,
          docentesError,
          areasError,
          alumnosError,
          carrerasError,
        });
        return;
      }

      setMetrics({
        cursos: totalCursos ?? 0,
        cursosActivos: cursosActivos ?? 0,
        docentes: totalDocentes ?? 0,
        areas: totalAreas ?? 0,
        alumnos: totalAlumnos ?? 0,
        carreras: totalCarreras ?? 0,
      });
    } finally {
      setLoadingMetrics(false);
    }
  }

  // ========== ÚLTIMOS CURSOS ================================
  async function fetchLastCourses() {
    try {
      setLoadingLastCourses(true);

      const { data, error } = await supabase
        .from("curso")
        .select(
          `
          id_curso,
          nombre_curso,
          nivel,
          modalidad,
          estado_curso,
          area_academica (
            nombre_area
          )
        `
        )
        .order("id_curso", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error al cargar últimos cursos:", error);
        return;
      }

      setLastCourses(data || []);
    } finally {
      setLoadingLastCourses(false);
    }
  }

  // ========== DATOS PARA GRÁFICAS ==========================
  async function fetchChartData() {
    try {
      setLoadingCharts(true);

      // Traemos todos los alumnos con su carrera
      const { data: alumnos, error } = await supabase
        .from("alumno")
        .select(
          `
          id_alumno,
          estado,
          id_curso,
          carrera (
            id_carrera,
            nombre_carrera
          )
        `
        );

      if (error) {
        console.error("Error al cargar alumnos para gráficas:", error);
        return;
      }

      if (!alumnos || alumnos.length === 0) {
        setAlumnosEstadoData([]);
        setAlumnosCarreraData([]);
        setTopCursos([]);
        return;
      }

      // --- Distribución por estado ---
      const estadoCounts = {};
      alumnos.forEach((a) => {
        const key = a.estado || "Sin estado";
        estadoCounts[key] = (estadoCounts[key] || 0) + 1;
      });

      const alumnosEstadoArray = Object.entries(estadoCounts).map(
        ([label, value]) => ({
          label,
          value,
        })
      );
      setAlumnosEstadoData(alumnosEstadoArray);

      // --- Distribución por carrera ---
      const carreraCounts = {};
      alumnos.forEach((a) => {
        const nombreCarrera = a.carrera?.nombre_carrera || "Sin carrera";
        carreraCounts[nombreCarrera] = (carreraCounts[nombreCarrera] || 0) + 1;
      });

      let carreraEntries = Object.entries(carreraCounts).map(
        ([label, value]) => ({ label, value })
      );
      carreraEntries.sort((a, b) => b.value - a.value);

      let carreraData;
      if (carreraEntries.length <= 5) {
        carreraData = carreraEntries;
      } else {
        const main = carreraEntries.slice(0, 4);
        const othersCount = carreraEntries
          .slice(4)
          .reduce((sum, item) => sum + item.value, 0);
        carreraData = [...main, { label: "Otras carreras", value: othersCount }];
      }
      setAlumnosCarreraData(carreraData);

      // --- Top cursos por número de alumnos ---
      const cursoCounts = {};
      alumnos.forEach((a) => {
        if (a.id_curso) {
          cursoCounts[a.id_curso] = (cursoCounts[a.id_curso] || 0) + 1;
        }
      });

      const cursoIds = Object.keys(cursoCounts);
      if (cursoIds.length === 0) {
        setTopCursos([]);
        return;
      }

      const { data: cursos, error: cursosError } = await supabase
        .from("curso")
        .select("id_curso, nombre_curso")
        .in(
          "id_curso",
          cursoIds.map((id) => Number(id))
        );

      if (cursosError) {
        console.error("Error al cargar cursos para ranking:", cursosError);
        return;
      }

      const ranking = (cursos || [])
        .map((c) => ({
          id_curso: c.id_curso,
          nombre_curso: c.nombre_curso,
          value: cursoCounts[c.id_curso] || 0,
        }))
        .filter((item) => item.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      setTopCursos(ranking);
    } finally {
      setLoadingCharts(false);
    }
  }

  // Totales para las donas (solo para porcentaje en leyenda)
  const totalAlumnosEstado = alumnosEstadoData.reduce(
    (sum, item) => sum + item.value,
    0
  );
  const totalAlumnosCarrera = alumnosCarreraData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  const maxCursoCount = topCursos.reduce(
    (max, item) => (item.value > max ? item.value : max),
    0
  );

  // ========== RENDER ========================================
  return (
    <main className="home-root">
      {/* HERO ---------------------------------------------------- */}
      <section className="home-hero">
        <div className="home-hero-text">
          <p className="home-eyebrow">TecNM Campus Felipe Carrillo Puerto</p>
          <h1 className="home-title">
            Sistema de Información Académica{" "}
            <span className="home-highlight">(SIA-FCP)</span>
          </h1>
          <p className="home-hero-description">
            Panel interno para consultar y administrar áreas académicas,
            docentes, carreras, cursos y alumnos del campus, conectado a la base
            de datos en Supabase.
          </p>

          <div className="home-cta-row">
            <Link to="/cursos" className="home-cta-primary">
              Ver catálogo de cursos
            </Link>
            <Link to="/docentes" className="home-cta-secondary">
              Ver docentes
            </Link>
          </div>

          <p className="home-cta-note">
            Usa la barra de navegación para moverte entre Cursos, Docentes,
            Áreas, Carreras y Alumnos.
          </p>
        </div>
      </section>

      {/* MÉTRICAS PRINCIPALES ------------------------------------ */}
      <section className="home-metrics-section">
        <div className="home-metrics">
          <article className="home-metric-card">
            <div className="home-metric-icon">
              <MdMenuBook />
            </div>
            <div className="home-metric-content">
              <span className="home-metric-label">Cursos totales</span>
              <strong className="home-metric-value">
                {loadingMetrics ? "…" : metrics.cursos}
              </strong>
              <p className="home-metric-help">
                {loadingMetrics
                  ? "Calculando oferta actual…"
                  : `${metrics.cursosActivos} curso${
                      metrics.cursosActivos === 1 ? "" : "s"
                    } activos`}
              </p>
            </div>
          </article>

          <article className="home-metric-card">
            <div className="home-metric-icon">
              <MdPeopleAlt />
            </div>
            <div className="home-metric-content">
              <span className="home-metric-label">Alumnos</span>
              <strong className="home-metric-value">
                {loadingMetrics ? "…" : metrics.alumnos}
              </strong>
              <p className="home-metric-help">
                Estudiantes inscritos en algún curso.
              </p>
            </div>
          </article>

          <article className="home-metric-card">
            <div className="home-metric-icon">
              <MdSchool />
            </div>
            <div className="home-metric-content">
              <span className="home-metric-label">Carreras</span>
              <strong className="home-metric-value">
                {loadingMetrics ? "…" : metrics.carreras}
              </strong>
              <p className="home-metric-help">
                Programas académicos registrados.
              </p>
            </div>
          </article>

          <article className="home-metric-card">
            <div className="home-metric-icon">
              <MdPersonOutline />
            </div>
            <div className="home-metric-content">
              <span className="home-metric-label">Docentes</span>
              <strong className="home-metric-value">
                {loadingMetrics ? "…" : metrics.docentes}
              </strong>
              <p className="home-metric-help">
                Personal académico asignable a cursos.
              </p>
            </div>
          </article>

          <article className="home-metric-card">
            <div className="home-metric-icon">
              <MdApartment />
            </div>
            <div className="home-metric-content">
              <span className="home-metric-label">Áreas académicas</span>
              <strong className="home-metric-value">
                {loadingMetrics ? "…" : metrics.areas}
              </strong>
              <p className="home-metric-help">
                Campos de conocimiento del campus.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* DASHBOARD DE GRÁFICAS ---------------------------------- */}
      <section className="home-dashboard">
        <div className="home-dashboard-charts">
          {/* Dona: alumnos por estado */}
          <article className="home-dashboard-card">
            <header className="home-dashboard-card-header">
              <h2>Distribución de alumnos por estado</h2>
              <p>Visualiza cuántos alumnos están activos, en baja, etc.</p>
            </header>

            {loadingCharts ? (
              <div className="home-empty small">
                Calculando distribución de alumnos…
              </div>
            ) : !alumnosEstadoData.length ? (
              <div className="home-empty small">
                Aún no hay alumnos registrados.
              </div>
            ) : (
              <div className="home-dashboard-row">
                <div className="home-donut-wrapper">
                  <div
                    className="home-donut"
                    style={{
                      backgroundImage: buildConicGradient(
                        alumnosEstadoData,
                        ESTADO_COLORS
                      ),
                    }}
                  >
                    <div className="home-donut-inner">
                      <span className="home-donut-number">
                        {totalAlumnosEstado}
                      </span>
                      <span className="home-donut-label">Alumnos</span>
                    </div>
                  </div>
                </div>

                <ul className="home-donut-legend">
                  {alumnosEstadoData.map((item, index) => {
                    const percent =
                      totalAlumnosEstado > 0
                        ? Math.round((item.value / totalAlumnosEstado) * 100)
                        : 0;
                    return (
                      <li key={item.label} className="home-donut-legend-item">
                        <span
                          className="home-donut-color"
                          style={{
                            backgroundColor:
                              ESTADO_COLORS[index % ESTADO_COLORS.length],
                          }}
                        />
                        <span className="home-donut-legend-label">
                          {item.label}
                        </span>
                        <span className="home-donut-legend-value">
                          {item.value} · {percent}%
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </article>

          {/* Dona: alumnos por carrera */}
          <article className="home-dashboard-card">
            <header className="home-dashboard-card-header">
              <h2>Alumnos por carrera</h2>
              <p>
                Muestra cómo se distribuyen los estudiantes entre las
                diferentes carreras.
              </p>
            </header>

            {loadingCharts ? (
              <div className="home-empty small">
                Calculando distribución por carrera…
              </div>
            ) : !alumnosCarreraData.length ? (
              <div className="home-empty small">
                Aún no hay alumnos vinculados a carreras.
              </div>
            ) : (
              <div className="home-dashboard-row">
                <div className="home-donut-wrapper">
                  <div
                    className="home-donut"
                    style={{
                      backgroundImage: buildConicGradient(
                        alumnosCarreraData,
                        CARRERA_COLORS
                      ),
                    }}
                  >
                    <div className="home-donut-inner">
                      <span className="home-donut-number">
                        {totalAlumnosCarrera}
                      </span>
                      <span className="home-donut-label">Alumnos</span>
                    </div>
                  </div>
                </div>

                <ul className="home-donut-legend">
                  {alumnosCarreraData.map((item, index) => {
                    const percent =
                      totalAlumnosCarrera > 0
                        ? Math.round((item.value / totalAlumnosCarrera) * 100)
                        : 0;
                    return (
                      <li key={item.label} className="home-donut-legend-item">
                        <span
                          className="home-donut-color"
                          style={{
                            backgroundColor:
                              CARRERA_COLORS[index % CARRERA_COLORS.length],
                          }}
                        />
                        <span className="home-donut-legend-label">
                          {item.label}
                        </span>
                        <span className="home-donut-legend-value">
                          {item.value} · {percent}%
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </article>
        </div>

        {/* Ranking de cursos */}
        <article className="home-dashboard-card home-dashboard-ranking">
          <header className="home-dashboard-card-header">
            <h2>Top 5 cursos por número de alumnos</h2>
            <p>
              Cursos con más estudiantes inscritos. Útil para identificar
              cargas y demanda.
            </p>
          </header>

          {loadingCharts ? (
            <div className="home-empty small">
              Calculando ranking de cursos…
            </div>
          ) : !topCursos.length ? (
            <div className="home-empty small">
              Aún no hay alumnos inscritos en cursos.
            </div>
          ) : (
            <ol className="home-ranking-list">
              {topCursos.map((curso) => {
                const widthPercent =
                  maxCursoCount > 0
                    ? (curso.value / maxCursoCount) * 100
                    : 0;
                return (
                  <li key={curso.id_curso} className="home-ranking-item">
                    <div className="home-ranking-header">
                      <span className="home-ranking-name">
                        {curso.nombre_curso}
                      </span>
                      <span className="home-ranking-value">
                        {curso.value} alumno
                        {curso.value === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="home-ranking-bar">
                      <div
                        className="home-ranking-bar-fill"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </article>
      </section>

      {/* ÚLTIMOS CURSOS ----------------------------------------- */}
      <section className="home-section">
        <header className="home-section-header">
          <h2 className="home-section-title">Últimos cursos registrados</h2>
          <Link to="/cursos" className="home-link-inline">
            Ir a todos los cursos →
          </Link>
        </header>

        {loadingLastCourses ? (
          <div className="home-empty">Cargando cursos recientes…</div>
        ) : lastCourses.length === 0 ? (
          <div className="home-empty">
            Aún no hay cursos registrados en la base de datos.
          </div>
        ) : (
          <div className="home-last-courses-list">
            {lastCourses.map((curso) => (
              <article key={curso.id_curso} className="home-last-course-card">
                <div className="home-last-course-main">
                  <h3 className="home-last-course-name">
                    {curso.nombre_curso}
                  </h3>
                  <p className="home-last-course-meta">
                    {curso.nivel} · {curso.modalidad} ·{" "}
                    {curso.area_academica?.nombre_area || "Sin área asignada"}
                  </p>
                </div>
                <span className="home-last-course-status">
                  {curso.estado_curso}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* NAVEGACIÓN RÁPIDA -------------------------------------- */}
      <section className="home-section">
        <header className="home-section-header">
          <h2 className="home-section-title">Navegación rápida</h2>
        </header>

        <div className="home-nav-grid">
          <Link to="/cursos" className="home-nav-card">
            <div className="home-nav-main">
              <div className="home-nav-icon">
                <MdMenuBook />
              </div>
              <div className="home-nav-text">
                <h3>Cursos</h3>
                <p>Consulta y edita la oferta académica vigente.</p>
              </div>
            </div>
            <span className="home-nav-chevron">
              <MdArrowForwardIos />
            </span>
          </Link>

          <Link to="/docentes" className="home-nav-card">
            <div className="home-nav-main">
              <div className="home-nav-icon">
                <MdPersonOutline />
              </div>
              <div className="home-nav-text">
                <h3>Docentes</h3>
                <p>Gestiona el personal académico asignable a cursos.</p>
              </div>
            </div>
            <span className="home-nav-chevron">
              <MdArrowForwardIos />
            </span>
          </Link>

          <Link to="/areas" className="home-nav-card">
            <div className="home-nav-main">
              <div className="home-nav-icon">
                <MdApartment />
              </div>
              <div className="home-nav-text">
                <h3>Áreas académicas</h3>
                <p>Organiza los campos de estudio del campus.</p>
              </div>
            </div>
            <span className="home-nav-chevron">
              <MdArrowForwardIos />
            </span>
          </Link>
        </div>
      </section>


      {/* FOOTER ------------------------------------------------- */}
      <footer className="home-footer">
        <span>Campus FCP · TecNM</span>
        <span className="home-footer-dot">·</span>
        <span>Uso interno para gestión académica</span>
      </footer>
    </main>
  );
}

export default HomePage;
