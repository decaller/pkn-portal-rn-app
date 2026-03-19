/**
 * TypeScript interfaces for Event-related API responses.
 * Refined based on api_result/events.json
 */

export interface EventPackage {
  name: string;
  price: number;
  max_quota: number | null;
}

export interface RundownItem {
  type: 'advanced' | string;
  data: {
    title: string;
    date: string | null;
    place: string | null;
    start_time: string | null;
    end_time: string | null;
    speaker: string | null;
    description: string;
    session_files: string[];
    links: string[];
  };
}

export interface EventItem {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  description: string;
  event_date: string;
  city: string | null;
  province: string | null;
  nation: string | null;
  duration_days: number | null;
  google_maps_url: string | null;
  cover_image: string | null;
  photos: string[];
  files: string[];
  documentation: string[];
  is_published: boolean;
  allow_registration: boolean;
  max_capacity: number | null;
  available_spots: number | null;
  is_full: boolean;
  registration_packages: EventPackage[];
  rundown: RundownItem[] | null;
  tags: string[] | null;
}

export interface EventsResponse {
  data: EventItem[];
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
