import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userName: '',
    fullName: '',
    about: '',
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email обязателен';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Введите корректный email адрес';
    }
    
    // Валидация пароля
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else {
      if (formData.password.length < 6) {
        newErrors.password = 'Пароль должен содержать минимум 6 символов';
      }
      if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = newErrors.password || '';
        newErrors.password += (newErrors.password ? ', ' : '') + 'должен содержать заглавную букву';
      }
      if (!/[a-z]/.test(formData.password)) {
        newErrors.password = newErrors.password || '';
        newErrors.password += (newErrors.password ? ', ' : '') + 'должен содержать строчную букву';
      }
      if (!/[0-9]/.test(formData.password)) {
        newErrors.password = newErrors.password || '';
        newErrors.password += (newErrors.password ? ', ' : '') + 'должен содержать цифру';
      }
    }
    
    // Валидация username
    if (!formData.userName) {
      newErrors.userName = 'Имя пользователя обязательно';
    } else if (formData.userName.length < 3) {
      newErrors.userName = 'Имя пользователя должно содержать минимум 3 символа';
    } else if (formData.userName.length > 50) {
      newErrors.userName = 'Имя пользователя не должно превышать 50 символов';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.userName)) {
      newErrors.userName = 'Имя пользователя может содержать только буквы, цифры и подчеркивание';
    }
    
    // Валидация fullName
    if (!formData.fullName) {
      newErrors.fullName = 'Полное имя обязательно';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Полное имя должно содержать минимум 2 символа';
    } else if (formData.fullName.length > 100) {
      newErrors.fullName = 'Полное имя не должно превышать 100 символов';
    }
    
    // Валидация about (опционально)
    if (formData.about && formData.about.length > 500) {
      newErrors.about = 'Информация о себе не должна превышать 500 символов';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Очищаем ошибку для этого поля при вводе
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
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
      const response = await authService.register(
        formData.email,
        formData.password,
        formData.userName,
        formData.fullName,
        formData.about
      );
      authService.saveAuthData(
        response.result.jwtToken,
        response.result.userName,
        response.result.email
      );
      navigate('/projects');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '500px', marginTop: '50px' }}>
      <div className="card">
        <h2>Регистрация</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ borderColor: errors.email ? '#ff6b6b' : '' }}
            />
            {errors.email && <div className="error" style={{ fontSize: '12px', marginTop: '-10px', marginBottom: '10px' }}>{errors.email}</div>}
          </div>
          <div>
            <label>Пароль</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{ borderColor: errors.password ? '#ff6b6b' : '' }}
            />
            {errors.password && <div className="error" style={{ fontSize: '12px', marginTop: '-10px', marginBottom: '10px' }}>{errors.password}</div>}
          </div>
          <div>
            <label>Имя пользователя</label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              required
              style={{ borderColor: errors.userName ? '#ff6b6b' : '' }}
            />
            {errors.userName && <div className="error" style={{ fontSize: '12px', marginTop: '-10px', marginBottom: '10px' }}>{errors.userName}</div>}
          </div>
          <div>
            <label>Полное имя</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              style={{ borderColor: errors.fullName ? '#ff6b6b' : '' }}
            />
            {errors.fullName && <div className="error" style={{ fontSize: '12px', marginTop: '-10px', marginBottom: '10px' }}>{errors.fullName}</div>}
          </div>
          <div>
            <label>О себе</label>
            <textarea
              name="about"
              value={formData.about}
              onChange={handleChange}
              rows={3}
              style={{ borderColor: errors.about ? '#ff6b6b' : '' }}
            />
            {errors.about && <div className="error" style={{ fontSize: '12px', marginTop: '-10px', marginBottom: '10px' }}>{errors.about}</div>}
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
        <p style={{ marginTop: '15px', textAlign: 'center' }}>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;