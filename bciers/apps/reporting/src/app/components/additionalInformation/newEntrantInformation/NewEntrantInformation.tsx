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

  const {
    report_new_entrant_data: reportNewEntrantData = {},
    regulated_products: regulatedProducts,
  } = newEntrantData || {};
  const initialFormData = reportNewEntrantData; // Already fallback to empty object
  const assertionStatement = initialFormData?.assertion_statement;
  const emissionAfterNewEntrant = {
    flaring_emissions: initialFormData.flaring_emissions || "",
    fugitive_emissions: initialFormData.fugitive_emissions || "",
    industrial_process_emissions:
      initialFormData.industrial_process_emissions || "",
    on_site_transportation_emissions:
      initialFormData.on_site_transportation_emissions || "",
    stationary_fuel_combustion_emissions:
      initialFormData.stationary_fuel_combustion_emissions || "",
    venting_emissions_useful: initialFormData.venting_emissions_useful || "",
    venting_emissions_non_useful:
      initialFormData.venting_emissions_non_useful || "",
    emissions_from_waste: initialFormData.emissions_from_waste || "",
    emissions_from_wastewater: initialFormData.emissions_from_wastewater || "",
  };

  const emissionExcludedByFuelType = {
    co2_emissions_from_excluded_woody_biomass:
      initialFormData.co2_emissions_from_excluded_woody_biomass || "",
    other_emissions_from_excluded_biomass:
      initialFormData.other_emissions_from_excluded_biomass || "",
    emissions_from_excluded_non_biomass:
      initialFormData.emissions_from_excluded_non_biomass || "",
  };

  const otherExcludedEmissions = {
    emissions_from_line_tracing:
      initialFormData.emissions_from_line_tracing || "",
    emissions_from_fat_oil: initialFormData.emissions_from_fat_oil || "",
  };

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

  // Define initial form values for NewEntrantInformationForm
  const initialFormValues = {
    assertion_statement: assertionStatement,
    emission_after_new_entrant: emissionAfterNewEntrant,
    emission_excluded_by_fuel_type: emissionExcludedByFuelType,
    other_excluded_emissions: otherExcludedEmissions,
  };

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
          ...initialFormValues,
        }}
      />
    </Suspense>
  );
}
