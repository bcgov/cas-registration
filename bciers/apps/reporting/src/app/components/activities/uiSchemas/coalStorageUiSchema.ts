import { sourceTypeCheckboxUiSchema } from "./common";
import NestedArrayFieldTemplate from "@bciers/components/form/fields/NestedArrayFieldTemplate";
import InlineFieldTemplate from "@bciers/components/form/fields/InlineFieldTemplate";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";

const uiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  id: {
    "ui:widget": "hidden",
  },
  storedCoalPiles: sourceTypeCheckboxUiSchema,
  sourceTypes: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      label: false,
    },
    storedCoalPiles: {
      "ui:FieldTemplate": SourceTypeBoxTemplate,
      emissions: {
        "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
        "ui:FieldTemplate": FieldTemplate,
        "ui:options": {
          arrayAddLabel: "Add Emission",
          padding: "p-2",
          label: false,
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
            coalPurchases: {
              "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
              "ui:FieldTemplate": FieldTemplate,
              "ui:options": {
                arrayAddLabel: "Add Coal Purchase",
                title: "Coal Purchase",
                label: false,
                verticalBorder: true,
              },
              items: {
                "ui:order": [
                  "annualCoalPurchaseAmount",
                  "coalBasin",
                  "basinName",
                  "basinDescription",
                  "provinceState",
                  "mineType",
                  "defaultCH4EmissionFactor",
                ],

                annualCoalPurchaseAmount: {
                  "ui:FieldTemplate": InlineFieldTemplate,
                },
                coalBasin: {
                  "ui:FieldTemplate": InlineFieldTemplate,
                },
                basinName: {
                  "ui:FieldTemplate": InlineFieldTemplate,
                },
                basinDescription: {
                  "ui:FieldTemplate": InlineFieldTemplate,
                },
                provinceState: {
                  "ui:FieldTemplate": InlineFieldTemplate,
                },
                mineType: {
                  "ui:FieldTemplate": InlineFieldTemplate,
                },
                defaultCH4EmissionFactor: {
                  "ui:FieldTemplate": InlineFieldTemplate,
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
