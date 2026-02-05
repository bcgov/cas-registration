import MethodologyFieldTemplate from "@bciers/components/form/fields/MethodologyFieldTemplate";
import {
  FieldTemplate,
  InlineFieldTemplate,
  GreyBoxWithLinkFieldTemplate,
} from "@bciers/components/form/fields";
import NestedArrayFieldTemplate from "@bciers/components/form/fields/NestedArrayFieldTemplate";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import { RadioWidget } from "@bciers/components/form/widgets";
import { sectionCUrl } from "@reporting/src/app/utils/constants";

const pulpAndPaperUiSchema2025 = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:title": "Pulp and paper production",
  "ui:order": [
    "id",
    "biogenicIndustrialProcessEmissions",
    "carbonates",
    "sourceTypes",
  ],
  id: {
    "ui:widget": "hidden",
  },
  // Biogenic Industrial Process Emissions (NEW for 2025)
  biogenicIndustrialProcessEmissions: {
    "ui:FieldTemplate": SourceTypeBoxTemplate,
    "ui:options": {
      label: true,
      title: "Biogenic Industrial Process Emissions",
    },
    "ui:order": ["doesUtilizeLimeRecoveryKiln", "scheduleC"],
    doesUtilizeLimeRecoveryKiln: {
      "ui:widget": RadioWidget,
      "ui:options": {
        inline: true,
      },
    },
    scheduleC: {
      "ui:FieldTemplate": GreyBoxWithLinkFieldTemplate,
      "ui:options": {
        label: true,
        padding: "p-2",
        bgColor: "#f2f2f2",
        linkUrl: sectionCUrl,
        linkText: "Schedule C)",
      },
      "ui:order": [
        "chemicalPulpAmount",
        "limeRecoveredByKilnAmount",
        "totalAllocated",
      ],
      chemicalPulpAmount: {
        "ui:FieldTemplate": InlineFieldTemplate,
        "ui:emptyValue": undefined,
      },
      limeRecoveredByKilnAmount: {
        "ui:FieldTemplate": InlineFieldTemplate,
        "ui:emptyValue": undefined,
      },
      totalAllocated: {
        "ui:FieldTemplate": InlineFieldTemplate,
        "ui:widget": "ReadOnlyWidget",
        "ui:options": {
          suffix: "%",
        },
      },
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

export default pulpAndPaperUiSchema2025;
