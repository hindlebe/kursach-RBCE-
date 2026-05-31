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
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    // Валидация названия
    if (!formData.title) {
      newErrors.title = 'Название проекта обязательно';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Название должно содержать минимум 3 символа';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Название не должно превышать 100 символов';
    }
    
    // Валидация описания
    if (!formData.summary) {
      newErrors.summary = 'Описание проекта обязательно';
    } else if (formData.summary.length < 10) {
      newErrors.summary = 'Описание должно содержать минимум 10 символов';
    } else if (formData.summary.length > 500) {
      newErrors.summary = 'Описание не должно превышать 500 символов';
    }
    
    // Валидация города
    if (!formData.location.city) {
      newErrors.city = 'Город обязателен';
    } else if (formData.location.city.length < 2) {
      newErrors.city = 'Название города должно содержать минимум 2 символа';
    } else if (formData.location.city.length > 100) {
      newErrors.city = 'Название города не должно превышать 100 символов';
    } else if (!/^[a-zA-Zа-яА-ЯёЁ\s-]+$/.test(formData.location.city)) {
      newErrors.city = 'Город может содержать только буквы, пробелы и дефисы';
    }
    
    // Валидация улицы
    if (!formData.location.street) {
      newErrors.street = 'Улица обязательна';
    } else if (formData.location.street.length < 2) {
      newErrors.street = 'Название улицы должно содержать минимум 2 символа';
    } else if (formData.location.street.length > 200) {
      newErrors.street = 'Название улицы не должно превышать 200 символов';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
      // Очищаем ошибку для этого поля
      if (errors[field]) {
        setErrors({ ...errors, [field]: '' });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
      // Очищаем ошибку для этого поля
      if (errors[name]) {
        setErrors({ ...errors, [name]: '' });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
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
              style={{ borderColor: errors.title ? '#ff6b6b' : '' }}
            />
            {errors.title && <div className="error" style={{ fontSize: '12px', marginTop: '-10px', marginBottom: '10px' }}>{errors.title}</div>}
          </div>
          <div>
            <label>Описание</label>
            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              rows={4}
              required
              style={{ borderColor: errors.summary ? '#ff6b6b' : '' }}
            />
            {errors.summary && <div className="error" style={{ fontSize: '12px', marginTop: '-10px', marginBottom: '10px' }}>{errors.summary}</div>}
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
              <option value="Hackathon">Хакатон</option>
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
              style={{ borderColor: errors.city ? '#ff6b6b' : '' }}
            />
            {errors.city && <div className="error" style={{ fontSize: '12px', marginTop: '-10px', marginBottom: '10px' }}>{errors.city}</div>}
          </div>
          <div>
            <label>Улица</label>
            <input
              type="text"
              name="location.street"
              value={formData.location.street}
              onChange={handleChange}
              required
              style={{ borderColor: errors.street ? '#ff6b6b' : '' }}
            />
            {errors.street && <div className="error" style={{ fontSize: '12px', marginTop: '-10px', marginBottom: '10px' }}>{errors.street}</div>}
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