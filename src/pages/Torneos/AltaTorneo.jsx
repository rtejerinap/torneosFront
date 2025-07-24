import React, { useState } from "react";

const AltaTorneo = () => {
  const [form, setForm] = useState({
    nombre: "",
    fecha: "",
    ciudad: "",
    precio: "",
    activo: true,
  });
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const API_BASE = import.meta.env.VITE_API_URL;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");
    try {
      const res = await fetch(`${API_BASE}/torneos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al crear torneo");
      }

      const data = await res.json();
      setMensaje(`Torneo creado con éxito: ID ${data.id}`);
      setForm({
        nombre: "",
        fecha: "",
        ciudad: "",
        precio: "",
        activo: true,
      });
    } catch (error) {
      console.error("Error al crear torneo:", error);
      setMensaje(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "2rem auto" }}>
      <h2>Crear Torneo</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre del torneo"
          value={form.nombre}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="fecha"
          value={form.fecha}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="ciudad"
          placeholder="Ciudad"
          value={form.ciudad}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="precio"
          placeholder="Precio"
          value={form.precio}
          onChange={handleChange}
          required
        />
        <label>
          <input
            type="checkbox"
            name="activo"
            checked={form.activo}
            onChange={handleChange}
          />{" "}
          Activo
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Creando..." : "Crear Torneo"}
        </button>
      </form>
      {mensaje && <p style={{ marginTop: "1rem" }}>{mensaje}</p>}
    </div>
  );
};

export default AltaTorneo;
