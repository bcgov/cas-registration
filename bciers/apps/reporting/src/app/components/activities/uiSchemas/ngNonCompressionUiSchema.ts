import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import {
  emissionsFieldsUiSchema,
  emissionsOnlyUiSchema,
  sourceSubTypeWithFuelUiSchema,
  sourceSubTypeWithoutFuelUiSchema,
  sourceTypeBoxUiSchema,
} from "./common";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import NestedArrayFieldTemplate from "@bciers/components/form/fields/NestedArrayFieldTemplate";
import { InlineFieldTemplate } from "@bciers/components/form/fields";

const uiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  naturalGasPneumatciHighBleedDeviceVenting: sourceTypeBoxUiSchema,
  naturalGasPneumaticPumpVenting: sourceTypeBoxUiSchema,
  naturalGasPneumaticLowBleedDeviceVenting: sourceTypeBoxUiSchema,
  naturalGasPneumaticIntermittentBleedDeviceVenting: sourceTypeBoxUiSchema,
  blowdownVenting: sourceTypeBoxUiSchema,
  flaringStacks: sourceTypeBoxUiSchema,
  equipmentLeaksDetectedLearkerEmissionFactorMethods: sourceTypeBoxUiSchema,
  populationCountSources: sourceTypeBoxUiSchema,
  transmissionStorageTanks: sourceTypeBoxUiSchema,
  otherVentingSources: sourceTypeBoxUiSchema,
  otherFugitiveSources: sourceTypeBoxUiSchema,
  thirdPartyLineHitsWithReleaseOfGas: sourceTypeBoxUiSchema,
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
    flaringStacks: sourceSubTypeWithFuelUiSchema,
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
            "descriptionOfOtherSources",
            "emissions",
          ],
          sourceSubType: {
            "ui:FieldTemplate": InlineFieldTemplate,
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
            "descriptionOfOtherSources",
            "emissions",
          ],
          sourceSubType: {
            "ui:FieldTemplate": InlineFieldTemplate,
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
