"use client";

import { useMemo, useState } from "react";
import { UUID } from "crypto";
import FacilitiesDataGrid from "apps/administration/app/components/facilities/FacilitiesDataGrid";
import {
  FacilityInitialData,
  FacilityRow,
} from "apps/administration/app/components/facilities/types";
import MultiStepBase from "@bciers/components/form/MultiStepBase";
import NewLfoFacilityForm from "./NewLfoFacilityForm";

interface FacilityLfoFormProps {
  facilityId?: UUID;
  formData: { [key: string]: any };
  initialGridData?: FacilityInitialData;
  operationId: UUID | "create";
  operationName: string;
  step: number;
  steps: string[];
}

const FacilityGridSx = {
  "& .MuiDataGrid-virtualScroller": { minHeight: "60px" },
  "& .MuiDataGrid-overlayWrapper": { minHeight: "60px" },
};

export default function FacilityLfoForm({
  formData,
  initialGridData,
  operationId,
  operationName,
  step,
  steps,
}: FacilityLfoFormProps) {
  const [facilityFormIsSubmitting, setFacilityFormIsSubmitting] =
    useState(false);

  // 🚩 Local grid data state, seeded from the server, updated on NewLfoFacilityForm onSuccess
  const [gridData, setGridData] = useState<FacilityInitialData>(
    initialGridData ?? { rows: [], row_count: 0 },
  );
  // 🚀 Create facility updates local grid data state
  const handleSuccess = (response: any) => {
    const newFacility = response[0];
    const newRow: FacilityRow = {
      // React‐key for the grid:
      id: newFacility.id as UUID,

      // FacilityRow interface:
      facility__bcghg_id__id: String(newFacility.bcghg_id ?? ""),
      facility__name: String(newFacility.name ?? ""),
      facility__type: String(newFacility.type ?? ""),
      facility__id: newFacility.id as UUID,
      status: String(newFacility.status ?? ""),

      facility__latitude_of_largest_emissions:
        newFacility.latitude_of_largest_emissions != null
          ? String(newFacility.latitude_of_largest_emissions)
          : "",
      facility__longitude_of_largest_emissions:
        newFacility.longitude_of_largest_emissions != null
          ? String(newFacility.longitude_of_largest_emissions)
          : "",
    };
    setGridData((prev) => ({
      rows: [...prev.rows, newRow],
      row_count: prev.row_count + 1,
    }));
  };
  // 🔑 Create a memo’d string key that changes whenever local grid data state row_count changes
  const gridKey = useMemo(
    () => gridData.row_count.toString(),
    [gridData.row_count],
  );

  // Whether we have at least one facility
  const operationHasFacilities = gridData.row_count > 0;

  // The form‐level submit guard (e.g. “must have one facility”)
  const handleSubmit = () => {
    if (!operationHasFacilities) {
      return { error: "Operation must have at least one facility." };
    }
    // Using window.location.href instead of MutliStepBase router.push as there were rerender issues due to
    // Facility Grid listerning to params change on this page which sometimes hijacked the route change
    window.location.href = `${
      window.location.origin
    }/registration/register-an-operation/${operationId}/${step + 1}`;
  };
  return (
    <MultiStepBase
      allowBackNavigation
      baseUrl={`/register-an-operation/${operationId}`}
      baseUrlParams={`title=${operationId}`}
      cancelUrl="/"
      onSubmit={handleSubmit}
      schema={{}}
      uiSchema={{}}
      step={step}
      steps={steps}
      submitButtonText="Continue"
      submitButtonDisabled={!operationHasFacilities}
      beforeForm={
        <NewLfoFacilityForm
          operationId={operationId as UUID}
          formData={formData}
          setFacilityFormIsSubmitting={setFacilityFormIsSubmitting}
          // 📌 **onSuccess** appends the created facility into local grid data state
          onSuccess={handleSuccess}
        />
      }
    >
      <section className="mt-4">
        <FacilitiesDataGrid
          key={gridKey} // 🔑 remount grid when local grid data state changes
          disabled={facilityFormIsSubmitting}
          initialData={gridData} // render from local state
          operationId={operationId}
          operationName={operationName}
          sx={FacilityGridSx}
          fromRegistration={true}
        />
      </section>
    </MultiStepBase>
  );
}
