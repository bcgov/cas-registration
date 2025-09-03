"use client";
import React, { useState } from "react";
import { actionHandler } from "@bciers/actions";
import { NavigationInformation } from "@reporting/src/app/components/taskList/types";
import MultiStepWrapperWithTaskList from "@bciers/components/form/MultiStepWrapperWithTaskList";
import { ReviewChanges } from "@reporting/src/app/components/changeReview/templates/ReviewChanges";
import { useRouter } from "next/navigation";
import { ChangeItem } from "@reporting/src/app/components/changeReview/constants/types";
import ReasonForChangeForm from "@reporting/src/app/components/changeReview/templates/ReasonForChange";
interface ChangeReviewProps {
  versionId: number;
  initialFormData: any;
  navigationInformation: NavigationInformation;
  changes: ChangeItem[];
  showChanges: boolean;
  isReportingOnly?: boolean;
}

export default function ChangeReviewForm({
  versionId,
  initialFormData,
  navigationInformation,
  changes,
  showChanges,
  isReportingOnly = false,
}: ChangeReviewProps) {
  const router = useRouter();
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<string[]>();
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
  const [reasonForChange, setReasonForChange] = useState(
    initialFormData.reason_for_change || "",
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSubmit = async (canContinue: boolean) => {
    const payload = {
      ...formData,
      reason_for_change: reasonForChange,
    };

    setIsSaving(true);

    const endpoint = `reporting/report-version/${versionId}`;
    const method = "POST";

    const response = await actionHandler(endpoint, method, endpoint, {
      body: JSON.stringify(payload),
    });

    if (response.error) {
      setErrors([response.error]);
    } else {
      if (canContinue) {
        setIsRedirecting(true);
        router.push(navigationInformation.continueUrl);
      }
    }

    setIsSaving(false);
  };

  return (
    <MultiStepWrapperWithTaskList
      initialStep={navigationInformation.headerStepIndex}
      steps={navigationInformation.headerSteps}
      taskListElements={navigationInformation.taskList}
      backUrl={navigationInformation.backUrl}
      continueUrl={navigationInformation.continueUrl}
      errors={errors}
      onSubmit={() => handleSubmit(true)}
      isRedirecting={isRedirecting}
      isSaving={isSaving}
      noFormSave={() => handleSubmit(false)}
      submitButtonDisabled={reasonForChange.trim() === ""}
    >
      <ReviewChanges
        changes={changes}
        showChanges={showChanges}
        isReportingOnly={isReportingOnly}
      />
      <ReasonForChangeForm
        reasonForChange={reasonForChange}
        onReasonChange={(val) => {
          setReasonForChange(val);
          setFormData({ ...formData, reason_for_change: val });
        }}
      />
    </MultiStepWrapperWithTaskList>
  );
}
