import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import NestedArrayFieldTemplate from "@bciers/components/form/fields/NestedArrayFieldTemplate";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import InlineFieldTemplate from "@bciers/components/form/fields/InlineFieldTemplate";
import {
  sourceTypeCheckboxUiSchema,
  fuelsFieldsUiSchema,
  emissionsFieldsUiSchema,
  emissionsOnlyUiSchema,
} from "./common";
const uiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  fuelCombustionForElectricityGeneration: sourceTypeCheckboxUiSchema,
  acidgasScrubbersAndReagents: sourceTypeCheckboxUiSchema,
  coolingUnits: sourceTypeCheckboxUiSchema,
  geothermalGeyserSteamOrFluids: sourceTypeCheckboxUiSchema,
  installationMaintOperationOfElectricalEquipment: sourceTypeCheckboxUiSchema,
  sourceTypes: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      label: false,
    },
    fuelCombustionForElectricityGeneration: {
      "ui:FieldTemplate": SourceTypeBoxTemplate,
      units: {
        "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
        "ui:FieldTemplate": FieldTemplate,
        "ui:title": "Unit Data",
        "ui:options": {
          arrayAddLabel: "Add Unit",
          label: false,
          title: "Unit",
          padding: "p-2",
        },
        items: {
          "ui:order": [
            "unitName",
            "unitType",
            "generationType",
            "cycleType",
            "thermalOutput",
            "supplementalFiringPurpose",
            "steamHeatAcquisitionAmount",
            "steamHeatAcquisitionProvider",
            "nameplateCapacity",
            "netPower",
            "fuels",
          ],
          unitName: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          unitType: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          generationType: {
            "ui:widget": "SelectWidget",
          },
          nameplateCapacity: {
            type: "number",
            minimum: 0,
          },
          fuels: fuelsFieldsUiSchema,
        },
      },
    },
    acidgasScrubbersAndReagents: emissionsOnlyUiSchema,
    coolingUnits: emissionsOnlyUiSchema,
    geothermalGeyserSteamOrFluids: emissionsOnlyUiSchema,
    installationMaintOperationOfElectricalEquipment: emissionsOnlyUiSchema,
  },
};

export default uiSchema;
