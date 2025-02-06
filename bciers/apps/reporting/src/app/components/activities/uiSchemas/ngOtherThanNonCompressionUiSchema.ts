import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import {
  emissionsFieldsUiSchema,
  emissionsOnlyUiSchema,
  sourceSubTypeWithFuelUiSchema,
  sourceSubTypeWithoutFuelUiSchema,
  sourceTypeCheckboxUiSchema,
} from "./common";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import NestedArrayFieldTemplate from "@bciers/components/form/fields/NestedArrayFieldTemplate";
import { InlineFieldTemplate } from "@bciers/components/form/fields";

const uiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  naturalGasPneumatciHighBleedDeviceVenting: sourceTypeCheckboxUiSchema,
  naturalGasPneumaticPumpVenting: sourceTypeCheckboxUiSchema,
  naturalGasPneumaticLowBleedDeviceVenting: sourceTypeCheckboxUiSchema,
  naturalGasPneumaticIntermittentBleedDeviceVenting: sourceTypeCheckboxUiSchema,
  blowdownVenting: sourceTypeCheckboxUiSchema,
  flareStacks: sourceTypeCheckboxUiSchema,
  centrifugalCompressorVenting: sourceTypeCheckboxUiSchema,
  reciprocatingCompressorVenting: sourceTypeCheckboxUiSchema,
  equipmentLeaksDetectedLearkerEmissionFactorMethods:
    sourceTypeCheckboxUiSchema,
  populationCountSources: sourceTypeCheckboxUiSchema,
  transmissionStorageTanks: sourceTypeCheckboxUiSchema,
  otherVentingSources: sourceTypeCheckboxUiSchema,
  otherFugitiveSources: sourceTypeCheckboxUiSchema,
  thirdPartyLineHitsWithReleaseOfGas: sourceTypeCheckboxUiSchema,
  sourceTypes: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      label: false,
    },
    naturalGasPneumatciHighBleedDeviceVenting: sourceSubTypeWithFuelUiSchema,
    naturalGasPneumaticPumpVenting: sourceSubTypeWithFuelUiSchema,
    naturalGasPneumaticLowBleedDeviceVenting: sourceSubTypeWithFuelUiSchema,
    naturalGasPneumaticIntermittentBleedDeviceVenting:
      sourceSubTypeWithFuelUiSchema,
    blowdownVenting: emissionsOnlyUiSchema,
    flareStacks: sourceSubTypeWithFuelUiSchema,
    centrifugalCompressorVenting: sourceSubTypeWithoutFuelUiSchema,
    reciprocatingCompressorVenting: sourceSubTypeWithoutFuelUiSchema,
    equipmentLeaksDetectedLearkerEmissionFactorMethods:
      sourceSubTypeWithoutFuelUiSchema,
    populationCountSources: sourceSubTypeWithoutFuelUiSchema,
    transmissionStorageTanks: emissionsOnlyUiSchema,
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
    thirdPartyLineHitsWithReleaseOfGas: sourceSubTypeWithoutFuelUiSchema,
  },
};

export default uiSchema;
