export type PenaltyAccrualRow = {
  date?: string;
  daily_penalty?: string | number | null;
  daily_compounded?: string | number | null;
  accumulated_penalty?: string | number | null;
  accumulated_compounded?: string | number | null;
  interest_rate?: string | number | null;
};

export type CalculatedPenaltyResponse = {
  requested_penalty_type?: string;
  automatic_overdue_penalty_status?: string;
  ggeapar_interest_status?: string;
  days_late?: number;
  total_penalty?: string | number | null;
  daily_accumulated_list?: PenaltyAccrualRow[];
};

export type PenaltyCalculatorFormData = {
  automatic_overdue_penalty_status?: string;
  ggeapar_interest_status?: string;
  requested_penalty_type: string;
  final_day_of_penalty_accrual?: string;
  penalty_summary: {
    total_penalty_amount?: string | number | null;
    days_late?: number | string | null;
  };
  accrual_data: {
    tableData: Array<Array<string | number | null | undefined>>;
  };
};
