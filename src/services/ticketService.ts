import api from './api';
import { Ticket } from '../types';

export const ticketService = {
  getTickets: async (): Promise<Ticket[]> => {
    const response = await api.get<Ticket[]>('/tickets/');
    return response.data;
  }
};
