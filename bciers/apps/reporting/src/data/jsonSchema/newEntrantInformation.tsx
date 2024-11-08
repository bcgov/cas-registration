import { RJSFSchema, UiSchema, WidgetProps } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import {
  InlineFieldTemplate,
  TitleOnlyFieldTemplate,
} from "@bciers/components/form/fields";
import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";
import { DateWidget } from "@bciers/components/form/widgets";
import checkboxWidget from "@bciers/components/form/widgets/CheckboxWidget";
import { BC_GOV_BACKGROUND_COLOR_BLUE } from "@bciers/styles";
import { Typography } from "@mui/material";

export const ProductionDataTitleWidget: React.FC<Partial<WidgetProps>> = ({
  id,
  value,
  children,
}) => {
  return (
    <div id={id} className="w-full mt-8">
      <h2 className="inline-block p-0 text-lg font-bold text-bc-bg-blue m-0 mb-12">
        <u>Product:</u> {value}
      </h2>
      {children}
    </div>
  );
};
export const newEntrantInfo = (
  <>
    <Typography
      variant="body2"
      color={BC_GOV_BACKGROUND_COLOR_BLUE}
      fontStyle="italic"
      fontSize={16}
    >
      This section applies to operations that fall under{" "}
      <u>new entrant category</u>.
    </Typography>
  </>
);
type Product = {
  id: number;
  name: string;
  production_amount: number;
};

export const createNewEntrantInformationSchema = (
  selectedProducts: Product[],
  dateOfAuthorization: string,
  dateOfFirstShipment: string,
  dateOfNewEntrantPeriod: string,
) =>
  ({
    type: "object",
    title: "New Entrant Information",
    properties: {
      purpose_note: { type: "object", readOnly: true },
      date_of_authorization: {
        type: "string",
        title: "Date of authorization",
        default: `${dateOfAuthorization}`,
      },
      date_of_first_shipment: {
        type: "string",
        title: "Date of first shipment",
        default: `${dateOfFirstShipment}`,
      },
      date_of_new_entrant_period_began: {
        type: "string",
        title: "Date new entrant period began",
        default: `${dateOfNewEntrantPeriod}`,
      },
      assertion_statement: {
        type: "boolean",
        title: "Assertion statement",
        default: false,
      },
      products: {
        type: "object",
        properties: {
          ...selectedProducts?.reduce(
            (acc, product) => ({
              ...acc,
              [`${product.id}`]: {
                type: "object",
                title: `Product: ${product.name}`,
                properties: {
                  production_amount: {
                    type: "number",
                    title: "Production after new entrant period began",
                    default: product.production_amount,
                  },
                },
              },
            }),
            {},
          ),
        },
      },
      emission_after_new_entrant: {
        type: "object",
        title: "Emission categories after new entrant period began",
        properties: {
          flaring_emissions: {
            type: "number",
            title: "Flaring emissions",
          },
          fugitive_emissions: {
            type: "number",
            title: "Fugitive emissions",
          },
          industrial_process_emissions: {
            type: "number",
            title: "Industrial process emissions",
          },
          on_site_transportation_emissions: {
            type: "number",
            title: "On-site transportation emissions",
          },
          stationary_fuel_combustion_emissions: {
            type: "number",
            title: "Stationary fuel combustion emissions",
          },
          venting_emissions_useful: {
            type: "number",
            title: "Venting emissions - useful",
          },
          venting_emissions_non_useful: {
            type: "number",
            title: "Venting emissions - non-useful",
          },
          emissions_from_waste: {
            type: "number",
            title: "Emissions from waste",
          },
          emissions_from_wastewater: {
            type: "number",
            title: "Emissions from wastewater",
          },
        },
      },
      emission_excluded_by_fuel_type: {
        type: "object",
        title: "Emissions excluded by fuel type",
        properties: {
          co2_emissions_from_excluded_woody_biomass: {
            type: "number",
            title: "CO2 emissions from excluded woody biomass",
          },
          other_emissions_from_excluded_biomass: {
            type: "number",
            title: "Other emissions from excluded biomass",
          },
          emissions_from_excluded_non_biomass: {
            type: "number",
            title: "Emissions from excluded non-biomass",
          },
        },
      },
      other_excluded_emissions: {
        type: "object",
        title: "Other excluded emissions",
        properties: {
          emissions_from_line_tracing: {
            type: "number",
            title:
              "Emissions from line tracing and non-processing and non-compression activities",
          },
          emissions_from_fat_oil: {
            type: "number",
            title:
              "Emissions from fat, oil and grease collection, refining and storage ",
          },
        },
      },
    },
  }) as RJSFSchema;

export const createNewEntrantInformationUiSchema = (
  selectedProducts: Product[],
): UiSchema => ({
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",

  purpose_note: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": newEntrantInfo,
  },

  assertion_statement: {
    "ui:widget": checkboxWidget,
    "ui:options": {
      label:
        "I certify that this operation was a reporting operation on the date that the application for designation as a new entrant was submitted to the Director under GGIRCA.",
    },
  },

  date_of_authorization: {
    "ui:widget": DateWidget,
    "ui:options": {
      simpleDateFormat: true,
    },
  },

  date_of_first_shipment: {
    "ui:widget": DateWidget,
    "ui:options": {
      simpleDateFormat: true,
    },
  },

  date_of_new_entrant_period_began: {
    "ui:widget": DateWidget,
    "ui:options": {
      simpleDateFormat: true,
    },
  },

  products: {
    "ui:options": { label: false },
    "ui:FieldTemplate": ({ children }) => <>{children}</>,
    ...selectedProducts?.reduce((acc, product) => {
      acc[product.id] = {
        "ui:FieldTemplate": ({ id, children }) => (
          <ProductionDataTitleWidget id={id} value={product.name}>
            {children}
          </ProductionDataTitleWidget>
        ),
        production_amount: {
          "ui:FieldTemplate": InlineFieldTemplate,
        },
      };
      return acc;
    }, {}),
  },

  emission_after_new_entrant: {
    "ui:FieldTemplate": SectionFieldTemplate,
    flaring_emissions: {
      "ui:FieldTemplate": InlineFieldTemplate,
    },
    fugitive_emissions: {
      "ui:FieldTemplate": InlineFieldTemplate,
    },
    industrial_process_emissions: {
      "ui:FieldTemplate": InlineFieldTemplate,
    },
    on_site_transportation_emissions: {
      "ui:FieldTemplate": InlineFieldTemplate,
    },
    stationary_fuel_combustion_emissions: {
      "ui:FieldTemplate": InlineFieldTemplate,
    },
    venting_emissions_useful: {
      "ui:FieldTemplate": InlineFieldTemplate,
    },
    venting_emissions_non_useful: {
      "ui:FieldTemplate": InlineFieldTemplate,
    },
    emissions_from_waste: {
      "ui:FieldTemplate": InlineFieldTemplate,
    },
    emissions_from_wastewater: {
      "ui:FieldTemplate": InlineFieldTemplate,
    },
  },

  emission_excluded_by_fuel_type: {
    "ui:FieldTemplate": SectionFieldTemplate,
    co2_emissions_from_excluded_woody_biomass: {
      "ui:FieldTemplate": InlineFieldTemplate,
    },
    other_emissions_from_excluded_biomass: {
      "ui:FieldTemplate": InlineFieldTemplate,
    },
    emissions_from_excluded_non_biomass: {
      "ui:FieldTemplate": InlineFieldTemplate,
    },
  },

  other_excluded_emissions: {
    "ui:FieldTemplate": SectionFieldTemplate,
    emissions_from_line_tracing: {
      "ui:FieldTemplate": InlineFieldTemplate,
    },
    emissions_from_fat_oil: {
      "ui:FieldTemplate": InlineFieldTemplate,
    },
  },
});
