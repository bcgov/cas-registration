import React from "react";
import { render, screen } from "@testing-library/react";
import { FieldTemplateProps } from "@rjsf/utils";
import BiogenicEmissionsSplitFieldTemplate from "./BiogenicEmissionsSplitFieldTemplate";
import { scheduleCUrl } from "@reporting/src/app/utils/constants";

const buildProps = (
  overrides: Partial<FieldTemplateProps> = {},
): FieldTemplateProps =>
  ({
    id: "root_biogenicEmissionsSplit",
    label: "",
    children: <span />,
    errors: null,
    description: null,
    classNames: "",
    uiSchema: {},
    formContext: {},
    registry: {} as any,
    ...overrides,
  }) as FieldTemplateProps;

describe("BiogenicEmissionsSplitFieldTemplate", () => {
  it("renders the hardcoded title text", () => {
    render(<BiogenicEmissionsSplitFieldTemplate {...buildProps()} />);
    expect(
      screen.getByText(
        /Enter the proportion of industrial process emissions that are biogenic/,
      ),
    ).toBeInTheDocument();
  });

  it("renders the Schedule C link with correct href", () => {
    render(<BiogenicEmissionsSplitFieldTemplate {...buildProps()} />);
    const link = screen.getByRole("link", { name: "Schedule C" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", scheduleCUrl);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders closing parenthesis and period after the link", () => {
    const { container } = render(
      <BiogenicEmissionsSplitFieldTemplate {...buildProps()} />,
    );
    const titleDiv = container.querySelector(".font-semibold");
    expect(titleDiv?.textContent).toMatch(/Schedule C\s*\)\.$/);
  });

  it("renders children", () => {
    render(
      <BiogenicEmissionsSplitFieldTemplate
        {...buildProps({ children: <div>form fields here</div> })}
      />,
    );
    expect(screen.getByText("form fields here")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <BiogenicEmissionsSplitFieldTemplate
        {...buildProps({ description: <p>some description</p> })}
      />,
    );
    expect(screen.getByText("some description")).toBeInTheDocument();
  });

  it("renders errors when provided", () => {
    render(
      <BiogenicEmissionsSplitFieldTemplate
        {...buildProps({ errors: <p>some error</p> })}
      />,
    );
    expect(screen.getByText("some error")).toBeInTheDocument();
  });

  it("applies the grey background color", () => {
    const { container } = render(
      <BiogenicEmissionsSplitFieldTemplate {...buildProps()} />,
    );
    const box = container.querySelector(".rounded-md");
    expect(box).toHaveStyle({ backgroundColor: "rgb(242, 242, 242)" });
  });
});
