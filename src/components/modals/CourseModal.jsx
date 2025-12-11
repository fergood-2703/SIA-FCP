// src/components/modals/CourseModal.jsx
import React, { useEffect, useState } from "react";
import BaseModal from "./BaseModal";
import "./Modal.css";

const NIVELES = ["Diplomado", "Licenciatura", "Posgrado"];
const MODALIDADES = ["Presencial", "En línea", "Mixta"];
const ESTADOS_CURSO = ["Activo", "En pausa", "Finalizado"];

const EMPTY_FORM = {
  nombre_curso: "",
  nivel: "Licenciatura",
  modalidad: "Presencial",
  duracion_semanas: "",
  creditos: "",
  cupo_maximo: "",
  estado_curso: "Activo",
  id_area: "",
  id_docente: "",
};

function CourseModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  saving,
  areas,
  docentes,
}) {
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          nombre_curso: initialData.nombre_curso ?? "",
          nivel: initialData.nivel ?? "Licenciatura",
          modalidad: initialData.modalidad ?? "Presencial",
          duracion_semanas:
            initialData.duracion_semanas != null
              ? String(initialData.duracion_semanas)
              : "",
          creditos:
            initialData.creditos != null ? String(initialData.creditos) : "",
          cupo_maximo:
            initialData.cupo_maximo != null
              ? String(initialData.cupo_maximo)
              : "",
          estado_curso: initialData.estado_curso ?? "Activo",
          id_area:
            initialData.id_area != null ? String(initialData.id_area) : "",
          id_docente:
            initialData.id_docente != null ? String(initialData.id_docente) : "",
        });
      } else {
        setFormData(EMPTY_FORM);
      }
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

    if (!formData.nombre_curso.trim()) {
      alert("El nombre del curso es obligatorio.");
      return;
    }

    const payload = {
      nombre_curso: formData.nombre_curso.trim(),
      nivel: formData.nivel,
      modalidad: formData.modalidad,
      estado_curso: formData.estado_curso,
    };

    if (formData.duracion_semanas !== "") {
      payload.duracion_semanas = parseInt(
        formData.duracion_semanas,
        10
      );
    }

    if (formData.creditos !== "") {
      payload.creditos = parseInt(formData.creditos, 10);
    }

    if (formData.cupo_maximo !== "") {
      payload.cupo_maximo = parseInt(formData.cupo_maximo, 10);
    }

    if (formData.id_area !== "") {
      payload.id_area = parseInt(formData.id_area, 10);
    }

    if (formData.id_docente !== "") {
      payload.id_docente = parseInt(formData.id_docente, 10);
    }

    await onSave(payload);
  }

  const title = initialData ? "Editar curso" : "Nuevo curso";

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title}>
      <form className="modal-form" onSubmit={handleSubmit}>
        {/* Nombre */}
        <div className="modal-field">
          <label className="modal-label" htmlFor="nombre_curso">
            Nombre del curso
          </label>
          <input
            id="nombre_curso"
            name="nombre_curso"
            type="text"
            className="modal-input"
            value={formData.nombre_curso}
            onChange={handleChange}
            required
          />
        </div>

        <div className="modal-grid">
          {/* Nivel */}
          <div className="modal-field">
            <label className="modal-label" htmlFor="nivel">
              Nivel
            </label>
            <select
              id="nivel"
              name="nivel"
              className="modal-input"
              value={formData.nivel}
              onChange={handleChange}
              required
            >
              {NIVELES.map((nivel) => (
                <option key={nivel} value={nivel}>
                  {nivel}
                </option>
              ))}
            </select>
          </div>

          {/* Modalidad */}
          <div className="modal-field">
            <label className="modal-label" htmlFor="modalidad">
              Modalidad
            </label>
            <select
              id="modalidad"
              name="modalidad"
              className="modal-input"
              value={formData.modalidad}
              onChange={handleChange}
              required
            >
              {MODALIDADES.map((mod) => (
                <option key={mod} value={mod}>
                  {mod}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-grid">
          {/* Duración */}
          <div className="modal-field">
            <label
              className="modal-label"
              htmlFor="duracion_semanas"
            >
              Duración en semanas
            </label>
            <input
              id="duracion_semanas"
              name="duracion_semanas"
              type="number"
              min="1"
              className="modal-input"
              value={formData.duracion_semanas}
              onChange={handleChange}
            />
          </div>

          {/* Créditos */}
          <div className="modal-field">
            <label className="modal-label" htmlFor="creditos">
              Créditos
            </label>
            <input
              id="creditos"
              name="creditos"
              type="number"
              min="0"
              className="modal-input"
              value={formData.creditos}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="modal-grid">
          {/* Cupo máximo */}
          <div className="modal-field">
            <label className="modal-label" htmlFor="cupo_maximo">
              Cupo máximo
            </label>
            <input
              id="cupo_maximo"
              name="cupo_maximo"
              type="number"
              min="0"
              className="modal-input"
              value={formData.cupo_maximo}
              onChange={handleChange}
            />
          </div>

          {/* Estado */}
          <div className="modal-field">
            <label className="modal-label" htmlFor="estado_curso">
              Estado del curso
            </label>
            <select
              id="estado_curso"
              name="estado_curso"
              className="modal-input"
              value={formData.estado_curso}
              onChange={handleChange}
              required
            >
              {ESTADOS_CURSO.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Área académica y Docente, con listas desplegables */}
        <div className="modal-grid">
          <div className="modal-field">
            <label className="modal-label" htmlFor="id_area">
              Área académica
            </label>
            <select
              id="id_area"
              name="id_area"
              className="modal-input"
              value={formData.id_area}
              onChange={handleChange}
            >
              <option value="">Sin asignar</option>
              {areas?.map((area) => (
                <option key={area.id_area} value={String(area.id_area)}>
                  {area.nombre_area}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-field">
            <label className="modal-label" htmlFor="id_docente">
              Docente responsable
            </label>
            <select
              id="id_docente"
              name="id_docente"
              className="modal-input"
              value={formData.id_docente}
              onChange={handleChange}
            >
              <option value="">Sin asignar</option>
              {docentes?.map((doc) => (
                <option
                  key={doc.id_docente}
                  value={String(doc.id_docente)}
                >
                  {doc.nombre_docente}
                </option>
              ))}
            </select>
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

export default CourseModal;
