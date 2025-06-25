import React, { useState, useEffect, useRef } from 'react';

const CombateLive = ({ combateId, nombreRojo, nombreAzul }) => {
  const [puntosRojo, setPuntosRojo] = useState(0);
  const [puntosAzul, setPuntosAzul] = useState(0);
  const [segundos, setSegundos] = useState(0);
  const [estadoCombate, setEstadoCombate] = useState('esperando'); // en_curso, pausado
  const intervaloRef = useRef(null);

  const formatTiempo = (totalSegundos) => {
    const min = String(Math.floor(totalSegundos / 60)).padStart(2, '0');
    const sec = String(Math.floor(totalSegundos % 60)).padStart(2, '0');
    const dec = String(Math.floor((totalSegundos % 1) * 10));
    return `${min}:${sec}.${dec}`;
  };

  const fetchResultados = async () => {
    try {
      const res = await fetch(`https://us-central1-torneos-305d7.cloudfunctions.net/api/combates/${combateId}/resultados`);
      const data = await res.json();
      setPuntosRojo(data.rojo || 0);
      setPuntosAzul(data.azul || 0);
    } catch (error) {
      console.error('Error al obtener resultados:', error);
    }
  };

  const fetchEventos = async () => {
    try {
      const res = await fetch(`https://us-central1-torneos-305d7.cloudfunctions.net/api/combates/${combateId}/eventos`);
      const eventos = await res.json();
      return eventos;
    } catch (error) {
      console.error('Error al obtener eventos:', error);
      return [];
    }
  };

  const enviarEvento = async (tipo, participante, valor, marcaDeTiempoManual) => {
    const marcaDeTiempo = marcaDeTiempoManual || formatTiempo(segundos);
    const timestampFront = new Date().toISOString();
    try {
      await fetch(`https://us-central1-torneos-305d7.cloudfunctions.net/api/combates/${combateId}/eventos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, participante, marcaDeTiempo, valor, timestampFront }),
      });
      if (tipo === 'punto') fetchResultados();
    } catch (error) {
      console.error('Error al enviar evento:', error);
    }
  };

  const iniciarCronometro = () => {
    if (intervaloRef.current) clearInterval(intervaloRef.current);
    intervaloRef.current = setInterval(() => {
      setSegundos((prev) => prev + 0.1);
    }, 100);
  };

  const detenerCronometro = () => {
    if (intervaloRef.current) clearInterval(intervaloRef.current);
    intervaloRef.current = null;
  };

  const iniciarCombate = async () => {
    const eventos = await fetchEventos();
    const ultimo = eventos.at(-1);

    if (ultimo?.tipo === 'stop' && ultimo.marcaDeTiempo) {
      const [min, sec] = ultimo.marcaDeTiempo.split(':').map(Number);
      setSegundos(min * 60 + sec);
    }

    setEstadoCombate('en_curso');
    iniciarCronometro();
    await enviarEvento('inicio');
  };

  const detenerCombate = async () => {
    detenerCronometro();
    const tiempoActual = formatTiempo(segundos);
    setEstadoCombate('pausado');
    await enviarEvento('stop', null, tiempoActual, tiempoActual);
  };

  useEffect(() => {
    fetchResultados();

    const sincronizar = async () => {
      const eventos = await fetchEventos();
      const ultimo = eventos.at(-1);

      if (!ultimo) return;

      if (ultimo.tipo === 'stop' && ultimo.marcaDeTiempo) {
        const [min, sec] = ultimo.marcaDeTiempo.split(':').map(Number);
        const tiempoStop = min * 60 + sec;
        detenerCronometro();
        setSegundos(tiempoStop);
        setEstadoCombate('pausado');
      } else if (ultimo.tipo === 'inicio') {
        const [min, sec] = ultimo.marcaDeTiempo.split(':').map(Number);
        const tiempoEvento = min * 60 + sec;
        const tiempoPasado = (Date.now() - new Date(ultimo.timestampFront)) / 1000;
        const nuevoTiempo = tiempoEvento + tiempoPasado;
        setSegundos(nuevoTiempo);
        setEstadoCombate('en_curso');

        if (!intervaloRef.current) iniciarCronometro();
      }
    };

    sincronizar();
    const id = setInterval(() => {
      sincronizar();
      fetchResultados(); // sincroniza también el resultado
    }, 2000);

    return () => clearInterval(id);
  }, [combateId]);

  const botonesPuntos = [1, 2, 3, 4, 5];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#111', color: '#fff', padding: '1rem' }}>
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        {estadoCombate !== 'en_curso' && (
          <button onClick={iniciarCombate} style={{ fontSize: '1.5rem', padding: '1rem 2rem' }}>
            {estadoCombate === 'pausado' ? 'REANUDAR' : 'INICIAR'}
          </button>
        )}
      </div>

      <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* ROJO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', width: '33%', alignItems: 'center' }}>
          {botonesPuntos.map((p) => (
            <button key={`rojo-${p}`} onClick={() => enviarEvento('punto', 'rojo', p)} disabled={estadoCombate !== 'en_curso'} style={{ backgroundColor: 'red', color: 'white', fontSize: '1.6rem', padding: '1.5rem', borderRadius: '8px', border: 'none', width: '100%', opacity: estadoCombate === 'en_curso' ? 1 : 0.4 }}>
              +{p}
            </button>
          ))}
        </div>

        {/* CENTRO */}
        <div style={{ width: '33%', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{formatTiempo(segundos)}</div>
          <div
            style={{
              fontSize: 'clamp(2rem, 6vw, 4rem)',
              fontWeight: 'bold',
              marginBottom: '1rem',
              whiteSpace: 'nowrap',
            }}
          >
            {puntosRojo} - {puntosAzul}
          </div>
          {estadoCombate === 'en_curso' && (
            <button onClick={detenerCombate} style={{ backgroundColor: '#fff', color: '#000', fontSize: '1.5rem', padding: '1.5rem', borderRadius: '50%', border: '2px solid #000' }}>
              STOP
            </button>
          )}
        </div>

        {/* AZUL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', width: '33%', alignItems: 'center' }}>
          {botonesPuntos.map((p) => (
            <button key={`azul-${p}`} onClick={() => enviarEvento('punto', 'azul', p)} disabled={estadoCombate !== 'en_curso'} style={{ backgroundColor: 'blue', color: 'white', fontSize: '1.6rem', padding: '1.5rem', borderRadius: '8px', border: 'none', width: '100%', opacity: estadoCombate === 'en_curso' ? 1 : 0.4 }}>
              +{p}
            </button>
          ))}
        </div>
      </div>

      {/* NOMBRES */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', padding: '0 2rem 1rem' }}>
        <span>{nombreRojo}</span>
        <span>{nombreAzul}</span>
      </div>
    </div>
  );
};

export default CombateLive;
