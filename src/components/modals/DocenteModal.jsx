// src/components/modals/DocenteModal.jsx
import React, { useEffect, useState } from "react";
import BaseModal from "./BaseModal";
import "./Modal.css";

const EMPTY_FORM = {
  nombre_docente: "",
};

function DocenteModal({ isOpen, onClose, onSave, initialData, saving }) {
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          nombre_docente: initialData.nombre_docente ?? "",
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

    if (!formData.nombre_docente.trim()) {
      alert("El nombre del docente es obligatorio.");
      return;
    }

    const payload = {
      nombre_docente: formData.nombre_docente.trim(),
    };

    await onSave(payload);
  }

  const title = initialData ? "Editar docente" : "Nuevo docente";

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="modal-field">
          <label className="modal-label" htmlFor="nombre_docente">
            Nombre del docente
          </label>
          <input
            id="nombre_docente"
            name="nombre_docente"
            type="text"
            className="modal-input"
            value={formData.nombre_docente}
            onChange={handleChange}
            required
          />
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
