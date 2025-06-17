import { render, screen } from "@testing-library/react";
import FormBase from "@bciers/components/form/FormBase";
import { RJSFSchema } from "@rjsf/utils";
import { AnnualEmissionsReportButtonField } from "@/compliance/src/app/data/jsonSchema/AnnualEmissionsReportButton";

const schema = {
  type: "object",
  properties: {
    view_annual_report_button: {
      type: "string",
      title: "Annual Emissions Report",
    },
  },
} as RJSFSchema;

const uiSchema = {
  view_annual_report_button: {
    "ui:widget": AnnualEmissionsReportButtonField,
  },
};

const formContext = {
  creditsIssuanceRequestData: { id: "test-123" },
};

describe("AnnualEmissionsReportButtonField", () => {
  it("renders a link with the correct text and URL", () => {
    render(
      <FormBase
        schema={schema}
        uiSchema={uiSchema}
        formContext={formContext}
      />,
    );

    const link = screen.getByRole("button", {
      name: /view annual emissions report/i,
    });
    expect(link).toHaveTextContent("View Annual Emissions Report");
    expect(link).toHaveAttribute("href", "/reports/test-123/annual-report");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
