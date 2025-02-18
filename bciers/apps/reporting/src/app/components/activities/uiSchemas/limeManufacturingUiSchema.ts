import { sourceTypeCheckboxUiSchema } from "./common";
import NestedArrayFieldTemplate from "@bciers/components/form/fields/NestedArrayFieldTemplate";
import InlineFieldTemplate from "@bciers/components/form/fields/InlineFieldTemplate";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";

const uiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  calcinationOfCarbonateMaterialsLimeProduction: sourceTypeCheckboxUiSchema,
  sourceTypes: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      label: false,
    },
    calcinationOfCarbonateMaterialsLimeProduction: {
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
          "ui:order": [
            "gasType",
            "emission",
            "equivalentEmission",
            "methodology",
          ],
          methodology: {
            "ui:FieldTemplate": FieldTemplate,
            "ui:options": {
              label: false,
            },
            "ui:order": [
              "methodology",
              "description",
              "limeTypes",
              "byproductWaste",
              "missingDataProcedures",
            ],
            methodology: {
              "ui:FieldTemplate": InlineFieldTemplate,
            },
            limeTypes: {
              "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
              "ui:FieldTemplate": FieldTemplate,
              "ui:options": {
                arrayAddLabel: "Add Lime Type",
                title: "Lime Type",
                label: false,
                verticalBorder: true,
              },
              items: {
                "ui:order": ["limeType", "limeDescription", "monthlyData"],
                limeType: {
                  "ui:FieldTemplate": InlineFieldTemplate,
                },
                limeDescription: {
                  "ui:FieldTemplate": InlineFieldTemplate,
                },
                monthlyData: {
                  "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
                  "ui:FieldTemplate": FieldTemplate,
                  "ui:options": {
                    arrayAddLabel: "Add Month",
                    title: "Month",
                    label: false,
                    verticalBorder: true,
                  },
                  items: {
                    "ui:order": [
                      "month",
                      "emissionFactor",
                      "amountProduced",
                      "caoContent",
                      "mgoContent",
                    ],
                  },
                },
              },
            },
            byproductWaste: {
              "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
              "ui:FieldTemplate": FieldTemplate,
              "ui:options": {
                arrayAddLabel: "Add Byproduct/Waste",
                title: "Byproduct/Waste",
                label: false,
                verticalBorder: true,
              },
              items: {
                "ui:order": [
                  "byproductWasteID",
                  "byproductWasteDescription",
                  "quarterlyData",
                ],
                byproductWasteID: {
                  "ui:FieldTemplate": InlineFieldTemplate,
                },
                byproductWasteDescription: {
                  "ui:FieldTemplate": InlineFieldTemplate,
                },
                quarterlyData: {
                  "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
                  "ui:FieldTemplate": FieldTemplate,
                  "ui:options": {
                    arrayAddLabel: "Add Quarter",
                    title: "Quarter",
                    label: false,
                    verticalBorder: true,
                  },
                  items: {
                    "ui:order": [
                      "quarter",
                      "emissionFactor",
                      "amountProduced",
                      "caoContent",
                      "mgoContent",
                    ],
                  },
                },
              },
            },
            missingDataProcedures: {
              "ui:FieldTemplate": InlineFieldTemplate,
            },
          },
        },
      },
    },
  },
};

export default uiSchema;
