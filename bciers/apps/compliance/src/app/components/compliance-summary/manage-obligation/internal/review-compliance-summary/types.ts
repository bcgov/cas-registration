import { PenaltyAccrual, PenaltyType } from "@/compliance/src/app/types";

export type PenaltyAccrualFieldData = {
  query_id: string;
  rows: PenaltyAccrual[];
};

export type PenaltyCalculatorFormData = {
  automatic_overdue_penalty_status: string;
  ggeapar_interest_status: string;
  requested_penalty_type: PenaltyType;
  final_day_of_penalty_accrual: string;
  penalty_summary: {
    total_penalty_amount: string;
    days_late: number;
  };
  accrual_data: PenaltyAccrualFieldData;
};
