import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import NestedArrayFieldTemplate from "@bciers/components/form/fields/NestedArrayFieldTemplate";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import CheckboxWidgetLeft from "@bciers/components/form/widgets/CheckboxWidgetLeft";
import InlineFieldTemplate from "@bciers/components/form/fields/InlineFieldTemplate";

const uiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  id: {
    "ui:widget": "hidden",
  },
  gscFuelOrWasteLinearFacilitiesUsefulEnergy: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:widget": CheckboxWidgetLeft,
    "ui:options": {
      label: false,
    },
  },
  gscFuelOrWasteLinearFacilitiesWithoutUsefulEnergy: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:widget": CheckboxWidgetLeft,
    "ui:options": {
      label: false,
    },
  },
  fieldProcessVentGasLinearFacilities: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:widget": CheckboxWidgetLeft,
    "ui:options": {
      label: false,
    },
  },
  sourceTypes: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      label: false,
    },
    gscFuelOrWasteLinearFacilitiesUsefulEnergy: {
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
          "ui:order": ["gscUnitName", "gscUnitType", "description", "fuels"],
          gscUnitName: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          gscUnitType: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          description: {
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
    gscFuelOrWasteLinearFacilitiesWithoutUsefulEnergy: {
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
          "ui:order": ["gscUnitName", "gscUnitType", "description", "fuels"],
          gscUnitName: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          gscUnitType: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          description: {
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

    fieldProcessVentGasLinearFacilities: {
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
          "ui:order": ["gscUnitName", "gscUnitType", "description", "fuels"],
          gscUnitName: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          gscUnitType: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          description: {
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
