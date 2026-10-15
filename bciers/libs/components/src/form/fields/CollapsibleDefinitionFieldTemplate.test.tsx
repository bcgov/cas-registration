import { render, screen } from "@testing-library/react";
import { FieldTemplateProps } from "@rjsf/utils";
import CollapsibleDefinitionFieldTemplate from "./CollapsibleDefinitionFieldTemplate";

// The template reads the errors from the props of RJSF's errors element
const Errors = (_props: { errors: string[] }) => null;

const renderTemplate = (errors?: string[]) =>
  render(
    <CollapsibleDefinitionFieldTemplate
      {...({
        label: "Cement production",
        children: <span />,
        errors: errors ? <Errors errors={errors} /> : undefined,
      } as unknown as FieldTemplateProps)}
    />,
  );

describe("CollapsibleDefinitionFieldTemplate", () => {
  it("renders the label as an h6 title in the BC blue", () => {
    renderTemplate();

    expect(screen.getByText("Cement production")).toHaveClass(
      "MuiTypography-h6",
      "text-bc-bg-blue",
    );
  });

  it("renders the title in red when the field has errors", () => {
    renderTemplate(["is required"]);

    expect(screen.getByText("Cement production")).toHaveClass(
      "MuiTypography-h6",
      "text-[#dc2626]",
    );
  });
});
