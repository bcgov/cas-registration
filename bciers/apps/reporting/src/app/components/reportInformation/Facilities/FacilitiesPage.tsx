import { FacilitiesSearchParams } from "apps/reporting/src/app/components/operations/types";
import Facilities from "@reporting/src/app/components/reportInformation/Facilities/Facilities";
import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
import { multiStepHeaderSteps } from "@reporting/src/app/components/taskList/multiStepHeaderConfig";
import ReportingStepButtons from "@bciers/components/form/components/ReportingStepButtons";

export default async function FacilitiesPage({
  searchParams,
}: {
  searchParams: FacilitiesSearchParams;
}) {
  return (
    <>
      <MultiStepHeader
        stepIndex={1}
        steps={multiStepHeaderSteps}
      ></MultiStepHeader>
      <Facilities searchParams={searchParams} />
    </>
  );
}
