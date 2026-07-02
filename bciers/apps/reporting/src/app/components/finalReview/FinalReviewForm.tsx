"use client";
import React, { useEffect, useState } from "react";
import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
import ReportingStepButtons from "@bciers/components/form/components/ReportingStepButtons";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";
import {
  NavigationInformation,
  ReportingFlow,
  ReportingOrigin,
} from "@reporting/src/app/components/taskList/types";
import { getFinalReviewData } from "@reporting/src/app/utils/getFinalReviewData";
import Loading from "@bciers/components/loading/SkeletonForm";
import { ReportData } from "./reportTypes";
import { FinalReviewReportSections } from "@reporting/src/app/components/finalReview/templates/FinalReviewReportSections";
import { ReportDownloadPdfButton } from "./templates/ReportDownloadPdfButton";

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
  // Store the async error in state so it can be re-thrown during render
  // 📍 React error boundary cannot catch errors thrown inside useEffect
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const finalReviewData = await getFinalReviewData(version_id);
        setData(finalReviewData);
      } catch (error) {
        console.error("FinalReviewForm.fetchData() failed", error);
        setError(error instanceof Error ? error : new Error(String(error)));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [version_id]);

  // Re-throw the async fetch error during render so it is handled by the React/Next.js error boundary
  if (error) {
    throw error;
  }

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
          {loading || !data ? (
            <Loading />
          ) : (
            <>
              <ReportDownloadPdfButton
                variant={
                  data.report_operation.operation_type ===
                  "Linear Facilities Operation"
                    ? "LFO"
                    : "SFO"
                }
              />
              <FinalReviewReportSections
                version_id={version_id}
                data={data}
                origin={ReportingOrigin.FinalReview}
                flow={flow}
              />
              <ReportingStepButtons
                backUrl={navigationInformation.backUrl}
                continueUrl={navigationInformation.continueUrl}
                buttonText="Continue"
                noSaveButton={true}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
