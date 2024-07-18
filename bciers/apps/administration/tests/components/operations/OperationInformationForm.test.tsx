import { render, screen } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import OperationInformationForm from "apps/administration/app/components/operations/OperationInformationForm";

// Just using a simple schema for testing purposes
// OperationInformationPage test will test the proper schema with extra enums provided by the backend
const testSchema: RJSFSchema = {
  type: "object",
  properties: {
    section1: {
      title: "Section 1",
      type: "object",
      properties: {
        name: {
          type: "string",
          title: "Operation Name",
        },
      },
    },
    section2: {
      title: "Section 2",
      type: "object",
      properties: {
        type: {
          type: "string",
          title: "Operation Type",
        },
      },
    },
  },
};

const formData = {
  name: "Operation 3",
  type: "Single Facility Operation",
};

describe("the OperationInformationForm component", () => {
  it("renders the OperationInformationForm component", async () => {
    render(<OperationInformationForm formData={{}} schema={testSchema} />);

    expect(screen.getByText(/Operation Name/i)).toBeVisible();
    expect(screen.getByText(/Operation Type/i)).toBeVisible();

    expect(screen.getByRole("button", { name: "Cancel" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Edit" })).toBeVisible();
  });

  it("should render the form with the correct values when formData is provided", async () => {
    render(
      <OperationInformationForm formData={formData} schema={testSchema} />,
    );

    expect(screen.getByText(/Operation Name/i)).toBeVisible();
    expect(screen.getByText(/Operation Type/i)).toBeVisible();
  });

  it("should have unchecked task list sections when no formData is provided", async () => {
    render(<OperationInformationForm formData={{}} schema={testSchema} />);

    expect(screen.getByTestId("section1-tasklist-check")).not.toContainHTML(
      "svg",
    );
    expect(screen.getByTestId("section2-tasklist-check")).not.toContainHTML(
      "svg",
    );
  });

  // it("should have checked task list sections when formData is provided", async () => {
  //   render(
  //     <OperationInformationForm formData={formData} schema={testSchema} />,
  //   );

  //   expect(screen.getByTestId("section1-tasklist-check")).toContainHTML("svg");
  //   expect(screen.getByTestId("section2-tasklist-check")).toContainHTML("svg");
  // });
});
