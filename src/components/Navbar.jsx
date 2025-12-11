// src/components/Navbar.jsx
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navbar.css";
import logoTecnm from "../assets/tecnm-logo.png";

function Navbar() {
  const [theme, setTheme] = useState("light");

  // Aplicar el tema al HTML <html data-theme="">
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Alternar tema
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <header className="nav-root">
      <div className="nav-inner">
        {/* Lado izquierdo: logo + texto */}
        <div className="nav-brand">
          <img src={logoTecnm} alt="TecNM" className="nav-logo" />
          <div className="nav-brand-text">
            <span className="nav-campus">TecNM Campus F. Carrillo Puerto</span>
            <span className="nav-subtitle">Gestión de Oferta Académica</span>
          </div>
        </div>

        {/* Lado derecho: enlaces */}
        <nav className="nav-links">
          <NavLink
            to="/"
            className={({ isActive }) =>
              "nav-link" + (isActive ? " nav-link-active" : "")
            }
            end
          >
            Inicio
          </NavLink>

          <NavLink
            to="/cursos"
            className={({ isActive }) =>
              "nav-link" + (isActive ? " nav-link-active" : "")
            }
          >
            Cursos
          </NavLink>

          <NavLink
            to="/docentes"
            className={({ isActive }) =>
              "nav-link" + (isActive ? " nav-link-active" : "")
            }
          >
            Docentes
          </NavLink>

          <NavLink
            to="/areas"
            className={({ isActive }) =>
              "nav-link" + (isActive ? " nav-link-active" : "")
            }
          >
            Áreas académicas
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
