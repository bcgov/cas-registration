"use client";

import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import NestedArrayFieldTemplate from "@bciers/components/form/fields/NestedArrayFieldTemplate";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import InlineFieldTemplate from "@bciers/components/form/fields/InlineFieldTemplate";
import CollapsibleDefinitionFieldTemplate from "@bciers/components/form/fields/CollapsibleDefinitionFieldTemplate";

const definitionSchema = {
  "ui:FieldTemplate": CollapsibleDefinitionFieldTemplate,
  emissionFactor: {
    "ui:FieldTemplate": InlineFieldTemplate,
  },
};

const uiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:order": ["coverGasFromElectrolysisCells", "sourceTypes"],
  sourceTypes: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      label: false,
    },
    calcinationUsedToProductClinker: {
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
          gasType: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          emissions: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          equivalentEmissions: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          methodology: {
            "ui:FieldTemplate": FieldTemplate,
            "ui:options": {
              label: false,
            },
            "ui:order": [
              "methodology",
              "quarter1",
              "quarter2",
              "quarter3",
              "quarter4",
              "january",
              "february",
              "march",
              "april",
              "may",
              "june",
              "july",
              "august",
              "september",
              "october",
              "november",
              "december",
            ],
            methodology: {
              "ui:FieldTemplate": InlineFieldTemplate,
            },
            quarter1: definitionSchema,
            quarter2: definitionSchema,
            quarter3: definitionSchema,
            quarter4: definitionSchema,
            january: definitionSchema,
            february: definitionSchema,
            march: definitionSchema,
            april: definitionSchema,
            may: definitionSchema,
            june: definitionSchema,
            july: definitionSchema,
            august: definitionSchema,
            september: definitionSchema,
            october: definitionSchema,
            november: definitionSchema,
            december: definitionSchema,
          },
          timesMissingDataProceduresWereFollowed: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
        },
      },
    },
  },
};

export default uiSchema;
