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
  carbonatesNotConsumedInActivitesColumnTwo: {
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
    carbonatesNotConsumedInActivitesColumnTwo: {
      "ui:FieldTemplate": SourceTypeBoxTemplate,
      emissions: {
        "ui:title": "Carbonate data",
        "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
        "ui:FieldTemplate": FieldTemplate,
        "ui:options": {
          arrayAddLabel: "Add Carbonate",
          label: false,
          title: "Carbonate",
          padding: "p-2",
        },
        items: {
          "ui:order": [
            "gasType",
            "emission",
            "equivalentEmission",
            "carbonateType",
            "methodology",
            "annualMassOfCarbonateTypeConsumedTonnes",
            "fractionCalcinationAchievedForEachParticularCarbonateTypeWeightFactor",
            "numberOfCarbonateTypes",
            "annualMassOfInputCarbonateTypeTonnes",
            "annualMassOfOutputCarbonateTypeTonnes",
            "numberOfInputCarbonateTypes",
            "numberOfOutputCarbonateTypes",
            "description",
          ],
          methodology: {
            "ui:FieldTemplate": FieldTemplate,
            "ui:options": {
              label: false,
            },
            methodology: {
              "ui:FieldTemplate": InlineFieldTemplate,
            },
            annualMassOfCarbonateTypeConsumedTonnes: {
              "ui:FieldTemplate": InlineFieldTemplate,
            },
            fractionCalcinationAchievedForEachParticularCarbonateTypeWeightFactor:
              {
                "ui:FieldTemplate": InlineFieldTemplate,
              },
            numberOfCarbonateTypes: {
              "ui:FieldTemplate": InlineFieldTemplate,
            },
            annualMassOfInputCarbonateTypeTonnes: {
              "ui:FieldTemplate": InlineFieldTemplate,
            },
            annualMassOfOutputCarbonateTypeTonnes: {
              "ui:FieldTemplate": InlineFieldTemplate,
            },
            numberOfInputCarbonateTypes: {
              "ui:FieldTemplate": InlineFieldTemplate,
            },
            numberOfOutputCarbonateTypes: {
              "ui:FieldTemplate": InlineFieldTemplate,
            },
            description: {
              "ui:FieldTemplate": InlineFieldTemplate,
            },
          },
          emissions: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          gasType: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          carbonateType: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          equivalentEmissions: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
        },
      },
    },
  },
};

export default uiSchema;
