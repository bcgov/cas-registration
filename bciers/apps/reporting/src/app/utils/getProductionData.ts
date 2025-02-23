import { actionHandler } from "@bciers/actions";
import { Product, ProductData } from "@bciers/types/form/productionData";

export async function getProductionData(
  reportVersionId: number,
  facilityId: string,
): Promise<{
  report_products: ProductData[];
  allowed_products: Product[];
}> {
  const endpoint = `reporting/report-version/${reportVersionId}/facilities/${facilityId}/production-data`;
  const response = await actionHandler(endpoint, "GET");

  if (response.error) {
    throw new Error(
      `Failed to fetch the production data for report version ${reportVersionId}, facility ${facilityId}.\n` +
        "Please check if the provided ID(s) are correct and try again.",
    );
  }

  return {
    report_products: response.report_products,
    allowed_products: response.allowed_products,
  };
}
