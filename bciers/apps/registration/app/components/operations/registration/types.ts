import { UUID } from "crypto";
import { RJSFSchema } from "@rjsf/utils";

export interface FacilityInformationFormData {}

export interface NewEntrantOperationFormData {}

export interface OperationInformationFormData {}

export interface OperationRepresentativeFormData {}

export interface RegistrationPurposeFormData {}

export interface RegistrationSubmissionFormData {}

export interface OperationRegistrationFormProps {
  operation: UUID | "create";
  schema: RJSFSchema;
  step: number;
  steps: string[];
}
