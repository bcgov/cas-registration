export enum OperationRegistrationSteps {
  OPERATION_INFORMATION = "Operation Information",
  FACILITY_INFORMATION = "Facility Information",
  NEW_ENTRANT_APPLICATION = "New Entrant Application",
  OPT_IN_APPLICATION = "Opt-in Application",
  OPERATION_REPRESENTATIVE = "Operation Representative",
  SUBMISSION = "Submission",
}

export const allOperationRegistrationSteps: string[] = Object.values(
  OperationRegistrationSteps,
);
