"use client";

import MultiStepBase from "@bciers/components/form/MultiStepBase";
import { optedInOperationUiSchema } from "apps/registration/app/data/jsonSchema/operationRegistration/optedInOperation";
import {
  OptedInOperationFormData,
  OperationRegistrationFormProps,
} from "apps/registration/app/components/operations/registration/types";
import { useState } from "react";
import { actionHandler } from "@bciers/actions";
import { IChangeEvent } from "@rjsf/core";

interface OptedInOperationFormProps extends OperationRegistrationFormProps {
  formData: OptedInOperationFormData;
}
// Required boolean fields that must be answered
const requiredBooleanFields: (keyof OptedInOperationFormData)[] = [
  "meets_section_3_emissions_requirements",
  "meets_electricity_import_operation_criteria",
  "meets_entire_operation_requirements",
  "meets_section_6_emissions_requirements",
  "meets_naics_code_11_22_562_classification_requirements",
  "meets_producing_gger_schedule_a1_regulated_product",
  "meets_reporting_and_regulated_obligations",
  "meets_notification_to_director_on_criteria_change",
];

// Check if all required questions are answered
// Boolean fields can be true or false, so we need to check for undefined and null
const allQuestionsAnswered = (formData: OptedInOperationFormData) => {
  return requiredBooleanFields.every((field) => {
    const value = formData[field];
    return value !== null && value !== undefined;
  });
};

const OptedInOperationForm = ({
  operation,
  schema,
  step,
  steps,
  formData,
}: OptedInOperationFormProps) => {
  const [formState, setFormState] = useState(formData);
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(
    !allQuestionsAnswered(formData),
  );

  const handleChange = (e: IChangeEvent) => {
    setFormState(e.formData);
    setSubmitButtonDisabled(!allQuestionsAnswered(e.formData));
  };

  const handleSubmit = async (e: IChangeEvent) => {
    setSubmitButtonDisabled(true);
    const response = await actionHandler(
      `registration/operations/${operation}/registration/opted-in-operation-detail`,
      "PUT",
      `/register-an-operation/${operation}`, // Removing this line will cause the form to show the existing data(not consistent)
      {
        body: JSON.stringify({
          ...e.formData,
        }),
      },
    );

    // errors are handled in MultiStepBase
    return response;
  };
  return (
    <MultiStepBase
      allowBackNavigation
      baseUrl={`/register-an-operation/${operation}`}
      cancelUrl="/"
      formData={formState}
      onChange={handleChange}
      onSubmit={handleSubmit}
      schema={schema}
      step={step}
      steps={steps}
      uiSchema={optedInOperationUiSchema}
      submitButtonDisabled={submitButtonDisabled}
    />
  );
};

export default OptedInOperationForm;
