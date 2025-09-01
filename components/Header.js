import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    // Redirecionar para login após logout
    window.location.href = '/login';
  };

  if (!user) {
    return (
      <header className="header">
        <div className="header-logo">TechHelp</div>
        <div className="header-user-info">
          <Link to="/login">Login</Link>
        </div>
      </header>
    );
  }

  return (
    <header className="header">
      <div className="header-logo">TechHelp</div>
      <div className="header-user-info">
        <span>Bem-vindo, {user.email} ({user.role})</span>
        <nav className="header-nav">
          <Link to="/">Painel</Link>
          <Link to="/my-feedbacks">Meus Feedbacks</Link>
        </nav>
        <button className="logout-button" onClick={handleLogout}>
          Sair
        </button>
      </div>
    </header>
  );
};

export default Header;