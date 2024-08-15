import { UUID } from "crypto";
import { RJSFSchema } from "@rjsf/utils";

export interface FacilityInformationFormData {}

export interface NewEntrantOperationFormData {}

export interface OptedInOperationFormData {
  has_emissions_for_section_3: boolean;
  is_electricity_import_operation: boolean;
  is_entire_operation_opted_in_for_designation: boolean;
  has_emissions_for_section_6: boolean;
  is_primary_economic_activity_classified_by_naics_11_22_562: boolean;
  produces_regulated_product_in_ggerr: boolean;
  is_capable_of_fulfilling_reporting_and_regulated_obligations: boolean;
  will_notify_director_if_criteria_not_met: boolean;
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
