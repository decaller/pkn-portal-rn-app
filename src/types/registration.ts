/**
 * Registration, Participant, and Invoice Types
 */
import { EventItem } from './event';

export interface Participant {
  id: number;
  name: string;
  email: string;
  phone: string;
  identity_number?: string;
  category?: string;
  metadata?: Record<string, any>;
}

export interface RegistrationPackageBreakdown {
  package_name: string;
  participant_count: number;
  unit_price: number;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  amount: number;
  status: string;
  status_label?: string;
  status_color?: string;
  due_date?: string;
  issued_at?: string;
  download_url?: string;
  can_pay_now?: boolean;
  has_active_payment_attempt?: boolean;
  total_amount?: number;
  snap_token?: string;
  items?: Array<{
    description: string;
    amount: number;
  }>;
}

export interface Registration {
  id: number;
  registration_number: string;
  event_id: number;
  event?: EventItem;
  package_id?: number | null;
  package_name?: string | null;
  participant_count: number;
  package_breakdown: RegistrationPackageBreakdown[];
  status: 'draft' | 'submitted' | 'confirmed' | 'cancelled' | 'awaiting_payment' | 'closed';
  status_label?: string;
  status_color?: string;
  payment_status?: string;
  payment_status_label?: string;
  payment_status_color?: string;
  total_amount: number;
  created_at: string;
  participants: Participant[];
  invoice?: Invoice;
  invoices?: Invoice[];
  latest_invoice?: Invoice;
  notes?: string | null;
  booker?: {
    id: number;
    name: string;
  };
}

type ApiEnvelope<T> = {
  data: T;
};

const isObject = (value: unknown): value is Record<string, any> =>
  typeof value === 'object' && value !== null;

export const normalizeRegistration = (value: unknown): Registration | null => {
  if (!isObject(value)) return null;

  const packageBreakdown = Array.isArray(value.package_breakdown) ? value.package_breakdown : [];
  const normalizedPackageBreakdown = packageBreakdown
    .filter((item) => isObject(item))
    .map((item) => ({
      package_name: typeof item.package_name === 'string' ? item.package_name : '',
      participant_count: Number(item.participant_count ?? 0),
      unit_price: Number(item.unit_price ?? 0),
    }));
  const participants = Array.isArray(value.participants) ? value.participants : [];
  const participantCount =
    Number(value.participant_count ?? 0) ||
    normalizedPackageBreakdown.reduce((sum, item) => sum + item.participant_count, 0) ||
    participants.length;
  const derivedPackageName =
    typeof value.package_name === 'string' && value.package_name.trim().length > 0
      ? value.package_name
      : packageBreakdown.find((item) => isObject(item) && typeof item.package_name === 'string')?.package_name ?? null;

  return {
    id: Number(value.id ?? 0),
    registration_number:
      typeof value.registration_number === 'string' && value.registration_number.trim().length > 0
        ? value.registration_number
        : `REG-${value.id ?? 'UNKNOWN'}`,
    event_id: Number(value.event_id ?? value.event?.id ?? 0),
    event: value.event,
    package_id: value.package_id == null ? null : Number(value.package_id),
    package_name: derivedPackageName,
    participant_count: participantCount,
    package_breakdown: normalizedPackageBreakdown,
    status: (value.status ?? 'draft') as Registration['status'],
    status_label: typeof value.status_label === 'string' ? value.status_label : undefined,
    status_color: typeof value.status_color === 'string' ? value.status_color : undefined,
    payment_status: typeof value.payment_status === 'string' ? value.payment_status : undefined,
    payment_status_label: typeof value.payment_status_label === 'string' ? value.payment_status_label : undefined,
    payment_status_color: typeof value.payment_status_color === 'string' ? value.payment_status_color : undefined,
    total_amount: Number(value.total_amount ?? 0),
    created_at: typeof value.created_at === 'string' ? value.created_at : '',
    participants,
    invoice: isObject(value.invoice) ? value.invoice as Invoice : undefined,
    invoices: Array.isArray(value.invoices) ? (value.invoices as Invoice[]) : [],
    latest_invoice: isObject(value.latest_invoice) ? value.latest_invoice as Invoice : undefined,
    notes: typeof value.notes === 'string' ? value.notes : null,
    booker: isObject(value.booker) ? { id: Number(value.booker.id), name: String(value.booker.name) } : undefined,
  };
};

export const extractRegistration = (payload: unknown): Registration | null => {
  if (isObject(payload) && 'data' in payload) {
    return normalizeRegistration((payload as ApiEnvelope<unknown>).data);
  }

  return normalizeRegistration(payload);
};

export const extractRegistrations = (payload: unknown): Registration[] => {
  if (Array.isArray(payload)) {
    return payload.map(normalizeRegistration).filter((item): item is Registration => item !== null);
  }

  if (isObject(payload) && Array.isArray((payload as ApiEnvelope<unknown>).data)) {
    return ((payload as ApiEnvelope<unknown[]>).data)
      .map(normalizeRegistration)
      .filter((item): item is Registration => item !== null);
  }

  return [];
};
