import api from './api';
import { Communication } from '../types';

export const communicationService = {
  getCommunications: async (): Promise<Communication[]> => {
    const response = await api.get<Communication[]>('/communications/');
    return response.data;
  }
};
