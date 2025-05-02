export interface Payment {
  id: string | number;
  paymentReceivedDate: string;
  paymentAmountApplied: number;
  paymentMethod: string;
  transactionType: string;
  receiptNumber: string;
}

export interface PaymentsData {
  rows: Payment[];
  row_count: number;
}
