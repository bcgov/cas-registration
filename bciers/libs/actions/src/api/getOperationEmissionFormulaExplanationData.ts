import { actionHandler } from "@bciers/actions";

async function getOperationEmissionFormulaExplanationData(versionId: number) {
  const response = await actionHandler(
    `reporting/report-version/${versionId}/emission-summary/formula-explanation`,
    "GET",
  );
  return response;
}

export default getOperationEmissionFormulaExplanationData;