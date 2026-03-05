export interface SignOffFormItems {
  acknowledgement_of_review: boolean;
  acknowledgement_of_records: boolean;
  acknowledgement_of_information: boolean | null;
  acknowledgement_of_possible_costs: boolean;
  signature: string;
  acknowledgement_of_new_version: boolean | null;
  acknowledgements_of_corrections: boolean | null;
  supplementary?: Record<string, boolean | null>;
}

export interface SignOffFormData extends SignOffFormItems {
  signature: string;
  date: string;
}
