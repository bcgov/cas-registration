type IsOperationOptedOutParams = {
  operationOptedOutFinalReportingYear?: number | null;
  reportingYear?: number | null;
};

export function isOperationOptedOut({
  operationOptedOutFinalReportingYear,
  reportingYear,
}: IsOperationOptedOutParams): boolean {
  if (operationOptedOutFinalReportingYear == null || reportingYear == null) {
    return false;
  }

  return operationOptedOutFinalReportingYear <= reportingYear;
}
