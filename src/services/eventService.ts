import api from './api';

export interface EventItem {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  image_url: string;
  price: number;
  category: string;
  status: 'open' | 'closed' | 'ongoing';
}

export const eventService = {
  getEvents: async (): Promise<EventItem[]> => {
    const response = await api.get('/events');
    return response.data.data;
  },

  getEventDetail: async (id: number): Promise<EventItem> => {
    const response = await api.get(`/events/${id}`);
    return response.data.data;
  },

  getSimilarEvents: async (id: number): Promise<EventItem[]> => {
    const response = await api.get(`/events/${id}/similar`);
    return response.data.data;
  }
};
