// src/components/modals/DocenteModal.jsx
import React, { useEffect, useState } from "react";
import BaseModal from "./BaseModal";
import "./Modal.css";

const NIVEL_ACADEMICO_OPTIONS = [
  "Licenciatura",
  "Maestría",
  "Doctorado",
];

const EMPTY_FORM = {
  nombre: "",
  apellido_paterno: "",
  apellido_materno: "",
  email: "",
  telefono: "",
  fecha_ingreso: "",
  id_area: "",
  nivel_academico: "Licenciatura",
};

function DocenteModal({
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
        nombre: initialData.nombre ?? "",
        apellido_paterno: initialData.apellido_paterno ?? "",
        apellido_materno: initialData.apellido_materno ?? "",
        email: initialData.email ?? "",
        telefono: initialData.telefono ?? "",
        fecha_ingreso: initialData.fecha_ingreso ?? "",
        id_area: initialData.id_area ?? "",
        nivel_academico: initialData.nivel_academico ?? "Licenciatura",
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

    if (!formData.nombre.trim() || !formData.apellido_paterno.trim()) {
      alert("Nombre y apellido paterno del docente son obligatorios.");
      return;
    }

    if (!formData.email.trim()) {
      alert("El correo electrónico del docente es obligatorio.");
      return;
    }

    if (!formData.id_area) {
      alert("Debes seleccionar un área académica.");
      return;
    }

    if (!formData.nivel_academico) {
      alert("Debes seleccionar el nivel académico del docente.");
      return;
    }

    const payload = {
      nombre: formData.nombre.trim(),
      apellido_paterno: formData.apellido_paterno.trim(),
      apellido_materno: formData.apellido_materno.trim() || null,
      email: formData.email.trim(),
      telefono: formData.telefono.trim() || null,
      id_area: Number(formData.id_area),
      nivel_academico: formData.nivel_academico,
      // si viene vacío dejamos null, Supabase lo castea a date
      fecha_ingreso: formData.fecha_ingreso || null,
    };

    await onSave(payload);
  }

  const title = initialData
    ? "Editar docente"
    : "Nuevo docente";

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title}>
      <form className="modal-form" onSubmit={handleSubmit}>
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

        <div className="modal-grid-2">
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
        </div>

        <div className="modal-grid-2">
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

          <div className="modal-field">
            <label className="modal-label" htmlFor="fecha_ingreso">
              Fecha de ingreso (opcional)
            </label>
            <input
              id="fecha_ingreso"
              name="fecha_ingreso"
              type="date"
              className="modal-input"
              value={formData.fecha_ingreso || ""}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="modal-grid-2">
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
              {NIVEL_ACADEMICO_OPTIONS.map((nivel) => (
                <option key={nivel} value={nivel}>
                  {nivel}
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

export default DocenteModal;
