import React from 'react';
import { useAuth } from '../../context/AuthContext';
import useCombateEstado from '../../hooks/useCombateEstado';
import formatTiempo from '../../utils/formatTiempo';

const CombateLive = ({ combateId, nombreRojo, nombreAzul }) => {
  const { rol } = useAuth();
  const esAdminOAutoridad = Array.isArray(rol)
    ? rol.includes('admin') || rol.includes('autoridad')
    : rol === 'admin' || rol === 'autoridad';

  const {
    puntos,
    estadoCombate,
    roundActual,
    totalRounds,
    reloj, // 👈 Usamos reloj en lugar de tiempoRestante
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


  const botonesPuntos = [1, 2, 3, 4, 5];
  const mostrarBotonIniciar =
    (estadoCombate === 'esperando' || estadoCombate === 'en_pausa' || estadoCombate === 'no iniciado' || estadoCombate === 'tiempo_extra') &&
    estadoCombate !== 'cerrado' &&
    esAdminOAutoridad;

  const textoBoton = () => {
    const esTiempoExtra = estadoCombate === 'tiempo_extra';
    return `${estadoCombate === 'en_pausa' ? 'REANUDAR' : 'INICIAR'} ${esTiempoExtra ? 'TIEMPO EXTRA' : `ROUND ${roundActual}`}`;
  };

  return (
    <>
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', background: '#111', color: '#fff',
        padding: '1rem', overflow: 'hidden', width: '100%', maxWidth: '100vw'
      }}>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          {mostrarBotonIniciar && (
            <button
              onClick={
                estadoCombate === 'en_pausa'||estadoCombate === 'no iniciado'
                  ? reanudarCombate
                  :  iniciarCombate
              }
              style={{ fontSize: '1.5rem', padding: '1rem 2rem' }}
            >
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
              {formatTiempo(reloj)} {/* 👈 Mostramos el valor del reloj */}
            </div>
        <div style={{
  fontSize: 'clamp(2rem, 6vw, 4rem)',
  fontWeight: 'bold',
  marginBottom: '1rem',
  whiteSpace: 'nowrap'
}}>
  {puntos.rojo} - {puntos.azul}
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