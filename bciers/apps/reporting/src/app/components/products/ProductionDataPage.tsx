import ProductionDataForm from "@reporting/src/app/components/products/ProductionDataForm";
import { buildProductionDataSchema, buildProductionDataUiSchema } from "@reporting/src/data/jsonSchema/productionData";
import { getProductionData } from "@bciers/actions/api";
import { getOrderedActivities } from "@reporting/src/app/utils/getOrderedActivities";
import { HasFacilityId } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getReportInformationTasklist } from "@reporting/src/app/utils/getReportInformationTaskListData";
import { getNavigationInformation } from "../taskList/navigationInformation";
import { HeaderStep, ReportingPage } from "../taskList/types";
import { getOverlappingIndustrialProcessEmissions } from "@reporting/src/app/utils/getOverlappingIndProcessEmissions";
import { getFacilityReportDetails } from "../../utils/getFacilityReportDetails";
import { getReviewOperationInformationPageData } from "@reporting/src/app/utils/getReportOperationData";

export default async function ProductionDataPage({
  version_id,
  facility_id,
}: HasFacilityId) {
  const response = await getProductionData(version_id, facility_id);
  const reportOperation = await getReviewOperationInformationPageData(version_id);
  console.log(reportOperation.operation_opted_out_detail)
  const isOptedOut = reportOperation.operation_opted_out_detail !== undefined
  console.log("isOptedOut ", isOptedOut)
  

  const allowedProductNames = response.payload.allowed_products.map(
    (p) => p.name,
  );
  const allowedProducts = response.payload.allowed_products.map((p) => ({
    product_id: p.id,
    product_name: p.name,
    unit: p.unit,
  }));

  const facilityType = response.facility_data.facility_type;

  const schema: any = buildProductionDataSchema(
    response.report_data.reporting_year,
    "Jan 1",
    "Dec 31",
    allowedProductNames,
    facilityType,
    isOptedOut
  );

  const tasklistData = await getReportInformationTasklist(
    version_id,
    facility_id,
  );

  const orderedActivities = await getOrderedActivities(version_id, facility_id);

  // These values are used when reporting the pulp & paper activity
  let isPulpAndPaper = false;
  let overlappingIndustrialProcessEmissions = 0; // emissions that are categorized as both industrial_process and excluded (ie: woody biomass)
  if (
    orderedActivities.find(
      (activity: { id: number; name: string; slug: string }) =>
        (activity.slug = "pulp_and_paper"),
    )
  ) {
    isPulpAndPaper = true;
    overlappingIndustrialProcessEmissions =
      await getOverlappingIndustrialProcessEmissions(version_id, facility_id);
  }

  const navInfo = await getNavigationInformation(
    HeaderStep.ReportInformation,
    ReportingPage.ProductionData,
    version_id,
    facility_id,
    {
      orderedActivities: orderedActivities,
      facilityName: tasklistData?.facilityName,
    },
  );

  const reportingYear = response.report_data.reporting_year

  return (
    <ProductionDataForm
      report_version_id={version_id}
      facility_id={facility_id}
      facilityType={facilityType}
      reportingYear={reportingYear}
      allowedProducts={allowedProducts}
      initialData={response.payload.report_products}
      schema={schema}
      navigationInformation={navInfo}
      isPulpAndPaper={isPulpAndPaper}
      overlappingIndustrialProcessEmissions={
        overlappingIndustrialProcessEmissions
      }
      isOptedOut={isOptedOut}
    />
  );
}
