import React, { useEffect, useState } from 'react';

const CombatesList = () => {
  const [combates, setCombates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [resultados, setResultados] = useState({});

  useEffect(() => {
    const fetchCombates = async () => {
      try {
        setLoading(true);
        const query = estadoFiltro !== 'todos' ? `?estado=${estadoFiltro}` : '';
        const res = await fetch(`https://us-central1-torneos-305d7.cloudfunctions.net/api/combates${query}`);
        let data = await res.json();

        // Ordenar por categoría.nombre, luego ronda, luego hora_inicio_planificada
        data.sort((a, b) => {
          const catA = a.categoria?.nombre || '';
          const catB = b.categoria?.nombre || '';
          const rondaA = a.ronda ?? 0;
          const rondaB = b.ronda ?? 0;
          const horaA = a.hora_inicio_planificada?._seconds || 0;
          const horaB = b.hora_inicio_planificada?._seconds || 0;

          return catA.localeCompare(catB) || rondaA - rondaB || horaA - horaB;
        });

        setCombates(data);
      } catch (error) {
        console.error('Error al cargar combates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCombates();
  }, [estadoFiltro]);

  useEffect(() => {
    const intervalo = setInterval(() => {
      actualizarDatosEnVivo();
    }, 3000);

    return () => clearInterval(intervalo);
  }, [combates]);

  const actualizarDatosEnVivo = async () => {
    const nuevosResultados = {};

    for (const combate of combates) {
      try {
        const [resPuntaje, resEventos] = await Promise.all([
          fetch(`https://us-central1-torneos-305d7.cloudfunctions.net/api/combates/${combate.id}/resultados`),
          fetch(`https://us-central1-torneos-305d7.cloudfunctions.net/api/combates/${combate.id}/eventos`)
        ]);
        const puntos = await resPuntaje.json();
        const eventos = await resEventos.json();
        const ultInicio = [...eventos].reverse().find(e => e.tipo === 'inicio');
        const ultStop = [...eventos].reverse().find(e => e.tipo === 'stop');

        const tiempo = ultStop?.marcaDeTiempo || ultInicio?.marcaDeTiempo || '00:00';

        nuevosResultados[combate.id] = {
          rojo: puntos.rojo,
          azul: puntos.azul,
          tiempo,
        };
      } catch (e) {
        console.error('Error en actualización en vivo:', e);
      }
    }

    setResultados(nuevosResultados);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Lista de Combates</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label>Filtrar por estado: </label>
        <select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="abierto">Abierto</option>
          <option value="En Curso">En Curso</option>
          <option value="cerrado">Cerrados</option>
        </select>
      </div>

      {loading ? (
        <p>Cargando combates...</p>
      ) : (
        <table border="1" cellPadding="6" cellSpacing="0">
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Ronda</th>
              <th>Rojo</th>
              <th>Azul</th>
              <th>Hora Planificada</th>
              <th>Estado</th>
              <th>Tiempo</th>
              <th>Resultado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {combates.map((combate) => {
              const resultado = resultados[combate.id] || { rojo: 0, azul: 0, tiempo: '00:00' };
              const hora = combate.hora_inicio_planificada?._seconds
                ? new Date(combate.hora_inicio_planificada._seconds * 1000).toLocaleString()
                : 'Sin horario';

              return (
                <tr key={combate.id}>
                  <td>{combate.categoria?.nombre || '-'}</td>
                  <td>{combate.ronda}</td>
                  <td>{combate.participante_rojo?.nombre}</td>
                  <td>{combate.participante_azul?.nombre}</td>
                  <td>{hora}</td>
                  <td>{combate.estado}</td>
                  <td>{resultado.tiempo}</td>
                  <td>{resultado.rojo} - {resultado.azul}</td>
                  <td>
                    <button
                      onClick={() => {
                        const url = `/combate-live?combateId=${combate.id}&rojo=${encodeURIComponent(combate.participante_rojo?.nombre)}&azul=${encodeURIComponent(combate.participante_azul?.nombre)}`;
                        window.open(url, '_blank');
                      }}
                    >
                      Abrir
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CombatesList;
