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
  package_id: number;
  package_name: string;
  status: 'draft' | 'submitted' | 'confirmed' | 'cancelled' | 'awaiting_payment';
  total_amount: number;
  created_at: string;
  participants: Participant[];
  invoice?: Invoice;
}
