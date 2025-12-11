// src/pages/HomePage.jsx
import "./HomePage.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const N8N_AI_WEBHOOK_URL =
  import.meta.env.VITE_N8N_AI_WEBHOOK_URL || "https://tu-endpoint-de-n8n";

function HomePage() {
  const [metrics, setMetrics] = useState({
    cursos: 0,
    docentes: 0,
    areas: 0,
  });
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiError, setAiError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // === Cargar totales desde Supabase ==========================
  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoadingMetrics(true);

        const [{ count: cursosCount, error: cursosError }, { count: docentesCount, error: docentesError }, { count: areasCount, error: areasError }] =
          await Promise.all([
            supabase.from("curso").select("*", { count: "exact", head: true }),
            supabase
              .from("docente")
              .select("*", { count: "exact", head: true }),
            supabase
              .from("area_academica")
              .select("*", { count: "exact", head: true }),
          ]);

        if (cursosError || docentesError || areasError) {
          console.error("Error al cargar métricas:", {
            cursosError,
            docentesError,
            areasError,
          });
          // No interrumpimos, solo dejamos los ceros
        }

        setMetrics({
          cursos: cursosCount ?? 0,
          docentes: docentesCount ?? 0,
          areas: areasCount ?? 0,
        });
      } finally {
        setLoadingMetrics(false);
      }
    }

    fetchMetrics();
  }, []);

  // === Enviar pregunta a la IA (n8n) ==========================
  async function handleAskAi(e) {
    e.preventDefault();
    if (!aiQuestion.trim() || aiLoading) return;

    setAiLoading(true);
    setAiError("");
    setAiAnswer("");

    try {
      const response = await fetch(N8N_AI_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: aiQuestion.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo obtener respuesta de la IA");
      }

      const data = await response.json();
      // Ajusta "answer" al nombre de campo que devuelvas desde n8n
      setAiAnswer(
        data.answer ||
          "La IA respondió, pero no se encontró el campo 'answer' en el JSON."
      );
    } catch (err) {
      console.error(err);
      setAiError(
        "Ocurrió un error al consultar la IA. Verifica el flujo de n8n y la URL."
      );
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <main className="home-root">
      {/* HERO ------------------------------------------------ */}
      <section className="home-hero">
        <div className="home-hero-text">
          <p className="home-eyebrow">Proyecto escolar · Panel interno</p>

          <h1>
            Administra la{" "}
            <span className="home-highlight">oferta académica</span> del campus.
          </h1>

          <p className="home-hero-description">
            Consulta y actualiza la información de cursos, docentes y áreas
            académicas en un solo lugar, conectado a la base de datos de
            Supabase.
          </p>

          <div className="home-cta-row">
            <Link to="/cursos" className="home-cta-primary">
              Ir a cursos
            </Link>
            <span className="home-cta-note">
              Atajo directo al catálogo de cursos activos.
            </span>
          </div>

          <div className="home-metrics">
            <article className="home-metric-card">
              <span className="home-metric-label">Cursos</span>
              <span className="home-metric-value">
                {loadingMetrics ? "…" : metrics.cursos}
              </span>
              <span className="home-metric-foot">Registrados en la base</span>
            </article>

            <article className="home-metric-card">
              <span className="home-metric-label">Docentes</span>
              <span className="home-metric-value">
                {loadingMetrics ? "…" : metrics.docentes}
              </span>
              <span className="home-metric-foot">
                Personal académico activo
              </span>
            </article>

            <article className="home-metric-card">
              <span className="home-metric-label">Áreas académicas</span>
              <span className="home-metric-value">
                {loadingMetrics ? "…" : metrics.areas}
              </span>
              <span className="home-metric-foot">
                Departamentos registrados
              </span>
            </article>
          </div>
        </div>

        {/* Columna lateral: Nota + IA */}
        <div className="home-side-column">
          <aside className="home-note-card">
            <p className="home-note-title">Nota rápida</p>
            <p className="home-note-text">
              Este panel está pensado como una herramienta interna para apoyar
              la gestión académica del TecNM Campus Felipe Carrillo Puerto.
            </p>
            <p className="home-note-text">
              Los datos se guardan en Supabase y se mantienen organizados desde
              las secciones de cursos, docentes y áreas académicas.
            </p>
          </aside>

          <section className="home-ai-card">
            <p className="home-ai-title">Consulta rápida a la IA</p>
            <p className="home-ai-text">
              Haz preguntas sobre cursos, docentes y áreas académicas. La IA
              responderá usando la información conectada a la base de datos.
            </p>

            <form className="home-ai-form" onSubmit={handleAskAi}>
              <textarea
                className="home-ai-textarea"
                rows={3}
                placeholder="Ejemplo: ¿Cuántos cursos de nivel intermedio hay activos?"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
              />
              <div className="home-ai-actions">
                <button
                  type="submit"
                  className="home-ai-button"
                  disabled={aiLoading || !aiQuestion.trim()}
                >
                  {aiLoading ? "Consultando…" : "Preguntar a la IA"}
                </button>
                <span className="home-ai-meta">
                  Conectado vía flujo de n8n (webhook).
                </span>
              </div>
            </form>

            {aiError && <p className="home-ai-error">{aiError}</p>}

            {aiAnswer && (
              <div className="home-ai-answer">
                <p className="home-ai-answer-label">Respuesta:</p>
                <p className="home-ai-answer-text">{aiAnswer}</p>
              </div>
            )}
          </section>
        </div>
      </section>

      {/* SECCIONES PRINCIPALES ------------------------------- */}
      <section className="home-sections">
        <h2 className="home-sections-title">Secciones principales</h2>

        <div className="home-cards-grid">
          <Link to="/cursos" className="home-nav-card">
            <div className="home-nav-icon">📚</div>
            <h3>Cursos</h3>
            <p>
              Consulta todos los cursos, crea nuevos registros y actualiza nivel,
              modalidad y duración.
            </p>
            <span className="home-nav-link">Abrir sección de cursos →</span>
          </Link>

          <Link to="/docentes" className="home-nav-card">
            <div className="home-nav-icon">👩‍🏫</div>
            <h3>Docentes</h3>
            <p>
              Gestiona el catálogo de docentes y vincula su información a las
              áreas y cursos correspondientes.
            </p>
            <span className="home-nav-link">Abrir sección de docentes →</span>
          </Link>

          <Link to="/areas" className="home-nav-card">
            <div className="home-nav-icon">🏛️</div>
            <h3>Áreas académicas</h3>
            <p>
              Administra departamentos, academias y áreas responsables de cada
              curso del campus.
            </p>
            <span className="home-nav-link">Abrir sección de áreas →</span>
          </Link>
        </div>
      </section>

      {/* FOOTER --------------------------------------------- */}
      <footer className="home-footer">
        <span>Campus FCP · TecNM</span>
        <span className="home-footer-dot">·</span>
        <span>Uso interno para gestión académica</span>
      </footer>
    </main>
  );
}

export default HomePage;
