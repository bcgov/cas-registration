import { UUID } from "crypto";
import {
  FacilityInformationPage,
  NewEntrantOperationPage,
  OperationInformationPage,
  OperationRepresentativePage,
  RegistrationSubmissionPage,
} from "@/registration/app/components/operations/registration";
import { allOperationRegistrationSteps } from "@/registration/app/components/operations/registration/enums";

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
  // const purpose = operationFormData?.registration_purpose;
  // hardcoding a value for development; remove value and ts-ignores when feature is implemented
  const purpose = "Reporting Operation";

  // Remove steps that aren't applicable to the registration based on purpose
  let steps = allOperationRegistrationSteps;
  // @ts-ignore
  if (purpose !== "New Entrant Operation")
    steps = steps.filter((e) => e !== "New Entrant Application");
  // @ts-ignore
  if (purpose !== "Opted-in Operation")
    steps = steps.filter((e) => e !== "Opt-in Application");

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
        searchParams: searchParams,
      });
    case "New Entrant Operation":
      return NewEntrantOperationPage(defaultProps);
    // to add opt in page
    case "Operation Representative":
      return OperationRepresentativePage(defaultProps);
    case "Submission":
      return RegistrationSubmissionPage(defaultProps);
  }
};

export default OperationRegistrationPage;
