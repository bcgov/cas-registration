import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import {
  emissionsOnlyUiSchema,
  fuelsOnlyUiSchema,
  sourceTypeCheckboxUiSchema,
  emissionsFieldsUiSchema,
  sourceSubTypeWithFuelUiSchema,
  sourceSubTypeWithoutFuelUiSchema,
} from "./common";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import NestedArrayFieldTemplate from "@bciers/components/form/fields/NestedArrayFieldTemplate";
import { InlineFieldTemplate } from "@bciers/components/form/fields";

const uiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  acidGasRemovalVentingOrIncineration: sourceTypeCheckboxUiSchema,
  associatedGasFlaring: sourceTypeCheckboxUiSchema,
  associatedGasVenting: sourceTypeCheckboxUiSchema,
  blowdownVenting: sourceTypeCheckboxUiSchema,
  centrifugalCompressorVenting: sourceTypeCheckboxUiSchema,
  dehydratorVenting: sourceTypeCheckboxUiSchema,
  naturalGasPneumatciHighBleedDeviceVenting: sourceTypeCheckboxUiSchema,
  naturalGasPneumaticIntermittentBleedDeviceVenting: sourceTypeCheckboxUiSchema,
  naturalGasPneumaticLowBleedDeviceVenting: sourceTypeCheckboxUiSchema,
  naturalGasPneumaticPumpVenting: sourceTypeCheckboxUiSchema,
  enhancedOilRecoveryHydrocarbonLiquids: sourceTypeCheckboxUiSchema,
  enhancedOilrecoveryInjectionPumpBlowdowns: sourceTypeCheckboxUiSchema,
  equipmentLeaksDetectedLearkerEmissionFactorMethods:
    sourceTypeCheckboxUiSchema,
  flaringStacks: sourceTypeCheckboxUiSchema,
  otherFugitiveSources: sourceTypeCheckboxUiSchema,
  otherVentingSources: sourceTypeCheckboxUiSchema,
  populationCountSources: sourceTypeCheckboxUiSchema,
  producedWaterDissolvedCarbonDioxideMethane: sourceTypeCheckboxUiSchema,
  reciprocatingCompressorVenting: sourceTypeCheckboxUiSchema,
  releasesFromTanksUsedForStorageProductionProcessing:
    sourceTypeCheckboxUiSchema,
  thirdPartyLineHitsWithReleaseOfGas: sourceTypeCheckboxUiSchema,
  transmissionStorageTanks: sourceTypeCheckboxUiSchema,
  sourceTypes: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      label: false,
    },
    acidGasRemovalVentingOrIncineration: sourceSubTypeWithoutFuelUiSchema,
    associatedGasFlaring: fuelsOnlyUiSchema,
    associatedGasVenting: emissionsOnlyUiSchema,
    blowdownVenting: sourceSubTypeWithoutFuelUiSchema,
    centrifugalCompressorVenting: sourceSubTypeWithoutFuelUiSchema,
    dehydratorVenting: sourceSubTypeWithoutFuelUiSchema,
    naturalGasPneumatciHighBleedDeviceVenting: fuelsOnlyUiSchema,
    naturalGasPneumaticIntermittentBleedDeviceVenting: fuelsOnlyUiSchema,
    naturalGasPneumaticLowBleedDeviceVenting: fuelsOnlyUiSchema,
    naturalGasPneumaticPumpVenting: fuelsOnlyUiSchema,
    enhancedOilRecoveryHydrocarbonLiquids: emissionsOnlyUiSchema,
    enhancedOilrecoveryInjectionPumpBlowdowns: emissionsOnlyUiSchema,
    equipmentLeaksDetectedLearkerEmissionFactorMethods:
      sourceSubTypeWithoutFuelUiSchema,
    flaringStacks: sourceSubTypeWithFuelUiSchema,
    otherFugitiveSources: {
      "ui:FieldTemplate": SourceTypeBoxTemplate,
      units: {
        "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
        "ui:FieldTemplate": FieldTemplate,
        "ui:title": "Source sub-type data",
        "ui:options": {
          arrayAddLabel: "Add source sub-type",
          label: false,
          title: "Source sub-type",
          padding: "p-2",
        },
        items: {
          "ui:order": [
            "sourceSubType",
            "type",
            "descriptionOfOtherSources",
            "emissions",
          ],
          sourceSubType: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          type: {
            "ui:widget": "hidden",
          },
          descriptionOfOtherSources: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          emissions: emissionsFieldsUiSchema,
        },
      },
    },
    otherVentingSources: {
      "ui:FieldTemplate": SourceTypeBoxTemplate,
      units: {
        "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
        "ui:FieldTemplate": FieldTemplate,
        "ui:title": "Source sub-type data",
        "ui:options": {
          arrayAddLabel: "Add source sub-type",
          label: false,
          title: "Source sub-type",
          padding: "p-2",
        },
        items: {
          "ui:order": [
            "sourceSubType",
            "type",
            "descriptionOfOtherSources",
            "emissions",
          ],
          sourceSubType: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          type: {
            "ui:widget": "hidden",
          },
          descriptionOfOtherSources: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          emissions: emissionsFieldsUiSchema,
        },
      },
    },
    populationCountSources: sourceSubTypeWithoutFuelUiSchema,
    producedWaterDissolvedCarbonDioxideMethane: emissionsOnlyUiSchema,
    reciprocatingCompressorVenting: sourceSubTypeWithoutFuelUiSchema,
    releasesFromTanksUsedForStorageProductionProcessing:
      sourceSubTypeWithoutFuelUiSchema,
    thirdPartyLineHitsWithReleaseOfGas: emissionsOnlyUiSchema,
    transmissionStorageTanks: emissionsOnlyUiSchema,
  },
};

export default uiSchema;
