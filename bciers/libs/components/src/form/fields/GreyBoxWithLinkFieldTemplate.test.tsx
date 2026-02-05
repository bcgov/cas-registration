import { render, screen } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import GreyBoxWithLinkFieldTemplate from "./GreyBoxWithLinkFieldTemplate";

describe("GreyBoxWithLinkFieldTemplate", () => {
  const schema: RJSFSchema = {
    type: "object",
    properties: {
      scheduleC: {
        type: "object",
        title:
          "Enter the proportion of industrial process emissions that are biogenic (emissions from biomass listed in",
        properties: {
          chemicalPulpAmount: {
            type: "number",
            title: "Chemical pulp amount (percentage)",
          },
          limeRecoveredByKilnAmount: {
            type: "number",
            title: "Lime recovered by kiln amount (percentage)",
          },
          totalAllocated: {
            type: "number",
            title: "Total allocated",
          },
        },
      },
    },
  };

  const formData = {
    scheduleC: {
      chemicalPulpAmount: 90,
      limeRecoveredByKilnAmount: 10,
      totalAllocated: 100,
    },
  };

  const uiSchemaWithLink = {
    scheduleC: {
      "ui:FieldTemplate": GreyBoxWithLinkFieldTemplate,
      "ui:options": {
        label: true,
        padding: "p-2",
        bgColor: "#f2f2f2",
        linkUrl:
          "https://www.bclaws.gov.bc.ca/civix/document/id/lc/statreg/249_2015#Schedulec",
        linkText: "Schedule C",
      },
    },
  };

  const uiSchemaWithoutLink = {
    scheduleC: {
      "ui:FieldTemplate": GreyBoxWithLinkFieldTemplate,
      "ui:options": {
        label: true,
        padding: "p-2",
        bgColor: "#f2f2f2",
      },
    },
  };

  const uiSchemaCustomBgColor = {
    scheduleC: {
      "ui:FieldTemplate": GreyBoxWithLinkFieldTemplate,
      "ui:options": {
        label: true,
        padding: "p-4",
        bgColor: "#ff0000",
      },
    },
  };

  it("renders the field with children correctly", () => {
    render(
      <FormBase
        schema={schema}
        uiSchema={uiSchemaWithLink}
        formData={formData}
      />,
    );
    expect(
      screen.getByText(/Enter the proportion of industrial process emissions/),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Chemical pulp amount (percentage)"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Lime recovered by kiln amount (percentage)"),
    ).toBeInTheDocument();
  });

  it("renders the link when linkUrl and linkText are provided", () => {
    render(
      <FormBase
        schema={schema}
        uiSchema={uiSchemaWithLink}
        formData={formData}
      />,
    );

    const link = screen.getByRole("link", { name: "Schedule C" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      "href",
      "https://www.bclaws.gov.bc.ca/civix/document/id/lc/statreg/249_2015#Schedulec",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("does not render link when linkUrl or linkText is missing", () => {
    render(
      <FormBase
        schema={schema}
        uiSchema={uiSchemaWithoutLink}
        formData={formData}
      />,
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("applies custom background color from uiSchema options", () => {
    const { container } = render(
      <FormBase
        schema={schema}
        uiSchema={uiSchemaCustomBgColor}
        formData={formData}
      />,
    );

    const greyBox = container.querySelector(".rounded-md");
    expect(greyBox).toHaveStyle({ backgroundColor: "rgb(255, 0, 0)" });
  });

  it("uses default background color when not specified", () => {
    const { container } = render(
      <FormBase
        schema={schema}
        uiSchema={uiSchemaWithLink}
        formData={formData}
      />,
    );

    const greyBox = container.querySelector(".rounded-md");
    expect(greyBox).toHaveStyle({ backgroundColor: "rgb(242, 242, 242)" });
  });

  it("applies custom padding class from uiSchema options", () => {
    const { container } = render(
      <FormBase
        schema={schema}
        uiSchema={uiSchemaCustomBgColor}
        formData={formData}
      />,
    );

    const greyBox = container.querySelector(".p-4");
    expect(greyBox).toBeInTheDocument();
  });

  it("uses default padding class when not specified", () => {
    const { container } = render(
      <FormBase
        schema={schema}
        uiSchema={uiSchemaWithLink}
        formData={formData}
      />,
    );

    const greyBox = container.querySelector(".p-2");
    expect(greyBox).toBeInTheDocument();
  });

  it("applies rounded-md and min-w-full classes", () => {
    const { container } = render(
      <FormBase
        schema={schema}
        uiSchema={uiSchemaWithLink}
        formData={formData}
      />,
    );

    const greyBox = container.querySelector(".rounded-md.min-w-full");
    expect(greyBox).toBeInTheDocument();
  });

  it("applies paddingLeft inline style", () => {
    const { container } = render(
      <FormBase
        schema={schema}
        uiSchema={uiSchemaWithLink}
        formData={formData}
      />,
    );

    const greyBox = container.querySelector(".rounded-md");
    expect(greyBox).toHaveStyle({ paddingLeft: "1rem" });
  });

  it("renders the complete Schedule C example correctly", () => {
    render(
      <FormBase
        schema={schema}
        uiSchema={uiSchemaWithLink}
        formData={formData}
      />,
    );

    expect(
      screen.getByText(/Enter the proportion of industrial process emissions/),
    ).toBeInTheDocument();

    const link = screen.getByRole("link", { name: "Schedule C" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      "href",
      "https://www.bclaws.gov.bc.ca/civix/document/id/lc/statreg/249_2015#Schedulec",
    );

    // Check form fields are rendered
    expect(
      screen.getByLabelText("Chemical pulp amount (percentage)"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Lime recovered by kiln amount (percentage)"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Total allocated")).toBeInTheDocument();
  });

  it("renders label when label option is true", () => {
    render(
      <FormBase
        schema={schema}
        uiSchema={uiSchemaWithLink}
        formData={formData}
      />,
    );

    expect(
      screen.getByText(/Enter the proportion of industrial process emissions/),
    ).toBeInTheDocument();
  });

  it("renders period after label and link", () => {
    render(
      <FormBase
        schema={schema}
        uiSchema={uiSchemaWithLink}
        formData={formData}
      />,
    );

    // The period should be present in the DOM after the link
    const labelSection = screen.getByText(
      /Enter the proportion of industrial process emissions/,
    ).parentElement;
    expect(labelSection?.textContent).toContain(".");
  });
});
