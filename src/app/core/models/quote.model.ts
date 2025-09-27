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