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

interface SubmissionData {
  current_facilities_section: {
    current_facilities: string[];
  };
  past_facilities_section: {
    past_facilities: string[];
  };
}

interface Facility {
  facility_id: string;
  facility__name: string;
  is_selected: boolean;
}

export default function LFOFacilitiesForm({ initialData, version_id }: Props) {
  const [formData, setFormData] = useState(() => ({ ...initialData }));
  const [errors, setErrors] = useState<string[] | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [deselectedFacilities, setDeselectedFacilities] = useState<string[]>(
    [],
  );
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

  // takes the form data and returns an array of facility_ids that are being selected. uses the intial form data as source of id-name mapping
  const getFacilityIdsForSubmission = (data: SubmissionData) => {
    const facilityIds: string[] = [];

    // Helper function to find facility_id by facility__name
    const findFacilityId = (name: string, facilities: Facility[]) => {
      const facility = facilities.find(
        (fac: any) => fac.facility__name === name,
      );
      return facility ? facility.facility_id : null;
    };

    // Get current facilities
    data.current_facilities_section.current_facilities.forEach(
      (name: string) => {
        const facilityId = findFacilityId(name, initialData.current_facilities);
        if (facilityId) {
          facilityIds.push(facilityId);
        }
      },
    );

    // Get past facilities
    data.past_facilities_section.past_facilities.forEach((name: string) => {
      const facilityId = findFacilityId(name, initialData.past_facilities);
      if (facilityId) {
        facilityIds.push(facilityId);
      }
    });

    return facilityIds;
  };

  // returns an array of facility names that were previously selected but are not currently selected
  const getListOfRemovedFacilities = () => {
    // get the array of currently selected facilities
    const selectedFacilities =
      formData.current_facilities_section.current_facilities.concat(
        formData.past_facilities_section.past_facilities,
      );
    // get the array of initially selected facilities
    const previouslySelectedFacilities = initialData.current_facilities
      .filter((curr_facility: Facility) => curr_facility.is_selected) // filter out the unselected facilities
      .map((curr_facility: Facility) => curr_facility.facility__name) // flatten the array to just the facility names
      .concat(
        // join the current and past facilities
        initialData.past_facilities
          .filter((past_facility: Facility) => past_facility.is_selected)
          .map((past_facility: Facility) => past_facility.facility__name),
      );
    // return the facilities that were previously selected but are not currently selected
    return previouslySelectedFacilities.filter(
      (facility: any) => !selectedFacilities.includes(facility),
    );
  };

  const handleChange = (e: any) => {
    setFormData({ ...e.formData });
  };

  const submit = async (data: any) => {
    const endpoint = `reporting/report-version/${version_id}/review-facilities`;
    const method = "POST";

    try {
      const response = await actionHandler(endpoint, method, endpoint, {
        body: JSON.stringify(
          getFacilityIdsForSubmission(data.formData ? data.formData : formData),
        ),
      });

      if (response?.error) {
        setErrors([response.error]);
        return false;
      }

      setErrors(undefined);
      return true;
    } catch (err) {
      console.error("Error submitting review facilities form: ", err);
      setErrors(["An unexpected error occurred."]);
      return false;
    }
  };

  const handleModalOpen = async () => {
    setModalOpen(true);
    return false;
  };

  const handleModalCancel = () => {
    setModalOpen(false);
  };

  const handleModalConfirm = () => {
    setModalOpen(false);
    submit(formData);
  };

  const handleSubmit = async (data: any) => {
    const deselected = getListOfRemovedFacilities();
    setDeselectedFacilities(deselected);

    // if there are deselected facilities, open the confrimation modal
    if (deselected.length > 0) {
      return handleModalOpen();
    } else {
      return submit(data);
    }
  };

  return (
    <>
      <SimpleModal
        title="Confirmation"
        open={modalOpen}
        onCancel={handleModalCancel}
        onConfirm={handleModalConfirm}
        confirmText="Continue"
        textComponentType="div"
      >
        <p>You have deselected the following facilities.</p>
        <ul>
          {deselectedFacilities.map((facility: any) => (
            <li key={facility}>{facility}</li>
          ))}
        </ul>
        <p>
          If any of these faclities have an existing report, saving will delete
          the facility{"'"}s report and any data previously entered will be
          lost.
          <br />
          Click <b>Cancel</b> to go back without saving the changes, or{" "}
          <b>Continue</b> to proceed.
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
        initialStep={0}
        onChange={handleChange}
        onSubmit={async (data) => handleSubmit(data)}
        backUrl={backUrl}
      />
    </>
  );
}
