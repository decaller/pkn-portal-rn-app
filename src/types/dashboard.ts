/**
 * TypeScript interfaces for Dashboard API response.
 */
import { EventItem } from './event';
import { NewsItem } from './news';

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar_url?: string;
  quote: string;
}

export interface DashboardResponse {
  featured_events: EventItem[];
  latest_news: NewsItem[];
  testimonials: Testimonial[];
  contact_info: {
    phone: string;
    whatsapp_url: string;
  };
  alerts?: Array<{
    id: string;
    type: 'info' | 'warning' | 'danger' | 'success';
    title: string;
    message: string;
    action_route?: string;
  }>;
  stats?: {
    active_registrations: number;
    pending_payments: number;
  };
}
