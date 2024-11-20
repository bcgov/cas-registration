import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import NewEntrantInformationForm from "./NewEntrantInformationForm";
import { getNewEntrantData } from "@reporting/src/app/utils/getNewEntrantData";

// Define type for Product to ensure consistency
type Product = {
  id: string | number;
  name: string;
};

export default async function NewEntrantInformation({
  versionId,
}: {
  versionId: number;
}) {
  const newEntrantData = await getNewEntrantData(versionId);
  const emissions = newEntrantData.report_new_entrant_data.emissions;
  const initialFormData = newEntrantData.report_new_entrant_data;
  const regulatedProducts = newEntrantData.regulated_products;
  // Mapping over the products to transform data
  const transformedProducts = regulatedProducts?.map((product: Product) => {
    const selectedProduct = initialFormData.selected_products?.find(
      (selectedProductObj: { [key: string]: any }) =>
        selectedProductObj[product.id],
    );

    const productionAmount =
      selectedProduct?.[product.id]?.production_amount || "";

    return {
      id: product.id,
      name: product.name,
      production_amount: productionAmount,
    };
  });
  const dateOfAuthorization = initialFormData?.authorization_date || "";
  const dateOfFirstShipment = initialFormData?.first_shipment_date || "";
  const dateOfNewEntrantPeriod =
    initialFormData?.new_entrant_period_start || "";

  return (
    <Suspense fallback={<Loading />}>
      <NewEntrantInformationForm
        versionId={versionId}
        products={
          transformedProducts?.length ? transformedProducts : regulatedProducts
        }
        dateOfAuthorization={dateOfAuthorization}
        dateOfFirstShipment={dateOfFirstShipment}
        dateOfNewEntrantPeriod={dateOfNewEntrantPeriod}
        initialFormData={{
          ...initialFormData,
        }}
        emissions={emissions}
      />
    </Suspense>
  );
}
