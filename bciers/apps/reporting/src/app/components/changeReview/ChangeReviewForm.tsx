"use client";
import React, { useEffect, useState } from "react";
import { actionHandler } from "@bciers/actions";
import { NavigationInformation } from "@reporting/src/app/components/taskList/types";
import MultiStepWrapperWithTaskList from "@bciers/components/form/MultiStepWrapperWithTaskList";
import { ReviewChanges } from "@reporting/src/app/components/changeReview/templates/ReviewChanges";
import { useRouter } from "next/navigation";
import { ChangeItem } from "@reporting/src/app/components/changeReview/constants/types";
import ReasonForChangeForm from "@reporting/src/app/components/changeReview/templates/ReasonForChange";
import { getChangeReviewData } from "../../utils/getReviewChangesData";
import Loading from "@bciers/components/loading/SkeletonForm";
import AlertNote from "@bciers/components/form/components/AlertNote";

interface ChangeReviewProps {
  versionId: number;
  initialFormData: any;
  navigationInformation: NavigationInformation;
  registrationPurpose: string;
  displayChanges: boolean;
}

export default function ChangeReviewForm({
  versionId,
  initialFormData,
  navigationInformation,
  registrationPurpose,
  displayChanges,
}: ChangeReviewProps) {
  const router = useRouter();
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<string[]>();
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
  const [reasonForChange, setReasonForChange] = useState(
    initialFormData.reason_for_change || "",
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [changesData, setChangesData] = useState<
    { changed: ChangeItem[] } | undefined
  >();
  useEffect(() => {
    if (!displayChanges) return;

    const fetchChanges = async () => {
      const fetchedDiffData: { changed: ChangeItem[] } =
        await getChangeReviewData(versionId);

      setChangesData(fetchedDiffData);
    };
    fetchChanges();
  }, [versionId, displayChanges]);

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
      <div className="pb-5">
        {displayChanges && changesData && (
          <ReviewChanges
            changes={changesData.changed}
            registrationPurpose={registrationPurpose}
          />
        )}
        {displayChanges && !changesData && <Loading />}
        {!displayChanges && (
          <AlertNote alertType="ALERT">
            The system cannot currently display changes for operations with more
            than 20 facilities, please refer to the final review page to confirm
            the submitted data.
          </AlertNote>
        )}
      </div>
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
