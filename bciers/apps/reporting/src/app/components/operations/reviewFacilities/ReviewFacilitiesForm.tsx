"use client";

import React, { useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";

import {
  buildReviewFacilitiesSchema,
  buildReviewFacilitiesUiSchema,
} from "@reporting/src/data/jsonSchema/reviewFacilities/reviewFacilities";
import { actionHandler } from "@bciers/actions";
import {
  getOperationInformationTaskList,
  ActivePage,
} from "@reporting/src/app/components/taskList/1_operationInformation";
import { multiStepHeaderSteps } from "@reporting/src/app/components/taskList/multiStepHeaderConfig";
import SimpleModal from "@bciers/components/modal/SimpleModal";

interface Props {
  initialData: any;
  version_id: number;
}

export default function LFOFacilitiesForm({ initialData, version_id }: Props) {
  const [formData, setFormData] = useState(() => ({ ...initialData }));
  const [errors, setErrors] = useState<string[] | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmedToChange, setConfirmedToChange] = useState(true);
  const saveAndContinueUrl = `/reports/${version_id}/report-information`;
  const backUrl = `/reports/${version_id}/person-responsible`;

  const schema: any = buildReviewFacilitiesSchema(
    initialData.current_facilities,
    initialData.past_facilities,
  );
  const uiSchema: any = buildReviewFacilitiesUiSchema(initialData.operation_id);

  const taskListElements = getOperationInformationTaskList(
    version_id,
    ActivePage.ReviewFacilities,
    "Linear Facility Operation",
  );

  const checkIfFacilityReportWillBeDeleted = () => {
    if (
      !formData ||
      !formData.current_facilities_section ||
      !formData.current_facilities_section.current_facilities
    ) {
      console.log("NO FORM DATA");
      return null;
    }

    const presentFacilities =
      formData.current_facilities_section.current_facilities.concat(
        formData.past_facilities_section.past_facilities,
      );
    const previousFacilities = formData.current_facilities.concat(
      initialData.past_facilities,
    );
    // first check if a facility has been deselected
    if (presentFacilities.length >= previousFacilities.length) {
      console.log("NO FACILITY DESELECTED");
      return null;
    }

    const deselectedFacilities = previousFacilities.filter(
      (facility: any) => !presentFacilities.includes(facility),
    );
    console.log("***********deselectedFacilities", deselectedFacilities);
    return deselectedFacilities;
  };

  const handleChange = (e: any) => {
    console.log("*******handleChange event", e);
    checkIfFacilityReportWillBeDeleted();
    setModalOpen(true);

    setFormData({ ...e.formData });
  };

  const handleModalCancel = () => {
    setConfirmedToChange(false);
    setModalOpen(false);
  };

  const handleModalConfirm = () => {
    setConfirmedToChange(true);
    setModalOpen(false);
    //setFormData({ ...formData });
  };

  const handleSubmit = async (data: any) => {
    const endpoint = `reporting/report-version/${version_id}/review-facilities`;
    const method = "POST";

    try {
      const response = await actionHandler(endpoint, method, endpoint, {
        body: JSON.stringify(data),
      });

      if (response?.error) {
        setErrors([response.error]);
        return false;
      }

      setErrors(undefined);
      return true;
    } catch (err) {
      setErrors(["An unexpected error occurred."]);
      return false;
    }
  };

  return (
    <>
      <SimpleModal
        title="Confirmation"
        open={modalOpen}
        onCancel={handleModalCancel}
        onConfirm={handleModalConfirm}
        confirmText="Deselect Facility"
      >
        <p>
          This facility has an existing report. Deselecting this facility will
          delete this facility&apos;s report on Save. Are you sure you want to
          deselect?
        </p>
      </SimpleModal>
      <MultiStepFormWithTaskList
        formData={formData}
        schema={schema}
        uiSchema={uiSchema}
        taskListElements={taskListElements}
        steps={multiStepHeaderSteps}
        errors={errors}
        continueUrl={saveAndContinueUrl}
        initialStep={1}
        onChange={handleChange}
        onSubmit={handleSubmit}
        backUrl={backUrl}
      />
    </>
  );
}
