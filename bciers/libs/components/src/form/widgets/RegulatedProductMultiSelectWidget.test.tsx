import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FormBase from "@bciers/components/form/FormBase";
import { RJSFSchema } from "@rjsf/utils";

export const regulatedProductSchema = {
  type: "object",
  required: ["regulatedProducts"],
  properties: {
    regulatedProducts: {
      type: "array",
      title: "Regulated Products",
      minItems: 1,
      items: {
        type: "number",
        enum: [1, 16, 43],
        enumNames: [
          "Product 1",
          "PnP: Chemical Pulp",
          "PnP: Lime Recovered by Kiln",
        ],
      },
    },
  },
} as RJSFSchema;

export const regulatedProductUiSchema = {
  regulatedProducts: {
    "ui:widget": "RegulatedProductMultiSelectWidget",
    "ui:placeholder": "Select Regulated Product",
  },
};

describe("RegulatedProductMultiSelectWidget", () => {
  it("does not show help text when no products are selected", async () => {
    render(
      <FormBase
        schema={regulatedProductSchema}
        uiSchema={regulatedProductUiSchema}
      />,
    );

    await waitFor(() => {
      expect(
        screen.queryByText(
          /If this is a chemical pulp mill that recovered lime by kiln/,
        ),
      ).not.toBeInTheDocument();
    });
  });

  it("does not show help text when only other products are selected", async () => {
    render(
      <FormBase
        schema={regulatedProductSchema}
        formData={{ regulatedProducts: [1] }}
        uiSchema={regulatedProductUiSchema}
      />,
    );

    await waitFor(() => {
      expect(
        screen.queryByText(
          /If this is a chemical pulp mill that recovered lime by kiln/,
        ),
      ).not.toBeInTheDocument();
    });
  });

  it("shows help text when only chemical pulp (16) is selected", async () => {
    render(
      <FormBase
        schema={regulatedProductSchema}
        formData={{ regulatedProducts: [16] }}
        uiSchema={regulatedProductUiSchema}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          /If this is a chemical pulp mill that recovered lime by kiln/,
        ),
      ).toBeInTheDocument();
    });
  });

  it("shows help text when only lime recovered by kiln (43) is selected", async () => {
    render(
      <FormBase
        schema={regulatedProductSchema}
        formData={{ regulatedProducts: [43] }}
        uiSchema={regulatedProductUiSchema}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          /If this is a chemical pulp mill that recovered lime by kiln/,
        ),
      ).toBeInTheDocument();
    });
  });

  it("does not show help text when both chemical pulp (16) and lime recovered by kiln (43) are selected", async () => {
    render(
      <FormBase
        schema={regulatedProductSchema}
        formData={{ regulatedProducts: [16, 43] }}
        uiSchema={regulatedProductUiSchema}
      />,
    );

    await waitFor(() => {
      expect(
        screen.queryByText(
          /If this is a chemical pulp mill that recovered lime by kiln/,
        ),
      ).not.toBeInTheDocument();
    });
  });

  it("shows help text when chemical pulp (16) is selected with other products", async () => {
    render(
      <FormBase
        schema={regulatedProductSchema}
        formData={{ regulatedProducts: [1, 16] }}
        uiSchema={regulatedProductUiSchema}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          /If this is a chemical pulp mill that recovered lime by kiln/,
        ),
      ).toBeInTheDocument();
    });
  });

  it("shows help text when lime recovered by kiln (43) is selected with other products", async () => {
    render(
      <FormBase
        schema={regulatedProductSchema}
        formData={{ regulatedProducts: [1, 43] }}
        uiSchema={regulatedProductUiSchema}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          /If this is a chemical pulp mill that recovered lime by kiln/,
        ),
      ).toBeInTheDocument();
    });
  });

  it("does not show help text when both products (16 and 43) are selected with other products", async () => {
    render(
      <FormBase
        schema={regulatedProductSchema}
        formData={{ regulatedProducts: [1, 16, 43] }}
        uiSchema={regulatedProductUiSchema}
      />,
    );

    await waitFor(() => {
      expect(
        screen.queryByText(
          /If this is a chemical pulp mill that recovered lime by kiln/,
        ),
      ).not.toBeInTheDocument();
    });
  });

  it("updates help text when value changes from no selection to product 16", async () => {
    const { rerender } = render(
      <FormBase
        schema={regulatedProductSchema}
        formData={{ regulatedProducts: [] }}
        uiSchema={regulatedProductUiSchema}
      />,
    );

    await waitFor(() => {
      expect(
        screen.queryByText(
          /If this is a chemical pulp mill that recovered lime by kiln/,
        ),
      ).not.toBeInTheDocument();
    });

    rerender(
      <FormBase
        schema={regulatedProductSchema}
        formData={{ regulatedProducts: [16] }}
        uiSchema={regulatedProductUiSchema}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          /If this is a chemical pulp mill that recovered lime by kiln/,
        ),
      ).toBeInTheDocument();
    });
  });

  it("removes help text when value changes to not meet the pulp and paper help text condition", async () => {
    const { rerender } = render(
      <FormBase
        schema={regulatedProductSchema}
        formData={{ regulatedProducts: [16] }}
        uiSchema={regulatedProductUiSchema}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          /If this is a chemical pulp mill that recovered lime by kiln/,
        ),
      ).toBeInTheDocument();
    });

    rerender(
      <FormBase
        schema={regulatedProductSchema}
        formData={{ regulatedProducts: [16, 43] }}
        uiSchema={regulatedProductUiSchema}
      />,
    );

    await waitFor(() => {
      expect(
        screen.queryByText(
          /If this is a chemical pulp mill that recovered lime by kiln/,
        ),
      ).not.toBeInTheDocument();
    });
  });
});
