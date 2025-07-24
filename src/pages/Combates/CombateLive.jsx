import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL;

const CombateLive = ({ combateId, nombreRojo, nombreAzul }) => {
  const { rol } = useAuth();
  const [puntosRojo, setPuntosRojo] = useState(0);
  const [puntosAzul, setPuntosAzul] = useState(0);
  const [segundos, setSegundos] = useState(0);
  const [estadoCombate, setEstadoCombate] = useState('esperando');
  const [roundActual, setRoundActual] = useState(1);
  const [totalRounds, setTotalRounds] = useState(1);
  const [tiempoPorRound, setTiempoPorRound] = useState(60);
  const [tiempoExtra, setTiempoExtra] = useState(30);
  const [modalVisible, setModalVisible] = useState(false);
  const [mensajeModal, setMensajeModal] = useState("");
  const [accionModal, setAccionModal] = useState(null);

  const intervaloRef = useRef(null);

  const esAdminOAutoridad = Array.isArray(rol)
    ? rol.includes('admin') || rol.includes('autoridad')
    : rol === 'admin' || rol === 'autoridad';

  const formatTiempo = (totalSegundos) => {
    if (isNaN(totalSegundos) || totalSegundos === null) return "00:00.0";
    const min = String(Math.floor(totalSegundos / 60)).padStart(2, '0');
    const sec = String(Math.floor(totalSegundos % 60)).padStart(2, '0');
    const dec = String(Math.floor((totalSegundos % 1) * 10));
    return `${min}:${sec}.${dec}`;
  };

  const fetchEventos = async () => {
    try {
      console.log(`[FETCH] GET /combates/${combateId}`);
      const res = await fetch(`${API_BASE}/combates/${combateId}`);
      const combate = await res.json();
      console.log(`[RESPUESTA] /combates:`, combate);

      setTotalRounds(combate.cantidad_de_rounds || 1);
      setTiempoPorRound(combate.tiempo_por_round || 60);
      setTiempoExtra(combate.tiempo_extra || 30);
      setRoundActual(combate.round_actual);

      console.log(`[FETCH] GET /combates/${combateId}/eventos`);
      const eventosRes = await fetch(`${API_BASE}/combates/${combateId}/eventos`);
      const eventosData = await eventosRes.json();
      console.log(`[RESPUESTA] /eventos:`, eventosData);

      let puntosR = 0, puntosA = 0;
      for (const e of eventosData) {
        if (e.tipo === 'punto') {
          if (e.participante === 'rojo') puntosR += e.valor || 0;
          if (e.participante === 'azul') puntosA += e.valor || 0;
        }
      }
      setPuntosRojo(puntosR);
      setPuntosAzul(puntosA);
    } catch (error) {
      console.error('❌ Error al obtener eventos:', error);
    }
  };

  const enviarEvento = async (tipo, participante, valor, marcaDeTiempoManual) => {
    const marcaDeTiempo = marcaDeTiempoManual || formatTiempo(segundos);
    const timestampFront = new Date().toISOString();
    const payload = { tipo, participante, valor, marcaDeTiempo, timestampFront, round: roundActual };
    console.log(`[FETCH] POST /combates/${combateId}/eventos`, payload);
    try {
      const res = await fetch(`${API_BASE}/combates/${combateId}/eventos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      console.log(`[RESPUESTA] /eventos:`, data);
    } catch (error) {
      console.error('❌ Error al enviar evento:', error);
    }
  };

  const iniciarCronometro = () => {
    if (intervaloRef.current) clearInterval(intervaloRef.current);
    console.log(`[CRONÓMETRO] Arrancando en ${segundos}s (Round: ${roundActual})`);
    intervaloRef.current = setInterval(() => {
      setSegundos((prev) => {
        const esTiempoExtra = estadoCombate === 'tiempo_extra';
        const limite = esTiempoExtra ? tiempoExtra : tiempoPorRound;
        if (prev + 0.1 >= limite) {
          detenerCronometro();
          console.log(`[CRONÓMETRO] Tiempo límite alcanzado: ${limite}s`);
          setSegundos(limite);
          setEstadoCombate('pausado');
          setMensajeModal(esTiempoExtra ? "Tiempo extra finalizado" : "Tiempo del round finalizado");
          setAccionModal(() => () => {
            console.log(`[MODAL] Confirmado fin de round. Reiniciando cronómetro a 0 antes de avanzar`);
            setSegundos(0); 
            if (esAdminOAutoridad) evaluarContinuacion();
            setModalVisible(false);
          });
          setModalVisible(true);
          return limite;
        }
        return prev + 0.1;
      });
    }, 100);
  };

  const detenerCronometro = () => {
    if (intervaloRef.current) clearInterval(intervaloRef.current);
    intervaloRef.current = null;
  };

  const iniciarCombate = async () => {
    console.log(`[CRONÓMETRO] Iniciando. Round: ${roundActual}`);
    if (estadoCombate === 'en_curso') return;
    setEstadoCombate('en_curso');
    await enviarEvento('inicio');
    iniciarCronometro();
  };

  const detenerCombate = async () => {
    detenerCronometro();
    const tiempoActual = formatTiempo(segundos);
    await enviarEvento('stop', null, tiempoActual, tiempoActual);
    setEstadoCombate('pausado');
  };

  const evaluarContinuacion = async () => {
    try {
      console.log(`[FETCH] POST /combates/${combateId}/finalizar-round body:`, { round_actual: roundActual });
      const res = await fetch(`${API_BASE}/combates/${combateId}/finalizar-round`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ round_actual: roundActual })
      });
      const data = await res.json();
      console.log(`[RESPUESTA] /finalizar-round:`, data);

      await fetchEventos();

      // --- FIX: NO AUTOINCREMENTAR si no viene round_actual ---
      let nuevoRound = roundActual;
      if (data.round_actual !== undefined && data.round_actual !== null) {
        nuevoRound = data.round_actual;
      } else if (data.estado_final !== "empate") {
        nuevoRound = roundActual + 1;
      }

      console.log(`[ACTUALIZAR] Round de ${roundActual} a ${nuevoRound}`);
      setRoundActual(nuevoRound);

      console.log(`[ACTUALIZAR] Segundos a 0 (antes: ${segundos})`);
      setSegundos(0);

      // --- Si hay empate, lo tratamos como tiempo extra ---
      let nuevoEstado = (data.estado_final === 'empate')
        ? 'tiempo_extra'
        : (data.estado === 'cerrado' ? 'cerrado' : 'esperando');

      console.log(`[ACTUALIZAR] Estado a ${nuevoEstado}`);
      setEstadoCombate(nuevoEstado);

    } catch (error) {
      console.error("❌ Error evaluando continuación:", error);
    }
  };

  useEffect(() => { fetchEventos(); }, [combateId]);

  useEffect(() => {
    const fetchEstado = async () => {
      try {
        console.log(`[FETCH] GET /combates/${combateId}/estado-actual`);
        const res = await fetch(`${API_BASE}/combates/${combateId}/estado-actual`);
        const data = await res.json();
        console.log(`[RESPUESTA] /estado-actual:`, data);

        setTotalRounds(data.total_rounds || 1);
        setRoundActual(data.round_actual || 1);

        if (estadoCombate !== 'cerrado') {
          setEstadoCombate(data.en_tiempo_extra ? 'tiempo_extra' : (data.estado || "esperando"));
        }

        setPuntosRojo(data.puntos?.rojo || 0);
        setPuntosAzul(data.puntos?.azul || 0);

        let tiempoAcumulado = 0;
        let ultimoInicio = null;
        if (data.eventos?.length) {
          for (const e of data.eventos) {
            if (e.tipo === "inicio") ultimoInicio = new Date(e.timestampFront || e.marcaDeTiempo).getTime();
            if (e.tipo === "stop" && ultimoInicio) {
              const stopTime = new Date(e.timestampFront || e.marcaDeTiempo).getTime();
              tiempoAcumulado += (stopTime - ultimoInicio) / 1000;
              ultimoInicio = null;
            }
          }
        }
     if (data.estado === "en_curso" && ultimoInicio && estadoCombate === "en_curso") {
  tiempoAcumulado += (Date.now() - ultimoInicio) / 1000;
  iniciarCronometro();
} else {
  detenerCronometro();
}
        console.log(`[ACTUALIZAR] Segundos calculados: ${Number(tiempoAcumulado.toFixed(1))}`);
        setSegundos(Number(tiempoAcumulado.toFixed(1)));
      } catch (err) {
        console.error("Error al obtener estado actual del combate:", err);
      }
    };
    fetchEstado();
  }, [combateId, roundActual]);

  useEffect(() => {
    const intervalo = setInterval(fetchEventos, 2000);
    return () => clearInterval(intervalo);
  }, [combateId]);

  const botonesPuntos = [1, 2, 3, 4, 5];
  const mostrarBotonIniciar =
    (estadoCombate === 'esperando' || estadoCombate === 'pausado' || estadoCombate === 'abierto' || estadoCombate === 'tiempo_extra') &&
    estadoCombate !== 'cerrado' &&
    esAdminOAutoridad;

  const textoBoton = () => {
    const esTiempoExtra = estadoCombate === 'tiempo_extra';
    return `${estadoCombate === 'pausado' ? 'REANUDAR' : 'INICIAR'} ${esTiempoExtra ? 'TIEMPO EXTRA' : `ROUND ${roundActual}`}`;
  };

  const ModalRound = () => (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999
    }}>
      <div style={{
        background: "white", color: "#000", padding: "2rem",
        borderRadius: "8px", textAlign: "center", maxWidth: "400px"
      }}>
        <p style={{ whiteSpace: "pre-wrap" }}>{mensajeModal}</p>
        <button onClick={accionModal} style={{
          marginTop: "1rem", padding: "0.8rem 2rem", fontSize: "1.2rem",
          background: "#007bff", color: "#fff", border: "none", borderRadius: "4px"
        }}>OK</button>
      </div>
    </div>
  );

  return (
    <>
      {modalVisible && <ModalRound />}
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', background: '#111', color: '#fff',
        padding: '1rem', overflow: 'hidden', width: '100%', maxWidth: '100vw'
      }}>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          {mostrarBotonIniciar && (
            <button onClick={iniciarCombate} style={{ fontSize: '1.5rem', padding: '1rem 2rem' }}>
              {textoBoton()}
            </button>
          )}
        </div>

        <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', width: '33%', alignItems: 'center' }}>
            {botonesPuntos.map((p) => (
              <button key={`rojo-${p}`} onClick={() => enviarEvento('punto', 'rojo', p)} disabled={!esAdminOAutoridad || estadoCombate !== 'en_curso'} style={{
                backgroundColor: 'red', color: 'white',
                fontSize: 'clamp(1.2rem, 4vw, 2rem)', padding: 'clamp(1rem,3vw,1.5rem)',
                borderRadius: '8px', border: 'none', width: '100%',
                opacity: estadoCombate === 'en_curso' && esAdminOAutoridad ? 1 : 0.4
              }}>+{p}</button>
            ))}
          </div>

          <div style={{
            width: '33%', maxWidth: '33%', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              {estadoCombate === 'tiempo_extra' ? 'Tiempo Extra' : `Round ${roundActual}`}
            </div>
            <div style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              marginBottom: '0.5rem',
              fontFamily: "'Orbitron', monospace",
              letterSpacing: '2px',
              color: '#00FF00',
              textShadow: '0 0 10px #00FF00',
              padding: '0.5rem',
              borderRadius: '8px',
              background: '#000',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              {formatTiempo(segundos)}
            </div>
            <div style={{
              fontSize: 'clamp(2rem, 6vw, 4rem)',
              fontWeight: 'bold',
              marginBottom: '1rem',
              whiteSpace: 'nowrap'
            }}>
              {puntosRojo} - {puntosAzul}
            </div>
            {estadoCombate === 'en_curso' && esAdminOAutoridad && (
              <button onClick={detenerCombate} style={{
                backgroundColor: '#fff',
                color: '#000',
                fontSize: '1.5rem',
                padding: '1.5rem',
                borderRadius: '50%',
                border: '2px solid #000'
              }}>STOP</button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', width: '33%', alignItems: 'center' }}>
            {botonesPuntos.map((p) => (
              <button key={`azul-${p}`} onClick={() => enviarEvento('punto', 'azul', p)} disabled={!esAdminOAutoridad || estadoCombate !== 'en_curso'} style={{
                backgroundColor: 'blue', color: 'white',
                fontSize: 'clamp(1.2rem, 4vw, 2rem)', padding: 'clamp(1rem,3vw,1.5rem)',
                borderRadius: '8px', border: 'none', width: '100%',
                opacity: estadoCombate === 'en_curso' && esAdminOAutoridad ? 1 : 0.4
              }}>+{p}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', padding: '0 2rem 1rem' }}>
          <span>{nombreRojo}</span>
          <span>{nombreAzul}</span>
        </div>
      </div>
    </>
  );
};

export default CombateLive;
