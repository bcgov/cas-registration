"use client";

import MultiStepBase from "@bciers/components/form/MultiStepBase";
import { facilityInformationUiSchema } from "apps/registration/app/data/jsonSchema/operationRegistration/facilityInformation";
import {
  FacilityInformationFormData,
  OperationRegistrationFormProps,
} from "apps/registration/app/components/operations/registration/types";

interface FacilityInformationFormProps extends OperationRegistrationFormProps {
  formData: FacilityInformationFormData;
}

const FacilityInformationForm = ({
  formData,
  operation,
  schema,
  step,
  steps,
}: FacilityInformationFormProps) => {
  return (
    <MultiStepBase
      baseUrl={`/operation/${operation}`}
      baseUrlParams="title=Placeholder+Title"
      cancelUrl="/"
      formData={formData}
      onSubmit={() => {}}
      schema={schema}
      step={step}
      steps={steps}
      uiSchema={facilityInformationUiSchema}
    />
  );
};

export default FacilityInformationForm;
