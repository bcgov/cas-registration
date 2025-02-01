import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import NestedArrayFieldTemplate from "@bciers/components/form/fields/NestedArrayFieldTemplate";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import InlineFieldTemplate from "@bciers/components/form/fields/InlineFieldTemplate";
import CheckboxWidgetLeft from "@bciers/components/form/widgets/CheckboxWidgetLeft";

const withFuelSourceType = {
  "ui:FieldTemplate": SourceTypeBoxTemplate,
  fuels: {
    "ui:title": "Fuel Data",
    "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      arrayAddLabel: "Add Fuel",
      label: false,
      title: "Fuel",
      padding: "p-2",
    },
    items: {
      "ui:order": ["fuelType", "annualFuelAmount", "emissions"],
      fuelType: {
        "ui:field": "fuelType",
        "ui:FieldTemplate": FieldTemplate,
        "ui:options": {
          label: false,
        },
        fuelName: {
          "ui:FieldTemplate": InlineFieldTemplate,
        },
        fuelUnit: {
          "ui:FieldTemplate": InlineFieldTemplate,
        },
        fuelClassification: {
          "ui:FieldTemplate": InlineFieldTemplate,
        },
      },
      annualFuelAmount: {
        "ui:FieldTemplate": InlineFieldTemplate,
      },
      emissions: {
        "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
        "ui:FieldTemplate": FieldTemplate,
        "ui:options": {
          arrayAddLabel: "Add Emission",
          title: "Emission",
          label: false,
          verticalBorder: true,
        },
        items: {
          methodology: {
            "ui:FieldTemplate": FieldTemplate,
            "ui:options": {
              label: false,
            },
            methodology: {
              "ui:FieldTemplate": InlineFieldTemplate,
            },
          },
        },
      },
    },
  },
};

const emissionOnlySourceType = {
  "ui:FieldTemplate": SourceTypeBoxTemplate,
  emissions: {
    "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      arrayAddLabel: "Add Emission",
      title: "Emission",
      label: false,
      verticalBorder: true,
    },
    items: {
      methodology: {
        "ui:FieldTemplate": FieldTemplate,
        "ui:options": {
          label: false,
        },
        methodology: {
          "ui:FieldTemplate": InlineFieldTemplate,
        },
      },
    },
  },
};

const emissionsAndSubSourceType = {
  "ui:FieldTemplate": SourceTypeBoxTemplate,
  subSourceType: {
    "ui:FieldTemplate": InlineFieldTemplate,
  },
  emissions: {
    "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      arrayAddLabel: "Add Emission",
      title: "Emission",
      label: false,
      verticalBorder: true,
    },
    items: {
      methodology: {
        "ui:FieldTemplate": FieldTemplate,
        "ui:options": {
          label: false,
        },
        methodology: {
          "ui:FieldTemplate": InlineFieldTemplate,
        },
      },
    },
  },
};

const sourceTypeWithCheckbox = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:widget": CheckboxWidgetLeft,
  "ui:options": {
    label: false,
  },
};

const uiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  associatedGasFlaring: sourceTypeWithCheckbox,
  associatedGasVenting: sourceTypeWithCheckbox,
  blowdownVenting: sourceTypeWithCheckbox,
  dehydratorVenting: sourceTypeWithCheckbox,
  drillingFlaring: sourceTypeWithCheckbox,
  drillingVenting: sourceTypeWithCheckbox,
  enhancedOilRecoveryHydrocarbonLiquids: sourceTypeWithCheckbox,
  enhancedOilrecoveryInjectionPumpBlowdowns: sourceTypeWithCheckbox,
  equipmentLeaksDetectedLearkerEmissionFactorMethods: sourceTypeWithCheckbox,
  flaringStacks: sourceTypeWithCheckbox,
  hydraulicFracturingFlaring: sourceTypeWithCheckbox,
  naturalGasPneumatciHighBleedDeviceVenting: sourceTypeWithCheckbox,
  naturalGasPneumaticIntermittentBleedDeviceVenting: sourceTypeWithCheckbox,
  naturalGasPneumaticLowBleedDeviceVenting: sourceTypeWithCheckbox,
  naturalGasPneumaticPumpVenting: sourceTypeWithCheckbox,
  otherFugitiveSources: sourceTypeWithCheckbox,
  otherVentingSources: sourceTypeWithCheckbox,
  populationCountSources: sourceTypeWithCheckbox,
  producedWaterDissolvedCarbonDioxideMethane: sourceTypeWithCheckbox,
  releasesFromTanksUsedForStorageProductionProcessing: sourceTypeWithCheckbox,
  thirdPartyLineHitsWithReleaseOfGas: sourceTypeWithCheckbox,
  transmissionStorageTanks: sourceTypeWithCheckbox,
  wellTestingFlaring: sourceTypeWithCheckbox,
  wellTestingVenting: sourceTypeWithCheckbox,
  wellVentingDuringWellCompletionsHydraulicFracturing: sourceTypeWithCheckbox,
  wellVentingForLiquidsUnloading: sourceTypeWithCheckbox,
  sourceTypes: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      label: false,
    },
    associatedGasFlaring: withFuelSourceType,
    associatedGasVenting: emissionOnlySourceType,
    blowdownVenting: emissionOnlySourceType,
    dehydratorVenting: emissionOnlySourceType,
    drillingFlaring: withFuelSourceType,
    drillingVenting: emissionOnlySourceType,
    enhancedOilRecoveryHydrocarbonLiquids: emissionOnlySourceType,
    enhancedOilrecoveryInjectionPumpBlowdowns: emissionOnlySourceType,
    equipmentLeaksDetectedLearkerEmissionFactorMethods: emissionOnlySourceType,
    flaringStacks: withFuelSourceType,
    hydraulicFracturingFlaring: withFuelSourceType,
    naturalGasPneumatciHighBleedDeviceVenting: withFuelSourceType,
    naturalGasPneumaticIntermittentBleedDeviceVenting: withFuelSourceType,
    naturalGasPneumaticLowBleedDeviceVenting: withFuelSourceType,
    naturalGasPneumaticPumpVenting: withFuelSourceType,
    otherFugitiveSources: emissionsAndSubSourceType,
    otherVentingSources: emissionOnlySourceType,
    populationCountSources: emissionOnlySourceType,
    producedWaterDissolvedCarbonDioxideMethane: emissionOnlySourceType,
    releasesFromTanksUsedForStorageProductionProcessing: emissionOnlySourceType,
    thirdPartyLineHitsWithReleaseOfGas: emissionOnlySourceType,
    transmissionStorageTanks: emissionOnlySourceType,
    wellTestingFlaring: withFuelSourceType,
    wellTestingVenting: emissionOnlySourceType,
    wellVentingDuringWellCompletionsHydraulicFracturing: emissionOnlySourceType,
    wellVentingForLiquidsUnloading: emissionOnlySourceType,
  },
};

export default uiSchema;
