"use client";
import React, { useEffect, useState } from "react";
import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
import ReportingStepButtons from "@bciers/components/form/components/ReportingStepButtons";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";
import { NavigationInformation } from "@reporting/src/app/components/taskList/types";
import { getFinalReviewData } from "@reporting/src/app/utils/getFinalReviewData";
import Loading from "@bciers/components/loading/SkeletonForm";
import { ReportData } from "./reportTypes";
import { FinalReviewReportSections } from "@reporting/src/app/components/finalReview/templates/FinalReviewReportSections";

interface Props {
  version_id: any;
  navigationInformation: NavigationInformation;
  flow: ReportingFlow;
}

export const FinalReviewForm: React.FC<Props> = ({
  version_id,
  navigationInformation,
  flow,
}) => {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const finalReviewData = await getFinalReviewData(version_id);
      setData(finalReviewData);
      setLoading(false);
    }
    fetchData();
  }, [version_id]);

  return (
    <div className="p-6">
      <div className="container mx-auto p-4" data-testid="facility-review">
        <MultiStepHeader
          stepIndex={navigationInformation.headerStepIndex}
          steps={navigationInformation.headerSteps}
        />
      </div>

      <div className="w-full flex gap-4">
        <div className="hidden md:block">
          <ReportingTaskList elements={navigationInformation.taskList} />
        </div>

        <div className="w-full">
          {loading ? (
            <Loading />
          ) : data ? (
            <>
              <FinalReviewReportSections
                version_id={version_id}
                data={data}
                origin={`final-review`}
              />
              <ReportingStepButtons
                backUrl={navigationInformation.backUrl}
                continueUrl={navigationInformation.continueUrl}
                buttonText="Continue"
                noSaveButton={true}
              />
            </>
          ) : (
            <Loading />
          )}
        </div>
      </div>
    </div>
  );
};
