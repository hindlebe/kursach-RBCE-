import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { topicsService } from '../services/topics';
import { CreateTopicRequest } from '../types';

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateTopicRequest>({
    title: '',
    summary: '',
    topicType: 'Development',
    location: {
      city: '',
      street: '',
    },
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [field]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await topicsService.createTopic(formData);
      navigate('/projects');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Не удалось создать проект');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '600px', marginTop: '50px' }}>
      <div className="card">
        <h2>Создать новый проект</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Название</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Описание</label>
            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>
          <div>
            <label>Тип проекта</label>
            <select
              name="topicType"
              value={formData.topicType}
              onChange={handleChange}
            >
              <option value="Development">Разработка</option>
              <option value="Workshop">Воркшоп</option>
              <option value="Research">Исследование</option>
              <option value="Other">Другое</option>
            </select>
          </div>
          <div>
            <label>Город</label>
            <input
              type="text"
              name="location.city"
              value={formData.location.city}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Улица</label>
            <input
              type="text"
              name="location.street"
              value={formData.location.street}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Создание...' : 'Создать проект'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;