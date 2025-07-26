import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import useCombateEstado from '../../hooks/useCombateEstado';
import formatTiempo from '../../utils/formatTiempo';

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
    evaluarContinuacion
  } = useCombateEstado(combateId);

  const [modalFinal, setModalFinal] = useState(false);

  useEffect(() => {
    if (estadoCombate === 'cerrado') setModalFinal(true);
    else setModalFinal(false);
  }, [estadoCombate]);

  const botonesPuntos = [1, 2, 3, 4, 5];
  const mostrarBotonIniciar =
    (estadoCombate === 'esperando' ||
      estadoCombate === 'en_pausa' ||
      estadoCombate === 'no iniciado' ||
      estadoCombate === 'tiempo_extra') &&
    estadoCombate !== 'cerrado' &&
    puedeControlarReloj;

  const textoBoton = () => {
    const esTiempoExtra = estadoCombate === 'tiempo_extra';
    return `${estadoCombate === 'en_pausa' ? 'REANUDAR' : 'INICIAR'} ${esTiempoExtra ? 'TIEMPO EXTRA' : `ROUND ${roundActual}`}`;
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
                style={{ marginTop: '2rem', fontSize: '1.2rem', padding: '0.7rem 1.2rem', borderRadius: 8 }}
                onClick={() => setModalFinal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner arriba si está cerrado */}
      {estadoCombate === 'cerrado' && (
        <div style={{
          width: '100%',
          background: '#b10f0f',
          color: '#fff',
          padding: '0.5rem',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '1.3rem',
          letterSpacing: '1px',
        }}>
          Combate finalizado
        </div>
      )}

      {/* Botón iniciar/reanudar */}
      <div style={{ textAlign: 'center', marginTop: '1rem', minHeight: '3rem' }}>
        {mostrarBotonIniciar && (
          <button
            onClick={
              estadoCombate === 'en_pausa' || estadoCombate === 'no iniciado'
                ? reanudarCombate
                : iniciarCombate
            }
            style={{ fontSize: '1.5rem', padding: '1rem 2rem' }}
          >
            {textoBoton()}
          </button>
        )}
      </div>

      {/* El centro: ocupa 85% del alto TOTAL, quitando el alto del banner y de los nombres */}
      <div
        style={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 'calc(85vh - 4rem)',
          maxHeight: 'calc(85vh - 4rem)',
          margin: 0,
        }}
      >
        {/* Botones rojos */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.7rem',
            width: '33%',
            alignItems: 'center',
            height: '95%',
            justifyContent: 'center'
          }}
        >
          {botonesPuntos.map((p) => (
            <button
              key={`rojo-${p}`}
              onClick={() => enviarEvento('punto', 'rojo', p)}
              disabled={!puedeSumarPuntos || estadoCombate !== 'en_curso'}
              style={{
                backgroundColor: 'red',
                color: 'white',
                fontSize: 'clamp(1.2rem, 4vw, 2rem)',
                flex: 1,
                borderRadius: '8px',
                border: 'none',
                width: '100%',
                minHeight: 0,
                opacity: estadoCombate === 'en_curso' && puedeSumarPuntos ? 1 : 0.4,
              }}
            >+{p}</button>
          ))}
        </div>

        {/* Centro */}
        <div
          style={{
            width: '33%',
            maxWidth: '33%',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
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
            {formatTiempo(reloj)}
          </div>
          <div style={{
            fontSize: 'clamp(2rem, 6vw, 4rem)',
            fontWeight: 'bold',
            marginBottom: '1rem',
            whiteSpace: 'nowrap'
          }}>
            {puntos.rojo} - {puntos.azul}
          </div>
          {estadoCombate === 'en_curso' && puedeControlarReloj && (
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

        {/* Botones azules */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.7rem',
            width: '33%',
            alignItems: 'center',
            height: '95%',
            justifyContent: 'center'
          }}
        >
          {botonesPuntos.map((p) => (
            <button
              key={`azul-${p}`}
              onClick={() => enviarEvento('punto', 'azul', p)}
              disabled={!puedeSumarPuntos || estadoCombate !== 'en_curso'}
              style={{
                backgroundColor: 'blue',
                color: 'white',
                fontSize: 'clamp(1.2rem, 4vw, 2rem)',
                flex: 1,
                borderRadius: '8px',
                border: 'none',
                width: '100%',
                minHeight: 0,
                opacity: estadoCombate === 'en_curso' && puedeSumarPuntos ? 1 : 0.4,
              }}
            >+{p}</button>
          ))}
        </div>
      </div>

      {/* Nombres */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '1.2rem',
        padding: '0 2rem 1rem',
        minHeight: '2.2rem'
      }}>
        <span>{nombreRojo}</span>
        <span>{nombreAzul}</span>
      </div>
    </div>
  );
};

export default CombateLive;
