// src/components/modals/AlumnoModal.jsx
import React, { useEffect, useState } from "react";
import BaseModal from "./BaseModal";
import "./Modal.css";

const ESTADO_OPTIONS = [
  "Activo",
  "Baja temporal",
  "Egresado",
  "Baja definitiva",
];

const EMPTY_FORM = {
  matricula: "",
  nombre: "",
  apellido_paterno: "",
  apellido_materno: "",
  email: "",
  telefono: "",
  fecha_nacimiento: "",
  fecha_inscripcion: "",
  id_carrera: "",
  id_curso: "",
  semestre_actual: 1,
  promedio_general: "",
  estado: "Activo",
};

function AlumnoModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  saving,
  carreras,
  cursos,
}) {
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setFormData({
        matricula: initialData.matricula ?? "",
        nombre: initialData.nombre ?? "",
        apellido_paterno: initialData.apellido_paterno ?? "",
        apellido_materno: initialData.apellido_materno ?? "",
        email: initialData.email ?? "",
        telefono: initialData.telefono ?? "",
        fecha_nacimiento: initialData.fecha_nacimiento ?? "",
        fecha_inscripcion: initialData.fecha_inscripcion ?? "",
        id_carrera: initialData.id_carrera ?? "",
        id_curso: initialData.id_curso ?? "",
        semestre_actual: initialData.semestre_actual ?? 1,
        promedio_general:
          initialData.promedio_general !== null &&
          initialData.promedio_general !== undefined
            ? initialData.promedio_general
            : "",
        estado: initialData.estado ?? "Activo",
      });
    } else {
      const hoy = new Date().toISOString().slice(0, 10);
      setFormData({
        ...EMPTY_FORM,
        fecha_inscripcion: hoy,
      });
    }
  }, [isOpen, initialData]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.matricula.trim()) {
      alert("La matrícula es obligatoria.");
      return;
    }
    if (!formData.nombre.trim() || !formData.apellido_paterno.trim()) {
      alert("Nombre y apellido paterno son obligatorios.");
      return;
    }
    if (!formData.email.trim()) {
      alert("El correo institucional es obligatorio.");
      return;
    }
    if (!formData.fecha_nacimiento) {
      alert("La fecha de nacimiento es obligatoria.");
      return;
    }
    if (!formData.fecha_inscripcion) {
      alert("La fecha de inscripción es obligatoria.");
      return;
    }
    if (!formData.id_carrera) {
      alert("Debes seleccionar una carrera.");
      return;
    }
    if (!formData.id_curso) {
      alert("Debes seleccionar un curso actual.");
      return;
    }

    const payload = {
      matricula: formData.matricula.trim(),
      nombre: formData.nombre.trim(),
      apellido_paterno: formData.apellido_paterno.trim(),
      apellido_materno: formData.apellido_materno.trim() || null,
      email: formData.email.trim(),
      telefono: formData.telefono.trim() || null,
      fecha_nacimiento: formData.fecha_nacimiento,
      fecha_inscripcion: formData.fecha_inscripcion,
      id_carrera: Number(formData.id_carrera),
      id_curso: Number(formData.id_curso),
      semestre_actual: Number(formData.semestre_actual) || 1,
      promedio_general:
        formData.promedio_general === ""
          ? null
          : Number(formData.promedio_general),
      estado: formData.estado,
    };

    await onSave(payload);
  }

  const title = initialData ? "Editar alumno" : "Nuevo alumno";

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="modal-grid-2">
          <div className="modal-field">
            <label className="modal-label" htmlFor="matricula">
              Matrícula
            </label>
            <input
              id="matricula"
              name="matricula"
              type="text"
              className="modal-input"
              value={formData.matricula}
              onChange={handleChange}
              required
            />
          </div>

          <div className="modal-field">
            <label className="modal-label" htmlFor="estado">
              Estado del alumno
            </label>
            <select
              id="estado"
              name="estado"
              className="modal-input"
              value={formData.estado}
              onChange={handleChange}
            >
              {ESTADO_OPTIONS.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-grid-2">
          <div className="modal-field">
            <label className="modal-label" htmlFor="nombre">
              Nombre
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              className="modal-input"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="modal-field">
            <label className="modal-label" htmlFor="apellido_paterno">
              Apellido paterno
            </label>
            <input
              id="apellido_paterno"
              name="apellido_paterno"
              type="text"
              className="modal-input"
              value={formData.apellido_paterno}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="modal-field">
          <label className="modal-label" htmlFor="apellido_materno">
            Apellido materno (opcional)
          </label>
          <input
            id="apellido_materno"
            name="apellido_materno"
            type="text"
            className="modal-input"
            value={formData.apellido_materno}
            onChange={handleChange}
          />
        </div>

        <div className="modal-grid-2">
          <div className="modal-field">
            <label className="modal-label" htmlFor="email">
              Correo institucional
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="modal-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="modal-field">
            <label className="modal-label" htmlFor="telefono">
              Teléfono (opcional)
            </label>
            <input
              id="telefono"
              name="telefono"
              type="tel"
              className="modal-input"
              value={formData.telefono}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="modal-grid-2">
          <div className="modal-field">
            <label className="modal-label" htmlFor="fecha_nacimiento">
              Fecha de nacimiento
            </label>
            <input
              id="fecha_nacimiento"
              name="fecha_nacimiento"
              type="date"
              className="modal-input"
              value={formData.fecha_nacimiento}
              onChange={handleChange}
              required
            />
          </div>

          <div className="modal-field">
            <label className="modal-label" htmlFor="fecha_inscripcion">
              Fecha de inscripción
            </label>
            <input
              id="fecha_inscripcion"
              name="fecha_inscripcion"
              type="date"
              className="modal-input"
              value={formData.fecha_inscripcion}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="modal-grid-2">
          <div className="modal-field">
            <label className="modal-label" htmlFor="id_carrera">
              Carrera
            </label>
            <select
              id="id_carrera"
              name="id_carrera"
              className="modal-input"
              value={formData.id_carrera}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona una carrera…</option>
              {carreras.map((carrera) => (
                <option
                  key={carrera.id_carrera}
                  value={carrera.id_carrera}
                >
                  {carrera.nombre_carrera}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-field">
            <label className="modal-label" htmlFor="id_curso">
              Curso actual
            </label>
            <select
              id="id_curso"
              name="id_curso"
              className="modal-input"
              value={formData.id_curso}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona un curso…</option>
              {cursos.map((curso) => (
                <option key={curso.id_curso} value={curso.id_curso}>
                  {curso.nombre_curso}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-grid-2">
          <div className="modal-field">
            <label className="modal-label" htmlFor="semestre_actual">
              Semestre actual
            </label>
            <input
              id="semestre_actual"
              name="semestre_actual"
              type="number"
              min="1"
              className="modal-input"
              value={formData.semestre_actual}
              onChange={handleChange}
            />
          </div>

          <div className="modal-field">
            <label className="modal-label" htmlFor="promedio_general">
              Promedio general (opcional)
            </label>
            <input
              id="promedio_general"
              name="promedio_general"
              type="number"
              step="0.01"
              min="0"
              max="100"
              className="modal-input"
              value={formData.promedio_general}
              onChange={handleChange}
            />
          </div>
        </div>

        <footer className="modal-footer">
          <button
            type="button"
            className="modal-btn modal-btn-secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="modal-btn modal-btn-primary"
            disabled={saving}
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </footer>
      </form>
    </BaseModal>
  );
}

export default AlumnoModal;
