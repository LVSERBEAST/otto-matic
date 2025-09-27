export type JobStage = 'Draft' | 'Approved' | 'Production' | 'Sent';
export type JobType =
  | 'Business Cards'
  | 'Posters'
  | 'Brochures'
  | 'Menus'
  | 'Invitations'
  | 'Other';

export interface Stock {
  paperType: string;
  quantity: number;
  weight?: string;
  finish?: string;
}

export interface SubJob {
  id: string;
  name: string; // "Invitation", "Envelope", "RSVP"
  quantity: number;
  stock: Stock[];
}

export interface Tooling {
  id: string;
  name: string;
  type: 'Die' | 'Plate' | 'Custom' | 'Other';
  cost: number;
  description?: string;
}

export interface PrintProcess {
  id: string;
  name: string; // "Letterpress", "Foil Stamp", "Die Cut"
  order: number;
  setupTime?: number;
  notes?: string;
}

export interface Quote {
  // Quote Details
  quoteId: string;
  quoteDate: Date;

  // Client Details
  clientId: string;
  clientName: string;

  // Production Details
  material: string;
  quantity: number;
  pricePerUnit: number;
  size: string;
  finishType: string;
  notes: string;

  // Financial
  setupFee: number;
  discountRate: number; // 0..1 (e.g., 0.1 for 10%)
  readonly subTotal: number; // computed: quantity * pricePerUnit
  readonly totalPrice: number; // computed: subTotal + setupFee - discount + tax

  // Tracking
  isExported: boolean;
}

export interface Job {
  // Job Details
  jobId: string;
  jobDate: Date;
  stage: JobStage;
  jobType: JobType;

  // References
  clientId: string;
  quoteId: string;

  // Production Details
  stock: Stock[];
  subJobs: SubJob[];
  tooling: Tooling[];
  printProcesses: PrintProcess[];

  // Notes
  productionNotes: string;
  clientNotes: string;

  // Deadlines
  quoteDeadline?: Date;
  productionDeadline?: Date;
  deliveryDeadline?: Date;
}
