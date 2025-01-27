import { UUID } from "crypto";
import { validate as isValidUUID } from "uuid";
import {
  FacilityInformationPage,
  NewEntrantOperationPage,
  OperationInformationPage,
  OperationRepresentativePage,
  RegistrationSubmissionPage,
  OptedInOperationPage,
} from "@/registration/app/components/operations/registration";
import {
  OperationRegistrationSteps,
  RegistrationPurposes,
  initialOperationRegistrationSteps,
} from "@/registration/app/components/operations/registration/enums";
import { getOperationV2 } from "@bciers/actions/api";
import { FacilitiesSearchParams } from "@/administration/app/components/facilities/types";

const OperationRegistrationPage = async ({
  step,
  operation,
  searchParams,
}: {
  step: number;
  operation: UUID;
  searchParams: FacilitiesSearchParams;
}) => {
  let operationData;
  let steps = [...initialOperationRegistrationSteps];
  if (operation && isValidUUID(operation)) {
    operationData = await getOperationV2(operation);
    const purpose = operationData?.registration_purpose;
    if (
      // Note: the purposes have slightly different names than the step names
      purpose === RegistrationPurposes.OPTED_IN_OPERATION
    ) {
      steps.splice(2, 0, OperationRegistrationSteps.OPT_IN_APPLICATION);
    }
    if (purpose === RegistrationPurposes.NEW_ENTRANT_OPERATION)
      steps.splice(2, 0, OperationRegistrationSteps.NEW_ENTRANT_APPLICATION);
    if (purpose === RegistrationPurposes.ELECTRICITY_IMPORT_OPERATION) {
      steps.splice(1, 1);
    }
  } else {
    steps = [...initialOperationRegistrationSteps];
  }

  const stepIndex = step - 1;
  const formSectionName = steps[stepIndex];

  const defaultProps = {
    operation,
    step,
    steps,
  };
  switch (formSectionName) {
    case "Operation Information":
      return OperationInformationPage(defaultProps);
    case "Facility Information":
      return FacilityInformationPage({
        ...defaultProps,
        searchParams,
        operationName: operationData?.name,
        operationType: operationData?.type,
      });
    case "Opt-in Application":
      return OptedInOperationPage(defaultProps);
    case "New Entrant Application":
      return NewEntrantOperationPage({
        ...defaultProps,
      });
    case "Operation Representative":
      return OperationRepresentativePage(defaultProps);
    case "Submission":
      return RegistrationSubmissionPage(defaultProps);
  }
};

export default OperationRegistrationPage;
