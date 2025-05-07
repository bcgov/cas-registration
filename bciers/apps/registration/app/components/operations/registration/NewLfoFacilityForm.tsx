"use client";

import { IChangeEvent } from "@rjsf/core";
import { useState, FC } from "react";
import { Button, Alert } from "@mui/material";
import FormBase, { FormPropsWithTheme } from "@bciers/components/form/FormBase";
import { actionHandler } from "@bciers/actions";
import { UUID } from "crypto";
import SnackBar from "@bciers/components/form/components/SnackBar";
import { RJSFSchema } from "@rjsf/utils";
import { useCallback } from "react";
import { FacilityInformationFormData } from "apps/registration/app/components/operations/registration/types";
import { createUnnestedFormData } from "@bciers/components/form/formDataUtils";
import {
  facilitiesLfoSchema,
  facilitiesLfoUiSchema,
} from "@/administration/app/data/jsonSchema/facilitiesLfo";

interface NewLfoFacilityFormProps
  extends Omit<FormPropsWithTheme<any>, "schema" | "uiSchema"> {
  operationId: UUID;
  formData: FacilityInformationFormData;
  setFacilityFormIsSubmitting: (facilityFormIsSubmitting: boolean) => void;
  onSuccess?: (createdFacility: any) => void;
}

const NewLfoFacilityForm: FC<NewLfoFacilityFormProps> = (props) => {
  const {
    formData,
    operationId,
    setFacilityFormIsSubmitting,
    onSuccess, // 📌 Callback to update parent grid data
  } = props;

  const [error, setError] = useState(undefined);
  const [formState, setFormState] = useState(formData);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Get the list of sections in the LFO schema - used to unnest the formData
  const formSectionListLfo = Object.keys(
    facilitiesLfoSchema.properties as RJSFSchema,
  );

  // Unnest the formData objects inside facility_information_array which is split into sections

  const handleFormChange = useCallback(
    (e: IChangeEvent) => {
      setFormState(e.formData);
    },
    [setFormState],
  );

  const handleSubmit = async (e: IChangeEvent) => {
    setFacilityFormIsSubmitting(true);
    // Clear any old errors
    setError(undefined);
    const method = "POST";

    const endpoint = "registration/facilities";

    const body = [
      {
        ...createUnnestedFormData(e.formData, formSectionListLfo),
        operation_id: operationId,
      },
    ];
    const response = await actionHandler(endpoint, method, "", {
      body: JSON.stringify(body),
    });
    if (!response || response?.error) {
      setError(response.error);
      return { error: response.error };
    }

    // 🔔 Notify parent via callback
    onSuccess?.(response);

    setIsSnackbarOpen(true);
    setShowForm(false);
    setFacilityFormIsSubmitting(false);
    setFormState({}); // reset form state
    return response;
  };

  return (
    <>
      <div
        className={`w-full form-group field field-object form-heading-label`}
      >
        <div className="form-heading">Facility Information</div>
      </div>
      {showForm ? (
        <>
          <FormBase
            formData={formState}
            onChange={handleFormChange}
            onSubmit={handleSubmit}
            schema={facilitiesLfoSchema}
            uiSchema={facilitiesLfoUiSchema}
            liveValidate
          >
            <div>
              <Button className="my-4" type="submit" variant="outlined">
                Save
              </Button>

              <div className="min-h-[48px] box-border">
                {error && <Alert severity="error">{error}</Alert>}
              </div>
            </div>
          </FormBase>
        </>
      ) : (
        <div>
          <Button
            className="my-4"
            variant="outlined"
            onClick={() => {
              setShowForm(!showForm);
            }}
          >
            Add New Facility
          </Button>
        </div>
      )}
      <SnackBar
        isSnackbarOpen={isSnackbarOpen}
        message="Facility added"
        setIsSnackbarOpen={setIsSnackbarOpen}
      />
    </>
  );
};

export default NewLfoFacilityForm;
