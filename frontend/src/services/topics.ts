import api from './api';
import { Topic, CreateTopicRequest, UpdateTopicRequest } from '../types';

export const topicsService = {
  async getTopics(): Promise<{ topics: Topic[] }> {
    try {
      const response = await api.get('/Topics/GetTopics');
     
      if (!response.data || !response.data.topics) {
        return { topics: [] };
      }
      return response.data;
    } catch (error) {
      console.error('API Error in getTopics:', error);
     
      return { topics: [] };
    }
  },

  async getTopic(id: string): Promise<{ topic: Topic }> {
  try {
    const response = await api.get(`/Topics/GetTopic?id=${id}`);
    // Убеждаемся, что topic существует
    if (!response.data || !response.data.topic) {
      throw new Error('Topic not found');
    }
    return response.data;
  } catch (error) {
    console.error('API Error in getTopic:', error);
    throw error;
  }
},

  async createTopic(data: CreateTopicRequest): Promise<Topic> {
    const response = await api.post('/Topics/CreateTopic', data);
    return response.data;
  },

  async updateTopic(id: string, data: UpdateTopicRequest): Promise<{ topicResponseDto: Topic }> {
    const response = await api.put(`/Topics/UpdateTopic?id=${id}`, data);
    return response.data;
  },

  async deleteTopic(id: string): Promise<{ isSuccess: boolean }> {
    const response = await api.delete(`/Topics/DeleteTopic/${id}`);
    return response.data;
  },

  async joinLeaveTopic(id: string): Promise<{ details: string; isSuccess: boolean }> {
    const response = await api.post(`/Topics/JoinLeaveTopic?id=${id}`);
    return response.data;
  },
};