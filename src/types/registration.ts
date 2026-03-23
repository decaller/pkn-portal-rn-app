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

export interface Invoice {
  id: number;
  invoice_number: string;
  amount: number;
  status: 'unpaid' | 'pending' | 'paid' | 'expired' | 'cancelled';
  due_date: string;
  snap_token?: string;
  items: Array<{
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
  status: 'draft' | 'submitted' | 'confirmed' | 'cancelled' | 'awaiting_payment';
  total_amount: number;
  created_at: string;
  participants: Participant[];
  invoice?: Invoice;
}

type ApiEnvelope<T> = {
  data: T;
};

const isObject = (value: unknown): value is Record<string, any> =>
  typeof value === 'object' && value !== null;

export const normalizeRegistration = (value: unknown): Registration | null => {
  if (!isObject(value)) return null;

  const packageBreakdown = Array.isArray(value.package_breakdown) ? value.package_breakdown : [];
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
    status: (value.status ?? 'draft') as Registration['status'],
    total_amount: Number(value.total_amount ?? 0),
    created_at: typeof value.created_at === 'string' ? value.created_at : '',
    participants: Array.isArray(value.participants) ? value.participants : [],
    invoice: isObject(value.invoice) ? value.invoice as Invoice : undefined,
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
