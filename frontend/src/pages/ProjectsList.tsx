import React, { useState, useEffect } from 'react';
import ProjectCard from '../components/ProjectCard';
import { topicsService } from '../services/topics';
import { Topic } from '../types';

const ProjectsList: React.FC = () => {
  const [projects, setProjects] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await topicsService.getTopics();
      // Убеждаемся, что data.topics существует и это массив
      setProjects(data?.topics || []);
    } catch (err: any) {
      console.error('Error loading projects:', err);
      setError(err.response?.data?.error || 'Не удалось загрузить проекты');
      setProjects([]); // Устанавливаем пустой массив в случае ошибки
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Загрузка проектов...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error" style={{ textAlign: 'center', padding: '40px' }}>
          <p>{error}</p>
          <button 
            onClick={loadProjects} 
            className="btn btn-primary" 
            style={{ marginTop: '20px' }}
          >
            Повторить попытку
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '30px' }}>Студенческие проекты</h1>
      {projects.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <p>Пока нет проектов. Будьте первым, кто создаст проект!</p>
          <button 
            onClick={() => window.location.href = '/create-project'} 
            className="btn btn-primary" 
            style={{ marginTop: '15px' }}
          >
            Создать проект
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsList;