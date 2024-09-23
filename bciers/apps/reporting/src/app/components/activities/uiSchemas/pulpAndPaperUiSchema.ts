import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import NestedArrayFieldTemplate from "@bciers/components/form/fields/NestedArrayFieldTemplate";
import { InlineFieldTemplate } from "@bciers/components/form/fields";

const uiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:title": "Pulp and paper production",
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
        },
      },
    },
  },
};

export default uiSchema;
