"use client";
import ActivityForm from "./ActivityForm";
import { ActivityFormProps } from "./types";
import uiSchema from "./uiSchemas/gscNonCompressionNonProcessingUiSchema";

// 🧩 Main component
export default function GSCNonCompressionNonProcessing({
  reportVersionId,
  facilityId,
  activityData,
  reportDate,
}: Readonly<ActivityFormProps>) {
  // Shape of an empty sourceType to create a set of fields on select
  const defaultEmptySourceTypeState = {
    units: [{ fuels: [{ emissions: [{}] }] }],
  };

  return (
    <ActivityForm
      facilityId={facilityId}
      reportVersionId={reportVersionId}
      activityData={activityData}
      reportDate={reportDate}
      uiSchema={uiSchema}
      defaultEmptySourceTypeState={defaultEmptySourceTypeState}
    />
  );
}
