// src/App.jsx
import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import CursosPage from "./pages/CursosPage";
import DocentesPage from "./pages/DocentesPage";
import AreasPage from "./pages/AreasPage";
import Navbar from "./components/Navbar";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cursos" element={<CursosPage />} />
        <Route path="/docentes" element={<DocentesPage />} />
        <Route path="/areas" element={<AreasPage />} />
      </Routes>
    </>
  );
}

export default App;
