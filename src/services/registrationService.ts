import api from './api';

export interface RegistrationItem {
  id: number;
  user_id: number;
  event_id: number;
  package_id: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  payment_status: 'unpaid' | 'pending' | 'paid';
  created_at: string;
  event_title: string;
  event_date: string;
  amount: number;
}

export const registrationService = {
  getRegistrations: async (): Promise<RegistrationItem[]> => {
    const response = await api.get('/registrations');
    return response.data.data;
  },

  createRegistration: async (data: { event_id: number; package_id: number }): Promise<RegistrationItem> => {
    const response = await api.post('/registrations', data);
    return response.data.data;
  },

  cancelRegistration: async (id: number): Promise<void> => {
    await api.delete(`/registrations/${id}`);
  }
};
