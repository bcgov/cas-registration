import { UUID } from "crypto";
import { RJSFSchema } from "@rjsf/utils";

export interface FacilityInformationFormData {}

export interface NewEntrantOperationFormData {}

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
