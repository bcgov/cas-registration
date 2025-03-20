export interface SignOffFormItems {
  acknowledgement_of_review: boolean;
  acknowledgement_of_records: boolean;
  acknowledgement_of_information: boolean;
  acknowledgement_of_impact: boolean;
}

export interface SignOffFormData extends SignOffFormItems {
  signature: string;
  date: string;
}
