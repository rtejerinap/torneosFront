import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import axios from "axios";
import "./BracketView.css";

const MATCH_HEIGHT = 110; // Alto de la caja del combate + gap vertical
const MATCH_WIDTH = 220;  // Ancho de la caja del combate
const ROUND_GAP = 160;    // Espacio horizontal entre rondas (aumentado para mayor claridad)


const BracketView = ({ llaveId }) => {
  const [combatesPorRonda, setCombatesPorRonda] = useState({});
  const [matchPositions, setMatchPositions] = useState({});
  const [lines, setLines] = useState([]);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const API_BASE = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // Resetear todo cuando cambia la llave
    setCombatesPorRonda({});
    setMatchPositions({});
    setLines([]);
  }, [llaveId]);

  useEffect(() => {
    const fetchAndProcessCombates = async () => {
      if (!llaveId) return;
      try {
        const res = await axios.get(`${API_BASE}/combates/por-llave/${llaveId}`);
        const allCombates = res.data;
        if (allCombates.length === 0) return;

        const rondas = {};
        allCombates.forEach(c => {
          if (!rondas[c.ronda]) rondas[c.ronda] = [];
          rondas[c.ronda].push(c);
        });
        
        // Ordenar por ID para consistencia inicial
        Object.values(rondas).forEach(ronda => ronda.sort((a, b) => a.id.localeCompare(b.id)));

        setCombatesPorRonda(rondas);
      } catch (err) {
        console.error("Error al cargar llaves:", err);
      }
    };
    fetchAndProcessCombates();
  }, [llaveId, API_BASE]);

  useLayoutEffect(() => {
    if (Object.keys(combatesPorRonda).length === 0) return;

    // Mapa de numero_combate a combate
    const combatePorNumero = {};
    Object.values(combatesPorRonda).flat().forEach(c => {
      combatePorNumero[c.numero_combate] = c;
    });

    // 1. Calcular posiciones de ronda 0 (base)
    const newPositions = {};
    const roundKeys = Object.keys(combatesPorRonda).sort((a, b) => parseInt(a) - parseInt(b));
    let maxContainerHeight = 0;

    // Guardar los combates de cada ronda en orden por numero_combate
    const combatesPorRondaSorted = roundKeys.map(rk =>
      [...combatesPorRonda[rk]].sort((a, b) => a.numero_combate - b.numero_combate)
    );

    // Primero, ronda 0: distribuir verticalmente
    if (combatesPorRondaSorted.length > 0) {
      combatesPorRondaSorted[0].forEach((combate, idx) => {
        const left = 0;
        const top = idx * MATCH_HEIGHT;
        newPositions[combate.numero_combate] = { top, left };
        if (top + MATCH_HEIGHT > maxContainerHeight) maxContainerHeight = top + MATCH_HEIGHT;
      });
    }

    // Siguientes rondas: centrar entre padres
    for (let ronda = 1; ronda < combatesPorRondaSorted.length; ronda++) {
      const combates = combatesPorRondaSorted[ronda];
      combates.forEach((combate, idx) => {
        const left = ronda * (MATCH_WIDTH + ROUND_GAP);
        // Buscar todos los combates de la ronda anterior que apuntan a este
        const parentCombates = Object.values(combatePorNumero).filter(
          p => p.siguiente_numero_combate === combate.numero_combate
        );
        let top;
        if (parentCombates.length > 0) {
          // Promediar el top de los padres
          const parentTops = parentCombates.map(p => newPositions[p.numero_combate]?.top + (MATCH_HEIGHT - 20) / 2 || 0);
          // Centrar el box en el medio de los padres
          const avgCenter = parentTops.reduce((sum, val) => sum + val, 0) / parentTops.length;
          top = avgCenter - (MATCH_HEIGHT - 20) / 2;
        } else {
          // Si no tiene padres, ubicarlo como en ronda 0
          top = idx * MATCH_HEIGHT;
        }
        newPositions[combate.numero_combate] = { top, left };
        if (top + MATCH_HEIGHT > maxContainerHeight) maxContainerHeight = top + MATCH_HEIGHT;
      });
    }

    setMatchPositions(newPositions);
    const maxRounds = roundKeys.length;
    const maxContainerWidth = maxRounds * MATCH_WIDTH + (maxRounds - 1) * ROUND_GAP;
    setContainerSize({ width: maxContainerWidth, height: maxContainerHeight });

    // Dibujar líneas
    const newLines = [];
    Object.values(combatesPorRonda).flat().forEach(combate => {
      if (!combate.siguiente_numero_combate) return;

      const origenPos = newPositions[combate.numero_combate];
      const destinoPos = newPositions[combate.siguiente_numero_combate];

      if (origenPos && destinoPos) {
        const x1 = origenPos.left + MATCH_WIDTH;
        const y1 = origenPos.top + (MATCH_HEIGHT - 20) / 2;
        const x2 = destinoPos.left;
        const y2 = destinoPos.top + (MATCH_HEIGHT - 20) / 2;
        const midX = x1 + (x2 - x1) / 2;

        newLines.push(
          <path
            key={`${combate.numero_combate}-${combate.siguiente_numero_combate}`}
            d={`M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`}
            stroke="#555" strokeWidth="2" fill="none"
          />
        );
      }
    });
    setLines(newLines);

  }, [combatesPorRonda]);

  return (
    <div className="bracket-wrapper">
      <div className="bracket-dynamic-container" style={{ width: containerSize.width, height: containerSize.height }}>
        <svg className="bracket-svg">{lines}</svg>
        {Object.keys(combatesPorRonda).length > 0 && Object.values(combatesPorRonda).flat().map(c => {
          const pos = matchPositions[c.numero_combate];
          if (!pos) return null;
          return (
            <div
              key={c.id}
              className="bracket-match"
              style={{
                position: 'absolute',
                top: `${pos.top}px`,
                left: `${pos.left}px`,
                width: `${MATCH_WIDTH}px`,
                height: `${MATCH_HEIGHT - 20}px`, // Dejar 20px de gap
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'stretch',
              }}
            >
              <div className="match-number-wrapper" style={{
                width: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRight: '1px solid #444',
                fontWeight: 700,
                fontSize: '1.1em',
                color: '#aaa',
                background: 'rgba(0,0,0,0.10)'
              }}>
                {c.numero_combate}
              </div>
              <div className="match-content" style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                <div className="bracket-part">
                  {c.participante_rojo ? (
                    <>
                      <div>{c.participante_rojo.nombre}</div>
                      <div className="apellido">{c.participante_rojo.apellido}</div>
                    </>
                  ) : <div className="vacant">(Lugar vacante)</div>}
                </div>
                <div className="bracket-part">
                  {c.participante_azul ? (
                    <>
                      <div>{c.participante_azul.nombre}</div>
                      <div className="apellido">{c.participante_azul.apellido}</div>
                    </>
                  ) : <div className="vacant">(Lugar vacante)</div>}
                </div>
                {c.bye && <div className="bye-text">BYE</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BracketView;