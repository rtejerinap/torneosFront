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
  const [llaveInfo, setLlaveInfo] = useState(null);
  const [selectedParticipants, setSelectedParticipants] = useState([]); // [{combateId, color}]
  const [loadingSwap, setLoadingSwap] = useState(false);
  const API_BASE = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // Resetear todo cuando cambia la llave
    setCombatesPorRonda({});
    setMatchPositions({});
    setLines([]);
    setLlaveInfo(null);
    setSelectedParticipants([]);
  }, [llaveId]);

  useEffect(() => {
    const fetchAll = async () => {
      if (!llaveId) return;
      try {
        // Info de la llave
        const llaveRes = await axios.get(`${API_BASE}/combates/llave/${llaveId}`);
        setLlaveInfo(llaveRes.data);
        // Combates
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
    fetchAll();
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

  // --- Intercambio de combates primera ronda ---
  const ronda0 = combatesPorRonda[0] || [];
  const puedeIntercambiar = llaveInfo && llaveInfo.estado === 'no_iniciado' && ronda0.length > 1;

  const handleSelectParticipant = (combateId, color) => {
    if (!puedeIntercambiar) return;
    setSelectedParticipants((prev) => {
      const exists = prev.find(sel => sel.combateId === combateId && sel.color === color);
      if (exists) {
        return prev.filter(sel => !(sel.combateId === combateId && sel.color === color));
      } else if (prev.length < 2) {
        return [...prev, { combateId, color }];
      } else {
        return prev;
      }
    });
  };

  const intercambiarParticipantes = async () => {
    if (selectedParticipants.length !== 2) return;
    setLoadingSwap(true);
    try {
      const [sel1, sel2] = selectedParticipants;
      if (sel1.combateId === sel2.combateId && sel1.color === sel2.color) return;
      // Buscar los dos combates
      const c1 = ronda0.find(c => c.id === sel1.combateId);
      const c2 = ronda0.find(c => c.id === sel2.combateId);
      if (!c1 || !c2) return;

      // Obtener los ids actuales
      const getId = (combate, color) => {
        if (color === 'rojo') return combate.participante_rojo?.id || null;
        if (color === 'azul') return combate.participante_azul?.id || null;
        return null;
      };
      const id1 = getId(c1, sel1.color);
      const id2 = getId(c2, sel2.color);

      // Si uno es vacante y el otro es participante, mover el participante y dejar vacante el otro
      let cambios = [];
      if (id1 && !id2) {
        // Mover id1 a slot2, dejar slot1 vacante
        cambios = [
          {
            combateId: c1.id,
            participante_rojo: sel1.color === 'rojo' ? null : c1.participante_rojo?.id || null,
            participante_azul: sel1.color === 'azul' ? null : c1.participante_azul?.id || null
          },
          {
            combateId: c2.id,
            participante_rojo: sel2.color === 'rojo' ? id1 : c2.participante_rojo?.id || null,
            participante_azul: sel2.color === 'azul' ? id1 : c2.participante_azul?.id || null
          }
        ];
      } else if (!id1 && id2) {
        // Mover id2 a slot1, dejar slot2 vacante
        cambios = [
          {
            combateId: c1.id,
            participante_rojo: sel1.color === 'rojo' ? id2 : c1.participante_rojo?.id || null,
            participante_azul: sel1.color === 'azul' ? id2 : c1.participante_azul?.id || null
          },
          {
            combateId: c2.id,
            participante_rojo: sel2.color === 'rojo' ? null : c2.participante_rojo?.id || null,
            participante_azul: sel2.color === 'azul' ? null : c2.participante_azul?.id || null
          }
        ];
      } else {
        // Ambos son participantes o ambos vacantes: swap normal
        cambios = [
          {
            combateId: c1.id,
            participante_rojo: sel1.color === 'rojo' ? id2 : c1.participante_rojo?.id || null,
            participante_azul: sel1.color === 'azul' ? id2 : c1.participante_azul?.id || null
          },
          {
            combateId: c2.id,
            participante_rojo: sel2.color === 'rojo' ? id1 : c2.participante_rojo?.id || null,
            participante_azul: sel2.color === 'azul' ? id1 : c2.participante_azul?.id || null
          }
        ];
      }

      await axios.post(`${API_BASE}/combates/intercambiar-participantes`, { cambios });
      setSelectedParticipants([]);
      // Refrescar combates
      const res = await axios.get(`${API_BASE}/combates/por-llave/${llaveId}`);
      const allCombates = res.data;
      const rondas = {};
      allCombates.forEach(c => {
        if (!rondas[c.ronda]) rondas[c.ronda] = [];
        rondas[c.ronda].push(c);
      });
      Object.values(rondas).forEach(ronda => ronda.sort((a, b) => a.id.localeCompare(b.id)));
      setCombatesPorRonda(rondas);
    } catch (err) {
      alert('Error al intercambiar participantes');
    } finally {
      setLoadingSwap(false);
    }
  };

  return (
    <div className="bracket-wrapper">
      {puedeIntercambiar && (
        <div style={{ marginBottom: 12 }}>
          <b>Intercambio de participantes (primera ronda):</b>
          <div style={{ fontSize: 14, color: '#aaa' }}>Seleccioná un participante de cada combate de la primera ronda y hacé clic en "Intercambiar participantes".</div>
          <button
            disabled={selectedParticipants.length !== 2 || loadingSwap}
            onClick={intercambiarParticipantes}
            style={{ marginTop: 6, marginBottom: 6, padding: '6px 16px', borderRadius: 4, background: '#222', color: '#fff', border: 'none', cursor: selectedParticipants.length === 2 && !loadingSwap ? 'pointer' : 'not-allowed' }}
          >
            {loadingSwap ? 'Intercambiando...' : 'Intercambiar participantes'}
          </button>
        </div>
      )}
      <div className="bracket-dynamic-container" style={{ width: containerSize.width, height: containerSize.height }}>
        <svg className="bracket-svg">{lines}</svg>
        {Object.keys(combatesPorRonda).length > 0 && Object.values(combatesPorRonda).flat().map(c => {
          const pos = matchPositions[c.numero_combate];
          if (!pos) return null;
          const isFirstRound = c.ronda === 0;
          // Para selección cruzada
          const isSelectedRojo = selectedParticipants.find(sel => sel.combateId === c.id && sel.color === 'rojo');
          const isSelectedAzul = selectedParticipants.find(sel => sel.combateId === c.id && sel.color === 'azul');
          return (
            <div
              key={c.id}
              className={`bracket-match${isFirstRound && puedeIntercambiar ? ' bracket-match-selectable' : ''}`}
              style={{
                position: 'absolute',
                top: `${pos.top}px`,
                left: `${pos.left}px`,
                width: `${MATCH_WIDTH}px`,
                height: `${MATCH_HEIGHT - 20}px`,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'stretch',
                opacity: isFirstRound && puedeIntercambiar ? 1 : 0.85
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
                <div
                  className={`bracket-part${isFirstRound && puedeIntercambiar ? ' bracket-part-selectable' : ''}${isSelectedRojo ? ' bracket-part-selected' : ''}`}
                  style={{ cursor: isFirstRound && puedeIntercambiar ? 'pointer' : 'default', border: isSelectedRojo ? '2px solid #1976d2' : undefined, borderRadius: 4, margin: 2, display: 'flex', alignItems: 'center', gap: 6 }}
                  onClick={() => isFirstRound && puedeIntercambiar && handleSelectParticipant(c.id, 'rojo')}
                >
                  {c.participante_rojo ? (
                    <div style={{ color: '#d32f2f', fontWeight: 600 }}>
                      {c.participante_rojo.nombre} {c.participante_rojo.apellido}
                    </div>
                  ) : <div className="vacant">(Lugar vacante)</div>}
                </div>
                <div
                  className={`bracket-part${isFirstRound && puedeIntercambiar ? ' bracket-part-selectable' : ''}${isSelectedAzul ? ' bracket-part-selected' : ''}`}
                  style={{ cursor: isFirstRound && puedeIntercambiar ? 'pointer' : 'default', border: isSelectedAzul ? '2px solid #1976d2' : undefined, borderRadius: 4, margin: 2, display: 'flex', alignItems: 'center', gap: 6 }}
                  onClick={() => isFirstRound && puedeIntercambiar && handleSelectParticipant(c.id, 'azul')}
                >
                  {c.participante_azul ? (
                    <div style={{ color: '#1976d2', fontWeight: 600 }}>
                      {c.participante_azul.nombre} {c.participante_azul.apellido}
                    </div>
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