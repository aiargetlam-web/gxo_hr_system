import api from './api';
import { Communication, CommunicationType, CommunicationMessage } from '../types';

export const communicationService = {
  getCommunications: async (): Promise<Communication[]> => {
    const response = await api.get<Communication[]>('/api/v1/communications');
    return response.data;
  },

  getCommunicationTypes: async (): Promise<CommunicationType[]> => {
    const response = await api.get<CommunicationType[]>('/api/v1/communications/types');
    return response.data;
  },

  getCommunication: async (id: number): Promise<Communication> => {
    const response = await api.get<Communication>(`/api/v1/communications/${id}`);
    return response.data;
  },

  updateCommunication: async (id: number, data: any): Promise<Communication> => {
    const response = await api.patch<Communication>(`/api/v1/communications/${id}`, data);
    return response.data;
  },

  uploadAttachment: async (id: number, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/api/v1/communications/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getMessages: async (id: number): Promise<CommunicationMessage[]> => {
    const response = await api.get<CommunicationMessage[]>(`/api/v1/communications/${id}/messages`);
    return response.data;
  },

  addMessage: async (id: number, content: string): Promise<CommunicationMessage> => {
    const response = await api.post<CommunicationMessage>(`/api/v1/communications/${id}/messages`, {
      content
    });
    return response.data;
  }
};
