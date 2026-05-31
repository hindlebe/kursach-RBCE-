import api from './api';
import { Comment, CreateCommentRequest } from '../types';

export const commentsService = {
  async getComments(id: string): Promise<{ comments: Comment[] }> {
    try {
      const response = await api.get(`/Comment/GetComments?id=${id}`);
      // Убеждаемся, что ответ содержит массив comments
      if (!response.data || !response.data.comments) {
        return { comments: [] };
      }
      return response.data;
    } catch (error) {
      console.error('API Error in getComments:', error);
      // Возвращаем пустой массив 
      return { comments: [] };
    }
  },

  async createComment(id: string, data: CreateCommentRequest): Promise<{ result: Comment }> {
    const response = await api.post(`/Comment/CreateComment?Id=${id}`, data);
    return response.data;
  },
};