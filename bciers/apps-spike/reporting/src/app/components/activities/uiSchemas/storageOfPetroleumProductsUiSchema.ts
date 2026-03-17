import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import NestedArrayFieldTemplate from "@bciers/components/form/fields/NestedArrayFieldTemplate";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import CheckboxWidgetLeft from "@bciers/components/form/widgets/CheckboxWidgetLeft";
import InlineFieldTemplate from "@bciers/components/form/fields/InlineFieldTemplate";
import MethodologyFieldTemplate from "@bciers/components/form/fields/MethodologyFieldTemplate";

const uiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  id: {
    "ui:widget": "hidden",
  },
  aboveGroundStorageTanks: {
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
    aboveGroundStorageTanks: {
      "ui:FieldTemplate": SourceTypeBoxTemplate,
      emissions: {
        "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
        "ui:FieldTemplate": FieldTemplate,
        "ui:options": {
          arrayAddLabel: "Add Emission",
          label: false,
          title: "Emission",
          padding: "p-2",
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
            methodology: {
              "ui:FieldTemplate": MethodologyFieldTemplate,
            },
            description: {
              "ui:FieldTemplate": InlineFieldTemplate,
            },
          },
          emission: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          gasType: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          equivalentEmission: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
        },
      },
    },
  },
};

export default uiSchema;
