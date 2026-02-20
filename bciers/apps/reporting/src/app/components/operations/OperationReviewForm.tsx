"use client";

import React, { useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import SimpleModal from "@bciers/components/modal/SimpleModal";
import { RJSFSchema } from "@rjsf/utils";
import {
  buildOperationReviewSchema,
  buildOperationReviewUiSchema,
} from "@reporting/src/data/jsonSchema/operations";
import { actionHandler } from "@bciers/actions";
import { useRouter } from "next/navigation";
import {
  HeaderStep,
  NavigationInformation,
  ReportingPage,
} from "../taskList/types";
import { SyncFacilitiesButton } from "@reporting/src/data/jsonSchema/reviewFacilities/reviewFacilitiesInfoText";
import SnackBar from "@bciers/components/form/components/SnackBar";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import { getUpdatedReportOperationDetails } from "@reporting/src/app/utils/getUpdatedReportOperationDetails";
import { operationRepresentativeLink } from "@reporting/src/data/jsonSchema/reviewOperationInformationText";
import {
  Activity,
  RegulatedProduct,
  ReportOperationRepresentative,
} from "./types";

interface Props {
  formData: any;
  version_id: number;
  schema: RJSFSchema;
  navigationInformation: NavigationInformation;
  reportType: string;
  reportingYear: number;
  allActivities: Activity[];
  allRegulatedProducts: RegulatedProduct[];
  allRepresentatives: ReportOperationRepresentative[];
  facilityId: string;
  isSyncAllowed: boolean;
  activitiesWithData: number[];
}

export default function OperationReviewForm({
  formData,
  version_id,
  schema,
  navigationInformation,
  reportType,
  reportingYear,
  allActivities,
  allRegulatedProducts,
  allRepresentatives,
  facilityId,
  isSyncAllowed,
  activitiesWithData,
}: Props) {
  type ModalConfig = {
    title: string;
    confirmText: string;
    content: React.ReactNode;
    onConfirm: () => void;
    onCancel: () => void;
  };

  const [activeModal, setActiveModal] = useState<ModalConfig | undefined>();

  const closeModal = () => setActiveModal(undefined);
  const [formDataState, setFormDataState] = useState<any>(formData);
  const [pageSchema, setPageSchema] = useState(schema);
  const [hasReps, setHasReps] = useState(allRepresentatives.length > 0);

  const missingOperationRepresentativeError = operationRepresentativeLink(
    formData.operation_id,
    formData.operation_name,
  );

  const [errors, setErrors] = useState<
    (string | React.ReactNode)[] | undefined
  >(hasReps ? undefined : [missingOperationRepresentativeError]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [navigationInfo, setNavigationInfo] = useState(navigationInformation);

  const router = useRouter();

  const saveHandler = async () => {
    const method = "POST";
    const endpoint = `reporting/report-version/${version_id}/report-operation`;
    const response = await actionHandler(endpoint, method, "", {
      body: JSON.stringify(formDataState),
    });

    if (response?.error) {
      setErrors([response?.error]);
      return false;
    }
    setErrors(undefined);
    return true;
  };

  const onChangeHandler = (data: { formData: any }) => {
    const updatedFormData = data.formData;

    if (
      updatedFormData?.operation_report_type !== undefined &&
      updatedFormData?.operation_report_type !==
        formDataState?.operation_report_type
    ) {
      setActiveModal({
        title: "Confirmation",
        confirmText: "Change report type",
        content: (
          <>
            Are you sure you want to change your report type to{" "}
            <strong>{updatedFormData.operation_report_type}</strong>? If you
            proceed, all of the form data you have entered will be lost.
          </>
        ),
        onConfirm: async () => {
          const response = await actionHandler(
            `reporting/report-version/${version_id}/change-report-type`,
            "POST",
            "",
            {
              body: JSON.stringify({
                report_type: updatedFormData.operation_report_type,
              }),
            },
          );
          if (response && !response.error) {
            router.push(`/reports/${response}/review-operation-information`);
          } else {
            setApiError("Failed to change the report type. Please try again.");
          }
          closeModal();
        },
        onCancel: () => {
          setFormDataState(formData);
          setApiError(null);
          closeModal();
        },
      });
      return;
    }

    // Detect deselected activities
    const previousActivities: number[] = formDataState?.activities ?? [];
    const updatedActivities: number[] = updatedFormData?.activities ?? [];

    const deselectedActivities = previousActivities.filter(
      (id) => !updatedActivities.includes(id),
    );

    if (deselectedActivities.length > 0) {
      const deselectedWithData = deselectedActivities.find((id) =>
        (activitiesWithData ?? []).includes(id),
      );

      if (deselectedWithData !== undefined) {
        const previousState = formDataState;
        setActiveModal({
          title: "Confirmation",
          confirmText: "Remove Activity",
          content:
            "Are you sure you want to remove this activity? If you proceed, all of the form data you have entered will be lost.",
          onConfirm: () => {
            setFormDataState(updatedFormData);
            closeModal();
          },
          onCancel: () => {
            setFormDataState({ ...previousState });
            closeModal();
          },
        });
        return;
      }
    }

    setFormDataState(updatedFormData);
  };

  const handleSync = async () => {
    const newData = await getUpdatedReportOperationDetails(version_id);
    if (newData.error) {
      setErrors(["Unable to sync data"]);
      return;
    }
    setPageSchema(
      buildOperationReviewSchema(
        newData,
        reportingYear,
        allActivities,
        allRegulatedProducts,
        newData.all_representatives,
        reportType,
        newData.show_regulated_products,
        newData.show_boro_id,
        newData.show_activities,
        isSyncAllowed,
      ),
    );
    setNavigationInfo(
      await getNavigationInformation(
        HeaderStep.OperationInformation,
        ReportingPage.ReviewOperationInfo,
        version_id,
        facilityId,
      ),
    );
    setFormDataState(newData.report_operation);

    const reps = newData.all_representatives || [];
    setHasReps(reps.length > 0);
    if (reps.length === 0) {
      setErrors([missingOperationRepresentativeError]);
    } else {
      setErrors(undefined);
      setIsSnackbarOpen(true);
    }
  };

  const uiSchema = buildOperationReviewUiSchema(
    formData.operation_id,
    formData.operation_name,
  );

  // Regulated product IDs 16 and 43 are the Pulp and paper: chemical pulp
  // and Pulp and paper: lime recovered by kiln, respectively
  const selectedProductIds: number[] = formDataState.regulated_products;
  const displayPulpAndPaperHelpText =
    (selectedProductIds.includes(16) && !selectedProductIds.includes(43)) ||
    (!selectedProductIds.includes(16) && selectedProductIds.includes(43));

  return (
    <>
      <SimpleModal
        title={activeModal?.title ?? ""}
        open={activeModal !== undefined}
        onCancel={activeModal?.onCancel ?? closeModal}
        onConfirm={activeModal?.onConfirm ?? closeModal}
        confirmText={activeModal?.confirmText}
      >
        {apiError ? (
          <div style={{ color: "red" }}>{apiError}</div>
        ) : (
          activeModal?.content
        )}
      </SimpleModal>
      <MultiStepFormWithTaskList
        initialStep={navigationInfo.headerStepIndex}
        steps={navigationInfo.headerSteps}
        taskListElements={navigationInfo.taskList}
        schema={pageSchema}
        uiSchema={{
          ...uiSchema,
          ...(isSyncAllowed && {
            sync_button: {
              ...uiSchema.sync_button,
              "ui:FieldTemplate": SyncFacilitiesButton,
              "ui:options": {
                onSync: handleSync,
              },
            },
          }),
          ...(displayPulpAndPaperHelpText && {
            regulated_products: {
              ...uiSchema.regulated_products,
              "ui:help": `If this is a chemical pulp mill that recovered lime by kiln,
                select both 'Pulp and paper: chemical pulp' and 'Pulp and paper: lime recovered by kiln'`,
            },
          }),
        }}
        formData={formDataState}
        saveButtonDisabled={!hasReps}
        submitButtonDisabled={!hasReps}
        onSubmit={saveHandler}
        onChange={onChangeHandler as (data: object) => void}
        backUrl={navigationInfo.backUrl}
        continueUrl={navigationInfo.continueUrl}
        errors={errors}
        backButtonText={"Back to All Reports"}
      />
      <SnackBar
        isSnackbarOpen={isSnackbarOpen}
        message="Changes synced successfully"
        setIsSnackbarOpen={setIsSnackbarOpen}
      />
    </>
  );
}
