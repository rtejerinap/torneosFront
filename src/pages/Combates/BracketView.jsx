import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./BracketView.css";

const BracketView = ({ categoriaId }) => {
  const [combates, setCombates] = useState([]);
  const containerRef = useRef(null);
  const matchRefs = useRef({});
  const API_BASE = import.meta.env.VITE_API_URL;


  useEffect(() => {
    const fetchCombates = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/combates/por-categoria/${categoriaId}`
        );

        const combatesMap = new Map();
        const porRonda = {};

        res.data.forEach((combate) => {
          combatesMap.set(combate.id, combate);
          if (!porRonda[combate.ronda]) porRonda[combate.ronda] = [];
          porRonda[combate.ronda].push(combate);
        });

        // Reverso: de qué combates proviene cada uno
        const hijosPorPadre = {};
        for (const combate of res.data) {
          if (combate.siguiente_combate_id) {
            if (!hijosPorPadre[combate.siguiente_combate_id]) {
              hijosPorPadre[combate.siguiente_combate_id] = [];
            }
            hijosPorPadre[combate.siguiente_combate_id].push(combate.id);
          }
        }

        // Encontrar combate final (el que no tiene siguiente_combate_id)
        const final = res.data.find((c) => !c.siguiente_combate_id);
        if (!final) {
          console.error("No se encontró el combate final.");
          return;
        }

        // DFS para recorrer hacia atrás y armar orden lógico por ronda
        const ordenadoPorRonda = {};
        const visitados = new Set();

        const dfs = (combateId) => {
          if (visitados.has(combateId)) return;
          visitados.add(combateId);
          const combate = combatesMap.get(combateId);
          if (!combate) return;

          const r = combate.ronda;
          if (!ordenadoPorRonda[r]) ordenadoPorRonda[r] = [];
          if (!ordenadoPorRonda[r].some(c => c.id === combate.id)) {
            ordenadoPorRonda[r].unshift(combate); // insertamos al principio
          }

          const hijos = hijosPorPadre[combateId] || [];
          hijos.forEach(dfs);
        };

        dfs(final.id);

        // Ordenar las rondas numéricamente
        const ordenFinal = {};
        Object.keys(ordenadoPorRonda)
          .sort((a, b) => parseInt(a) - parseInt(b))
          .forEach((r) => {
            ordenFinal[r] = ordenadoPorRonda[r];
          });

        setCombates(ordenFinal);
      } catch (err) {
        console.error("Error al cargar llaves:", err);
      }
    };

    fetchCombates();
  }, [categoriaId]);


  const renderLines = () => {
    const lines = [];

    Object.keys(combates).forEach((ronda) => {
      const rondaInt = parseInt(ronda);
      const combatesActual = combates[rondaInt];
      const combatesSiguiente = combates[rondaInt + 1];

      if (!combatesSiguiente) return;

      combatesActual.forEach((combate) => {
        const origenEl = matchRefs.current[combate.id];
        const destino = combate.siguiente_combate_id;
        const destinoEl = matchRefs.current[destino];

        if (origenEl && destinoEl) {
          const rectOrigen = origenEl.getBoundingClientRect();
          const rectDestino = destinoEl.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();

          const x1 = rectOrigen.right - containerRect.left;
          const y1 = rectOrigen.top + rectOrigen.height / 2 - containerRect.top;
          const x2 = rectDestino.left - containerRect.left;
          const y2 = rectDestino.top + rectDestino.height / 2 - containerRect.top;

          lines.push(
            <line
              key={`${combate.id}-${destino}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="gray"
              strokeWidth="2"
            />
          );
        }
      });
    });

    return lines;
  };

  return (
    <div className="bracket-wrapper" ref={containerRef}>
      <svg className="bracket-svg">{renderLines()}</svg>
      <div className="bracket-container">
        {Object.keys(combates)
          .sort((a, b) => a - b)
          .map((ronda) => (
            <div key={ronda} className="bracket-column">
              <h4>Ronda {parseInt(ronda) + 1}</h4>
              {combates[ronda].map((c) => (
                <div
                  key={c.id}
                  className="bracket-match"
                  ref={(el) => (matchRefs.current[c.id] = el)}
                >
                  <div className="bracket-part">
                    {c.participante_rojo?.nombre || "(vacante)"}
                  </div>
                  <div className="bracket-part">
                    {c.participante_azul?.nombre || "(vacante)"}
                  </div>
                  {c.bye && <div className="bye-text">BYE</div>}
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
};

export default BracketView;
