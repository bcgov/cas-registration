"use client";

import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import NestedArrayFieldTemplate from "@bciers/components/form/fields/NestedArrayFieldTemplate";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import CheckboxWidgetLeft from "@bciers/components/form/widgets/CheckboxWidgetLeft";
import InlineFieldTemplate from "@bciers/components/form/fields/InlineFieldTemplate";
import { DateWidget, MultiSelectWidget } from "@bciers/components/form/widgets";
import { SectionFieldTemplate } from "@bciers/components/form/fields";

const uiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:order": [
    "id",
    "smelterTechType",
    "annualEmissions",
    "anodeCathodeBackingGreenCokeCalcination",
    "anodeEffects",
    "coverGasFromElectrolysisCells",
    "sourceTypes",
  ],
  id: {
    "ui:widget": "hidden",
  },
  smelterTechType: {
    "ui:widget": MultiSelectWidget,
    "ui:placeholder": "Select Smelter Technology Type(s)",
  },
  annualEmissions: {
    "ui:FieldTemplate": SectionFieldTemplate,
    "ui:options": {
      label: false,
    },
  },
  annualAnodeConsumptionForPrebakeCells: {
    "ui:FieldTemplate": InlineFieldTemplate,
  },
  annualCF4EmissionsFromAnodeEffectsForPrebakeCells: {
    "ui:FieldTemplate": InlineFieldTemplate,
  },
  annualC2F6EmissionsFromAnodeEffectsForPrebakeCells: {
    "ui:FieldTemplate": InlineFieldTemplate,
  },
  annualAnodePasteConsumptionForSoderbergCells: {
    "ui:FieldTemplate": InlineFieldTemplate,
  },
  annualCF4EmissionsFromAnodeEffectsForSoderbergCells: {
    "ui:FieldTemplate": InlineFieldTemplate,
  },
  annualC2F6EmissionsFromAnodeEffectsForSoderbergCells: {
    "ui:FieldTemplate": InlineFieldTemplate,
  },
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
