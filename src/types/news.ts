/**
 * TypeScript interfaces for News-related API responses.
 */

export interface NewsItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  published_at: string;
  author?: string;
  image: {
    url: string;
    alt?: string;
  } | null;
  category?: string;
}

export interface NewsDetail extends NewsItem {
  content: string;
  related_articles: NewsItem[];
}

export interface NewsResponse {
  data: NewsItem[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
