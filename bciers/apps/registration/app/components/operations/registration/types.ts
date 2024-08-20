import { UUID } from "crypto";
import { RJSFSchema } from "@rjsf/utils";

export interface FacilityInformationFormData {}

export interface NewEntrantOperationFormData {}

export interface OptedInOperationFormData {
  meets_section_3_emissions_requirements: boolean;
  meets_electricity_import_criteria: boolean;
  meets_entire_operation_requirements: boolean;
  meets_section_6_emissions_requirements: boolean;
  meets_naics_code_11_22_562_classification_requirements: boolean;
  meets_producing_gger_schedule_a1_regulated_product: boolean;
  meets_reporting_and_regulated_obligations: boolean;
  meets_notification_to_director_on_criteria_change: boolean;
}

export interface OperationInformationFormData {}

export interface OperationRepresentativeFormData {}

export interface RegistrationPurposeFormData {}

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
