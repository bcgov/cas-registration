import { UUID } from "crypto";
import { validate as isValidUUID } from "uuid";
import {
  FacilityInformationPage,
  NewEntrantOperationPage,
  OperationInformationPage,
  OperationRepresentativePage,
  RegistrationPurposePage,
  RegistrationSubmissionPage,
} from "@/registration/app/components/operations/registration";
import { getOperation } from "@bciers/actions/api";
import {
  OperationRegistrationSteps,
  OperationRegistrationNewEntrantSteps,
} from "@/registration/app/components/operations/registration/enums";

import { FacilitiesSearchParams } from "@/administration/app/components/facilities/types";
import { OperationData } from "./types";

const OperationRegistrationPage = async ({
  step,
  operation,
  searchParams,
}: {
  step: number;
  operation: UUID | "create";
  searchParams: FacilitiesSearchParams;
}) => {
  let operationData: OperationData | undefined;

  if (operation && isValidUUID(operation)) {
    operationData = await getOperation(operation);
  }
  // const isNewEntrantOperation = operationFormData?.type === "New Entrant Operation";
  const isNewEntrantOperation = true;

  // New entrant operations have an additional page
  const steps = isNewEntrantOperation
    ? OperationRegistrationNewEntrantSteps
    : OperationRegistrationSteps;
  const stepIndex = step - 1;
  const formSectionName = steps[stepIndex];

  const defaultProps = {
    operation,
    step,
    steps,
  };

  switch (formSectionName) {
    case "Registration Purpose":
      return RegistrationPurposePage(defaultProps);
    case "Operation Information":
      return OperationInformationPage(defaultProps);
    case "Facility Information":
      return FacilityInformationPage({
        ...defaultProps,
        searchParams,
        operationData,
      });
    case "New Entrant Operation":
      return NewEntrantOperationPage(defaultProps);
    case "Operation Representative":
      return OperationRepresentativePage(defaultProps);
    case "Submission":
      return RegistrationSubmissionPage(defaultProps);
  }
};

export default OperationRegistrationPage;
