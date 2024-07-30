import { UUID } from "crypto";
import {
  FacilityInformationPage,
  NewEntrantOperationPage,
  OperationInformationPage,
  OperationRepresentativePage,
  RegistrationPurposePage,
  RegistrationSubmissionPage,
} from "@/registration/app/components/operations/registration";
import {
  OperationRegistrationSteps,
  OperationRegistrationNewEntrantSteps,
} from "@/registration/app/components/operations/registration/enums";

import { FacilitiesSearchParams } from "@/administration/app/components/facilities/types";

const OperationRegistrationPage = async ({
  formSection,
  operation,
  searchParams,
}: {
  formSection: number;
  operation: UUID | "create";
  searchParams: FacilitiesSearchParams;
}) => {
  // const isNewEntrantOperation = operationFormData?.is_new_entrant_operation;
  const isNewEntrantOperation = true;

  // New entrant operations have an additional page
  const steps = isNewEntrantOperation
    ? OperationRegistrationNewEntrantSteps
    : OperationRegistrationSteps;
  const formSectionName = steps[formSection - 1];

  switch (formSectionName) {
    case "Registration Purpose":
      return (
        <RegistrationPurposePage
          operation={operation}
          step={formSection}
          steps={steps}
        />
      );
    case "Operation Information":
      return (
        <OperationInformationPage
          operation={operation}
          step={formSection}
          steps={steps}
        />
      );
    case "Facility Information":
      return (
        <FacilityInformationPage
          operation={operation}
          searchParams={searchParams}
          step={formSection}
          steps={steps}
        />
      );
    case "New Entrant Operation":
      return (
        <NewEntrantOperationPage
          operation={operation}
          step={formSection}
          steps={steps}
        />
      );
    case "Operation Representative":
      return (
        <OperationRepresentativePage
          operation={operation}
          step={formSection}
          steps={steps}
        />
      );
    case "Submission":
      return (
        <RegistrationSubmissionPage
          operation={operation}
          step={formSection}
          steps={steps}
        />
      );
  }
};

export default OperationRegistrationPage;
