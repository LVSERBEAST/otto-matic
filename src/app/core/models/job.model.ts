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

export interface Job {
  // Job Details
  id: string;
  jobDate: Date;
  stage: JobStage;
  jobType: JobType;

  // References
  clientId: string;
  quoteIds: string[];

  // Derived from Quote (for display convenience)
  clientName: string;
  material: string;
  quantity: number;
  size: string;
  finishType: string;
  totalPrice: number;

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

  hasQuote?: boolean;
}