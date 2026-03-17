"use client";

import { UUID } from "crypto";
import { FacilityInitialData } from "apps/administration/app/components/facilities/types";
import type { FacilityInformationFormData } from "apps/registration/app/components/operations/registration/types";
import FacilityLfoForm from "./FacilityLfoForm";
import FacilitySfoForm from "./FacilitySfoForm";

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

export default function FacilityInformationForm({
  facilityId,
  formData,
  initialGridData,
  isOperationSfo,
  operationId,
  operationName,
  step,
  steps,
  isCreating,
}: FacilityInformationFormProps) {
  return isOperationSfo ? (
    <FacilitySfoForm
      isCreating={isCreating}
      facilityId={facilityId}
      step={step}
      steps={steps}
      operationId={operationId}
      formData={formData}
    />
  ) : (
    <FacilityLfoForm
      step={step}
      steps={steps}
      operationId={operationId}
      operationName={operationName}
      formData={formData}
      initialGridData={initialGridData}
    />
  );
}
