import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import useCombateEstado from '../../hooks/useCombateEstado';
import formatTiempo from '../../utils/formatTiempo';

// Helper para mostrar advertencias (sin fondo, solo texto destacado)
const AdvertenciasInfo = ({ cantidad, color }) => (
  <div style={{
    color,
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: '1.1rem',
    letterSpacing: 1,
    minWidth: 60,
    textAlign: 'center',
    opacity: 0.92
  }}>
    {cantidad}
  </div>
);

const API_BASE = import.meta.env.VITE_API_URL;

const CombateLive = ({ combateId, nombreRojo, nombreAzul }) => {
  const { rol } = useAuth();

  // SOLO admin y autoridad pueden controlar el reloj
  const puedeControlarReloj = Array.isArray(rol)
    ? rol.includes('admin') || rol.includes('autoridad')
    : rol === 'admin' || rol === 'autoridad';

  // admin, autoridad y arbitro pueden sumar puntos
  const puedeSumarPuntos = Array.isArray(rol)
    ? rol.includes('admin') || rol.includes('autoridad') || rol.includes('arbitro')
    : rol === 'admin' || rol === 'autoridad' || rol === 'arbitro';

  const {
    puntos,
    estadoCombate,
    roundActual,
    totalRounds,
    reloj,
    limiteTiempo,
    horaInicioReal,
    horaFinReal,
    ultimoMensaje,
    puedeIniciar,
    debeFinalizar,
    fetchEstadoActual,
    setEstadoCombate,
    setRoundActual,
    enviarEvento,
    iniciarCombate,
    reanudarCombate,
    detenerCombate,
    evaluarContinuacion,
    advertencias_rojo,
    advertencias_azul
  } = useCombateEstado(combateId);

  const [modalFinal, setModalFinal] = useState(false);
  const [modalEmpate, setModalEmpate] = useState(false);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [logEventos, setLogEventos] = useState([]);
  const [logLoading, setLogLoading] = useState(false);

  // --- NUEVO: datos del combate para "asignar ganador"
  const [byeFlag, setByeFlag] = useState(false);
  const [idRojo, setIdRojo] = useState(null);
  const [idAzul, setIdAzul] = useState(null);

  // Modal / estado para asignar ganador
  const [asignarOpen, setAsignarOpen] = useState(false);
  const [asignarSeleccion, setAsignarSeleccion] = useState(null);
  const [asignando, setAsignando] = useState(false);
  const [asignarError, setAsignarError] = useState(null);

  // Estado para advertencia
  const [confirmAdvertencia, setConfirmAdvertencia] = useState(false);
  const [advertenciaPendiente, setAdvertenciaPendiente] = useState(null);

  // Cargar detalles del combate (bye + ids de participantes)
  useEffect(() => {
    let abort = false;
    const cargar = async () => {
      try {
        const res = await fetch(`${API_BASE}/combates/${combateId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (abort) return;
        setByeFlag(!!data.bye);
        setIdRojo(data.participante_rojo || null);
        setIdAzul(data.participante_azul || null);
      } catch {}
    };
    cargar();
    return () => { abort = true; };
  }, [combateId]);

  // Empate detectado (mensaje o estado tiempo_extra)
  const hayEmpateDetectado =
    estadoCombate === 'tiempo_extra' ||
    (ultimoMensaje && ultimoMensaje.toLowerCase().includes('empate'));

  // Mostrar botón Asignar ganador (solo admin/autoridad), si hay bye o empate y el combate no está cerrado
  const mostrarAsignarGanador =
    puedeControlarReloj &&
    (byeFlag || hayEmpateDetectado) &&
    estadoCombate !== 'cerrado' &&
    (idRojo || idAzul);

  // Armar opciones (excluir null)
  const opcionesGanador = [
    idRojo ? { id: idRojo, label: nombreRojo || 'Rojo' } : null,
    idAzul ? { id: idAzul, label: nombreAzul || 'Azul' } : null
  ].filter(Boolean);

  // Si hay 1 sola opción (bye), la preseleccionamos
  useEffect(() => {
    if (asignarOpen && opcionesGanador.length === 1) {
      setAsignarSeleccion(opcionesGanador[0].id);
    }
  }, [asignarOpen, opcionesGanador]);

  // Función para enviar advertencia
  const handleAdvertencia = (lado) => {
    setAdvertenciaPendiente(lado);
    setConfirmAdvertencia(true);
  };

  const confirmarAdvertencia = async () => {
    if (!advertenciaPendiente) return;
    try {
      await enviarEvento('advertencia', advertenciaPendiente, 1);
    } catch {
      alert('Error al enviar advertencia');
    }
    setConfirmAdvertencia(false);
    setAdvertenciaPendiente(null);
  };

  const cancelarAdvertencia = () => {
    setConfirmAdvertencia(false);
    setAdvertenciaPendiente(null);
  };

  const handleOpenLog = async () => {
    setLogModalOpen(true);
    setLogLoading(true);
    try {
      const res = await fetch(`${API_BASE}/combates/${combateId}/eventos-ordenados`);
      const data = await res.json();
      setLogEventos(data);
    } catch (error) {
      console.error("Error al cargar el log de eventos:", error);
    } finally {
      setLogLoading(false);
    }
  };

  // Modal para combate finalizado
  useEffect(() => {
    setModalFinal(estadoCombate === 'cerrado');
  }, [estadoCombate]);

  // Modal de EMPATE/TIEMPO EXTRA detectado
  useEffect(() => {
    if (
      ultimoMensaje?.toLowerCase().includes('empate') ||
      estadoCombate === 'empate' ||
      estadoCombate === 'tiempo_extra'
    ) {
      setModalEmpate(true);
    } else {
      setModalEmpate(false);
    }
  }, [ultimoMensaje, estadoCombate]);

  const botonesPuntos = [1, 2, 3, 4, 5]; // Solo para árbitros

  // Estado para confirmación de suma/resta admin/autoridad
  const [confirmPunto, setConfirmPunto] = useState(false);
  const [puntoPendiente, setPuntoPendiente] = useState(null); // { lado: 'rojo'|'azul', valor: +1|-1 }

  // Handler para admin/autoridad
  const handlePuntoAdmin = (lado, valor) => {
    setPuntoPendiente({ lado, valor });
    setConfirmPunto(true);
  };

  const confirmarPuntoAdmin = async () => {
    if (!puntoPendiente) return;
    try {
      await enviarEvento('punto', puntoPendiente.lado, puntoPendiente.valor);
    } catch {
      alert('Error al enviar punto');
    }
    setConfirmPunto(false);
    setPuntoPendiente(null);
  };

  const cancelarPuntoAdmin = () => {
    setConfirmPunto(false);
    setPuntoPendiente(null);
  };

  const mostrarBotonIniciar =
    (estadoCombate === 'esperando' ||
      estadoCombate === 'en_pausa' ||
      estadoCombate === 'no iniciado' || // <-- si tu backend usa 'no_iniciado', cambiá esta línea
      estadoCombate === 'tiempo_extra') &&
    estadoCombate !== 'cerrado' &&
    puedeControlarReloj;

  const textoBoton = () => {
    const esTiempoExtra = estadoCombate === 'tiempo_extra';
    return `${estadoCombate === 'en_pausa' ? 'REANUDAR' : 'INICIAR'} ${esTiempoExtra ? 'TIEMPO EXTRA' : `ROUND ${roundActual}`}`;
  };

  // --- NUEVO: llamar al EP de asignar ganador
  const ejecutarAsignarGanador = async () => {
    setAsignarError(null);
    if (!asignarSeleccion) {
      setAsignarError('Debés seleccionar un competidor.');
      return;
    }
    setAsignando(true);
    try {
      const res = await fetch(`${API_BASE}/combates/${combateId}/asignar-ganador`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ganador_participante_id: asignarSeleccion,
          metodo_victoria: 'asignacion_manual',
          forzar: true
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'No se pudo asignar el ganador');
      }
      // Refrescar estado y cerrar modal
      await fetchEstadoActual();
      setAsignarOpen(false);
      // Si se cerró el combate, mostramos modal de final
      setModalFinal(true);
    } catch (e) {
      setAsignarError(e.message);
    } finally {
      setAsignando(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        height: '100dvh',
        maxHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: '#111',
        color: '#fff',
        padding: 0,
        margin: 0,
        width: '100vw',
        overflow: 'hidden',
      }}
    >
      {/* Modal combate finalizado */}
      {modalFinal && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <div style={{
            background: '#222',
            color: '#fff',
            padding: '2rem 3rem',
            borderRadius: '20px',
            fontSize: '2rem',
            textAlign: 'center'
          }}>
            Combate finalizado
            <div>
              <button
                style={{ marginTop: '2rem', fontSize: '1.2rem', padding: '0.7rem 1.2rem', borderRadius: 8, marginRight: '1rem' }}
                onClick={handleOpenLog}
              >
                Log de Eventos
              </button>
              <button
                style={{ marginTop: '2rem', fontSize: '1.2rem', padding: '0.7rem 1.2rem', borderRadius: 8, background: '#555' }}
                onClick={() => setModalFinal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Log de Eventos */}
      {logModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          zIndex: 1200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#333',
            color: '#fff',
            padding: '1.5rem',
            borderRadius: '10px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <h2 style={{ marginTop: 0, borderBottom: '1px solid #555', paddingBottom: '0.5rem' }}>Log de Eventos</h2>
            <div style={{ overflowY: 'auto', flexGrow: 1 }}>
              {logLoading ? (
                <p>Cargando...</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem' }}>
                  {logEventos.map((evento, index) => (
                    <li key={index} style={{
                      padding: '0.6rem 0.2rem',
                      borderBottom: '1px solid #444',
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{ color: '#aaa', fontFamily: 'monospace' }}>{evento.marcaDeTiempo}</span>
                      <span style={{ flexGrow: 1, textAlign: 'left', marginLeft: '1rem' }}>{`${evento.tipo.toUpperCase()}: ${evento.participante || ''} ${evento.valor || ''}`.trim()}</span>
                      <span style={{ color: '#888', fontSize: '0.8em', fontStyle: 'italic' }}>{evento.user_name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button style={{ marginTop: '1.5rem', fontSize: '1.2rem', padding: '0.7rem 1.2rem', borderRadius: 8, alignSelf: 'center' }} onClick={() => setLogModalOpen(false)}>Cerrar</button>
          </div>
        </div>
      )}

      {/* Modal EMPATE/TIEMPO EXTRA */}
      {modalEmpate && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 1100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <div style={{
            background: '#ffd600',
            color: '#222',
            padding: '2rem 3rem',
            borderRadius: '20px',
            fontSize: '2rem',
            textAlign: 'center'
          }}>
            <b>¡Empate!</b>
            <div>Se habilita el TIEMPO EXTRA</div>
            <button
              style={{ marginTop: '2rem', fontSize: '1.2rem', padding: '0.7rem 1.2rem', borderRadius: 8 }}
              onClick={() => setModalEmpate(false)}
            >
              Ok
            </button>
          </div>
        </div>
      )}

      {/* Banner arriba si está cerrado o no está en curso */}
      {(estadoCombate === 'cerrado' || (puedeControlarReloj && estadoCombate !== 'en_curso')) && (
        <div style={{
          width: '100%',
          background: '#08b433ff',
          color: '#fff',
          padding: '0.5rem 1rem',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '1.3rem',
          letterSpacing: '1px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem'
        }}>
          {estadoCombate === 'cerrado' && (
            <span>Resultado Final: {puntos.rojo} - {puntos.azul}</span>
          )}
          {puedeControlarReloj && estadoCombate !== 'en_curso' && (
            <button
              onClick={handleOpenLog}
              style={{
                fontSize: '0.9rem',
                padding: '0.4rem 0.8rem',
                borderRadius: '5px',
                border: '1px solid #fff',
                background: 'transparent',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              Ver Log
            </button>
          )}
        </div>
      )}

      {/* Reloj arriba de los botones, centrado */}
      <div style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '1.2rem',
        marginBottom: '0.5rem',
      }}>
        {/* El reloj solo lo ven admin/autoridad */}
        {puedeControlarReloj && (
          <div
            className="CombateLive-reloj"
            style={{
              fontSize: 'clamp(2.2rem, 7vw, 3.2rem)',
              fontFamily: "'Orbitron', 'Share Tech Mono', 'VT323', monospace",
              letterSpacing: '3px',
              color: '#00FF00',
              textShadow: '0 0 18px #00FF00, 0 0 4px #222',
              padding: '0.7rem 0.2rem',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #111 60%, #1a3a1a 100%)',
              width: '100%',
              maxWidth: 220,
              boxSizing: 'border-box',
              border: '3px solid #00FF00',
              boxShadow: '0 0 24px 2px #00ff0055, 0 2px 12px #000',
              fontWeight: 900,
              userSelect: 'none',
              transition: 'background 0.3s',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.5rem',
            }}
          >
            {formatTiempo(reloj)}
          </div>
        )}
        {/* Botón iniciar/reanudar más chico */}
        {mostrarBotonIniciar && (
          <button
            onClick={
              estadoCombate === 'en_pausa' || estadoCombate === 'no iniciado' // <-- cambiar si usás 'no_iniciado'
                ? reanudarCombate
                : iniciarCombate
            }
            style={{ fontSize: '1.1rem', padding: '0.5rem 1.1rem', borderRadius: 10, marginTop: 8 }}
          >
            {textoBoton()}
          </button>
        )}

        {/* --- NUEVO: Botón Asignar ganador cuando bye o empate --- */}
        {mostrarAsignarGanador && (
          <button
            onClick={() => { setAsignarError(null); setAsignarOpen(true); }}
            style={{
              marginTop: 10,
              fontSize: '1rem',
              padding: '0.5rem 1rem',
              borderRadius: 10,
              background: '#9c27b0',
              color: '#fff',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Asignar ganador
          </button>
        )}
      </div>

      {/* El centro */}
      <div
        style={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 'calc(85vh - 8rem)',
          maxHeight: 'calc(85vh - 8rem)',
          margin: 0,
          gap: '2vw',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2vw',
            width: '33%',
            alignItems: 'center',
            height: '95%',
            justifyContent: 'center',
            maxWidth: 400,
            minWidth: 120,
          }}
        >
          {/* Nombre ROJO arriba */}
          <div style={{ color: 'red', fontWeight: 'bold', fontSize: 'clamp(1.1rem, 2.5vw, 2rem)', marginBottom: 4, letterSpacing: 1 }}>{nombreRojo}</div>
          {/* Mostrar advertencias ROJO solo admin/autoridad */}
          {puedeControlarReloj && (
            <AdvertenciasInfo cantidad={typeof advertencias_rojo !== 'undefined' ? advertencias_rojo : 0} color="#c62828" />
          )}
          {/* Botón advertencia solo admin/autoridad */}
          {puedeControlarReloj && estadoCombate !== 'cerrado' && estadoCombate !== 'esperando' && estadoCombate !== 'no iniciado' && (
            <button
              style={{
                backgroundColor: '#ff9800',
                color: '#fff',
                fontSize: 'clamp(1.1rem, 4vw, 2rem)',
                borderRadius: '16px',
                border: 'none',
                width: '100%',
                marginTop: 18,
                marginBottom: 22,
                padding: '1.2rem 0',
                fontWeight: 'bold',
                letterSpacing: 1,
                opacity: estadoCombate === 'cerrado' || estadoCombate === 'esperando' || estadoCombate === 'no iniciado' ? 0.5 : 1,
                cursor: estadoCombate === 'cerrado' || estadoCombate === 'esperando' || estadoCombate === 'no iniciado' ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                touchAction: 'manipulation',
              }}
              onClick={() => handleAdvertencia('rojo')}
              disabled={estadoCombate === 'cerrado' || estadoCombate === 'esperando' || estadoCombate === 'no iniciado'}
            >
              Advertencia Rojo
            </button>
          )}
          {/* Si es árbitro, muestra los botones clásicos */}
          {puedeSumarPuntos && !puedeControlarReloj && botonesPuntos.map((p) => (
            <button
              key={`rojo-${p}`}
              onClick={() => enviarEvento('punto', 'rojo', p)}
              disabled={estadoCombate !== 'en_curso'}
              style={{
                backgroundColor: 'red',
                color: 'white',
                fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
                borderRadius: '16px',
                border: 'none',
                width: '100%',
                minHeight: 64,
                marginBottom: 12,
                padding: '1.2rem 0',
                fontWeight: 'bold',
                letterSpacing: 1,
                opacity: estadoCombate === 'en_curso' ? 1 : 0.4,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                touchAction: 'manipulation',
              }}
            >+{p}</button>
          ))}
          {/* Si es admin/autoridad, muestra +1 y -1 con confirmación */}
          {puedeControlarReloj && estadoCombate !== 'cerrado' && estadoCombate !== 'no iniciado' && (
            <>
              <button
                style={{
                  backgroundColor: 'red',
                  color: '#fff',
                  fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
                  borderRadius: '16px',
                  border: 'none',
                  width: '100%',
                  marginBottom: 16,
                  padding: '1.2rem 0',
                  fontWeight: 'bold',
                  letterSpacing: 1,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  touchAction: 'manipulation',
                }}
                onClick={() => handlePuntoAdmin('rojo', 1)}
              >+1</button>
              <button
                style={{
                  backgroundColor: 'red',
                  color: '#fff',
                  fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
                  borderRadius: '16px',
                  border: 'none',
                  width: '100%',
                  marginBottom: 16,
                  padding: '1.2rem 0',
                  fontWeight: 'bold',
                  letterSpacing: 1,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  touchAction: 'manipulation',
                }}
                onClick={() => handlePuntoAdmin('rojo', -1)}
              >-1</button>
            </>
          )}

        </div>

        {/* Centro */}
        <div
          style={{
            width: '33%',
            maxWidth: 400,
            minWidth: 120,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>
              {estadoCombate === 'tiempo_extra' ? 'Tiempo Extra' : `Round ${roundActual}`}
            </div>
            {/* El tanteador solo lo ven admin/autoridad */}
            {puedeControlarReloj && (
              <div style={{
                fontSize: 'clamp(2rem, 6vw, 4rem)',
                fontWeight: 'bold',
                marginBottom: '1rem',
                whiteSpace: 'nowrap',
                textAlign: 'center',
              }}>
                {puntos.rojo} - {puntos.azul}
              </div>
            )}
            {estadoCombate === 'en_curso' && puedeControlarReloj && (
              <button onClick={detenerCombate} style={{
                backgroundColor: '#fff',
                color: '#000',
                fontSize: '1.5rem',
                padding: '1.5rem',
                borderRadius: '50%',
                border: '2px solid #000',
                margin: '0 auto',
                display: 'block',
              }}>STOP</button>
            )}
          </>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2vw',
            width: '33%',
            alignItems: 'center',
            height: '95%',
            justifyContent: 'center',
            maxWidth: 400,
            minWidth: 120,
          }}
        >
          {/* Nombre AZUL arriba */}
          <div style={{ color: 'blue', fontWeight: 'bold', fontSize: 'clamp(1.1rem, 2.5vw, 2rem)', marginBottom: 4, letterSpacing: 1 }}>{nombreAzul}</div>
          {/* Mostrar advertencias AZUL solo admin/autoridad */}
          {puedeControlarReloj && (
            <AdvertenciasInfo cantidad={typeof advertencias_azul !== 'undefined' ? advertencias_azul : 0} color="#1565c0" />
          )}
          {puedeControlarReloj && estadoCombate !== 'cerrado' && estadoCombate !== 'esperando' && estadoCombate !== 'no iniciado' && (
            <button
              style={{
                backgroundColor: '#ff9800',
                color: '#fff',
                fontSize: 'clamp(1.1rem, 4vw, 2rem)',
                borderRadius: '16px',
                border: 'none',
                width: '100%',
                marginTop: 18,
                marginBottom: 22,
                padding: '1.2rem 0',
                fontWeight: 'bold',
                letterSpacing: 1,
                opacity: estadoCombate === 'cerrado' || estadoCombate === 'esperando' || estadoCombate === 'no iniciado' ? 0.5 : 1,
                cursor: estadoCombate === 'cerrado' || estadoCombate === 'esperando' || estadoCombate === 'no iniciado' ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                touchAction: 'manipulation',
              }}
              onClick={() => handleAdvertencia('azul')}
              disabled={estadoCombate === 'cerrado' || estadoCombate === 'esperando' || estadoCombate === 'no iniciado'}
            >
              Advertencia Azul
            </button>
          )}

          {/* Si es árbitro, muestra los botones clásicos */}
          {puedeSumarPuntos && !puedeControlarReloj && botonesPuntos.map((p) => (
            <button
              key={`azul-${p}`}
              onClick={() => enviarEvento('punto', 'azul', p)}
              disabled={estadoCombate !== 'en_curso'}
              style={{
                backgroundColor: 'blue',
                color: 'white',
                fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
                borderRadius: '16px',
                border: 'none',
                width: '100%',
                minHeight: 64,
                marginBottom: 12,
                padding: '1.2rem 0',
                fontWeight: 'bold',
                letterSpacing: 1,
                opacity: estadoCombate === 'en_curso' ? 1 : 0.4,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                touchAction: 'manipulation',
              }}
            >+{p}</button>
          ))}
          {/* Si es admin/autoridad, muestra +1 y -1 con confirmación */}
          {puedeControlarReloj && estadoCombate !== 'cerrado' && estadoCombate !== 'no iniciado' && (
            <>
              <button
                style={{
                  backgroundColor: 'blue',
                  color: '#fff',
                  fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
                  borderRadius: '16px',
                  border: 'none',
                  width: '100%',
                  marginBottom: 16,
                  padding: '1.2rem 0',
                  fontWeight: 'bold',
                  letterSpacing: 1,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  touchAction: 'manipulation',
                }}
                onClick={() => handlePuntoAdmin('azul', 1)}
              >+1</button>
              <button
                style={{
                  backgroundColor: 'blue',
                  color: '#fff',
                  fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
                  borderRadius: '16px',
                  border: 'none',
                  width: '100%',
                  marginBottom: 16,
                  padding: '1.2rem 0',
                  fontWeight: 'bold',
                  letterSpacing: 1,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  touchAction: 'manipulation',
                }}
                onClick={() => handlePuntoAdmin('azul', -1)}
              >-1</button>
            </>
          )}

        </div>

        {/* Modal de confirmación de punto admin/autoridad */}
        {confirmPunto && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 2100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ background: '#fff', color: '#222', padding: 32, borderRadius: 12, minWidth: 320 }}>
              <h2>Confirmar acción</h2>
              <p>¿Seguro que querés {puntoPendiente?.valor > 0 ? 'sumar' : 'restar'} 1 punto al competidor <b>{puntoPendiente?.lado === 'rojo' ? 'ROJO' : 'AZUL'}</b>?</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                <button onClick={cancelarPuntoAdmin}>Cancelar</button>
                <button onClick={confirmarPuntoAdmin} style={{ background: '#2196f3', color: '#fff', fontWeight: 'bold' }}>Confirmar</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación de advertencia */}
        {confirmAdvertencia && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ background: '#fff', color: '#222', padding: 32, borderRadius: 12, minWidth: 320 }}>
              <h2>Confirmar advertencia</h2>
              <p>¿Seguro que querés enviar una advertencia al competidor <b>{advertenciaPendiente === 'rojo' ? 'ROJO' : 'AZUL'}</b>?</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                <button onClick={cancelarAdvertencia}>Cancelar</button>
                <button onClick={confirmarAdvertencia} style={{ background: '#ff9800', color: '#fff', fontWeight: 'bold' }}>Confirmar</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal ASIGNAR GANADOR */}
      {asignarOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          zIndex: 2200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', color: '#222', padding: 24, borderRadius: 12, minWidth: 320, maxWidth: 420 }}>
            <h2 style={{ marginTop: 0 }}>Asignar ganador</h2>
            {opcionesGanador.length === 0 ? (
              <p>No hay competidores disponibles para asignar.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {opcionesGanador.map(opt => (
                  <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="asignar-ganador"
                      value={opt.id}
                      checked={asignarSeleccion === opt.id}
                      onChange={() => setAsignarSeleccion(opt.id)}
                    />
                    <span><b>{opt.label}</b></span>
                  </label>
                ))}
                {asignarError && <div style={{ color: '#b71c1c', marginTop: 6 }}>{asignarError}</div>}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 18 }}>
                  <button onClick={() => setAsignarOpen(false)} disabled={asignando}>Cancelar</button>
                  <button
                    onClick={ejecutarAsignarGanador}
                    disabled={asignando || !asignarSeleccion}
                    style={{ background: '#9c27b0', color: '#fff', fontWeight: 'bold', padding: '0.5rem 1rem', borderRadius: 8 }}
                  >
                    {asignando ? 'Asignando...' : 'Asignar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Estilos responsive */}
      <style>{`
        @media (max-width: 700px) {
          .CombateLive-btn {
            font-size: 6vw !important;
            padding: 1.5rem 0 !important;
            min-height: 60px !important;
            border-radius: 18px !important;
            margin-bottom: 14px !important;
          }
          .CombateLive-reloj {
            max-width: 90vw !important;
            font-size: 8vw !important;
            padding: 0.6rem 0.1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CombateLive;
