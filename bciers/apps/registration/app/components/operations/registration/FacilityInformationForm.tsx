"use client";

import FormBase from "@bciers/components/form/FormBase";
import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  operation,
  schema,
  step,
  steps,
}: FacilityInformationFormProps) => {
  return (
    <>
      <MultiStepHeader step={step} steps={steps} />
      <FormBase
        formData={formData}
        schema={schema}
        uiSchema={facilityInformationUiSchema}
      />
    </>
  );
};

export default FacilityInformationForm;
