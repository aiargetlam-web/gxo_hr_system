import api from './api';
import { Ticket, TicketType, TicketMessage } from '../types';

export const ticketService = {
  getTickets: async (): Promise<Ticket[]> => {
    const response = await api.get<Ticket[]>('/api/v1/tickets');
    return response.data;
  },

  getTicketTypes: async (): Promise<TicketType[]> => {
    const response = await api.get<TicketType[]>('/api/v1/tickets/types');
    return response.data;
  },

  getTicket: async (id: number): Promise<Ticket> => {
    const response = await api.get<Ticket>(`/api/v1/tickets/${id}`);
    return response.data;
  },

  createTicket: async (data: {
    type_id: number;
    priority?: number;
    content: string;
  }): Promise<Ticket> => {
    const response = await api.post<Ticket>('/api/v1/tickets', data);
    return response.data;
  },

  updateTicket: async (id: number, data: any): Promise<Ticket> => {
    const response = await api.patch<Ticket>(`/api/v1/tickets/${id}`, data);
    return response.data;
  },

  addMessage: async (id: number, content: string): Promise<TicketMessage> => {
    const response = await api.post<TicketMessage>(`/api/v1/tickets/${id}/messages`, {
      content
    });
    return response.data;
  }
};
