"use client";
import ActivityForm from "./ActivityForm";
import uiSchema from "./uiSchemas/fuelCombustionMobileUiSchema";

interface Props {
  activityData: {
    activityId: number;
    sourceTypeMap: { [key: number]: string };
  };
  reportDate: string;
}

// 🧩 Main component
export default function FuelCombustionByMobile({
  activityData,
  reportDate,
}: Readonly<Props>) {
  // Shape of an empty sourceType to create a set of fields on select
  const defaultEmptySourceTypeState = {
    fuels: [{ emissions: [{}] }],
  };

  return (
    <ActivityForm
      activityData={activityData}
      reportDate={reportDate}
      uiSchema={uiSchema}
      defaultEmptySourceTypeState={defaultEmptySourceTypeState}
    />
  );
}
