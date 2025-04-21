import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Inicio from "./pages/Inicio";
import Inscribirse from "./pages/Inscribirse";
import MainLayout from "./components/MainLayout";
import AdminLayout from "./pages/AdminLayout";
import Admin from "./pages/Admin"; 
import AltaMaestro from "./components/Escuelas/AltaMaestro";
/* import AdminTorneos from "./pages/AdminTorneos";*/
import Participantes from "./components/Participantes";
import Tab from "./components/Escuelas/Tab";
import RolesManager from "./components/admin/RolesManager";
import ParticipanteDetalle from "./pages/ParticipanteDetalle";
const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/inscribirse" element={<Inscribirse />} />
          <Route path="/participante/:id" element={<ParticipanteDetalle />} />

        </Route>

        {/* Admin layout con subrutas */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Admin />} />
       {/*    <Route path="torneos" element={<AdminTorneos />} />*/}
          <Route path="participantes" element={<Participantes />} /> 
          <Route path="/admin/alta-maestro" element={<AltaMaestro />} />
          <Route path="/admin/escuelas" element={<Tab/>} />
          <Route path="roles" element={<RolesManager />} /> {/* 👈 Nueva ruta */}



        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
