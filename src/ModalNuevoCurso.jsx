// src/ModalNuevoCurso.jsx
import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function ModalNuevoCurso({ onClose, onSaved }) {
  const [form, setForm] = useState({
    nombre_curso: "",
    nivel: "",
    modalidad: "",
    duracion_semanas: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    // Validación muy básica
    if (!form.nombre_curso || !form.nivel || !form.modalidad || !form.duracion_semanas) {
      setError("Todos los campos son obligatorios");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("curso").insert([
      {
        nombre_curso: form.nombre_curso,
        nivel: form.nivel,
        modalidad: form.modalidad,
        duracion_semanas: Number(form.duracion_semanas),
      },
    ]);

    if (error) {
      console.error(error);
      setError("Error al guardar el curso");
      setSaving(false);
      return;
    }

    // Avisar al componente padre
    onSaved();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          color: "black",
          padding: "1.5rem",
          borderRadius: "0.5rem",
          width: "400px",
          maxWidth: "90%",
        }}
      >
        <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem" }}>
          Nuevo curso
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <input
            name="nombre_curso"
            placeholder="Nombre del curso"
            onChange={handleChange}
            style={inputStyle}
          />
          <input
            name="nivel"
            placeholder="Nivel (Diplomado, Licenciatura, etc.)"
            onChange={handleChange}
            style={inputStyle}
          />
          <input
            name="modalidad"
            placeholder="Modalidad (Mixta, En línea, etc.)"
            onChange={handleChange}
            style={inputStyle}
          />
          <input
            name="duracion_semanas"
            type="number"
            placeholder="Duración en semanas"
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        {error && (
          <p style={{ color: "red", marginTop: "0.5rem" }}>
            {error}
          </p>
        )}

        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.5rem",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "0.4rem 0.8rem",
              backgroundColor: "#e5e7eb",
              borderRadius: "0.375rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "0.4rem 0.8rem",
              backgroundColor: "#2563eb",
              color: "white",
              borderRadius: "0.375rem",
              border: "none",
              cursor: "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  border: "1px solid #d1d5db",
  borderRadius: "0.375rem",
  padding: "0.4rem 0.6rem",
  fontSize: "0.9rem",
};
