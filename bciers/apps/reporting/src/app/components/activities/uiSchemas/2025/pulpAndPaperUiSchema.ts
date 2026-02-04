import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import NestedArrayFieldTemplate from "@bciers/components/form/fields/NestedArrayFieldTemplate";
import { InlineFieldTemplate } from "@bciers/components/form/fields";
import MethodologyFieldTemplate from "@bciers/components/form/fields/MethodologyFieldTemplate";

const uiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:title": "Pulp and paper production",
  "ui:order": [
    "id",
    "biogenicIndustrialProcessEmissions",
    "carbonates",
    "noSourceTypesMessage",
    "sourceTypes",
  ],
  id: {
    "ui:widget": "hidden",
  },
  noSourceTypesMessage: {
    "ui:widget": "textarea",
    "ui:readonly": true,
    "ui:options": {
      rows: 3,
    },
  },
  biogenicIndustrialProcessEmissions: {
    "ui:FieldTemplate": SourceTypeBoxTemplate,
    "ui:options": {
      label: true,
      title: "Biogenic Industrial Process Emissions",
      padding: "p-2",
      validation: {
        percentageSum: {
          fields: ["chemicalPulpPercentage", "limeKilnRecoveryPercentage"],
          expectedSum: 100,
          message:
            "Chemical pulp and lime kiln percentages must add up to 100%",
        },
      },
    },
    descriptionBox: {
      "ui:widget": "textarea",
      "ui:readonly": true,
      "ui:options": {
        rows: 4,
        className: "bg-gray-100 p-3 rounded",
        conditional: {
          show: "hasBiogenicEmissions",
          when: true,
        },
      },
      "ui:help":
        "Enter the proportion of industrial process emissions that are biogenic (emissions from biomass listed in Schedule C).",
    },
    hasBiogenicEmissions: {
      "ui:widget": "radio",
      "ui:options": {
        label: true,
        title: "Does this mill utilize a lime recovery kiln?",
      },
      "ui:help":
        "If yes, you must specify how industrial process biogenic emissions are split between chemical pulp and lime kiln recovery products",
    },
    chemicalPulpPercentage: {
      "ui:FieldTemplate": InlineFieldTemplate,
      "ui:options": {
        label: true,
        title: "Chemical pulp amount (percentage)",
        conditional: {
          show: "hasBiogenicEmissions",
          when: true,
        },
      },
      "ui:widget": "updown",
      "ui:placeholder": "0%",
      "ui:help":
        "Percentage of industrial process emissions allocated to chemical pulp product",
    },
    limeKilnRecoveryPercentage: {
      "ui:FieldTemplate": InlineFieldTemplate,
      "ui:options": {
        label: true,
        title: "Lime recovered by kiln amount (percentage)",
        conditional: {
          show: "hasBiogenicEmissions",
          when: true,
        },
      },
      "ui:widget": "updown",
      "ui:placeholder": "0%",
      "ui:help":
        "Percentage of biogenic industrial process emissions allocated to lime kiln recovery product",
    },
    totalAllocated: {
      "ui:widget": "text",
      "ui:readonly": true,
      "ui:options": {
        className: "font-bold",
        conditional: {
          show: "hasBiogenicEmissions",
          when: true,
        },
      },
      "ui:help": "Total allocated",
    },
  },
  carbonates: {
    "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
    "ui:FieldTemplate": SourceTypeBoxTemplate,
    "ui:options": {
      arrayAddLabel: "Add Carbonate",
      label: true,
      title: "Carbonate",
      padding: "p-2",
    },
    items: {
      "ui:order": ["carbonateName", "annualAmount", "purityOfCarbonate"],
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
          arrayAddLabel: "Add Emission",
          label: false,
          title: "Emission",
          padding: "p-2",
        },
        items: {
          equivalentEmission: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          methodology: {
            "ui:FieldTemplate": FieldTemplate,
            "ui:options": {
              label: false,
            },
            methodology: {
              "ui:FieldTemplate": MethodologyFieldTemplate,
            },
            isWoodyBiomass: {
              "ui:options": {
                label: true,
                title:
                  "This methodology calculates emissions from spent liquor combustion",
              },
            },
          },
        },
      },
    },
  },
};

export default uiSchema;
