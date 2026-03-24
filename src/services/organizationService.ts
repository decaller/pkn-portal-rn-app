import api from './api';

export interface Organization {
  id: number;
  name: string;
  slug: string;
  logo?: string;
}

export const organizationService = {
  /**
   * Fetch all organizations the current user belongs to.
   */
  getOrganizations: async (): Promise<Organization[]> => {
    const response = await api.get('/organizations');
    // Handle Laravel ResourceCollection wrapping (data: [...]) or direct array
    return Array.isArray(response.data) ? response.data : response.data.data || [];
  },
};
