// src/components/TopBar.jsx

import React from 'react';
import './TopBar.css';
import { FiUser } from 'react-icons/fi';
import logoTurnus from '../assets/LogoClara.png';

function TopBar() {
  return (
    <header className="topbar">
      <img src={logoTurnus} alt="Logo da Turnus" className="topbar-logo" />
      <div className="user-info">
        <div className="user-avatar">
          <FiUser size={20} />
        </div>
        <div className="user-details">
          <span className="user-name">Valdenis Coutinho</span>
          <span className="user-email">valdeniscoutinho@gmail.com</span>
        </div>
      </div>
    </header>
  );
}

export default TopBar;

