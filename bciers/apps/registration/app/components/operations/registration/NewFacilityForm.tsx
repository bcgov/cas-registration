"use client";

import {
  createOperationRepresentativeSchema,
  createOperationRepresentativeUiSchema,
} from "apps/registration/app/data/jsonSchema/operationRegistration/operationRepresentative";
import { OperationRepresentative } from "apps/registration/app/components/operations/registration/types";
import { IChangeEvent } from "@rjsf/core";
import { useState, FC } from "react";
import { Button, Alert } from "@mui/material";
import { getContact } from "@bciers/actions/api";
import {
  ContactFormData,
  ContactRow,
} from "@/administration/app/components/contacts/types";
import FormBase, { FormPropsWithTheme } from "@bciers/components/form/FormBase";
import { actionHandler } from "@bciers/actions";
import { UUID } from "crypto";
import SnackBar from "@bciers/components/form/components/SnackBar";
import { facilitiesSfoSchema } from "@/administration/app/data/jsonSchema/facilitiesSfo";
import { RJSFSchema } from "@rjsf/utils";
import {
  facilityInformationLfoSchema,
  facilityInformationLfoUiSchema,
  facilityInformationSfoSchema,
  facilityInformationSfoUiSchema,
} from "@/registration/app/data/jsonSchema/operationRegistration/facilityInformation";
import { useCallback, useMemo } from "react";
import FacilitiesDataGrid from "apps/administration/app/components/facilities/FacilitiesDataGrid";
import { FacilityInitialData } from "apps/administration/app/components/facilities/types";
import MultiStepBase from "@bciers/components/form/MultiStepBase";
import { FacilityInformationFormData } from "apps/registration/app/components/operations/registration/types";
import { createUnnestedFormData } from "@bciers/components/form/formDataUtils";
import {
  facilitiesLfoSchema,
  facilitiesLfoUiSchema,
} from "@/administration/app/data/jsonSchema/facilitiesLfo";
import { useRouter } from "next/navigation";

interface NewFacilityFormProps
  extends Omit<FormPropsWithTheme<any>, "schema" | "uiSchema"> {
  step: number;
  operationId: UUID;
  isSubmitting: boolean;
  formData: FacilityInformationFormData;
  setFacilityFormIsSubmitting: (facilityFormIsSubmitting: boolean) => void;
  onSubmit?: (e: IChangeEvent) => void;
}

const NewFacilityForm: FC<NewFacilityFormProps> = (props) => {
  const { formData, operationId, setFacilityFormIsSubmitting } = props;

  const [error, setError] = useState(undefined);
  const [formState, setFormState] = useState(formData);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

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
    console.log("did i fire");
    setFacilityFormIsSubmitting(true);
    const method = "POST";

    const endpoint = "registration/facilities";

    const body = [
      {
        ...createUnnestedFormData(e.formData, formSectionListLfo),
        operation_id: operationId,
      },
    ];
    console.log("operationId", operationId);
    const response = await actionHandler(endpoint, method, "", {
      body: JSON.stringify(body),
    });
    if (!response || response?.error) {
      setError(response.error);
      return { error: response.error };
    }
    setIsSnackbarOpen(true);
    setShowForm(false);
    setFacilityFormIsSubmitting(false);
    // router.refresh();
    return response;
  };
  console.log("formState", formState);
  return (
    <>
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
            Add Facility
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

export default NewFacilityForm;
