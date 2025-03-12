import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import NestedArrayFieldTemplate from "@bciers/components/form/fields/NestedArrayFieldTemplate";
import InlineFieldTemplate from "@bciers/components/form/fields/InlineFieldTemplate";
import { emissionsOnlyUiSchema, sourceTypeCheckboxUiSchema } from "./common";

const feedstockUiSchema = {
  "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
  "ui:FieldTemplate": FieldTemplate,
  "ui:options": {
    arrayAddLabel: "Add Feedstock",
    title: "Feedstocks",
    label: false,
    verticalBorder: true,
  },
  items: {
    "ui:order": [
      "feedstock",
      "annualFeedstockConsumedAmount",
      "unitForAnnualFeedstockConsumedAmount",
    ],

    feedstock: {
      "ui:FieldTemplate": InlineFieldTemplate,
    },
    annualFeedstockConsumedAmount: {
      "ui:FieldTemplate": InlineFieldTemplate,
    },
    unitForAnnualFeedstockConsumedAmount: {
      "ui:FieldTemplate": InlineFieldTemplate,
    },
  },
};

const uiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:order": [
    "feedstocks",
    "aboveGroundStorageTanksAtRefineries",
    "asphaltProduction",
    "catalystRegeneration",
    "cokeCalciningAtRefineries",
    "delayedCokingAtRefineries",
    "equipmentLeaks",
    "flaresCombustionOfPurgeGas",
    "loadingOperationsatRefineriesAndTerminals",
    "oilWaterSeparatorsAtRefineries",
    "processVents",
    "sulphurRecovery",
    "uncontrolledBlowdownSystemsAtRefineries",
    "wastewaterProcessingAnaerobicDigestionAtRefineries",
    "*",
  ],
  id: {
    "ui:widget": "hidden",
  },
  feedstocks: feedstockUiSchema,
  catalystRegeneration: sourceTypeCheckboxUiSchema,
  processVents: sourceTypeCheckboxUiSchema,
  asphaltProduction: sourceTypeCheckboxUiSchema,
  sulphurRecovery: sourceTypeCheckboxUiSchema,
  flaresCombustionOfPurgeGas: sourceTypeCheckboxUiSchema,
  aboveGroundStorageTanksAtRefineries: sourceTypeCheckboxUiSchema,
  oilWaterSeparatorsAtRefineries: sourceTypeCheckboxUiSchema,
  equipmentLeaks: sourceTypeCheckboxUiSchema,
  wastewaterProcessingAnaerobicDigestionAtRefineries:
    sourceTypeCheckboxUiSchema,
  uncontrolledBlowdownSystemsAtRefineries: sourceTypeCheckboxUiSchema,
  loadingOperationsatRefineriesAndTerminals: sourceTypeCheckboxUiSchema,
  delayedCokingAtRefineries: sourceTypeCheckboxUiSchema,
  cokeCalciningAtRefineries: sourceTypeCheckboxUiSchema,
  sourceTypes: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      label: false,
    },
    "ui:order": [
      "aboveGroundStorageTanksAtRefineries",
      "asphaltProduction",
      "catalystRegeneration",
      "cokeCalciningAtRefineries",
      "delayedCokingAtRefineries",
      "equipmentLeaks",
      "flaresCombustionOfPurgeGas",
      "loadingOperationsatRefineriesAndTerminals",
      "oilWaterSeparatorsAtRefineries",
      "processVents",
      "sulphurRecovery",
      "uncontrolledBlowdownSystemsAtRefineries",
      "wastewaterProcessingAnaerobicDigestionAtRefineries",
      "*",
    ],
    catalystRegeneration: emissionsOnlyUiSchema,
    processVents: emissionsOnlyUiSchema,
    asphaltProduction: emissionsOnlyUiSchema,
    sulphurRecovery: emissionsOnlyUiSchema,
    flaresCombustionOfPurgeGas: emissionsOnlyUiSchema,
    aboveGroundStorageTanksAtRefineries: emissionsOnlyUiSchema,
    oilWaterSeparatorsAtRefineries: emissionsOnlyUiSchema,
    equipmentLeaks: emissionsOnlyUiSchema,
    wastewaterProcessingAnaerobicDigestionAtRefineries: emissionsOnlyUiSchema,
    uncontrolledBlowdownSystemsAtRefineries: emissionsOnlyUiSchema,
    loadingOperationsatRefineriesAndTerminals: emissionsOnlyUiSchema,
    delayedCokingAtRefineries: emissionsOnlyUiSchema,
    cokeCalciningAtRefineries: emissionsOnlyUiSchema,
  },
};
export default uiSchema;
