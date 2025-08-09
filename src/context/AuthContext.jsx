import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup , signOut, onAuthStateChanged, getRedirectResult } from "firebase/auth";
import axios from "axios";
const API_BASE = import.meta.env.VITE_API_URL;

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const ModalDatosUsuario = ({ visible, onSubmit }) => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
    }}>
      <div style={{
        background: "#fff", padding: "2rem", borderRadius: 10, minWidth: 300, display: "flex", flexDirection: "column", gap: 16
      }}>
        <h2>Completá tus datos</h2>
        <input
          autoFocus
          placeholder="Nombre"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          style={{ fontSize: 18, padding: 8 }}
        />
        <input
          placeholder="Apellido"
          value={apellido}
          onChange={e => setApellido(e.target.value)}
          style={{ fontSize: 18, padding: 8 }}
        />
        <button
          style={{ fontSize: 18, padding: 10, marginTop: 10 }}
          disabled={!nombre || !apellido}
          onClick={() => onSubmit({ nombre, apellido })}
        >
          Guardar
        </button>
      </div>
    </div>
  );
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [rol, setRol] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [modalDatos, setModalDatos] = useState(false);
  const [datosPendientes, setDatosPendientes] = useState(null);


  const loginConGoogle = () => signInWithPopup(auth, googleProvider);

  const cerrarSesion = async () => {
    await signOut(auth);
    setRol(null);
    setUsuario(null);
    setPerfil(null);
  };

  // NUEVO useEffect para capturar el resultado del redirect
  useEffect(() => {
    const fetchRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          console.log("Usuario después del redirect:", result.user);
        }
      } catch (error) {
        console.error("Error al obtener el resultado del redirect:", error);
      }
    };
    fetchRedirectResult();
  }, []);

  // Chequear o crear usuario en backend
  const chequearOCrearUsuario = async (user) => {
    console.log("🔎 Buscando usuario en backend:", user.uid);
    try {
      const res = await axios.get(`${API_BASE}/usuarios/${user.uid}`);
      console.log("📡 Respuesta GET /usuarios/:uid", res.data);

      // Permitir ambos formatos de respuesta: { usuario: ... } o plano
      const usuario = res.data.usuario || res.data;

      // Log de los campos recibidos
      console.log("📝 Campos recibidos del usuario:", usuario);

      // Si el usuario es null, undefined, string vacío, array vacío, objeto vacío, o le faltan campos obligatorios, pedir datos
      const usuarioVacio =
        !usuario ||
        (typeof usuario === "object" && Object.keys(usuario).length === 0) ||
        (typeof usuario === "string" && usuario.trim() === "") ||
        (Array.isArray(usuario) && usuario.length === 0);

      if (
        usuarioVacio ||
        !usuario.nombre ||
        !usuario.apellido ||
        !usuario.email ||
        !usuario.uid
      ) {
        console.log("⚠️ Usuario inexistente o incompleto en backend, pidiendo datos...");
        return new Promise((resolve, reject) => {
          setDatosPendientes({ user, resolve, reject });
          setModalDatos(true);
        });
      }
      console.log("👤 Usuario ya existe en backend:", usuario);
      return usuario;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log("⚠️ Usuario no encontrado (404), pidiendo datos...");
        return new Promise((resolve, reject) => {
          setDatosPendientes({ user, resolve, reject });
          setModalDatos(true);
        });
      } else {
        console.error("❌ Error en GET /usuarios/:uid", error);
        throw error;
      }
    }
  };

  // Cuando el usuario completa el modal
  const handleGuardarDatos = async ({ nombre, apellido }) => {
    if (!datosPendientes) return;
    const { user, resolve, reject } = datosPendientes;
    try {
      const nuevoUsuario = {
        uid: user.uid,
        nombre,
        apellido,
        email: user.email,
      };
      const res = await axios.post(`${API_BASE}/usuarios`, nuevoUsuario);
      console.log(`🆕 Usuario creado en backend:`, res.data.usuario);
      console.log(`➡️ Nombre tomado: ${nombre} ${apellido}`);
      setModalDatos(false);
      setDatosPendientes(null);
      resolve(res.data.usuario);
    } catch (error) {
      setModalDatos(false);
      setDatosPendientes(null);
      reject(error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUsuario(user);
      setCargando(false);

      if (user) {
        console.log("🆔 UID actual:", user.uid);
        try {
          // Chequear o crear usuario y traer perfil
          const perfilUsuario = await chequearOCrearUsuario(user);
          setPerfil(perfilUsuario);
          console.log("👤 Perfil del usuario:", perfilUsuario);

          // Traer roles
          const res = await axios.get(`${API_BASE}/roles/${user.uid}`);
          console.log("📥 Datos recibidos:", res.data);
          const rolesObtenidos = res.data.roles || ["usuario"];
          setRol(rolesObtenidos);
          console.log("✅ Rol del usuario:", rolesObtenidos);

        } catch (error) {
          console.error("❌ Error al obtener el rol o perfil:", error.response?.data || error.message);
          setRol(["usuario"]);
          setPerfil(null);
        }
      } else {
        setRol(null);
        setPerfil(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, perfil, loginConGoogle, cerrarSesion, rol }}>
      <ModalDatosUsuario
        visible={modalDatos}
        onSubmit={handleGuardarDatos}
      />
      {!cargando && children}
    </AuthContext.Provider>
  );
};
