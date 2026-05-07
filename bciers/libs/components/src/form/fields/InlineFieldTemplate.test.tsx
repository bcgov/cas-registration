import { render, screen } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "../FormBase";
import InlineFieldTemplate from "./InlineFieldTemplate";

describe("InlineFieldTemplate", () => {
  it("renders a static unit from displayUnit", () => {
    const schema: RJSFSchema = {
      type: "object",
      properties: {
        annual_production: {
          type: "number",
          title: "Annual Production",
        },
      },
    };

    const uiSchema = {
      annual_production: {
        "ui:FieldTemplate": InlineFieldTemplate,
        "ui:options": {
          displayUnit: "tCO2e",
        },
      },
    };

    render(
      <FormBase
        schema={schema}
        uiSchema={uiSchema}
        formData={{ annual_production: 123 }}
      />,
    );

    expect(screen.getByText("tCO2e")).toBeVisible();
  });

  it("resolves unit from array item using arrayPath and field", () => {
    const data = {
      production_data: [
        {
          annual_production: 123,
          unit: "tonnes of tests",
        },
      ],
    };

    const getArrayItem = (path: string, index: number) => {
      const arr = (data as Record<string, unknown[]>)[path];
      if (!Array.isArray(arr)) return undefined;
      return arr[index];
    };

    const schema: RJSFSchema = {
      type: "object",
      properties: {
        production_data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              annual_production: {
                type: "number",
                title: "Annual Production",
              },
            },
          },
        },
      },
    };

    const uiSchema = {
      production_data: {
        items: {
          annual_production: {
            "ui:FieldTemplate": InlineFieldTemplate,
            "ui:options": {
              unit: { field: "unit" },
              arrayPath: "production_data",
            },
          },
        },
      },
    };

    render(
      <FormBase
        schema={schema}
        uiSchema={uiSchema}
        formData={data}
        formContext={{ getArrayItem }}
      />,
    );

    expect(screen.getByText("tonnes of tests")).toBeVisible();
  });

  it("renders a composed unit from mixed static and dynamic tokens", () => {
    const data = {
      products: [
        {
          emission_intensity: 3.14,
          unit: "tonnes of tests",
        },
      ],
    };

    const getArrayItem = (path: string, index: number) => {
      const arr = (data as Record<string, unknown[]>)[path];
      if (!Array.isArray(arr)) return undefined;
      return arr[index];
    };

    const schema: RJSFSchema = {
      type: "object",
      properties: {
        products: {
          type: "array",
          items: {
            type: "object",
            properties: {
              emission_intensity: {
                type: "number",
                title: "Production-weighted average emission intensity",
              },
            },
          },
        },
      },
    };

    const uiSchema = {
      products: {
        items: {
          emission_intensity: {
            "ui:FieldTemplate": InlineFieldTemplate,
            "ui:options": {
              unit: ["tCO2e/", { field: "unit" }],
              arrayPath: "products",
            },
          },
        },
      },
    };

    render(
      <FormBase
        schema={schema}
        uiSchema={uiSchema}
        formData={data}
        formContext={{ getArrayItem }}
      />,
    );

    expect(screen.getByText("tCO2e/tonnes of tests")).toBeVisible();
  });

  it("falls back to root formContext lookup when arrayPath is not provided", () => {
    const schema: RJSFSchema = {
      type: "object",
      properties: {
        annual_production: {
          type: "number",
          title: "Annual Production",
        },
      },
    };

    const uiSchema = {
      annual_production: {
        "ui:FieldTemplate": InlineFieldTemplate,
        "ui:options": {
          unit: { field: "globalUnit" },
        },
      },
    };

    render(
      <FormBase
        schema={schema}
        uiSchema={uiSchema}
        formData={{ annual_production: 123 }}
        formContext={{ globalUnit: "kg" }}
      />,
    );

    expect(screen.getByText("kg")).toBeVisible();
  });

  it("does not render unit text when neither unit nor displayUnit is configured", () => {
    const schema: RJSFSchema = {
      type: "object",
      properties: {
        annual_production: {
          type: "number",
          title: "Annual Production",
        },
      },
    };

    const uiSchema = {
      annual_production: {
        "ui:FieldTemplate": InlineFieldTemplate,
      },
    };

    render(
      <FormBase
        schema={schema}
        uiSchema={uiSchema}
        formData={{ annual_production: 123 }}
        formContext={{ globalUnit: "unit-that-should-not-render" }}
      />,
    );

    expect(
      screen.queryByText("unit-that-should-not-render"),
    ).not.toBeInTheDocument();
  });
});
