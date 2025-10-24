// src/components/Sidebar.jsx

import React from 'react';
import './Sidebar.css';
import { FiHome, FiUsers, FiCalendar, FiLogOut } from 'react-icons/fi'; // Ícones

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">

        <div className="scale-selector">
          <label>Escala</label>
          <select>
            <option>Plantão - ETA</option>
          </select>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li>
              <a href="#inicio">
                <FiHome />
                <span>Início</span>
              </a>
            </li>
            <li className="active"> {/* Adiciona a classe .active aqui para o item selecionado */}
              <a href="#funcionarios">
                <FiUsers />
                <span>Funcionários</span>
              </a>
            </li>
            <li>
              <a href="#escalas">
                <FiCalendar />
                <span>Escalas</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="sidebar-bottom">
        <a href="#sair">
          <FiLogOut />
          <span>Sair</span>
        </a>
      </div>
    </aside>
  );
}

export default Sidebar;