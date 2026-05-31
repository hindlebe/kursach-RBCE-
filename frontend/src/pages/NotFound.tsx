import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="container" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <h1 style={{ fontSize: '72px', marginBottom: '20px', color: '#64ffda' }}>404</h1>
      <h2 style={{ marginBottom: '20px' }}>Страница не найдена</h2>
      <p style={{ marginBottom: '30px', color: '#8892b0' }}>
        Страница, которую вы ищете, либо не существует, либо была перемещена
      </p>
      <Link to="/" className="btn btn-primary">
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;