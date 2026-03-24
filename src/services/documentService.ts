import api from './api';

export interface DocumentItem {
  id: number;
  title: string;
  category: string;
  file_url: string;
  file_type: string;
  size: string;
  created_at: string;
}

export const documentService = {
  getDocuments: async (): Promise<DocumentItem[]> => {
    const response = await api.get('/documents');
    return response.data.data;
  },

  getFeaturedDocuments: async (): Promise<DocumentItem[]> => {
    const response = await api.get('/documents/featured');
    return response.data.data;
  }
};
