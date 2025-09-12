import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Inicio from "./pages/Inicio";
import Inscribirse from "./pages/Inscribirse";
import MainLayout from "./components/MainLayout";
import AdminLayout from "./pages/AdminLayout";
import Admin from "./pages/Admin"; 
import AltaMaestro from "./components/Escuelas/AltaMaestro";
/* import AdminTorneos from "./pages/AdminTorneos";*/
import CombatesList from "./pages/Combates/CombatesList";
import Participantes from "./components/Participantes";
import Tab from "./components/Escuelas/Tab";
import RolesManager from "./components/admin/RolesManager";
import ParticipanteDetalle from "./pages/ParticipanteDetalle";
import CombateLive from "./pages/Combates/CombateLive";
import CombateLiveWrapper from "./pages/Combates/CombateLiveWrapper";
import AltaCategoriaCombate from "./pages/Torneos/AltaCategoriaCombate";
import Torneos from "./pages/Torneos/Torneos"; 
import ParticipantesPorCategoria from "./pages/Torneos/ParticipantesPorCategoria";
import MiInscripcion from "./pages/MiInscripcion";
import ZonasManager from "./pages/ZonasManager";
import Categorias from "./pages/Categorias";


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

  {/* Ruta pública para abrir desde nueva pestaña */}
  <Route path="/combate-live" element={<CombateLiveWrapper />} />

  {/* Admin layout con subrutas */}
  <Route path="/admin/*" element={<AdminLayout />}>
    <Route index element={<Admin />} />
    <Route path="participantes" element={<Participantes />} />
    <Route path="alta-maestro" element={<AltaMaestro />} />
    <Route path="escuelas" element={<Tab />} />
    <Route path="roles" element={<RolesManager />} />
    <Route path="combates" element={<CombatesList />} />
    <Route path="torneos" element={<Torneos />} />
    <Route path="participantes-por-categoria" element={<ParticipantesPorCategoria />} />
    {/* Aquí podrías agregar más rutas de admin según sea necesario */}
    <Route path="alta-categoria-combate" element={<AltaCategoriaCombate />} />
    {/* Esta podrías incluso eliminarla si solo usás la ruta sin params */}
    <Route path="combate-live/:combateId" element={<CombateLive combateId="..." nombreRojo="..." nombreAzul="..." />} />
    <Route path="mi-inscripcion" element={<MiInscripcion />} />
    <Route path="categorias" element={<Categorias />} />
  <Route path="zonas" element={<ZonasManager />} />
  </Route>
</Routes>

    </BrowserRouter>
  );
};

export default App;
