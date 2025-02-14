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
import ngNonCompressionUiSchema from "./ngNonCompressionUiSchema";
import ngOtherThanNonCompressionUiSchema from "./ngOtherThanNonCompressionUiSchema";
import lngActivitiesUiSchema from "./lngActivities";
import ogExtractionNonCompressionUiSchema from "./ogExtractionNonCompressionUiSchema";
import industrialWastewaterProcessingUiSchema from "@reporting/src/app/components/activities/uiSchemas/industrialWastewaterProcessingUiSchema";
import ogExtractionOtherThanNcNpUiSchema from "./ogExtractionOtherThanNcNpUiSchema";
import electricityGenerationUiSchema from "./electricityGenerationUiSchema";
import leadProductionUiSchema from "./leadProductionUiSchema";

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
  natural_gas_activities_non_compression: ngNonCompressionUiSchema,
  natural_gas_activities_other_than_non_compression:
    ngOtherThanNonCompressionUiSchema,
  lng_activities: lngActivitiesUiSchema,
  og_activities_non_compression: ogExtractionNonCompressionUiSchema,
  ind_wastewater_processing: industrialWastewaterProcessingUiSchema,
  og_activities_other_than_non_compression: ogExtractionOtherThanNcNpUiSchema,
  electricity_generation: electricityGenerationUiSchema,
  lead_production: leadProductionUiSchema,
};

export const getUiSchema = (slug: string) => {
  return uiSchemaMap[slug];
};
