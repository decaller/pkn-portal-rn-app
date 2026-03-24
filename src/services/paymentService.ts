import api from './api';

export interface InvoiceItem {
  id: number;
  registration_id: number;
  amount: number;
  status: 'unpaid' | 'pending' | 'paid';
  due_date: string;
  snap_token?: string;
}

export interface ChargeResponse {
  snap_token: string;
  redirect_url: string;
}

export const paymentService = {
  getInvoices: async (): Promise<InvoiceItem[]> => {
    const response = await api.get('/invoices');
    return response.data.data;
  },

  getInvoiceDetail: async (id: number): Promise<InvoiceItem> => {
    const response = await api.get(`/invoices/${id}`);
    return response.data.data;
  },

  charge: async (invoiceId: number): Promise<ChargeResponse> => {
    const response = await api.post('/payments/charge', { invoice_id: invoiceId });
    return response.data;
  }
};
