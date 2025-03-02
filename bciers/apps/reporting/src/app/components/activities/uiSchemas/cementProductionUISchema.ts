"use client";

import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import NestedArrayFieldTemplate from "@bciers/components/form/fields/NestedArrayFieldTemplate";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import InlineFieldTemplate from "@bciers/components/form/fields/InlineFieldTemplate";
import GridItemFieldTemplate from "@bciers/components/form/fields/GridItemFieldTemplate";
import CollapsibleDefinitionFieldTemplate from "@bciers/components/form/fields/CollapsibleDefinitionFieldTemplate";

const gridSchema = {
  "ui:FieldTemplate": GridItemFieldTemplate,
};

const definitionSchema = {
  "ui:FieldTemplate": CollapsibleDefinitionFieldTemplate,
  clinkerProduction: gridSchema,
  emissionFactor: gridSchema,
  totalCalciumContentOfClinker: gridSchema,
  totalMagnesiumContentOfClinker: gridSchema,
  nonCalcinedCalciumOxideContentOfClinker: gridSchema,
  nonCalcinedMagnesiumOxideContentOfClinker: gridSchema,
  quantityOfNonCarbonateRawMaterialsEnteringTheKiln: gridSchema,
  quantityOfCKDNotRecycledBackToKilns: gridSchema,
};

const uiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:order": ["coverGasFromElectrolysisCells", "sourceTypes"],
  id: {
    "ui:widget": "hidden",
  },
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
              "description",
              "amountOfRawMaterialConsumedT",
              "rawMaterialOrganicCarbonContentWeightFraction",
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
              "quarter1",
              "quarter2",
              "quarter3",
              "quarter4",
            ],
            methodology: {
              "ui:FieldTemplate": InlineFieldTemplate,
            },
            description: {
              "ui:FieldTemplate": InlineFieldTemplate,
            },
            amountOfRawMaterialConsumedT: {
              "ui:FieldTemplate": InlineFieldTemplate,
            },
            rawMaterialOrganicCarbonContentWeightFraction: {
              "ui:FieldTemplate": InlineFieldTemplate,
            },
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
            quarter1: definitionSchema,
            quarter2: definitionSchema,
            quarter3: definitionSchema,
            quarter4: definitionSchema,
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
