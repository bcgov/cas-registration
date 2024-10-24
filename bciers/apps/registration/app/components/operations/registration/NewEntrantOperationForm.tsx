"use client";

import { actionHandler } from "@bciers/actions";
import { IChangeEvent } from "@rjsf/core";
import MultiStepBase from "@bciers/components/form/MultiStepBase";
import { newEntrantOperationUiSchema } from "apps/registration/app/data/jsonSchema/operationRegistration/newEntrantOperation";
import {
  NewEntrantOperationFormData,
  OperationRegistrationFormProps,
} from "apps/registration/app/components/operations/registration/types";
import { useState, useEffect } from "react";


interface NewEntrantOperationFormProps extends OperationRegistrationFormProps {
  formData: NewEntrantOperationFormData;
}
// Check if all questions are answered
const allQuestionsAnswered = (formData: NewEntrantOperationFormData) => {
  return Object.values(formData).every((value) => value !== null);
};

const NewEntrantOperationForm = ({
  formData,
  operation,
  schema,
  step,
  steps,
}: NewEntrantOperationFormProps) => {
  const [formState, setFormState] = useState(formData);
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);

  //To run the check on initial load when the form already has data
  useEffect(() => {
    if (formData) {
      setSubmitButtonDisabled(!allQuestionsAnswered(formData));
    }
  }, []);

  const handleChange = (e: IChangeEvent) => {
    setFormState(e.formData);
    setSubmitButtonDisabled(!allQuestionsAnswered(e.formData));
  };

  const baseUrl = `/register-an-operation/${operation}`;
  const handleSubmit = async (e: IChangeEvent) => {
    setSubmitButtonDisabled(true);
    const body = {
      operation_id: operation,
      date_of_first_shipment: e.formData.date_of_first_shipment,
      new_entrant_application: e.formData.new_entrant_application,
    };
    const response = await actionHandler(
      `registration/v2/operations/${operation}/registration/new-entrant-operation-detail`,
      "POST",
      baseUrl, // Removing this line will cause the form to show the existing data(not consistent)
      {body: body}
    );
    console.log('HEEEEEERRRRRRRREEEEEEEEE')
    console.log('BODY')
    console.log(JSON.stringify({...e.formData}))

    return response;
  };

  return (
    <MultiStepBase
      allowBackNavigation
      baseUrl={baseUrl}
      cancelUrl="/"
      formData={formState}
      onSubmit={handleSubmit}
      onChange={handleChange}
      schema={schema}
      step={step}
      steps={steps}
      uiSchema={newEntrantOperationUiSchema}
      submitButtonDisabled={submitButtonDisabled}
    />
  );
};

export default NewEntrantOperationForm;
