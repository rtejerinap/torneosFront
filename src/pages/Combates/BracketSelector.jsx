import React, { useEffect, useState } from "react";
import axios from "axios";
import BracketView from "./BracketView"; // el componente de llaves generado antes


const BracketSelector = () => {
  const [torneos, setTorneos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [llaves, setLlaves] = useState([]);
  const [torneoId, setTorneoId] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [llaveId, setLlaveId] = useState("");
  const API_BASE = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchTorneos = async () => {
      try {
        const res = await axios.get(`${API_BASE}/torneos`);
        setTorneos(res.data);
      } catch (err) {
        console.error("Error cargando torneos:", err);
      }
    };
    fetchTorneos();
  }, []);

  useEffect(() => {
    const fetchCategorias = async () => {
      if (!torneoId) return;
      try {
        const res = await axios.get(`${API_BASE}/api/categorias?torneoId=${torneoId}`);
        setCategorias(res.data);
      } catch (err) {
        console.error("Error cargando categorías:", err);
      }
    };
    fetchCategorias();
    setCategoriaId("");
    setLlaves([]);
    setLlaveId("");
  }, [torneoId]);

  useEffect(() => {
    const fetchLlaves = async () => {
      if (!categoriaId) {
        setLlaves([]);
        setLlaveId("");
        return;
      }
      try {
        const res = await axios.get(`${API_BASE}/combates/llaves-por-categoria/${categoriaId}`);
        setLlaves(res.data);
        setLlaveId("");
      } catch (err) {
        console.error("Error cargando llaves:", err);
        setLlaves([]);
        setLlaveId("");
      }
    };
    fetchLlaves();
  }, [categoriaId]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Visualización de llaves del torneo</h2>

      <div className="mb-4">
        <label className="block mb-1">Seleccionar torneo:</label>
        <select
          className="border rounded px-2 py-1 w-full"
          value={torneoId}
          onChange={(e) => {
            setTorneoId(e.target.value);
          }}
        >
          <option value="">-- Seleccioná un torneo --</option>
          {torneos.map((t) => (
            <option key={t.id} value={t.id}>{t.nombre}</option>
          ))}
        </select>
      </div>

      {torneoId && (
        <div className="mb-4">
          <label className="block mb-1">Seleccionar categoría:</label>
          <select
            className="border rounded px-2 py-1 w-full"
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
          >
            <option value="">-- Seleccioná una categoría --</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
      )}

      {(!!categoriaId && llaves && llaves.length > 0) && (
        <div className="mb-4">
          <label className="block mb-1">Seleccionar llave:</label>
          <select
            className="border rounded px-2 py-1 w-full"
            value={llaveId}
            onChange={(e) => setLlaveId(e.target.value)}
          >
            <option value="">-- Seleccioná una llave --</option>
            {llaves.map((l) => (
              <option key={l.id} value={l.id}>{l.nombre || `Llave #${l.id}`}</option>
            ))}
          </select>
        </div>
      )}

      {llaveId && <BracketView llaveId={llaveId} />}
    </div>
  );
};

export default BracketSelector;
