// src/components/modals/CarreraModal.jsx
import React, { useEffect, useState } from "react";
import BaseModal from "./BaseModal";
import "./Modal.css";

const NIVEL_OPTIONS = ["Licenciatura", "Maestría", "Doctorado"];
const ESTADO_OPTIONS = ["Activa", "Inactiva"];

const EMPTY_FORM = {
  nombre_carrera: "",
  nivel_academico: "Licenciatura",
  duracion_semestres: "",
  creditos_totales: "",
  id_area: "",
  estado: "Activa",
};

function CarreraModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  saving,
  areas,
}) {
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setFormData({
        nombre_carrera: initialData.nombre_carrera ?? "",
        nivel_academico: initialData.nivel_academico ?? "Licenciatura",
        duracion_semestres: initialData.duracion_semestres ?? "",
        creditos_totales: initialData.creditos_totales ?? "",
        id_area: initialData.id_area ?? "",
        estado: initialData.estado ?? "Activa",
      });
    } else {
      setFormData(EMPTY_FORM);
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

    if (!formData.nombre_carrera.trim()) {
      alert("El nombre de la carrera es obligatorio.");
      return;
    }

    if (!formData.id_area) {
      alert("Debes seleccionar un área académica.");
      return;
    }

    if (!formData.duracion_semestres || Number(formData.duracion_semestres) <= 0) {
      alert("La duración en semestres debe ser mayor a cero.");
      return;
    }

    if (!formData.creditos_totales || Number(formData.creditos_totales) <= 0) {
      alert("Los créditos totales deben ser mayores a cero.");
      return;
    }

    const payload = {
      nombre_carrera: formData.nombre_carrera.trim(),
      nivel_academico: formData.nivel_academico,
      duracion_semestres: Number(formData.duracion_semestres),
      creditos_totales: Number(formData.creditos_totales),
      id_area: Number(formData.id_area),
      estado: formData.estado || "Activa",
    };

    await onSave(payload);
  }

  const title = initialData ? "Editar carrera" : "Nueva carrera";

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="modal-field">
          <label className="modal-label" htmlFor="nombre_carrera">
            Nombre de la carrera
          </label>
          <input
            id="nombre_carrera"
            name="nombre_carrera"
            type="text"
            className="modal-input"
            value={formData.nombre_carrera}
            onChange={handleChange}
            required
          />
        </div>

        <div className="modal-grid-2">
          <div className="modal-field">
            <label className="modal-label" htmlFor="nivel_academico">
              Nivel académico
            </label>
            <select
              id="nivel_academico"
              name="nivel_academico"
              className="modal-input"
              value={formData.nivel_academico}
              onChange={handleChange}
              required
            >
              {NIVEL_OPTIONS.map((nivel) => (
                <option key={nivel} value={nivel}>
                  {nivel}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-field">
            <label className="modal-label" htmlFor="estado">
              Estado
            </label>
            <select
              id="estado"
              name="estado"
              className="modal-input"
              value={formData.estado}
              onChange={handleChange}
              required
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
            <label className="modal-label" htmlFor="duracion_semestres">
              Duración (semestres)
            </label>
            <input
              id="duracion_semestres"
              name="duracion_semestres"
              type="number"
              min="1"
              className="modal-input"
              value={formData.duracion_semestres}
              onChange={handleChange}
              required
            />
          </div>

          <div className="modal-field">
            <label className="modal-label" htmlFor="creditos_totales">
              Créditos totales
            </label>
            <input
              id="creditos_totales"
              name="creditos_totales"
              type="number"
              min="1"
              className="modal-input"
              value={formData.creditos_totales}
              onChange={handleChange}
              required
            />
          </div>
        </div>

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
            required
          >
            <option value="">Selecciona un área…</option>
            {areas.map((area) => (
              <option key={area.id_area} value={area.id_area}>
                {area.nombre_area}
              </option>
            ))}
          </select>
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

export default CarreraModal;
