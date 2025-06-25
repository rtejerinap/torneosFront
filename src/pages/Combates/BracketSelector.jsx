import React, { useEffect, useState } from "react";
import axios from "axios";
import BracketView from "./BracketView"; // el componente de llaves generado antes

const BracketSelector = () => {
  const [torneos, setTorneos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [torneoId, setTorneoId] = useState("");
  const [categoriaId, setCategoriaId] = useState("");

  useEffect(() => {
    const fetchTorneos = async () => {
      try {
        const res = await axios.get("https://us-central1-torneos-305d7.cloudfunctions.net/api/torneos");
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
        const res = await axios.get(`https://us-central1-torneos-305d7.cloudfunctions.net/api/api/categorias?torneoId=${torneoId}`);
        setCategorias(res.data);
      } catch (err) {
        console.error("Error cargando categorías:", err);
      }
    };
    fetchCategorias();
  }, [torneoId]);

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
            setCategoriaId("");
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

      {categoriaId && <BracketView categoriaId={categoriaId} />}
    </div>
  );
};

export default BracketSelector;
