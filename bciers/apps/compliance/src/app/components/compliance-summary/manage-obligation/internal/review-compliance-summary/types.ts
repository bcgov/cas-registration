export type PenaltyAccrualValue = string | number | null | undefined;

export type PenaltyAccrualRow = {
  date?: PenaltyAccrualValue;
  daily_penalty?: PenaltyAccrualValue;
  daily_compounded?: PenaltyAccrualValue;
  accumulated_penalty?: PenaltyAccrualValue;
  accumulated_compounded?: PenaltyAccrualValue;
  interest_rate?: PenaltyAccrualValue;
};

export type PenaltyAccrualEntry =
  | PenaltyAccrualRow
  | [
      PenaltyAccrualValue,
      PenaltyAccrualValue,
      PenaltyAccrualValue,
      PenaltyAccrualValue,
      PenaltyAccrualValue,
      PenaltyAccrualValue,
    ];

export type CalculatedPenaltyResponse = {
  requested_penalty_type?: string;
  automatic_overdue_penalty_status?: string;
  ggeapar_interest_status?: string;
  days_late?: number;
  total_penalty?: string | number | null;
  daily_accumulated_list?: PenaltyAccrualEntry[];
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
