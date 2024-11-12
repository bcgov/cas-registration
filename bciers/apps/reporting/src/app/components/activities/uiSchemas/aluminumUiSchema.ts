"use client";

import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import NestedArrayFieldTemplate from "@bciers/components/form/fields/NestedArrayFieldTemplate";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import CheckboxWidgetLeft from "@bciers/components/form/widgets/CheckboxWidgetLeft";
import InlineFieldTemplate from "@bciers/components/form/fields/InlineFieldTemplate";
import { DateWidget } from "@bciers/components/form/widgets";

const uiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  anodeCathodeBackingGreenCokeCalcination: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:widget": CheckboxWidgetLeft,
    "ui:options": {
      title: "Anode Consumption",
      label: false,
    },
  },
  anodeEffects: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:widget": CheckboxWidgetLeft,
    "ui:options": {
      label: false,
    },
  },
  coverGasFromElectrolysisCells: {
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
    anodeCathodeBackingGreenCokeCalcination: {
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
            methodology: {
              "ui:FieldTemplate": InlineFieldTemplate,
            },
          },
        },
      },
    },
    anodeEffects: {
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
            methodology: {
              "ui:FieldTemplate": InlineFieldTemplate,
            },
            lastDateOfSlopeCoefficientsMeasurement: {
              "ui:widget": DateWidget,
            },
            lastDateOfOvervoltageEmissionFactorMeasurement: {
              "ui:widget": DateWidget,
            },
          },
        },
      },
    },
    coverGasFromElectrolysisCells: {
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
            methodology: {
              "ui:FieldTemplate": InlineFieldTemplate,
            },
          },
        },
      },
    },
  },
};

export default uiSchema;
