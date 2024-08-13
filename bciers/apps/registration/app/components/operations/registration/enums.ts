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

export enum RegistrationPurposes {
  REPORTING_OPERATION = "Reporting Operation",
  OBPS_REGULATED_OPERATION = "OBPS Regulated Operation",
  OPTED_IN_OPERATION = "Opted-in Operation",
  NEW_ENTRANT_OPERATION = "New Entrant Operation",
  ELECTRICITY_IMPORT_OPERATION = "Electricity Import Operation",
  POTENTIAL_REPORTING_OPERATION = "Potential Reporting Operation",
}
