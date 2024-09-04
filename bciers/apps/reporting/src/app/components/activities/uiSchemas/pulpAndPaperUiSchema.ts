import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import CheckboxWidgetLeft from "@bciers/components/form/widgets/CheckboxWidgetLeft";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import NestedArrayFieldTemplate from "@bciers/components/form/fields/NestedArrayFieldTemplate";
import { InlineFieldTemplate } from "@bciers/components/form/fields";

const uiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  pulpingAndChemicalRecovery: {
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
    pulpingAndChemicalRecovery: {
      "ui:FieldTemplate": SourceTypeBoxTemplate,
      emissions: {
        "ui:title": "Pulping and Chemical Recovery",
        "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
        "ui:FieldTemplate": FieldTemplate,
        "ui:options": {
          arrayAddLabel: "Add Pulping and Chemical Recovery",
          label: false,
          title: "Pulping and Chemical Recovery",
          padding: "p-2",
        },
        items: {
          "ui:order": [
            "gasType",
            "methodology",
            "emission",
            "equivalentEmission",
            "carbonateName",
            "purityOfCarbonate",
            "annualAmount",
            "purityOfCarbonateWeightFraction",
            "massOfSpentLiquorCombustedTonnesYear",
            "solidsPercentageByWeight",
            "annualHighHeatValueOfSpentLiquorSolidsGjKg",
            "annualCarbonContentOfSpentLiquorSolidsByWeight",
            "makeUpQuantityOfCaco3UsedTonnesYear",
            "makeUpQuantityOfNa2Co3UsedTonnesYear",
            "description",
          ],
          gasType: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          methodology: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          emission: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          equivalentEmission: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          carbonateName: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          purityOfCarbonate: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          annualAmount: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          purityOfCarbonateWeightFraction: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          massOfSpentLiquorCombustedTonnesYear: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          solidsPercentageByWeight: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          annualHighHeatValueOfSpentLiquorSolidsGjKg: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          annualCarbonContentOfSpentLiquorSolidsByWeight: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          makeUpQuantityOfCaco3UsedTonnesYear: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          makeUpQuantityOfNa2Co3UsedTonnesYear: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          description: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
        },
      },
    },
  },
};

export default uiSchema;
