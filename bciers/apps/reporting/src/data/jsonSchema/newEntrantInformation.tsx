import { RJSFSchema, UiSchema, WidgetProps } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import {
  InlineFieldTemplate,
  TitleOnlyFieldTemplate,
} from "@bciers/components/form/fields";
import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";
import { DateWidget } from "@bciers/components/form/widgets";
import checkboxWidget from "@bciers/components/form/widgets/CheckboxWidget";
import { Typography } from "@mui/material";

export const ProductionDataTitleWidget: React.FC<Partial<WidgetProps>> = ({
  id,
  value,
  children,
}) => (
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

type Product = {
  id: number;
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
          default: emission.emission_amount ?? null,
        },
      }),
      {},
    );

export const createNewEntrantInformationSchema = (
  selectedProducts: Product[],
  emissions: Emission[],
): RJSFSchema => ({
  type: "object",
  title: "New Entrant Information",
  properties: {
    purpose_note: { type: "object", readOnly: true },
    date_of_authorization: {
      type: "string",
      title: "Date of authorization",
    },
    date_of_first_shipment: {
      type: "string",
      title: "Date of first shipment",
    },
    date_of_new_entrant_period_began: {
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
});

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
  },

  date_of_first_shipment: {
    "ui:widget": DateWidget,
  },

  date_of_new_entrant_period_began: {
    "ui:widget": DateWidget,
  },

  products: {
    "ui:options": { label: false },
    "ui:FieldTemplate": ({ children }) => <>{children}</>,
    ...selectedProducts.reduce((acc, product) => {
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
  },

  emission_excluded_by_fuel_type: {
    "ui:FieldTemplate": SectionFieldTemplate,
  },

  other_excluded_emissions: {
    "ui:FieldTemplate": SectionFieldTemplate,
  },
});
