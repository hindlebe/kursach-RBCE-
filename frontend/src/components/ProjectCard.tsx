import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Topic } from '../types';

interface ProjectCardProps {
  project: Topic;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const navigate = useNavigate();

  if (!project) {
    return null;
  }

  return (
    <div 
      className="card" 
      onClick={() => navigate(`/projects/${project.id}`)} 
      style={{ cursor: 'pointer' }}
    >
      <h3>{project.title || 'Без названия'}</h3>
      <p>{project.summary || 'Нет описания'}</p>
      <p><strong>Тип:</strong> {project.topicType === 'Development' ? 'Разработка' : 
                                   project.topicType === 'Workshop' ? 'Воркшоп' :
                                   project.topicType === 'Research' ? 'Исследование' :
                                   project.topicType === 'Hackathon' ? 'Хакатон' :
                                   project.topicType || 'Неизвестно'}</p>
      <p><strong>Локация:</strong> {project.location?.city || 'Неизвестно'}, {project.location?.street || 'Неизвестно'}</p>
      <p><strong>Участников:</strong> {project.users?.length || 0}</p>
      {project.eventStart && (
        <p><strong>Старт:</strong> {new Date(project.eventStart).toLocaleDateString('ru-RU')}</p>
      )}
    </div>
  );
};

export default ProjectCard;