import api from './api';
import { AuthResponse } from '../types';

export const authService = {
  async register(email: string, password: string, userName: string, fullName: string, about: string): Promise<AuthResponse> {
    const response = await api.post('/Auth/Register', {
      email,
      password,
      userName,
      fullName,
      about,
    });
    return response.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post('/Auth/login', {
      email,
      password,
    });
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  getUser(): any | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  saveAuthData(token: string, userName: string, email: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ userName, email }));
  },
};