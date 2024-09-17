"use client";
import ActivityForm from "./ActivityForm";
import uiSchema from "./uiSchemas/pulpAndPaperUiSchema";

interface Props {
  activityData: {
    activityId: number;
    sourceTypeMap: { [key: number]: string };
  };
  reportDate: string;
}

// 🧩 Main component
export default function PulpAndPaperProduction({
  activityData,
  reportDate,
}: Readonly<Props>) {
  const defaultEmptySourceTypeState = {
    emissions: [{}],
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
