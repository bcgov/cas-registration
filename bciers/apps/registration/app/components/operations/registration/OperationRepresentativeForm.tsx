"use client";

import MultiStepBase from "@bciers/components/form/MultiStepBase";
import {
  OperationRepresentativeFormData,
  OperationsContacts,
} from "apps/registration/app/components/operations/registration/types";
import { ContactRow } from "@/administration/app/components/contacts/types";
import { UUID } from "crypto";
import NewOperationRepresentativeForm from "./NewOperationRepresentativeForm";

interface OperationRepresentativeFormProps {
  operation: UUID;
  step: number;
  steps: string[];
  formData: OperationRepresentativeFormData;
  existingOperationRepresentatives: OperationsContacts[];
  contacts: ContactRow[];
}

const OperationRepresentativeForm = ({
  formData,
  operation,
  step,
  steps,
  existingOperationRepresentatives,
  contacts,
}: OperationRepresentativeFormProps) => {
  const hasExistingOperationReps = existingOperationRepresentatives?.length > 0;

  return (
    <MultiStepBase
      allowBackNavigation
      baseUrl={`/register-an-operation/${operation}`}
      baseUrlParams={`title=${operation}`}
      cancelUrl="/"
      onSubmit={() => {}} //We just want to redirect to the next step
      schema={{}}
      step={step}
      steps={steps}
      uiSchema={{}}
      submitButtonText="Continue"
      submitButtonDisabled={!hasExistingOperationReps}
      beforeForm={
        <NewOperationRepresentativeForm
          formData={formData}
          existingOperationRepresentatives={existingOperationRepresentatives}
          contacts={contacts}
        />
      }
    />
  );
};

export default OperationRepresentativeForm;
