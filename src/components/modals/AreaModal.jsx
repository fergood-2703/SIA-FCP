// src/components/modals/AreaModal.jsx
import React, { useEffect, useState } from "react";
import BaseModal from "./BaseModal";
import "./Modal.css";

const EMPTY_FORM = {
  nombre_area: "",
};

function AreaModal({ isOpen, onClose, onSave, initialData, saving }) {
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          nombre_area: initialData.nombre_area ?? "",
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

    if (!formData.nombre_area.trim()) {
      alert("El nombre del área académica es obligatorio.");
      return;
    }

    const payload = {
      nombre_area: formData.nombre_area.trim(),
    };

    await onSave(payload);
  }

  const title = initialData ? "Editar área académica" : "Nueva área académica";

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="modal-field">
          <label className="modal-label" htmlFor="nombre_area">
            Nombre del área académica
          </label>
          <input
            id="nombre_area"
            name="nombre_area"
            type="text"
            className="modal-input"
            value={formData.nombre_area}
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

export default AreaModal;
