/**
 * Mock data for development and when API is unavailable.
 * These simulate the real API responses for visual development.
 */
import type { DashboardResponse, EventItem, NewsItem, DocumentItem } from '@/types';

export const MOCK_EVENTS: EventItem[] = [
  {
    id: 1,
    title: 'PKN National Conference 2026',
    slug: 'pkn-national-conference-2026',
    summary: 'The biggest annual gathering of educators and practitioners exploring nabawiyah character building.',
    description: '<p>Annual national offline conference by PKN.</p>',
    event_date: '2026-06-04',
    city: 'Jakarta',
    province: 'DKI Jakarta',
    nation: 'Indonesia',
    duration_days: 1,
    google_maps_url: 'https://maps.app.goo.gl/xbW37bh5HdmLzjfX7',
    cover_image: 'https://picsum.photos/seed/event1/800/400',
    photos: [],
    files: ['https://example.com/conference-proposal.pdf'],
    documentation: [
      'https://picsum.photos/seed/doc1/400/300',
      'https://picsum.photos/seed/doc2/400/300',
    ],
    is_published: true,
    allow_registration: true,
    max_capacity: 500,
    available_spots: 120,
    is_full: false,
    registration_packages: [
      { 
        name: 'Regular', 
        price: 100000, 
        max_quota: 400,
        description: 'Standard access to all conference sessions and basic materials.'
      },
      { 
        name: 'VIP', 
        price: 250000, 
        max_quota: 100,
        description: 'Premium seating, exclusive networking lunch, and advanced materials package.'
      },
    ],
    rundown: [
      {
        type: 'advanced',
        data: {
          title: 'Keynote Session',
          date: '2026-06-04',
          place: 'Main Ballroom',
          start_time: '08:00',
          end_time: '10:00',
          speaker: 'Ustadz Ahmad',
          description: '<p>Opening keynote.</p>',
          session_files: [],
          links: [],
        },
      },
    ],
    tags: ['Conference', 'National'],
    proposal: 'https://example.com/conference-proposal.pdf',
    testimonials: [],
  },
  {
    id: 2,
    title: 'PKN Regional Workshop 2026',
    slug: 'pkn-regional-workshop-2026',
    summary: 'Intensive workshop for educators focusing on practical implementation of Nabawiyah curriculum.',
    description: '<p>Regional offline workshop and networking session.</p>',
    event_date: '2026-09-04',
    city: 'Kabupaten Cikarang',
    province: 'Jawa Barat',
    nation: 'Indonesia',
    duration_days: 3,
    google_maps_url: 'https://maps.app.goo.gl/xbW37bh5HdmLzjfX7',
    cover_image: 'https://picsum.photos/seed/event2/800/400',
    photos: [],
    files: ['https://example.com/workshop-proposal.pdf'],
    documentation: [],
    is_published: true,
    allow_registration: true,
    max_capacity: 50,
    available_spots: 50,
    is_full: false,
    registration_packages: [
      { 
        name: 'Regular', 
        price: 75000, 
        max_quota: 30,
        description: 'Penginapan bersama di kelas yang diubah menjadi tempat menginap dengan fasilitas 1 kasur dan 1 bantal.'
      },
      { 
        name: 'VIP', 
        price: 200000, 
        max_quota: 20,
        description: 'Penginapan khusus berdua di hotel terdekat.'
      },
    ],
    rundown: [],
    tags: ['Workshop', 'Regional'],
    proposal: 'http://localhost/storage/event-proposals/01KKTMY5S0JMW99YD51YWK3YB7.pdf',
    testimonials: [],
  },
];

export const MOCK_NEWS: NewsItem[] = [
  {
    id: 1,
    title: 'PKN Launches New Professional Development Program',
    content: '<p>A comprehensive program designed to help professionals advance their careers through structured learning paths and mentorship.</p>',
    thumbnail: 'https://picsum.photos/seed/news1/800/400',
    is_published: true,
    event_id: null,
    created_at: '2026-03-15T00:00:00Z',
  },
  {
    id: 2,
    title: 'Research Collaboration Agreement with Leading Universities',
    content: '<p>PKN signs a landmark agreement with 5 top universities to advance knowledge management research.</p>',
    thumbnail: 'https://picsum.photos/seed/news2/800/400',
    is_published: true,
    event_id: null,
    created_at: '2026-03-12T00:00:00Z',
  },
  {
    id: 3,
    title: 'Upcoming Changes to Event Registration System',
    content: '<p>We are improving our event registration system to make it faster and more convenient for all members.</p>',
    thumbnail: 'https://picsum.photos/seed/news3/800/400',
    is_published: true,
    event_id: null,
    created_at: '2026-03-10T00:00:00Z',
  },
];

export const MOCK_DOCUMENTS: DocumentItem[] = [
  {
    id: 1,
    title: 'ICKM 2025 Conference Proceedings',
    slug: 'ickm-2025-proceedings',
    description: 'Full proceedings from the International Conference on Knowledge Management 2025.',
    file_url: 'https://example.com/docs/ickm-2025.pdf',
    original_filename: 'ickm-2025.pdf',
    cover_image: 'https://picsum.photos/seed/doc1/400/300',
    mime_type: 'application/pdf',
    tags: ['Conference', '2025'],
    is_active: true,
    event_id: 1,
  },
  {
    id: 2,
    title: 'Annual Report 2025',
    slug: 'annual-report-2025',
    description: 'PKN\'s annual report detailing achievements and financial overview.',
    file_url: 'https://example.com/docs/annual-2025.pdf',
    original_filename: 'annual-2025.pdf',
    cover_image: 'https://picsum.photos/seed/doc2/400/300',
    mime_type: 'application/pdf',
    tags: ['Report', '2025'],
    is_active: true,
    event_id: null,
  },
  {
    id: 3,
    title: 'Workshop Materials - AI in Education',
    slug: 'ai-education-workshop-materials',
    description: 'Slides and handouts from the AI in Education workshop series.',
    file_url: 'https://example.com/docs/ai-workshop.zip',
    original_filename: 'ai-workshop.zip',
    cover_image: 'https://picsum.photos/seed/doc3/400/300',
    mime_type: 'application/zip',
    tags: ['Workshop', 'AI'],
    is_active: true,
    event_id: 2,
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
