import { RJSFSchema, UiSchema, WidgetProps } from "@rjsf/utils";

import { Typography } from "@mui/material";
import {
  FieldTemplate,
  InlineFieldTemplate,
  SectionFieldTemplate,
  TitleOnlyFieldTemplate,
} from "@bciers/components/form/fields";
import checkboxWidget from "@bciers/components/form/widgets/CheckboxWidget";
import { DateWidget } from "@bciers/components/form/widgets";

export const ProductionDataTitleWidget: React.FC<
  Partial<WidgetProps> & { children?: React.ReactNode }
> = ({ id, value, children }) => (
  <div id={id} className="w-full mt-8">
    <h2 className="inline-block p-0 text-lg font-bold text-bc-bg-blue m-0 mb-12">
      <u>Product:</u> {value}
    </h2>
    {children}
  </div>
);
export const newEntrantInfo = (
  <Typography variant="body2" color="primary" fontStyle="italic" fontSize={16}>
    This section applies to operations that fall under{" "}
    <u>new entrant category</u>.
  </Typography>
);

// Define types for Product and Emission
type Product = {
  product_id: number;
  name: string;
  production_amount: number;
};

type Emission = {
  id: number;
  category_name: string;
  category_type: "basic" | "fuel_excluded" | "other_excluded";
  emission_amount: number | null;
};

const categorizeEmissions = (emissions: Emission[], type: string) =>
  emissions
    .filter((emission) => emission.category_type === type)
    .reduce(
      (acc, emission) => ({
        ...acc,
        [emission.id]: {
          type: "number",
          title: emission.category_name,
        },
      }),
      {},
    );

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

  authorization_date: {
    "ui:widget": DateWidget,
  },

  first_shipment_date: {
    "ui:widget": DateWidget,
  },

  new_entrant_period_start: {
    "ui:widget": DateWidget,
  },

  products: {
    "ui:options": { label: false }, // Hides the default label for the 'products' section
    "ui:FieldTemplate": ({ children }: { children?: React.ReactNode }) => (
      <>{children}</>
    ),

    ...selectedProducts.reduce(
      (acc, product) => {
        acc[String(product.id)] = {
          "ui:FieldTemplate": ({
            id,
            children,
          }: {
            id: string;
            children?: React.ReactNode;
          }) => (
            <ProductionDataTitleWidget id={id} value={product.name}>
              {children}
            </ProductionDataTitleWidget>
          ),
          production_amount: {
            "ui:FieldTemplate": InlineFieldTemplate,
          },
        };
        return acc;
      },
      {} as Record<string, unknown>,
    ),
  },

  emission_after_new_entrant: {
    "ui:FieldTemplate": SectionFieldTemplate,
  },

  emission_excluded_by_fuel_type: {
    "ui:FieldTemplate": SectionFieldTemplate,
  },

  other_excluded_emissions: {
    "ui:FieldTemplate": SectionFieldTemplate,
  },
});

export const buildNewEntrantSchema = (
  selectedProducts: any[],
  emissions: any[],
) =>
  ({
    type: "object",
    title: "New Entrant Information",
    properties: {
      purpose_note: { type: "object", readOnly: true },
      authorization_date: {
        type: "string",
        title: "Date of authorization",
      },
      first_shipment_date: {
        type: "string",
        title: "Date of first shipment",
      },
      new_entrant_period_start: {
        type: "string",
        title: "Date new entrant period began",
      },
      assertion_statement: {
        type: "boolean",
        title: "Assertion statement",
        default: false,
      },
      products: {
        type: "object",
        properties: selectedProducts.reduce(
          (acc, product) => ({
            ...acc,
            [product.id]: {
              type: "object",
              title: `Product: ${product.name}`,
              properties: {
                production_amount: {
                  type: "number",
                  title: "Production after new entrant period began",
                },
              },
            },
          }),
          {},
        ),
      },
      emission_after_new_entrant: {
        type: "object",
        title: "Emission categories after new entrant period began",
        properties: categorizeEmissions(emissions, "basic"),
      },
      emission_excluded_by_fuel_type: {
        type: "object",
        title: "Emissions excluded by fuel type",
        properties: categorizeEmissions(emissions, "fuel_excluded"),
      },
      other_excluded_emissions: {
        type: "object",
        title: "Other excluded emissions",
        properties: categorizeEmissions(emissions, "other_excluded"),
      },
    },
  }) as RJSFSchema;
