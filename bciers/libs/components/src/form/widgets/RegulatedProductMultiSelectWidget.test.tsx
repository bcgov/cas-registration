import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FormBase from "@bciers/components/form/FormBase";
import { RJSFSchema } from "@rjsf/utils";
import {
  CHEMICAL_PULP_NAME,
  LIME_RECOVERED_NAME,
} from "./RegulatedProductMultiSelectWidget";

const HELP_TEXT = /If this is a chemical pulp mill that recovered lime by kiln/;

const REPORTING_YEAR_BEFORE_RULE = 2024;
const REPORTING_YEAR_RULE_START = 2025;

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
      },
    },
  },
} as RJSFSchema;

export const regulatedProductUiSchema = {
  regulatedProducts: {
    "ui:widget": "RegulatedProductMultiSelectWidget",
    "ui:placeholder": "Select Regulated Product",
    "ui:enumNames": ["Product 1", CHEMICAL_PULP_NAME, LIME_RECOVERED_NAME],
  },
};

const renderWidget = (
  regulatedProducts: number[] = [],
  reportingYear = REPORTING_YEAR_RULE_START,
) =>
  render(
    <FormBase
      schema={regulatedProductSchema}
      formData={{ regulatedProducts }}
      uiSchema={regulatedProductUiSchema}
      formContext={{ reportingYear }}
    />,
  );

const expectHelpTextVisible = async () => {
  await waitFor(() => {
    expect(screen.getByText(HELP_TEXT)).toBeVisible();
  });
};

const expectHelpTextHidden = async () => {
  await waitFor(() => {
    expect(screen.queryByText(HELP_TEXT)).not.toBeInTheDocument();
  });
};

describe("RegulatedProductMultiSelectWidget", () => {
  describe("reporting year rule", () => {
    it("does not show help text for 2024 reports when only chemical pulp is selected", async () => {
      renderWidget([16], REPORTING_YEAR_BEFORE_RULE);

      await expectHelpTextHidden();
    });

    it("shows help text starting in 2025 when only chemical pulp is selected", async () => {
      renderWidget([16], REPORTING_YEAR_RULE_START);

      await expectHelpTextVisible();
    });
  });

  describe("product selection rule for reports after 2024", () => {
    it("does not show help text when no products are selected", async () => {
      renderWidget([]);

      await expectHelpTextHidden();
    });

    it("does not show help text when only unrelated products are selected", async () => {
      renderWidget([1]);

      await expectHelpTextHidden();
    });

    it("shows help text when only chemical pulp is selected", async () => {
      renderWidget([16]);

      await expectHelpTextVisible();
    });

    it("shows help text when only lime recovered by kiln is selected", async () => {
      renderWidget([43]);

      await expectHelpTextVisible();
    });

    it("does not show help text when both matching products are selected", async () => {
      renderWidget([16, 43]);

      await expectHelpTextHidden();
    });

    it("shows help text when chemical pulp is selected with unrelated products", async () => {
      renderWidget([1, 16]);

      await expectHelpTextVisible();
    });

    it("shows help text when lime recovered by kiln is selected with unrelated products", async () => {
      renderWidget([1, 43]);

      await expectHelpTextVisible();
    });

    it("does not show help text when both matching products are selected with unrelated products", async () => {
      renderWidget([1, 16, 43]);

      await expectHelpTextHidden();
    });
  });

  describe("reactive updates", () => {
    it("shows help text when the selection changes from none to chemical pulp", async () => {
      const { rerender } = renderWidget([]);

      await expectHelpTextHidden();

      rerender(
        <FormBase
          schema={regulatedProductSchema}
          formData={{ regulatedProducts: [16] }}
          uiSchema={regulatedProductUiSchema}
          formContext={{ reportingYear: REPORTING_YEAR_RULE_START }}
        />,
      );

      await expectHelpTextVisible();
    });

    it("removes help text when the selection changes to both matching products", async () => {
      const { rerender } = renderWidget([16]);

      await expectHelpTextVisible();

      rerender(
        <FormBase
          schema={regulatedProductSchema}
          formData={{ regulatedProducts: [16, 43] }}
          uiSchema={regulatedProductUiSchema}
          formContext={{ reportingYear: REPORTING_YEAR_RULE_START }}
        />,
      );

      await expectHelpTextHidden();
    });
  });
});
