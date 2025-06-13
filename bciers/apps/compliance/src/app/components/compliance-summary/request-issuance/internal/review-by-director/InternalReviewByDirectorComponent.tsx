"use client";

import FormBase from "@bciers/components/form/FormBase";
import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import {
  internalReviewByDirectorSchema,
  internalReviewByDirectorUiSchema,
} from "@/compliance/src/app/data/jsonSchema/requestIssuance/internal/internalReviewByDirectorSchema";
import { useState } from "react";
import { IChangeEvent } from "@rjsf/core";
import SimpleModal from "@bciers/components/modal/SimpleModal";
import { DirectorReviewData } from "@/compliance/src/app/types";

interface Props {
  formData: DirectorReviewData;
  complianceSummaryId: string;
}

const InternalReviewByDirectorComponent = ({
  formData,
  complianceSummaryId,
}: Props) => {
  const backUrl = `/compliance-summaries/${complianceSummaryId}/review-credits-issuance-request`;
  // const saveAndContinueUrl = `/compliance-summaries/${complianceSummaryId}`;
  // const router = useRouter();

  const [modalOpen, setModalOpen] = useState(false);
  const [formState, setFormState] = useState(formData);

  const handleFormChange = (e: IChangeEvent) => {
    setFormState(e.formData);
  };

  const handleApprove = async () => {
    try {
      if (formState?.analyst_recommendation === "require_changes") {
        return;
      }

      // TBD: API integration for approval submission
      // await submitDirectorDecision(complianceSummaryId, updatedFormData, "approved");

      // router.push(saveAndContinueUrl);
    } catch (error) {
      throw new Error(`Error approving request: ${error}`);
    }
  };

  const handleDecline = async () => {
    try {
      if (formState?.analyst_recommendation === "require_changes") {
        return;
      }

      // TBD: API integration for decline submission
      // await submitDirectorDecision(complianceSummaryId, updatedFormData, "declined");

      // router.push(saveAndContinueUrl);
    } catch (error) {
      throw new Error(`Error declining request: ${error}`);
    }
  };

  return (
    <>
      <SimpleModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onConfirm={() => setModalOpen(false)}
        title="Annual Emissions Report"
      >
        Annual Emissions Report
      </SimpleModal>
      <FormBase
        schema={internalReviewByDirectorSchema()}
        uiSchema={internalReviewByDirectorUiSchema}
        formData={formState}
        onChange={handleFormChange}
        formContext={{
          creditsIssuanceRequestData: formState,
          openModal: () => setModalOpen(true),
        }}
        className="w-full"
      >
        <ComplianceStepButtons
          onMiddleButtonClick={handleDecline}
          onContinueClick={handleApprove}
          backUrl={backUrl}
          middleButtonText="Decline"
          continueButtonText="Approve"
          middleButtonDisabled={
            formState?.analyst_recommendation === "require_changes"
          }
          submitButtonDisabled={
            formState?.analyst_recommendation === "require_changes"
          }
        />
      </FormBase>
    </>
  );
};

export default InternalReviewByDirectorComponent;
