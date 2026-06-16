"use client";
import { useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import {
  buildReviewFacilitiesSchema,
  buildReviewFacilitiesUiSchema,
} from "@reporting/src/data/jsonSchema/reviewFacilities/reviewFacilities";
import { actionHandler } from "@bciers/actions";
import SimpleModal from "@bciers/components/modal/SimpleModal";
import { getOperationFacilitiesList } from "@reporting/src/app/utils/getOperationFacilitiesList";
import { useRouter } from "next/navigation";
import { NavigationInformation } from "../../taskList/types";
import SnackBar from "@bciers/components/form/components/SnackBar";
import { handleApiResponse } from "@reporting/src/app/utils/handleApiResponse";
import { useFormErrors } from "@reporting/src/hooks/useFormErrors";
import { createGenericReportValidationError } from "@reporting/src/app/components/shared/validation/utils";

interface Props {
  initialData: any;
  version_id: number;
  navigationInformation: NavigationInformation;
  isSyncAllowed?: boolean;
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
  isSyncAllowed = true,
}: Props) {
  const [formData, setFormData] = useState(() => ({ ...initialData }));
  const [facilitiesData, setFacilitiesData] = useState(() => ({
    ...initialData,
  }));
  const { setErrors, renderedErrors } = useFormErrors();
  const [modalOpen, setModalOpen] = useState(false);
  const [submittingDisabled, setSubmittingDisabled] = useState(false);
  const [deselectedFacilities, setDeselectedFacilities] = useState<string[]>(
    [],
  );
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [continueAfterSubmit, setContinueAfterSubmit] =
    useState<boolean>(false);
  const [schema, setSchema] = useState<any>(
    buildReviewFacilitiesSchema(
      initialData.current_facilities,
      initialData.past_facilities,
      isSyncAllowed,
    ),
  );

  const uiSchema: any = buildReviewFacilitiesUiSchema(initialData.operation_id);
  const router = useRouter();

  const getFacilityIdsForSubmission = (data: SubmissionData) => {
    const facilityIds: string[] = [];

    const findFacilityId = (name: string, facilities: Facility[]) => {
      const facility = facilities?.find((fac) => fac.facility__name === name);
      return facility ? facility.facility_id : null;
    };

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
      setErrors([
        createGenericReportValidationError("No facilities selected."),
      ]);
      setSubmittingDisabled(true);
      return;
    }

    setErrors(undefined);
    setSubmittingDisabled(false);
  };

  const submit = async (data: any) => {
    const response = await actionHandler(
      `reporting/report-version/${version_id}/review-facilities`,
      "POST",
      `reporting/reports/${version_id}/review-facilities`,
      {
        body: JSON.stringify(
          getFacilityIdsForSubmission(data.formData ? data.formData : formData),
        ),
      },
    );

    const isValid = handleApiResponse(response, setErrors);

    if (!isValid) {
      return false;
    }

    if (continueAfterSubmit) {
      router.push(navigationInformation.continueUrl);
    }

    return true;
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

    if (deselected.length > 0) {
      setContinueAfterSubmit(navigateAfterSubmit);
      return handleModalOpen();
    }

    return submit(data);
  };

  const handleSync = async () => {
    const newData = await getOperationFacilitiesList(version_id);
    setSchema(
      buildReviewFacilitiesSchema(
        newData.current_facilities,
        newData.past_facilities,
        isSyncAllowed,
      ),
    );
    setFacilitiesData(newData);
    setIsSnackbarOpen(true);
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
          Any data entered for this facility in this report will be removed.
          Previously submitted reports will not be affected.
        </p>
      </SimpleModal>
      <MultiStepFormWithTaskList
        formData={formData}
        schema={schema}
        uiSchema={{
          ...uiSchema,
          ...(isSyncAllowed && {
            sync_button: {
              ...uiSchema.sync_button,
              "ui:options": {
                onSync: handleSync,
              },
            },
          }),
        }}
        taskListElements={navigationInformation.taskList}
        steps={navigationInformation.headerSteps}
        errors={renderedErrors}
        continueUrl={navigationInformation.continueUrl}
        initialStep={navigationInformation.headerStepIndex}
        onChange={handleChange}
        onSubmit={async (data, navigateAfterSubmit) =>
          handleSubmit(data, navigateAfterSubmit)
        }
        backUrl={navigationInformation.backUrl}
        saveButtonDisabled={submittingDisabled}
        submitButtonDisabled={submittingDisabled}
      />
      <SnackBar
        isSnackbarOpen={isSnackbarOpen}
        message="Changes synced successfully"
        setIsSnackbarOpen={setIsSnackbarOpen}
      />
    </>
  );
}
