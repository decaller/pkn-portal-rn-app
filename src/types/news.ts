/**
 * TypeScript interfaces for News-related API responses.
 * Refined based on api_result/news.json
 */

export interface NewsItem {
  id: number;
  title: string;
  content: string;
  thumbnail: string | null;
  is_published: boolean;
  event_id: number | null;
  created_at: string;
}

export interface NewsResponse {
  data: NewsItem[];
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
}
