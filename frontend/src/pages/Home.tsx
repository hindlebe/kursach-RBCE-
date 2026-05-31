import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Topic } from '../types';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [featuredProjects, setFeaturedProjects] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    loadFeaturedProjects();
  }, []);

  const loadFeaturedProjects = async () => {
    try {
      setLoading(true);
    
      if (token) {
        const response = await api.get('/Topics/GetTopics');
        
        const topics = response.data?.topics || [];
        setFeaturedProjects(topics.slice(0, 3));
      } else {
        // Демо-данные для неавторизованных пользователей
        setFeaturedProjects([
          {
            id: '1',
            title: 'Разработка AI Чат-бота',
            summary: 'Создание интеллектуального чат-бота для помощи студентам с использованием технологий GPT',
            topicType: 'Разработка',
            location: { city: 'Москва', street: 'Цифровой парк' },
            eventStart: '2024-07-15T10:00:00Z',
            isVoided: false,
            users: [{ id: '1', username: 'alice', fullName: 'Алиса Смит', role: 'Organizer' }]
          },
          {
            id: '2',
            title: 'Воркшоп по Web3',
            summary: 'Изучение блокчейна и децентрализованных приложений',
            topicType: 'Воркшоп',
            location: { city: 'Санкт-Петербург', street: 'Университет ИТМО' },
            eventStart: '2024-08-01T14:00:00Z',
            isVoided: false,
            users: [{ id: '2', username: 'bob', fullName: 'Боб Джонсон', role: 'Organizer' }]
          },
          {
            id: '3',
            title: 'Хакатон мобильных приложений',
            summary: '48-часовой хакатон по созданию инновационных мобильных решений',
            topicType: 'Хакатон',
            location: { city: 'Новосибирск', street: 'Технопарк' },
            eventStart: '2024-09-10T09:00:00Z',
            isVoided: false,
            users: [{ id: '3', username: 'charlie', fullName: 'Чарли Браун', role: 'Organizer' }]
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setFeaturedProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    if (token) {
      navigate('/projects');
    } else {
      navigate('/register');
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #0a192f 0%, #112240 100%)',
        padding: '80px 20px',
        textAlign: 'center',
        borderBottom: '1px solid #233554'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: '48px',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #64ffda 0%, #4cd8b5 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            RBCE
          </h1>
          <p style={{ fontSize: '20px', marginBottom: '30px', color: '#8892b0' }}>
            Ролевая среда для совместной работы над проектами
          </p>
          <button
            onClick={handleGetStarted}
            className="btn btn-primary"
            style={{ fontSize: '18px', padding: '12px 30px' }}
          >
            Начать
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '36px' }}>
          Почему наша платформа?
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px'
        }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚀</div>
            <h3 style={{ marginBottom: '15px', color: '#64ffda' }}>Совместная работа</h3>
            <p style={{ color: '#8892b0' }}>Работайте вместе с участниками команды, делитесь идеями и создавайте удивительные проекты</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>💬</div>
            <h3 style={{ marginBottom: '15px', color: '#64ffda' }}>Комментарии в реальном времени</h3>
            <p style={{ color: '#8892b0' }}>Обсуждайте детали проектов, оставляйте отзывы и оставайтесь на связи с командой</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>👥</div>
            <h3 style={{ marginBottom: '15px', color: '#64ffda' }}>Управление ролями</h3>
            <p style={{ color: '#8892b0' }}>Организаторы и участники с разными правами и обязанностями</p>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section style={{ padding: '60px 20px', backgroundColor: '#0a192f' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '36px' }}>
            Избранные проекты
          </h2>
          {loading ? (
            <div className="loading">Загрузка проектов...</div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '30px'
            }}>
              {featuredProjects && featuredProjects.length > 0 ? (
                featuredProjects.map((project) => (
                  <div key={project.id} className="card" style={{ cursor: 'pointer' }}>
                    <h3 style={{ color: '#64ffda', marginBottom: '15px' }}>{project.title}</h3>
                    <p style={{ color: '#8892b0', marginBottom: '15px' }}>{project.summary}</p>
                    <div style={{ marginBottom: '10px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        backgroundColor: 'rgba(100, 255, 218, 0.1)',
                        color: '#64ffda',
                        borderRadius: '20px',
                        fontSize: '14px'
                      }}>
                        {project.topicType}
                      </span>
                    </div>
                    <p style={{ fontSize: '14px', color: '#8892b0' }}>
                      📍 {project.location?.city || 'Неизвестно'}, {project.location?.street || 'Неизвестно'}
                    </p>
                    <p style={{ fontSize: '14px', color: '#8892b0' }}>
                      👥 {project.users?.length || 0} участников
                    </p>
                    {project.eventStart && (
                      <p style={{ fontSize: '14px', color: '#8892b0' }}>
                        📅 {new Date(project.eventStart).toLocaleDateString('ru-RU')}
                      </p>
                    )}
                    {token ? (
                      <Link to={`/projects/${project.id}`}>
                        <button className="btn btn-primary" style={{ marginTop: '15px', width: '100%' }}>
                          Просмотреть проект
                        </button>
                      </Link>
                    ) : (
                      <button
                        onClick={() => navigate('/register')}
                        className="btn btn-secondary"
                        style={{ marginTop: '15px', width: '100%' }}
                      >
                        Присоединиться
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="card" style={{ textAlign: 'center', gridColumn: '1/-1' }}>
                  <p>Пока нет доступных проектов.</p>
                  {token && (
                    <button 
                      onClick={() => navigate('/create-project')} 
                      className="btn btn-primary" 
                      style={{ marginTop: '15px' }}
                    >
                      Создать первый проект
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          {!loading && featuredProjects && featuredProjects.length > 0 && token && (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <Link to="/projects">
                <button className="btn btn-secondary">Все проекты →</button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Statistics Section */}
      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '30px',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '48px', color: '#64ffda', fontWeight: 'bold' }}>500+</div>
              <div style={{ color: '#8892b0', marginTop: '10px' }}>Активных проектов</div>
            </div>
            <div>
              <div style={{ fontSize: '48px', color: '#64ffda', fontWeight: 'bold' }}>2000+</div>
              <div style={{ color: '#8892b0', marginTop: '10px' }}>Студентов</div>
            </div>
            <div>
              <div style={{ fontSize: '48px', color: '#64ffda', fontWeight: 'bold' }}>50+</div>
              <div style={{ color: '#8892b0', marginTop: '10px' }}>Университетов</div>
            </div>
            <div>
              <div style={{ fontSize: '48px', color: '#64ffda', fontWeight: 'bold' }}>1000+</div>
              <div style={{ color: '#8892b0', marginTop: '10px' }}>Комментариев</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '80px 20px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #112240 0%, #0a192f 100%)',
        borderTop: '1px solid #233554'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>
            Готовы начать свой путь?
          </h2>
          <p style={{ fontSize: '18px', marginBottom: '30px', color: '#8892b0' }}>
            Присоединяйтесь к тысячам студентов, уже сотрудничающих над удивительными проектами
          </p>
          {!token && (
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <Link to="/register">
                <button className="btn btn-primary" style={{ fontSize: '16px' }}>
                  Зарегистрироваться
                </button>
              </Link>
              <Link to="/login">
                <button className="btn btn-secondary" style={{ fontSize: '16px' }}>
                  Войти
                </button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;