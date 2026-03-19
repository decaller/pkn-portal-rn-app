/**
 * TypeScript interfaces for Event-related API responses.
 */

export interface EventImage {
  url: string;
  alt?: string;
}

export interface EventPackage {
  id: number;
  name: string;
  price: number;
  currency: string;
  participant_limit?: number;
  description?: string;
}

export interface EventItem {
  id: number;
  title: string;
  slug: string;
  summary: string;
  description?: string;
  event_date: string;
  event_end_date?: string;
  location: string;
  available_spots: number | null;
  registration_open: boolean;
  registration_start?: string;
  registration_end?: string;
  image: EventImage | null;
  packages?: EventPackage[];
  category?: string;
  status: 'upcoming' | 'ongoing' | 'past' | 'cancelled';
}

export interface EventDetail extends EventItem {
  description: string;
  packages: EventPackage[];
  similar_events: EventItem[];
  organizer?: string;
}

export interface EventsResponse {
  data: EventItem[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
