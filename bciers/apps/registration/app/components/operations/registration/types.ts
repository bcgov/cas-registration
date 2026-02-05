import { UUID } from "crypto";
import { RJSFSchema } from "@rjsf/utils";
import { Dict } from "@bciers/types/dictionary";

export type FacilityInformationFormData = Dict;

export interface NewEntrantOperationFormData {
  id: UUID;
  name: string;
  new_entrant_application: string | null;
}

export interface OptedInOperationFormData {
  meets_section_3_emissions_requirements: boolean | null;
  meets_electricity_import_operation_criteria: boolean | null;
  meets_entire_operation_requirements: boolean | null;
  meets_section_6_emissions_requirements: boolean | null;
  meets_naics_code_11_22_562_classification_requirements: boolean | null;
  meets_producing_gger_schedule_a1_regulated_product: boolean | null;
  meets_reporting_and_regulated_obligations: boolean | null;
  meets_notification_to_director_on_criteria_change: boolean | null;
  final_reporting_year: number | null;
}

export type OperationInformationFormData = Dict;

export interface OperationRepresentativeFormData {
  operation_representatives?: number[];
  new_operation_representative?: {
    existing_contact_id: string;
    first_name: string;
    last_name: string;
    position_title: string;
    email: string;
    phone_number: string;
    street_address: string;
    municipality: string;
    province: string;
    postal_code: string;
  }[];
}

export type RegistrationPurposeFormData = Dict;

export interface RegistrationSubmissionFormData {
  acknowledgement_of_review: boolean;
  acknowledgement_of_records: boolean;
  acknowledgement_of_information: boolean;
}

export interface OperationRegistrationFormProps {
  operation: UUID;
  schema: RJSFSchema;
  step: number;
  steps: string[];
}

export interface OperationRepresentative {
  id: number;
  full_name: string;
}
