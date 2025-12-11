// src/NewCourseModal.jsx
import { useEffect, useState } from "react";
import "./NewCourseModal.css";

function NewCourseModal({
  isOpen,
  mode = "create",          // "create" | "edit"
  initialCourse = null,     // objeto curso cuando editas
  onClose,
  onSave,
}) {
  const [nombre, setNombre] = useState("");
  const [nivel, setNivel] = useState("");
  const [modalidad, setModalidad] = useState("");
  const [duracion, setDuracion] = useState("");

  // Cuando cambies de curso a editar, rellenar el formulario
  useEffect(() => {
    if (initialCourse && mode === "edit") {
      setNombre(initialCourse.nombre_curso || "");
      setNivel(initialCourse.nivel || "");
      setModalidad(initialCourse.modalidad || "");
      setDuracion(
        initialCourse.duracion_semanas !== null &&
        initialCourse.duracion_semanas !== undefined
          ? String(initialCourse.duracion_semanas)
          : ""
      );
    } else {
      // modo crear: limpiar campos
      setNombre("");
      setNivel("");
      setModalidad("");
      setDuracion("");
    }
  }, [initialCourse, mode]);

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      nombre_curso: nombre.trim(),
      nivel: nivel.trim(),
      modalidad: modalidad.trim(),
      duracion_semanas: duracion === "" ? null : Number(duracion),
    };

    onSave(payload);
  }

  const isEdit = mode === "edit";

  return (
    <div className="nc-backdrop" onClick={onClose}>
      <div
        className="nc-modal"
        onClick={(e) => e.stopPropagation()} // que no cierre al hacer clic dentro
      >
        <header className="nc-header">
          <h2 className="nc-title">
            {isEdit ? "Editar curso" : "Nuevo curso"}
          </h2>
          <p className="nc-subtitle">
            {isEdit
              ? "Actualiza la información básica del curso."
              : "Completa los datos para registrar un curso nuevo."}
          </p>
        </header>

        <form className="nc-form" onSubmit={handleSubmit}>
          <div className="nc-field">
            <label className="nc-label" htmlFor="nombre_curso">
              Nombre del curso
            </label>
            <input
              id="nombre_curso"
              className="nc-input"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Matemáticas Básicas"
              required
            />
          </div>

          <div className="nc-field">
            <label className="nc-label" htmlFor="nivel">
              Nivel
            </label>
            <input
              id="nivel"
              className="nc-input"
              type="text"
              value={nivel}
              onChange={(e) => setNivel(e.target.value)}
              placeholder="Diplomado, Licenciatura, etc."
              required
            />
          </div>

          <div className="nc-field">
            <label className="nc-label" htmlFor="modalidad">
              Modalidad
            </label>
            <input
              id="modalidad"
              className="nc-input"
              type="text"
              value={modalidad}
              onChange={(e) => setModalidad(e.target.value)}
              placeholder="Mixta, En línea, Presencial, etc."
              required
            />
          </div>

          <div className="nc-field">
            <label className="nc-label" htmlFor="duracion">
              Duración en semanas
            </label>
            <input
              id="duracion"
              className="nc-input"
              type="number"
              min="1"
              value={duracion}
              onChange={(e) => setDuracion(e.target.value)}
              placeholder="Ej. 16"
            />
          </div>

          <div className="nc-footer">
            <button
              type="button"
              className="nc-btn nc-btn-cancel"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button type="submit" className="nc-btn nc-btn-save">
              {isEdit ? "Guardar cambios" : "Guardar curso"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewCourseModal;
