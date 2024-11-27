import carbonatesUseUiSchema from "./carbonatesUseUiSchema";
import fuelCombustionMobileUiSchema from "./fuelCombustionMobileUiSchema";
import gscNonCompressionNonProcessingUiSchema from "./gscNonCompressionNonProcessingUiSchema";
import gscOtherThanNonCompression from "./gscOtherThanNonCompression";
import gscUiSchema from "./gscUiSchema";
import hydrogenProduction from "./hydrogenProduction";
import pulpAndPaperUiSchema from "./pulpAndPaperUiSchema";
import refineryFuelGasUiSchema from "./refineryFuelGasUiSchema";
import openPitCoalMining from "@reporting/src/app/components/activities/uiSchemas/openPitCoalMining";
import storageOfPetroleumProductsUiSchema from "./storageOfPetroleumProductsUiSchema";
import aluminumUiSchema from "./aluminumUiSchema";

type UiSchemaMap = {
  [key: string]: any;
};

// Activity slug & matching uiSchema
export const uiSchemaMap: UiSchemaMap = {
  gsc_excluding_line_tracing: gscUiSchema,
  gsc_solely_for_line_tracing: gscUiSchema,
  gsc_other_than_non_compression: gscOtherThanNonCompression,
  gsc_non_compression: gscNonCompressionNonProcessingUiSchema,
  fuel_combustion_by_mobile: fuelCombustionMobileUiSchema,
  hydrogen_production: hydrogenProduction,
  pulp_and_paper: pulpAndPaperUiSchema,
  refinery_fuel_gas: refineryFuelGasUiSchema,
  carbonate_use: carbonatesUseUiSchema,
  open_pit_coal_mining: openPitCoalMining,
  storage_petro_products: storageOfPetroleumProductsUiSchema,
  aluminum_production: aluminumUiSchema,
};

export const getUiSchema = (slug: string) => {
  return uiSchemaMap[slug];
};
