import { useState, useEffect, useCallback, useRef } from 'react';
import formatTiempo from '../utils/formatTiempo';

const API_BASE = import.meta.env.VITE_API_URL;

const useCombateEstado = (combateId) => {
    const [estadoCombate, setEstadoCombate] = useState('esperando');
    const [roundActual, setRoundActual] = useState(1);
    const [totalRounds, setTotalRounds] = useState(1);
    const [reloj, setReloj] = useState(0);
    const [limiteTiempo, setLimiteTiempo] = useState(60);
    const [horaInicioReal, setHoraInicioReal] = useState(null);
    const [horaFinReal, setHoraFinReal] = useState(null);
    const [ultimoMensaje, setUltimoMensaje] = useState(null);
    const [puedeIniciar, setPuedeIniciar] = useState(false);
    const [debeFinalizar, setDebeFinalizar] = useState(false);
    const [eventos, setEventos] = useState([]);
    const [puntos, setPuntos] = useState({ rojo: 0, azul: 0 });

    const timerRef = useRef(null);
    const finalizandoRef = useRef(false);

    const fetchEstadoActual = useCallback(async () => {
        try {
            console.log(`[FETCH] GET /combates/${combateId}/estado-actual`);
            const res = await fetch(`${API_BASE}/combates/${combateId}/estado-actual`);
            const data = await res.json();
            console.log(`[RESPUESTA] /estado-actual:`, data);

            console.log("[DEBUG] Estado del combate:", data.estado);
            console.log("[DEBUG] Round actual:", data.round_actual);
            setReloj(prevReloj => {
                // Si está en 'esperando', lo reseteás a 0 sí o sí
                if (data.estado === 'esperando') return 0;
                // Si NO está en_curso, pisás el reloj con lo que viene del back (por ejemplo: 'pausado', 'cerrado', etc)
                if (data.estado !== 'en_curso') return data.reloj ?? 0;
                // Si está en_curso y la diferencia es mayor a 3 segundos, sincronizás
                if (Math.abs((data.reloj ?? 0) - prevReloj) > 3) return data.reloj ?? 0;
                // Si está en_curso y la diferencia es chica, dejá el reloj local
                return prevReloj;
            });

            console.log("[DEBUG] Limite de tiempo:", data.limite_tiempo);

            setEstadoCombate(data.estado);
            setRoundActual(data.round_actual);
            setTotalRounds(data.total_rounds);
            setLimiteTiempo(data.limite_tiempo);
            setHoraInicioReal(data.hora_inicio_real);
            setHoraFinReal(data.hora_fin_real);
            setUltimoMensaje(data.ultimo_mensaje);
            setPuedeIniciar(data.puede_iniciar);
            setDebeFinalizar(data.debe_finalizar);
            setEventos(data.eventos);
            setPuntos(data.puntos || { rojo: 0, azul: 0 });
        } catch (error) {
            console.error('Error al obtener el estado actual del combate:', error);
        }
    }, [combateId]);

    useEffect(() => {
        fetchEstadoActual();
    }, [fetchEstadoActual]);

    const evaluarContinuacionConMarca = useCallback(async (marcaDeTiempo) => {
        try {
            const res = await fetch(`${API_BASE}/combates/${combateId}/finalizar-round`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ round_a_finalizar: roundActual, marcaDeTiempo })
            });
            const data = await res.json();
            console.log(`[RESPUESTA] /finalizar-round:`, data);
            // 🔥 Sólo esto:
            await fetchEstadoActual();
        } catch (error) {
            console.error("❌ Error evaluando continuación:", error);
        }
    }, [combateId, roundActual, fetchEstadoActual]);

    const evaluarContinuacion = useCallback(async () => {
        await evaluarContinuacionConMarca(formatTiempo(reloj));
    }, [evaluarContinuacionConMarca, reloj]);

    useEffect(() => {
        if (estadoCombate === 'en_curso') {
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
                setReloj(prevReloj => {
                    const nuevoReloj = prevReloj + 0.1;
                    if (nuevoReloj >= limiteTiempo) {
                        // --- SOLO ejecutar una vez por round ---
                        if (!finalizandoRef.current) {
                            finalizandoRef.current = true;
                            evaluarContinuacion();
                        }
                        return limiteTiempo;
                    }
                    return nuevoReloj;
                });
            }, 100);
        } else {
            clearInterval(timerRef.current);
            // Reseteamos el flag si no está en_curso
            finalizandoRef.current = false;
        }

        return () => clearInterval(timerRef.current);
    }, [estadoCombate, limiteTiempo, evaluarContinuacion]);

    // Y agregá este useEffect (cortito) para resetear el flag cada vez que cambia el round
    useEffect(() => {
        finalizandoRef.current = false;
    }, [roundActual]);

// 🔄 Sincronización automática SIEMPRE (cada 2s)
useEffect(() => {
  const intervalo = setInterval(() => {
    fetchEstadoActual();
  }, 2000);
  return () => clearInterval(intervalo);
}, [fetchEstadoActual]);


    const enviarEvento = async (tipo, participante, valor, marcaDeTiempoManual) => {
        const marcaDeTiempo = marcaDeTiempoManual || formatTiempo(reloj);
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
            fetchEstadoActual();
        } catch (error) {
            console.error('❌ Error al enviar evento:', error);
        }
    };

    const iniciarCombate = async () => {
        console.log(`[CRONÓMETRO] Iniciando. Round: ${roundActual}`);
        if (estadoCombate === 'en_curso') return;
        setEstadoCombate('en_curso');

        setReloj(0); // 👈 Importante: resetea el reloj SIEMPRE al iniciar
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setReloj(prevReloj => {
                const nuevoReloj = prevReloj + 0.1;
                if (nuevoReloj >= limiteTiempo) {
                    evaluarContinuacion();
                    return limiteTiempo;
                }
                return nuevoReloj;
            });
        }, 100);

        await enviarEvento('inicio', null, null, "00:00.0");
    };

    const reanudarCombate = async () => {
        console.log(`[CRONÓMETRO] Reanudando. Round: ${roundActual}`);
        if (estadoCombate === 'en_curso') return;
        setEstadoCombate('en_curso');

        // Iniciar el reloj en el frontend
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setReloj(prevReloj => {
                const nuevoReloj = prevReloj + 0.1;
                if (nuevoReloj >= limiteTiempo) {
                    evaluarContinuacion();
                    return limiteTiempo; // Para que el reloj se quede en el límite
                }
                return nuevoReloj;
            });
        }, 100);

        await enviarEvento('reinicio', null, null, formatTiempo(reloj)); // Enviar evento de inicio con marca de tiempo actual
    };

    const detenerCombate = async () => {
        const tiempoActual = formatTiempo(reloj);
        await enviarEvento('stop', null, tiempoActual, tiempoActual);
        setEstadoCombate('pausado');
        clearInterval(timerRef.current); // Detener el temporizador
    };

    return {
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
        eventos,
        puntos,
        setEstadoCombate,
        setRoundActual,
        enviarEvento,
        iniciarCombate,
        reanudarCombate,
        detenerCombate,
        evaluarContinuacion
    };
};

export default useCombateEstado;
