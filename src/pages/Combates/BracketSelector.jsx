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
  const [filtroSexo, setFiltroSexo] = useState("");
  const [filtroRango, setFiltroRango] = useState("");
  const [filtroModalidad, setFiltroModalidad] = useState("");
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
      if (!torneoId || !filtroSexo || !filtroRango || !filtroModalidad) {
        setCategorias([]);
        setCategoriaId("");
        setLlaves([]);
        setLlaveId("");
        return;
      }
      try {
        const res = await axios.get(`${API_BASE}/api/categorias/filtrar?sexo=${filtroSexo}&rango=${filtroRango}&id_torneo=${torneoId}&modalidad=${filtroModalidad}`);
        setCategorias(res.data);
      } catch (err) {
        console.error("Error cargando categorías:", err);
        setCategorias([]);
      }
      setCategoriaId("");
      setLlaves([]);
      setLlaveId("");
    };
    fetchCategorias();
  }, [torneoId, filtroSexo, filtroRango, filtroModalidad]);

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
    <div
      style={{
        padding: '16px',
        width: '100%',
        margin: 0,
        boxSizing: 'border-box',
      }}
    >
      <h2 style={{ fontSize: '1.3em', fontWeight: 700, marginBottom: 18 }}>Visualización de llaves del torneo</h2>

      <div
        style={{
          display: 'flex',
          flexDirection: window.innerWidth > 900 ? 'row' : 'column',
          gap: 12,
          width: '100%',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
        }}
      >
        <div style={{ minWidth: 220, flex: 1 }}>
          <label style={{ fontWeight: 500, marginBottom: 4 }}>Seleccionar torneo:</label>
          <select
            style={{
              border: '1px solid #bbb',
              borderRadius: 6,
              padding: '10px',
              fontSize: 16,
              width: '100%',
              marginBottom: 10,
              minWidth: 200,
              maxWidth: '100%',
            }}
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
          <>
            <div style={{ minWidth: 180, flex: 1 }}>
              <label style={{ fontWeight: 500, marginBottom: 4 }}>Sexo:</label>
              <select
                style={{
                  border: '1px solid #bbb',
                  borderRadius: 6,
                  padding: '10px',
                  fontSize: 16,
                  width: '100%',
                  marginBottom: 10,
                  minWidth: 120,
                  maxWidth: '100%',
                }}
                value={filtroSexo}
                onChange={e => setFiltroSexo(e.target.value)}
              >
                <option value="">-- Seleccioná sexo --</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
              </select>
            </div>
            <div style={{ minWidth: 180, flex: 1 }}>
              <label style={{ fontWeight: 500, marginBottom: 4 }}>Rango de edad:</label>
              <select
                style={{
                  border: '1px solid #bbb',
                  borderRadius: 6,
                  padding: '10px',
                  fontSize: 16,
                  width: '100%',
                  marginBottom: 10,
                  minWidth: 120,
                  maxWidth: '100%',
                }}
                value={filtroRango}
                onChange={e => setFiltroRango(e.target.value)}
              >
                <option value="">-- Seleccioná rango --</option>
                <option value="infantiles">Infantiles (5-13)</option>
                <option value="juvenilesA">Juveniles A (14-15)</option>
                <option value="juvenilesB">Juveniles B (16-17)</option>
                <option value="mayores">Mayores (18-34)</option>
                <option value="mayoresPlata">Mayores Plata (35-44)</option>
                <option value="mayoresOro">Mayores Oro (45-59)</option>
              </select>
            </div>
            <div style={{ minWidth: 180, flex: 1 }}>
              <label style={{ fontWeight: 500, marginBottom: 4 }}>Modalidad:</label>
              <select
                style={{
                  border: '1px solid #bbb',
                  borderRadius: 6,
                  padding: '10px',
                  fontSize: 16,
                  width: '100%',
                  marginBottom: 10,
                  minWidth: 120,
                  maxWidth: '100%',
                }}
                value={filtroModalidad}
                onChange={e => setFiltroModalidad(e.target.value)}
              >
                <option value="">-- Seleccioná modalidad --</option>
                <option value="Lucha">Lucha</option>
                <option value="tul">Tul</option>
              </select>
            </div>

            {filtroSexo && filtroRango && filtroModalidad && (
              <>
                <label style={{ fontWeight: 500, marginBottom: 4 }}>Seleccionar categoría:</label>
                <select
                  style={{
                    border: '1px solid #bbb',
                    borderRadius: 6,
                    padding: '10px',
                    fontSize: 16,
                    width: '100%',
                    marginBottom: 10,
                    minWidth: 200,
                    maxWidth: '100%',
                  }}
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(e.target.value)}
                >
                  <option value="">-- Seleccioná una categoría --</option>
                  {categorias
                    .slice()
                    .sort((a, b) => {
                      if (a.edad_min !== b.edad_min) return a.edad_min - b.edad_min;
                      if (a.edad_max !== b.edad_max) return a.edad_max - b.edad_max;
                      if (a.peso_minimo !== b.peso_minimo) return a.peso_minimo - b.peso_minimo;
                      return a.peso_maximo - b.peso_maximo;
                    })
                    .map((c) => (
                      <option key={c.id} value={c.id}>{`${c.nombre} (${c.peso_minimo} - ${c.peso_maximo} kg)`}</option>
                    ))}
                </select>
              </>
            )}
          </>
        )}

        {(!!categoriaId && llaves && llaves.length > 0) && (
          <>
            <label style={{ fontWeight: 500, marginBottom: 4 }}>Seleccionar llave:</label>
            <select
              style={{
                border: '1px solid #bbb',
                borderRadius: 6,
                padding: '10px',
                fontSize: 16,
                width: '100%',
                marginBottom: 10,
                minWidth: 200,
                maxWidth: '100%',
              }}
              value={llaveId}
              onChange={(e) => setLlaveId(e.target.value)}
            >
              <option value="">-- Seleccioná una llave --</option>
              {llaves.map((l) => (
                <option key={l.id} value={l.id}>{l.nombre || `Llave #${l.id}`}</option>
              ))}
            </select>
          </>
        )}

        {llaveId && <div style={{ marginTop: 18 }}><BracketView llaveId={llaveId} /></div>}
      </div>
    </div>
  );
};

export default BracketSelector;
