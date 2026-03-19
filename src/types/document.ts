/**
 * TypeScript interfaces for Document-related API responses.
 */

export interface DocumentItem {
  id: number;
  title: string;
  description: string;
  file_url: string;
  file_size: string;
  file_type: string;
  created_at: string;
  category?: string;
  thumbnail_url?: string;
}

export interface DocumentsResponse {
  data: DocumentItem[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
