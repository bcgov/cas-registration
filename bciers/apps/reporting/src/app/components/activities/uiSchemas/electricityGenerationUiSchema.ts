import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import NestedArrayFieldTemplate from "@bciers/components/form/fields/NestedArrayFieldTemplate";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import CheckboxWidgetLeft from "@bciers/components/form/widgets/CheckboxWidgetLeft";
import InlineFieldTemplate from "@bciers/components/form/fields/InlineFieldTemplate";
import {
  emissionsFieldsUiSchema,
  emissionsOnlyUiSchema,
  fuelsOnlyUiSchema,
  sourceSubTypeWithFuelUiSchema,
  sourceSubTypeWithoutFuelUiSchema,
  sourceTypeCheckboxUiSchema,
  fuelsFieldsUiSchema,
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
    acidgasScrubbersAndReagents: {
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
          "ui:order": ["unitName", "unitType", "fuels"],
          unitName: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          unitType: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          fuels: {
            "ui:title": "Fuel Data",
            "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
            "ui:FieldTemplate": FieldTemplate,
            "ui:options": {
              arrayAddLabel: "Add Fuel",
              label: false,
              title: "Fuel",
            },
            items: {
              "ui:order": [
                "fuelType",
                "fuelDescription",
                "annualFuelAmount",
                "emissions",
              ],
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
              fuelDescription: {
                "ui:FieldTemplate": InlineFieldTemplate,
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
        },
      },
    },
  },
};

export default uiSchema;
