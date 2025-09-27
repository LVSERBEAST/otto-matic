export interface Client {
  // Contact Info
  id: string;
  name: string;
  email: string;
  phone: string;
  website: string;

  // Address
  street: string;
  city: string;
  state: string;
  zip: string;

  // Financial/Tracking
  isTaxExempt: boolean;
  defaultDiscountRate: number; // 0..1 (e.g., 0.1 for 10%)
  notes: string;
}
