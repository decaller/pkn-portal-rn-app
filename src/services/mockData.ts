/**
 * Mock data for development and when API is unavailable.
 * These simulate the real API responses for visual development.
 */
import type { DashboardResponse, EventItem, NewsItem, DocumentItem } from '@/types';

export const MOCK_EVENTS: EventItem[] = [
  {
    id: 1,
    title: 'International Conference on Knowledge Management 2026',
    slug: 'ickm-2026',
    summary: 'Join leading researchers and practitioners for three days of intensive knowledge sharing and networking.',
    event_date: '2026-06-15',
    event_end_date: '2026-06-17',
    location: 'Jakarta Convention Center',
    available_spots: 45,
    registration_open: true,
    image: { url: 'https://picsum.photos/seed/event1/800/400' },
    status: 'upcoming',
    category: 'Conference',
  },
  {
    id: 2,
    title: 'Workshop: AI in Education - Practical Applications',
    slug: 'ai-education-workshop',
    summary: 'Hands-on workshop exploring the latest AI tools and methodologies for academic environments.',
    event_date: '2026-05-20',
    location: 'Bandung Institute of Technology',
    available_spots: 12,
    registration_open: true,
    image: { url: 'https://picsum.photos/seed/event2/800/400' },
    status: 'upcoming',
    category: 'Workshop',
  },
  {
    id: 3,
    title: 'PKN Annual Members Gathering',
    slug: 'pkn-annual-gathering',
    summary: 'The annual gathering for PKN members to connect, share experiences, and plan the year ahead.',
    event_date: '2026-04-10',
    location: 'Hotel Indonesia Kempinski',
    available_spots: null,
    registration_open: true,
    image: { url: 'https://picsum.photos/seed/event3/800/400' },
    status: 'upcoming',
    category: 'Networking',
  },
  {
    id: 4,
    title: 'Seminar: Digital Transformation in Southeast Asia',
    slug: 'digital-transformation-sea',
    summary: 'Expert speakers discuss the challenges and opportunities of digital transformation in the region.',
    event_date: '2026-03-25',
    location: 'Virtual (Zoom)',
    available_spots: 200,
    registration_open: true,
    image: { url: 'https://picsum.photos/seed/event4/800/400' },
    status: 'ongoing',
    category: 'Seminar',
  },
];

export const MOCK_NEWS: NewsItem[] = [
  {
    id: 1,
    title: 'PKN Launches New Professional Development Program',
    slug: 'pkn-new-program',
    excerpt: 'A comprehensive program designed to help professionals advance their careers through structured learning paths and mentorship.',
    published_at: '2026-03-15',
    author: 'PKN Editorial',
    image: { url: 'https://picsum.photos/seed/news1/800/400' },
    category: 'Announcement',
  },
  {
    id: 2,
    title: 'Research Collaboration Agreement with Leading Universities',
    slug: 'research-collaboration',
    excerpt: 'PKN signs a landmark agreement with 5 top universities to advance knowledge management research.',
    published_at: '2026-03-12',
    author: 'PKN Research',
    image: { url: 'https://picsum.photos/seed/news2/800/400' },
    category: 'Research',
  },
  {
    id: 3,
    title: 'Upcoming Changes to Event Registration System',
    slug: 'registration-changes',
    excerpt: 'We are improving our event registration system to make it faster and more convenient for all members.',
    published_at: '2026-03-10',
    image: { url: 'https://picsum.photos/seed/news3/800/400' },
    category: 'Update',
  },
];

export const MOCK_DOCUMENTS: DocumentItem[] = [
  {
    id: 1,
    title: 'ICKM 2025 Conference Proceedings',
    description: 'Full proceedings from the International Conference on Knowledge Management 2025.',
    file_url: 'https://example.com/docs/ickm-2025.pdf',
    file_size: '12.5 MB',
    file_type: 'PDF',
    created_at: '2025-12-01',
    category: 'Conference',
  },
  {
    id: 2,
    title: 'Annual Report 2025',
    description: 'PKN\'s annual report detailing achievements and financial overview.',
    file_url: 'https://example.com/docs/annual-2025.pdf',
    file_size: '4.2 MB',
    file_type: 'PDF',
    created_at: '2026-01-15',
    category: 'Report',
  },
  {
    id: 3,
    title: 'Workshop Materials - AI in Education',
    description: 'Slides and handouts from the AI in Education workshop series.',
    file_url: 'https://example.com/docs/ai-workshop.zip',
    file_size: '28.1 MB',
    file_type: 'ZIP',
    created_at: '2026-02-20',
    category: 'Workshop',
  },
];

export const MOCK_TESTIMONIALS = [
  {
    id: 1,
    name: 'Dr. Sarah Wijaya',
    role: 'Professor, Universitas Indonesia',
    quote: 'PKN has been instrumental in connecting me with leading researchers in my field. The conferences are world-class.',
  },
  {
    id: 2,
    name: 'Ahmad Prasetyo',
    role: 'Senior Consultant, Deloitte',
    quote: 'The professional development programs offered by PKN gave me the edge I needed in my career.',
  },
  {
    id: 3,
    name: 'Dr. Maya Putri',
    role: 'Research Director, BRIN',
    quote: 'Collaborating through PKN\'s network has opened doors for cross-institutional research that I never imagined possible.',
  },
];

export const MOCK_DASHBOARD: DashboardResponse = {
  featured_events: MOCK_EVENTS.slice(0, 3),
  latest_news: MOCK_NEWS,
  testimonials: MOCK_TESTIMONIALS,
};
