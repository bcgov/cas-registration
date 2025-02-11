import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import {
  emissionsOnlyUiSchema,
  fuelsOnlyUiSchema,
  sourceTypeCheckboxUiSchema,
  emissionsFieldsUiSchema,
} from "./common";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import NestedArrayFieldTemplate from "@bciers/components/form/fields/NestedArrayFieldTemplate";
import { InlineFieldTemplate } from "@bciers/components/form/fields";

const uiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  associatedGasFlaring: sourceTypeCheckboxUiSchema,
  associatedGasVenting: sourceTypeCheckboxUiSchema,
  blowdownVenting: sourceTypeCheckboxUiSchema,
  dehydratorVenting: sourceTypeCheckboxUiSchema,
  drillingFlaring: sourceTypeCheckboxUiSchema,
  drillingVenting: sourceTypeCheckboxUiSchema,
  enhancedOilRecoveryHydrocarbonLiquids: sourceTypeCheckboxUiSchema,
  enhancedOilrecoveryInjectionPumpBlowdowns: sourceTypeCheckboxUiSchema,
  equipmentLeaksDetectedLearkerEmissionFactorMethods:
    sourceTypeCheckboxUiSchema,
  flaringStacks: sourceTypeCheckboxUiSchema,
  hydraulicFracturingFlaring: sourceTypeCheckboxUiSchema,
  naturalGasPneumatciHighBleedDeviceVenting: sourceTypeCheckboxUiSchema,
  naturalGasPneumaticIntermittentBleedDeviceVenting: sourceTypeCheckboxUiSchema,
  naturalGasPneumaticLowBleedDeviceVenting: sourceTypeCheckboxUiSchema,
  naturalGasPneumaticPumpVenting: sourceTypeCheckboxUiSchema,
  otherFugitiveSources: sourceTypeCheckboxUiSchema,
  otherVentingSources: sourceTypeCheckboxUiSchema,
  populationCountSources: sourceTypeCheckboxUiSchema,
  producedWaterDissolvedCarbonDioxideMethane: sourceTypeCheckboxUiSchema,
  releasesFromTanksUsedForStorageProductionProcessing:
    sourceTypeCheckboxUiSchema,
  thirdPartyLineHitsWithReleaseOfGas: sourceTypeCheckboxUiSchema,
  transmissionStorageTanks: sourceTypeCheckboxUiSchema,
  wellTestingFlaring: sourceTypeCheckboxUiSchema,
  wellTestingVenting: sourceTypeCheckboxUiSchema,
  wellVentingDuringWellCompletionsHydraulicFracturing:
    sourceTypeCheckboxUiSchema,
  wellVentingForLiquidsUnloading: sourceTypeCheckboxUiSchema,
  sourceTypes: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      label: false,
    },
    associatedGasFlaring: fuelsOnlyUiSchema,
    associatedGasVenting: emissionsOnlyUiSchema,
    blowdownVenting: emissionsOnlyUiSchema,
    dehydratorVenting: emissionsOnlyUiSchema,
    drillingFlaring: fuelsOnlyUiSchema,
    drillingVenting: emissionsOnlyUiSchema,
    enhancedOilRecoveryHydrocarbonLiquids: emissionsOnlyUiSchema,
    enhancedOilrecoveryInjectionPumpBlowdowns: emissionsOnlyUiSchema,
    equipmentLeaksDetectedLearkerEmissionFactorMethods: emissionsOnlyUiSchema,
    flaringStacks: fuelsOnlyUiSchema,
    hydraulicFracturingFlaring: fuelsOnlyUiSchema,
    naturalGasPneumatciHighBleedDeviceVenting: fuelsOnlyUiSchema,
    naturalGasPneumaticIntermittentBleedDeviceVenting: fuelsOnlyUiSchema,
    naturalGasPneumaticLowBleedDeviceVenting: fuelsOnlyUiSchema,
    naturalGasPneumaticPumpVenting: fuelsOnlyUiSchema,
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
      "ui:order": ["descriptionOfOtherSources", "emissions"],
      descriptionOfOtherSources: {
        "ui:FieldTemplate": InlineFieldTemplate,
      },
      emissions: emissionsFieldsUiSchema,
    },
    populationCountSources: emissionsOnlyUiSchema,
    producedWaterDissolvedCarbonDioxideMethane: emissionsOnlyUiSchema,
    releasesFromTanksUsedForStorageProductionProcessing: emissionsOnlyUiSchema,
    thirdPartyLineHitsWithReleaseOfGas: emissionsOnlyUiSchema,
    transmissionStorageTanks: emissionsOnlyUiSchema,
    wellTestingFlaring: fuelsOnlyUiSchema,
    wellTestingVenting: emissionsOnlyUiSchema,
    wellVentingDuringWellCompletionsHydraulicFracturing: emissionsOnlyUiSchema,
    wellVentingForLiquidsUnloading: emissionsOnlyUiSchema,
  },
};

export default uiSchema;
