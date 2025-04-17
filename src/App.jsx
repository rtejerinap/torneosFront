import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Inicio from "./pages/Inicio";
import Inscribirse from "./pages/Inscribirse";
import MainLayout from "./components/MainLayout";

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/inscribirse" element={<Inscribirse />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
