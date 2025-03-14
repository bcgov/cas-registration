import ProductionDataForm from "@reporting/src/app/components/products/ProductionDataForm";
import { buildProductionDataSchema } from "@reporting/src/data/jsonSchema/productionData";
import { getProductionData } from "@bciers/actions/api";
import { getOrderedActivities } from "@reporting/src/app/utils/getOrderedActivities";
import { HasFacilityId } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getReportInformationTasklist } from "@reporting/src/app/utils/getReportInformationTaskListData";
import { getNavigationInformation } from "../taskList/navigationInformation";
import { HeaderStep, ReportingPage } from "../taskList/types";

export default async function ProductionDataPage({
  version_id,
  facility_id,
}: HasFacilityId) {
  const response = await getProductionData(version_id, facility_id);

  const allowedProductNames = response.allowed_products.map((p) => p.name);
  const allowedProducts = response.allowed_products.map((p) => ({
    product_id: p.id,
    product_name: p.name,
    unit: p.unit,
  }));

  const schema: any = buildProductionDataSchema(
    "Jan 1",
    "Dec 31",
    allowedProductNames,
  );
  const tasklistData = await getReportInformationTasklist(
    version_id,
    facility_id,
  );

  const orderedActivities = await getOrderedActivities(version_id, facility_id);

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

  return (
    <ProductionDataForm
      report_version_id={version_id}
      facility_id={facility_id}
      allowedProducts={allowedProducts}
      initialData={response.report_products}
      schema={schema}
      navigationInformation={navInfo}
    />
  );
}
