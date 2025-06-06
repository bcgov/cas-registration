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
import cementProductionUISchema from "./cementProductionUISchema";
import gscSolelyLineTracingUiSchema from "./gscSolelyLineTracingUiSchema";
import limeManufacturingUiSchema from "./limeManufacturingUiSchema";
import coalStorageUiSchema from "./coalStorageUiSchema";
import zincProductionUiSchema from "./zincProductionUiSchema";
import petroleumRefiningUiSchema from "./petroleumRefiningUiSchema";
import leadProductionUiSchema from "./leadProductionUiSchema";
import fallbackUiSchema from "./fallbackUiSchema";
import electricityTransmissionUiSchema from "./electricityTransmissionUiSchema";

type UiSchemaMap = {
  [key: string]: any;
};

// Activity slug & matching uiSchema
export const uiSchemaMap: UiSchemaMap = {
  gsc_excluding_line_tracing: gscUiSchema,
  gsc_solely_for_line_tracing: gscSolelyLineTracingUiSchema,
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
  cement_production: cementProductionUISchema,
  lime_manufacturing: limeManufacturingUiSchema,
  coal_storage: coalStorageUiSchema,
  zinc_production: zincProductionUiSchema,
  petroleum_refining: petroleumRefiningUiSchema,
  lead_production: leadProductionUiSchema,
  electronics_manufacturing: fallbackUiSchema,
  ammonia_production: fallbackUiSchema,
  underground_coal_mining: fallbackUiSchema,
  copper_nickel_refining: fallbackUiSchema,
  ferroalloy_production: fallbackUiSchema,
  glass_manufacturing: fallbackUiSchema,
  magnesium_production: fallbackUiSchema,
  nitric_acid_manufacturing: fallbackUiSchema,
  petrochemical_production: fallbackUiSchema,
  phos_acid_production: fallbackUiSchema,
  electricity_transmission: electricityTransmissionUiSchema,
};

export const getUiSchema = (slug: string) => {
  return uiSchemaMap[slug];
};
