export interface Payment {
  id: string | number;
  paymentReceivedDate: string;
  paymentAmountApplied: number;
  paymentMethod: string;
  transactionType: string;
  referenceNumber: string;
}

export interface PaymentsData {
  rows: Payment[];
  row_count: number;
}
