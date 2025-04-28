"use client";

import { useCallback, useMemo, useState } from "react";
import { UUID } from "crypto";
import { IChangeEvent } from "@rjsf/core";
import { RJSFSchema } from "@rjsf/utils";
import { actionHandler } from "@bciers/actions";
import FacilitiesDataGrid from "apps/administration/app/components/facilities/FacilitiesDataGrid";
import { FacilityInitialData } from "apps/administration/app/components/facilities/types";
import MultiStepBase from "@bciers/components/form/MultiStepBase";
import {
  facilityInformationLfoSchema,
  facilityInformationSfoSchema,
  facilityInformationLfoUiSchema,
  facilityInformationSfoUiSchema,
} from "apps/registration/app/data/jsonSchema/operationRegistration/facilityInformation";
import { FacilityInformationFormData } from "apps/registration/app/components/operations/registration/types";
import { createUnnestedFormData } from "@bciers/components/form/formDataUtils";
import { facilitiesSfoSchema } from "@/administration/app/data/jsonSchema/facilitiesSfo";
import NewFacilityForm from "./NewFacilityForm";
import { useRouter } from "next/navigation";

interface FacilityInformationFormProps {
  facilityId?: UUID;
  formData: FacilityInformationFormData;
  initialGridData?: FacilityInitialData;
  isCreating: boolean;
  isOperationSfo: boolean;
  operationId: UUID | "create";
  operationName: string;
  step: number;
  steps: string[];
}

const FacilityGridSx = {
  "& .MuiDataGrid-virtualScroller": {
    minHeight: "60px",
  },
  "& .MuiDataGrid-overlayWrapper": {
    minHeight: "60px",
  },
};

const FacilityInformationForm = ({
  facilityId,
  formData,
  initialGridData,
  isCreating,
  isOperationSfo,
  operationId,
  operationName,
  step,
  steps,
}: FacilityInformationFormProps) => {
  const [facilityFormIsSubmitting, setFacilityFormIsSubmitting] =
    useState(false);
  const router = useRouter();

  const operationHasFacilities =
    initialGridData?.row_count && initialGridData.row_count > 0;
  const handleSubmit = () => {
    // if there are no existing facilities and the user hasn't added a new one, return error
    if (!operationHasFacilities) {
      return { error: "Operation must have at least one facility." };
    }
    // router.refresh(); // this does nothing
  };
  return (
    <MultiStepBase
      allowBackNavigation
      baseUrl={`/register-an-operation/${operationId}`}
      baseUrlParams={`title=${operationId}`}
      cancelUrl="/"
      onSubmit={handleSubmit}
      schema={{}}
      step={step}
      steps={steps}
      uiSchema={{}}
      submitButtonText="Continue"
      submitButtonDisabled={!operationHasFacilities}
      beforeForm={
        <NewFacilityForm
          onSubmit={handleSubmit}
          step={step}
          operationId={operationId as UUID}
          formData={formData}
          setFacilityFormIsSubmitting={setFacilityFormIsSubmitting}
        />
      }
    >
      {/* Only display DataGrid for LFO Operations */}
      {!isOperationSfo && (
        <section className="mt-4">
          <FacilitiesDataGrid
            disabled={facilityFormIsSubmitting}
            initialData={initialGridData ?? { rows: [], row_count: 0 }}
            operationId={operationId}
            operationName={operationName}
            sx={FacilityGridSx}
            fromRegistration={true}
          />
        </section>
      )}
    </MultiStepBase>
  );
};

export default FacilityInformationForm;
