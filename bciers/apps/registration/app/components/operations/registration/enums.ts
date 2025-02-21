export enum OperationRegistrationSteps {
  OPERATION_INFORMATION = "Operation Information",
  FACILITY_INFORMATION = "Facility Information",
  NEW_ENTRANT_APPLICATION = "New Entrant Application",
  OPT_IN_APPLICATION = "Opt-in Application",
  OPERATION_REPRESENTATIVE = "Operation Representative",
  SUBMISSION = "Submission",
}

export const initialOperationRegistrationSteps: string[] = [
  OperationRegistrationSteps.OPERATION_INFORMATION,
  OperationRegistrationSteps.FACILITY_INFORMATION,
  OperationRegistrationSteps.OPERATION_REPRESENTATIVE,
  OperationRegistrationSteps.SUBMISSION,
];

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

export const regulatedOperationPurposes: ReadonlyArray<RegistrationPurposes> = [
  RegistrationPurposes.OBPS_REGULATED_OPERATION,
  RegistrationPurposes.NEW_ENTRANT_OPERATION,
  RegistrationPurposes.OPTED_IN_OPERATION,
];

export const reportingOperationPurposes: ReadonlyArray<RegistrationPurposes> = [
  ...regulatedOperationPurposes,
  RegistrationPurposes.REPORTING_OPERATION,
  RegistrationPurposes.POTENTIAL_REPORTING_OPERATION,
];

export const RegistrationPurposeHelpText: {
  [key in RegistrationPurposes]: string;
} = {
  [RegistrationPurposes.REPORTING_OPERATION]:
    "A Reporting Operation is an industrial operation that emits greater than or equal to 10 000 tCO2e per year and must submit an emission report, but does not produce a regulated product.",
  [RegistrationPurposes.OBPS_REGULATED_OPERATION]:
    "An OBPS Regulated Operation is a type of reporting operation that produces a regulated product and emits greater than or equal to 10 000 tCO2e per year. This option should be selected if you are a registering as a mandatory participant in the B.C. OBPS.",
  [RegistrationPurposes.OPTED_IN_OPERATION]:
    "An Opted-in Operation is an industrial operation that produces a regulated product and emits less than 10,000 tCO2e per year. These operations may apply to voluntarily participate in the B.C. OBPS. This option should be selected if your operation has already been designated as an Opted-In Operation, OR if your operation is registering and applying to be an Opted-In Operation for the first time.",
  [RegistrationPurposes.NEW_ENTRANT_OPERATION]:
    "This option should be selected if you are registering and applying to be a New Entrant.",
  [RegistrationPurposes.ELECTRICITY_IMPORT_OPERATION]:
    "An Electricity Import Operation is an industrial operation that imports electricity from an electricity generating facility located outside British Columbia and is the first point of delivery in British Columbia.",
  [RegistrationPurposes.POTENTIAL_REPORTING_OPERATION]:
    "A Potential Reporting Operation is an industrial operation that did not submit an emission report for the previous year, but has forecast its emissions to be greater than or equal to 10 000 tCO2e for the current reporting period. Potential Reporting Operations must register, but do not need to submit an emission report unless they actually emit greater than or equal to 10 000 tCO2e in the current reporting period.",
};
