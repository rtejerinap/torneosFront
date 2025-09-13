import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL;

const TulLive = (props) => {
  const { rol, usuario } = useAuth();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const combateId = props.combateId || params.get('combateId');
  const nombreRojo = props.nombreRojo || params.get('rojo');
  const nombreAzul = props.nombreAzul || params.get('azul');
  const [estado, setEstado] = useState(null);
  const [itemsRojo, setItemsRojo] = useState([0, 0, 0, 0, 0]);
  const [itemsAzul, setItemsAzul] = useState([0, 0, 0, 0, 0]);
  const [enviando, setEnviando] = useState(false);
  const [habilitando, setHabilitando] = useState(false);
  const [finalizando, setFinalizando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let intervalId;
    const fetchEstado = () => {
      fetch(`${API_BASE}/combates/${combateId}/estado-tul`)
        .then(res => res.json())
        .then(setEstado)
        .catch(() => setEstado(null));
    };
    fetchEstado();
    intervalId = setInterval(fetchEstado, 2000);
    return () => clearInterval(intervalId);
  }, [combateId]);

  const puedeHabilitar = Array.isArray(rol)
    ? rol.includes('admin') || rol.includes('autoridad')
    : rol === 'admin' || rol === 'autoridad';

  const puedeFinalizar = puedeHabilitar && estado?.usuarios_votaron_ambos?.length >= 2;

  // Mostrar botón habilitar solo si el estado es 'no_iniciado'
  const mostrarBotonHabilitar = puedeHabilitar && estado?.estado === 'no_iniciado';

 // TulLive.jsx
const handleHabilitar = async () => {
  setHabilitando(true);
  setError(null);
  try {
    const user_name = `${usuario?.nombre ?? ''} ${usuario?.apellido ?? ''}`.trim() || 'Sistema';
    const payload = {
      tipo: 'inicio',
      participante: null,
      valor: null,
      marcaDeTiempo: '00:00.0',                     // igual que CombateLive
      timestampFront: new Date().toISOString(),     // igual que CombateLive
      round: estado?.round_actual ?? 1,             // igual que CombateLive
      user_name                                     // igual que CombateLive
    };

    const resp = await fetch(`${API_BASE}/combates/${combateId}/eventos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      setError(data?.error || `Error ${resp.status}`);
      return;
    }
    const res = await fetch(`${API_BASE}/combates/${combateId}/estado-tul`);
    setEstado(await res.json());
  } catch (e) {
    setError(e?.message || 'Error al habilitar combate');
  } finally {
    setHabilitando(false);
  }
};

  

  const handleEnviarItems = async (lado) => {
    setEnviando(true);
    setError(null);
    try {
      const items = lado === 'rojo' ? itemsRojo : itemsAzul;
      const payload = {
        participante: lado,
        items: {
          item1: items[0],
          item2: items[1],
          item3: items[2],
          item4: items[3],
          item5: items[4],
        },
        round: estado?.round_actual || 1,
        user_name: usuario?.email || 'arbitro',
      };

      await fetch(`${API_BASE}/combates/${combateId}/eventos-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      // Refrescar estado
      const res = await fetch(`${API_BASE}/combates/${combateId}/estado-tul`);
      setEstado(await res.json());
    } catch (e) {
      setError('Error al enviar ítems');
    } finally {
      setEnviando(false);
    }
  };

  const handleFinalizarRound = async () => {
    setFinalizando(true);
    setError(null);
    try {
      await fetch(`${API_BASE}/combates/${combateId}/finalizar-round`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ round_a_finalizar: estado?.round_actual || 1 }),
      });
      // Refrescar estado
      const res = await fetch(`${API_BASE}/combates/${combateId}/estado-tul`);
      setEstado(await res.json());
    } catch (e) {
      setError('Error al finalizar round');
    } finally {
      setFinalizando(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#111', color: '#fff', padding: 0 }}>
      <h2 style={{ textAlign: 'center', marginTop: 24 }}>Tul Live</h2>
      {estado && (
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div>Round actual: {estado.round_actual}</div>
          <div>Puntos: <span style={{ color: 'red' }}>{estado.puntos?.rojo ?? 0}</span> - <span style={{ color: 'blue' }}>{estado.puntos?.azul ?? 0}</span></div>
          <div>Estado: {estado.estado}</div>
        </div>
      )}
      {error && <div style={{ color: '#ff5252', textAlign: 'center' }}>{error}</div>}
      {/* Botón habilitar solo autoridad y si el estado es 'no_iniciado' */}
      {((Array.isArray(rol) && rol.includes('autoridad')) || rol === 'autoridad') && estado?.estado === 'no_iniciado' && (
        <button onClick={handleHabilitar} disabled={habilitando} style={{ margin: '12px auto', display: 'block', fontSize: '1.2rem', padding: '0.7rem 1.2rem', borderRadius: 8 }}>
          {habilitando ? 'Habilitando...' : 'Habilitar combate'}
        </button>
      )}
      {/* Ingreso de ítems para árbitros */}
      {Array.isArray(rol) && rol.includes('arbitro') && (
        <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginTop: 24 }}>
          <form onSubmit={(e) => { e.preventDefault(); handleEnviarItems('rojo'); }}>
            <h3 style={{ color: 'red' }}>{nombreRojo || 'Rojo'}</h3>
            {itemsRojo.map((val, idx) => (
              <div key={idx} style={{ marginBottom: 10 }}>
                <label>Item {idx + 1}: </label>
                <input
                  type="number"
                  value={val}
                  min={0}
                  max={10}
                  onChange={(e) => {
                    const arr = [...itemsRojo];
                    arr[idx] = Number(e.target.value);
                    setItemsRojo(arr);
                  }}
                  style={{ width: 60 }}
                  disabled={enviando || estado?.estado !== 'en_curso'}
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={enviando || estado?.estado !== 'en_curso'}
              style={{ fontSize: '1.1rem', padding: '0.5rem 1.1rem', borderRadius: 10, marginTop: 10 }}
            >
              {enviando ? 'Enviando...' : 'Enviar Rojo'}
            </button>
          </form>
          <form onSubmit={(e) => { e.preventDefault(); handleEnviarItems('azul'); }}>
            <h3 style={{ color: 'blue' }}>{nombreAzul || 'Azul'}</h3>
            {itemsAzul.map((val, idx) => (
              <div key={idx} style={{ marginBottom: 10 }}>
                <label>Item {idx + 1}: </label>
                <input
                  type="number"
                  value={val}
                  min={0}
                  max={10}
                  onChange={(e) => {
                    const arr = [...itemsAzul];
                    arr[idx] = Number(e.target.value);
                    setItemsAzul(arr);
                  }}
                  style={{ width: 60 }}
                  disabled={enviando || estado?.estado !== 'en_curso'}
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={enviando || estado?.estado !== 'en_curso'}
              style={{ fontSize: '1.1rem', padding: '0.5rem 1.1rem', borderRadius: 10, marginTop: 10 }}
            >
              {enviando ? 'Enviando...' : 'Enviar Azul'}
            </button>
          </form>
        </div>
      )}
      {/* Mostrar usuarios que votaron ambos y botón finalizar para autoridad/admin */}
      {puedeHabilitar && estado?.usuarios_votaron_ambos?.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <div><b>Usuarios que votaron ambos:</b></div>
          <div style={{ margin: '8px 0', color: '#ffd600' }}>{estado.usuarios_votaron_ambos.join(', ')}</div>
          {puedeFinalizar && (
            <button onClick={handleFinalizarRound} disabled={finalizando} style={{ fontSize: '1.1rem', padding: '0.5rem 1.1rem', borderRadius: 10, background: '#08b433', color: '#fff', marginTop: 12 }}>
              {finalizando ? 'Finalizando...' : 'Finalizar'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TulLive;
