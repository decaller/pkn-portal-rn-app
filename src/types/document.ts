/**
 * TypeScript interfaces for Document-related API responses.
 * Refined based on api_result/documents.json
 */

export interface DocumentItem {
  id: number;
  title: string;
  slug: string;
  file_url: string;
  original_filename: string;
  cover_image: string | null;
  mime_type: string;
  description: string | null;
  tags: string[] | null;
  is_active: boolean;
  is_featured: boolean;
  event_id: number | null;
}

export interface DocumentsResponse {
  featured: DocumentItem[];
  documents: {
    data: DocumentItem[];
    links: {
      first: string;
      last: string;
      prev: string | null;
      next: string | null;
    };
    meta: {
      current_page: number;
      from: number;
      last_page: number;
      per_page: number;
      to: number;
      total: number;
      path: string;
    };
  };
}
