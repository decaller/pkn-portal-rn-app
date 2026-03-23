/**
 * Mock data for development and when API is unavailable.
 * These simulate the real API responses for visual development.
 * Aligned with api_result/mobile-dashboard.json and api_result/documents.json
 */
import type { DashboardResponse, EventItem, NewsItem, DocumentItem, Testimonial } from '@/types';

export const MOCK_EVENTS: EventItem[] = [
  {
    id: 2,
    title: 'PKN Regional Workshop 2026',
    slug: 'pkn-regional-workshop-2026',
    summary: 'Workshop pendidikan bagi para pendidik Karakter Nabawiyah.',
    description: '<p>Dengan terus menghadirkan rasa syukur kepada Rabbunal Karim...</p>',
    event_date: '2026-09-04',
    city: 'Kabupaten Cikarang',
    province: 'Jawa Barat',
    nation: 'Indonesia',
    duration_days: 5,
    google_maps_url: 'https://maps.app.goo.gl/xbW37bh5HdmLzjfX7',
    cover_image: 'http://localhost/storage/event-covers/01KK1AQ3RZ1WHA58XT29YTGGBT.png',
    photos: [],
    files: [],
    documentation: [
      'http://localhost/storage/event-documentation/01KM3C2DQ1YVAC2QRWZ78F4B5B.jpeg',
      'http://localhost/storage/event-documentation/01KM3C2DQ3K51NV8QKE04QG0BB.jpeg',
    ],
    is_published: true,
    allow_registration: true,
    max_capacity: 50,
    available_spots: 50,
    is_full: false,
    registration_packages: [
      { id: 1, name: 'Regular', price: 75000, max_quota: 30, description: 'Penginapan bersama di kelas.' },
      { id: 2, name: 'VIP', price: 200000, max_quota: 20, description: 'Penginapan khusus berdua di hotel.' },
    ],
    rundown: [],
    tags: ['Akademi Guru'],
    proposal: undefined,
    testimonials: [],
  },
  {
    id: 1,
    title: 'PKN National Conference 2026',
    slug: 'pkn-national-conference-2026',
    summary: 'Annual national offline conference by PKN.',
    description: '<p>Annual national offline conference by PKN.</p>',
    event_date: '2026-06-04',
    city: 'Jakarta',
    province: 'DKI Jakarta',
    nation: 'Indonesia',
    duration_days: 1,
    google_maps_url: null,
    cover_image: 'https://picsum.photos/seed/event1/800/400',
    photos: [],
    files: [],
    documentation: [],
    is_published: true,
    allow_registration: true,
    max_capacity: 500,
    available_spots: 120,
    is_full: false,
    registration_packages: [],
    rundown: [],
    tags: ['Conference', 'National'],
    proposal: undefined,
    testimonials: [],
  },
];

export const MOCK_NEWS: NewsItem[] = [
  {
    id: 2,
    title: 'Registration Open: PKN Regional Workshop 2026',
    content: '<p>Registration is now open for PKN Regional Workshop 2026 on 04 Sep 2026.</p>',
    thumbnail: 'http://localhost/storage/news-thumbnails/01KM45HK2J39N2Q8WCWZHK0YG9.jpeg',
    is_published: true,
    event_id: 2,
    created_at: '2026-03-04T22:41:56+00:00',
  },
];

export const MOCK_DOCUMENTS: DocumentItem[] = [
  {
    id: 34,
    title: '0. PROGRAM PEMBELAJARAN 40 PILAR.xlsx',
    slug: 'doc-pnxci',
    file_url: 'http://localhost/storage/manual-uploads/0. PROGRAM PEMBELAJARAN 40 PILAR.xlsx',
    original_filename: '0. PROGRAM PEMBELAJARAN 40 PILAR.xlsx',
    cover_image: 'http://localhost/storage/document-covers/34-doc-pnxci.png',
    mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    description: 'Auto-extracted from manual_upload: Manual Upload',
    tags: ['featured'],
    is_active: true,
    is_featured: true,
    event_id: null,
  },
  {
    id: 33,
    title: '0. LEMBAR OBSERVASI 1-PERTUMBUHAN KARAKTER.pdf',
    slug: 'doc-seqg5',
    file_url: 'http://localhost/storage/manual-uploads/0. LEMBAR OBSERVASI 1-PERTUMBUHAN KARAKTER.pdf',
    original_filename: '0. LEMBAR OBSERVASI 1-PERTUMBUHAN KARAKTER.pdf',
    cover_image: 'http://localhost/storage/document-covers/33-doc-seqg5.png',
    mime_type: 'application/pdf',
    description: 'Auto-extracted from manual_upload: Manual Upload',
    tags: ['featured'],
    is_active: true,
    is_featured: true,
    event_id: null,
  },
  {
    id: 31,
    title: '3. Pembelajaran Alamiyah.pptx',
    slug: 'doc-tqtyz',
    file_url: 'http://localhost/storage/manual-uploads/3. Pembelajaran Alamiyah.pptx',
    original_filename: '3. Pembelajaran Alamiyah.pptx',
    cover_image: 'http://localhost/storage/document-covers/31-doc-tqtyz.png',
    mime_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    description: 'Auto-extracted from manual_upload: Manual Upload',
    tags: ['featured'],
    is_active: true,
    is_featured: true,
    event_id: null,
  },
  {
    id: 27,
    title: '1. Mengembalikan Pendidikan ke asalnya-1.pdf',
    slug: 'doc-a7z0y',
    file_url: 'http://localhost/storage/manual-uploads/1. Mengembalikan Pendidikan ke asalnya-1.pdf',
    original_filename: '1. Mengembalikan Pendidikan ke asalnya-1.pdf',
    cover_image: 'http://localhost/storage/document-covers/27-doc-a7z0y.png',
    mime_type: 'application/pdf',
    description: 'Auto-extracted from manual_upload: Manual Upload',
    tags: ['featured'],
    is_active: true,
    is_featured: true,
    event_id: null,
  },
];

export const MOCK_TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Dr. Sarah Wijaya',
    role: 'Professor, Universitas Indonesia',
    quote: 'PKN has been instrumental in connecting me with leading researchers.',
  },
];

export const MOCK_DASHBOARD: DashboardResponse = {
  featured_events: MOCK_EVENTS,
  latest_news: MOCK_NEWS,
  featured_document: MOCK_DOCUMENTS[3], // Singular as in mobile-dashboard.json
  featured_documents: MOCK_DOCUMENTS.filter(doc => doc.is_featured), // Plural for carousel
  testimonials: MOCK_TESTIMONIALS,
  contact_info: {
    phone: '628111729896',
    whatsapp_url: 'https://wa.me/628111729896',
  },
  alerts: [
    {
      id: '1',
      type: 'info',
      title: 'PKN 2026 Registration Open',
      message: 'Early bird registration is available.',
      action_route: '/(tabs)/events',
    },
  ],
  stats: {
    active_registrations: 2,
    pending_payments: 1,
  },
};
