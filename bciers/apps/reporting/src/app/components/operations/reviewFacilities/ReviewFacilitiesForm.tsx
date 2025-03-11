"use client";
import React, { useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import {
  buildReviewFacilitiesSchema,
  buildReviewFacilitiesUiSchema,
} from "@reporting/src/data/jsonSchema/reviewFacilities/reviewFacilities";
import { actionHandler } from "@bciers/actions";
import { multiStepHeaderSteps } from "@reporting/src/app/components/taskList/multiStepHeaderConfig";
import SimpleModal from "@bciers/components/modal/SimpleModal";
import { getOperationFacilitiesList } from "@reporting/src/app/utils/getOperationFacilitiesList";
import { useRouter } from "next/navigation";
import { NavigationInformation } from "../../taskList/types";

interface Props {
  initialData: any;
  version_id: number;
  navigationInformation: NavigationInformation;
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

export default function LFOFacilitiesForm({
  initialData,
  version_id,
  navigationInformation,
}: Props) {
  const [formData, setFormData] = useState(() => ({ ...initialData }));
  const [facilitiesData, setFacilitiesData] = useState(() => ({
    // a store of the facilities data that can be updated without changing the form data
    ...initialData,
  }));
  const [errors, setErrors] = useState<string[] | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [submittingDisabled, setSubmittingDisabled] = useState(false);
  const [deselectedFacilities, setDeselectedFacilities] = useState<string[]>(
    [],
  );
  const [continueAfterSubmit, setContinueAfterSubmit] =
    useState<boolean>(false);
  const [schema, setSchema] = useState<any>(
    buildReviewFacilitiesSchema(
      initialData.current_facilities,
      initialData.past_facilities,
    ),
  );

  const uiSchema: any = buildReviewFacilitiesUiSchema(initialData.operation_id);
  const router = useRouter();

  // takes the form data and returns an array of facility_ids that are being selected. uses the intial form data as source of id-name mapping
  const getFacilityIdsForSubmission = (data: SubmissionData) => {
    const facilityIds: string[] = [];

    const findFacilityId = (name: string, facilities: Facility[]) => {
      const facility = facilities?.find((fac) => fac.facility__name === name);
      return facility ? facility.facility_id : null;
    };

    // Handle Current Facilities
    if (data.current_facilities_section?.current_facilities?.length) {
      data.current_facilities_section.current_facilities.forEach(
        (name: string) => {
          const facilityId = findFacilityId(
            name,
            facilitiesData.current_facilities || [],
          );
          if (facilityId) facilityIds.push(facilityId);
        },
      );
    }

    // Handle Past Facilities (Avoiding undefined errors)
    if (data.past_facilities_section?.past_facilities?.length) {
      data.past_facilities_section.past_facilities.forEach((name: string) => {
        const facilityId = findFacilityId(
          name,
          facilitiesData.past_facilities || [],
        );
        if (facilityId) facilityIds.push(facilityId);
      });
    }

    return facilityIds;
  };

  // returns an array of facility names that were previously selected but are not currently selected
  const getListOfRemovedFacilities = () => {
    const selectedFacilities = [
      ...(formData.current_facilities_section?.current_facilities || []),
      ...(formData.past_facilities_section?.past_facilities || []),
    ];

    const previouslySelectedFacilities = [
      ...(formData.current_facilities
        ?.filter((curr: Facility) => curr.is_selected)
        .map((curr: Facility) => curr.facility__name) || []),
      ...(formData.past_facilities
        ?.filter((past: Facility) => past.is_selected)
        .map((past: Facility) => past.facility__name) || []),
    ];

    return previouslySelectedFacilities.filter(
      (facility) => !selectedFacilities.includes(facility),
    );
  };

  const isAnyFacilitySelected = ({
    current_facilities_section,
    past_facilities_section,
  }: SubmissionData) =>
    current_facilities_section.current_facilities.length > 0 ||
    past_facilities_section?.past_facilities.length > 0;

  const handleChange = (e: any) => {
    setFormData({ ...e.formData });
    const anyFacilitySelected = isAnyFacilitySelected(e.formData);
    if (!anyFacilitySelected) {
      setErrors(["No facilities selected"]);
      setSubmittingDisabled(true);
    } else {
      setErrors(undefined);
      setSubmittingDisabled(false);
    }
  };

  const submit = async (data: any) => {
    const endpoint = `reporting/report-version/${version_id}/review-facilities`;
    const method = "POST";
    const pathToRevalidate = `reporting/reports/${version_id}/review-facilities`;
    try {
      const response = await actionHandler(endpoint, method, pathToRevalidate, {
        body: JSON.stringify(
          getFacilityIdsForSubmission(data.formData ? data.formData : formData),
        ),
      });

      if (response?.error) {
        setErrors([response.error]);
        return false;
      }

      setErrors(undefined);
      // this check uses a state variable because this function can be called by a modal which is disconnected from the child component that bubbles up this value
      if (continueAfterSubmit !== undefined && continueAfterSubmit) {
        router.push(navigationInformation.continueUrl);
      }
      return true;
    } catch (err) {
      setErrors(["An unexpected error occurred."]);
      return false;
    }
  };

  const handleModalOpen = async () => {
    setModalOpen(true);
    return false;
  };

  const handleModalCancel = () => {
    setContinueAfterSubmit(false);
    setModalOpen(false);
  };

  const handleModalConfirm = async () => {
    setModalOpen(false);
    submit(formData);
  };

  const handleSubmit = async (data: any, navigateAfterSubmit: boolean) => {
    const deselected = getListOfRemovedFacilities();
    setDeselectedFacilities(deselected);

    // if there are deselected facilities, open the confirmation modal
    if (deselected.length > 0) {
      setContinueAfterSubmit(navigateAfterSubmit);
      return handleModalOpen();
    } else {
      const response = await submit(data);
      return response;
    }
  };

  const handleSync = async () => {
    const newData = await getOperationFacilitiesList(version_id);
    setSchema(
      buildReviewFacilitiesSchema(
        newData.current_facilities,
        newData.past_facilities,
      ),
    );
    setFacilitiesData(newData);
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
        <p>You have deselected the following facilities:</p>
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
        uiSchema={{
          ...uiSchema,
          sync_button: {
            ...uiSchema.sync_button,
            "ui:options": {
              onSync: handleSync,
            },
          },
        }}
        taskListElements={navigationInformation.taskList}
        steps={multiStepHeaderSteps}
        errors={errors}
        continueUrl={navigationInformation.continueUrl}
        initialStep={0}
        onChange={handleChange}
        onSubmit={async (data, navigateAfterSubmit) =>
          handleSubmit(data, navigateAfterSubmit)
        }
        backUrl={navigationInformation.backUrl}
        saveButtonDisabled={submittingDisabled}
        submitButtonDisabled={submittingDisabled}
      />
    </>
  );
}
