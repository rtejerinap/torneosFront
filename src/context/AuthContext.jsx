import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import axios from "axios";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [rol, setRol] = useState(null);
  const [cargando, setCargando] = useState(true);

  const API_BASE = "https://us-central1-torneos-305d7.cloudfunctions.net/api";

  const loginConGoogle = () => signInWithPopup(auth, googleProvider);

  const cerrarSesion = async () => {
    await signOut(auth);
    setRol(null);
    setUsuario(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUsuario(user);
      setCargando(false);
  
      if (user) {
        console.log("🆔 UID actual:", user.uid);
        try {
          const res = await axios.get(`${API_BASE}/roles/${user.uid}`);
          console.log("📥 Datos recibidos:", res.data);
          const rolesObtenidos = res.data.roles || ["usuario"];
          setRol(rolesObtenidos);
          console.log("✅ Rol del usuario:", rolesObtenidos);
        } catch (error) {
          console.error("❌ Error al obtener el rol:", error.response?.data || error.message);
          setRol(["usuario"]);
        }
      } else {
        setRol(null);
      }
    });
  
    return () => unsubscribe();
  }, []);
  

  return (
    <AuthContext.Provider value={{ usuario, loginConGoogle, cerrarSesion, rol }}>
      {!cargando && children}
    </AuthContext.Provider>
  );
};
