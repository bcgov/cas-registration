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
  industrialWastewaterProcessAnaerobicDigestion: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:widget": CheckboxWidgetLeft,
    "ui:options": {
      label: false,
    },
  },
  oilWaterSeparators: {
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
    industrialWastewaterProcessAnaerobicDigestion: {
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
            "description",
          ],
          gasType: {
            "ui:FieldTemplate": InlineFieldTemplate,
            "ui:widget": "select",
            "ui:options": {
              label: "Gas Type",
            },
          },
          emission: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          equivalentEmission: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          methodology: {
            "ui:FieldTemplate": FieldTemplate,
            "ui:widget": "select",
            "ui:options": {
              label: false,
            },
            methodology: {
              "ui:FieldTemplate": MethodologyFieldTemplate,
            },
          },
        },
      },
    },
    oilWaterSeparators: {
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
            "description",
          ],
          gasType: {
            "ui:FieldTemplate": InlineFieldTemplate,
            "ui:widget": "select",
            "ui:options": {
              label: "Gas Type",
            },
          },
          emission: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          equivalentEmission: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
          methodology: {
            "ui:FieldTemplate": FieldTemplate,
            "ui:widget": "select",
            "ui:options": {
              label: false,
            },
            methodology: {
              "ui:FieldTemplate": MethodologyFieldTemplate,
            },
          },
        },
      },
    },
  },
};

export default uiSchema;
