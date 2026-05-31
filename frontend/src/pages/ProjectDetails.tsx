import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { topicsService } from '../services/topics';
import { authService } from '../services/auth';
import CommentSection from '../components/CommentSection';
import { Topic } from '../types';

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const user = authService.getUser();

  const [editForm, setEditForm] = useState({
    title: '',
    summary: '',
    topicType: '',
    eventStart: '',
    location: { city: '', street: '' }
  });

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  const loadProject = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await topicsService.getTopic(id);
      setProject(data.topic);
      
      // Безопасная проверка на участие
      const userJoined = data.topic?.users?.some(u => u.username === user?.userName) || false;
      setIsJoined(userJoined);
      
      // Initialize edit form
      setEditForm({
        title: data.topic?.title || '',
        summary: data.topic?.summary || '',
        topicType: data.topic?.topicType || '',
        eventStart: data.topic?.eventStart || '',
        location: { 
          city: data.topic?.location?.city || '', 
          street: data.topic?.location?.street || '' 
        }
      });
    } catch (err) {
      console.error('Error loading project:', err);
      setError('Проект не найден');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLeave = async () => {
    if (!id) return;
    try {
      await topicsService.joinLeaveTopic(id);
      loadProject(); // Reload to get updated user list
    } catch (err) {
      setError('Не удалось присоединиться/выйти из проекта');
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Вы уверены, что хотите удалить этот проект?')) return;
    try {
      await topicsService.deleteTopic(id);
      navigate('/projects');
    } catch (err) {
      setError('Не удалось удалить проект');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await topicsService.updateTopic(id, {
        ...editForm,
        eventStart: editForm.eventStart || null
      });
      setIsEditing(false);
      loadProject();
    } catch (err) {
      setError('Не удалось обновить проект');
    }
  };

  
  const isOrganizer = project?.users?.some(u => u.username === user?.userName && u.role === 'Organizer') || false;

  if (loading) return <div className="loading">Загрузка проекта...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!project) return <div className="error">Проект не найден</div>;

  return (
    <div className="container">
      {isEditing ? (
        <div className="card">
          <h2>Редактировать проект</h2>
          <form onSubmit={handleUpdate}>
            <div>
              <label>Название</label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Описание</label>
              <textarea
                value={editForm.summary}
                onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })}
                rows={3}
                required
              />
            </div>
            <div>
              <label>Тип</label>
              <select
                value={editForm.topicType}
                onChange={(e) => setEditForm({ ...editForm, topicType: e.target.value })}
              >
                <option value="Development">Разработка</option>
                <option value="Workshop">Воркшоп</option>
                <option value="Research">Исследование</option>
                <option value="Other">Другое</option>
              </select>
            </div>
            <div>
              <label>Дата начала (опционально)</label>
              <input
                type="datetime-local"
                value={editForm.eventStart}
                onChange={(e) => setEditForm({ ...editForm, eventStart: e.target.value })}
              />
            </div>
            <div>
              <label>Город</label>
              <input
                type="text"
                value={editForm.location.city}
                onChange={(e) => setEditForm({ ...editForm, location: { ...editForm.location, city: e.target.value } })}
                required
              />
            </div>
            <div>
              <label>Улица</label>
              <input
                type="text"
                value={editForm.location.street}
                onChange={(e) => setEditForm({ ...editForm, location: { ...editForm.location, street: e.target.value } })}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">Сохранить</button>
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Отмена</button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <h2>{project.title}</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                {!isJoined ? (
                  <button onClick={handleJoinLeave} className="btn btn-primary">Присоединиться</button>
                ) : (
                  <button onClick={handleJoinLeave} className="btn btn-secondary">Выйти</button>
                )}
                {isOrganizer && (
                  <>
                    <button onClick={() => setIsEditing(true)} className="btn btn-secondary">Редактировать</button>
                    <button onClick={handleDelete} className="btn btn-danger">Удалить</button>
                  </>
                )}
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <p><strong>Тип:</strong> {project.topicType === 'Development' ? 'Разработка' : 
                                         project.topicType === 'Workshop' ? 'Воркшоп' :
                                         project.topicType === 'Research' ? 'Исследование' :
                                         project.topicType === 'Hackathon' ? 'Хакатон' :
                                         project.topicType || 'Неизвестно'}</p>
              <p><strong>Локация:</strong> {project.location?.city || 'Неизвестно'}, {project.location?.street || 'Неизвестно'}</p>
              {project.eventStart && (
                <p><strong>Дата начала:</strong> {new Date(project.eventStart).toLocaleString('ru-RU')}</p>
              )}
              <p><strong>Описание:</strong> {project.summary}</p>
            </div>

            <div>
              <h3>Участники ({project.users?.length || 0})</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                {project.users && project.users.length > 0 ? (
                  project.users.map((user) => (
                    <div key={user.id} className="card" style={{ flex: '1', minWidth: '200px', marginBottom: '0' }}>
                      <strong>{user.fullName || user.username}</strong>
                      <span style={{ color: '#64ffda', marginLeft: '10px' }}>
                        ({user.role === 'Organizer' ? 'Организатор' : 
                          user.role === 'Participant' ? 'Участник' : 'Не определена'})
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={{ color: '#8892b0', padding: '10px' }}>Пока нет участников</div>
                )}
              </div>
            </div>
          </div>

          <CommentSection topicId={project.id} />
        </>
      )}
    </div>
  );
};

export default ProjectDetails;