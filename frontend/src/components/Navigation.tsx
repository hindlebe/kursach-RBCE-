import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const user = authService.getUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          RBCE
        </Link>
        <div className="navbar-links">
          {user ? (
            <>
              <Link to="/">Главная</Link>
              <Link to="/projects">Проекты</Link>
              <Link to="/create-project">Создать проект</Link>
              <span className="user-info">Добро пожаловать, {user.userName}</span>
              <button onClick={handleLogout} className="btn btn-secondary">
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/">Главная</Link>
              <Link to="/projects">Проекты</Link>
              <Link to="/login">Войти</Link>
              <Link to="/register">Регистрация</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;