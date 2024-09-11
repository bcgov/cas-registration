"use client";
import ActivityForm from "./ActivityForm";
import uiSchema from "./uiSchemas/carbonatesUseUiSchema";

interface Props {
  activityData: {
    activityId: number;
    sourceTypeMap: { [key: number]: string };
  };
  reportDate: string;
}

// 🧩 Main component
export default function HydrogenProduction({
  activityData,
  reportDate,
}: Readonly<Props>) {
  const defaultEmptySourceTypeState = {
    emissions: [{ gasType: "CO2" }],
  };

  return (
    <div>
      <ActivityForm
        activityData={activityData}
        reportDate={reportDate}
        uiSchema={uiSchema}
        defaultEmptySourceTypeState={defaultEmptySourceTypeState}
      />
    </div>
  );
}
