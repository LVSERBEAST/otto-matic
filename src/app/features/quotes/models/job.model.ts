export type JobStatus = 'Draft' | 'Approved' | 'Sent';

// Base job inputs used before calculations are applied
export interface JobInputs {
  // Quote Details
  quoteId: string;
  quoteDate: Date;
  status: JobStatus;

  // Client Details
  clientId: string;
  clientName: string;

  // Production Inputs
  material: string;
  quantity: number;
  pricePerUnit: number;
  size: string;
  finishType: string;
  notes: string;

  // Financial & Tracking
  setupFee: number;
  discountRate: number; // 0..1 (e.g., 0.1 for 10%)
  isExported: boolean;
}

// The final Job with computed pricing fields (subTotal and totalPrice)
export interface Job extends JobInputs {
  readonly subTotal: number; // computed: quantity * pricePerUnit
  readonly totalPrice: number; // computed: subTotal + setupFee - discount + tax
}
