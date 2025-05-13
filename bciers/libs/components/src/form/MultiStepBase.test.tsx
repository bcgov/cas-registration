import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect } from "vitest";
import MultiStepBase from "./MultiStepBase";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { useParams, useRouter, useSession } from "@bciers/testConfig/mocks";
import { QueryParams, Session } from "@bciers/testConfig/types";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";

const mockOnSubmit = vi.fn();
const mockPush = vi.fn();

const testSchema: RJSFSchema = {
  type: "object",
  required: ["field1"],
  properties: {
    field1: {
      type: "string",
    },
  },
};

const testUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  field1: {
    "ui:widget": "TextWidget",
  },
};

const defaultProps = {
  allowBackNavigation: true,
  allowEdit: true,
  baseUrl: "baseurl.com",
  cancelUrl: "cancelurl.com",
  customStepNames: undefined,
  disabled: true,
  error: undefined,
  formData: {
    field1: "test field1",
  },
  onSubmit: mockOnSubmit,
  schema: testSchema,
  setErrorReset: vi.fn(),
  step: 1,
  steps: ["page1", "page2", "page3"],
  uiSchema: testUiSchema,
};

describe("The MultiStepBase component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useSession.mockReturnValue({
      data: {
        user: {
          app_role: "industry_user_admin",
        },
      },
    } as Session);

    useRouter.mockReturnValue({
      query: {},
      replace: vi.fn(),
      push: mockPush,
    });
  });
  it("does not show the Edit button when allowEdit is false", () => {
    useParams.mockReturnValue({
      formSection: "1",
      operation: "create",
    } as QueryParams);

    render(<MultiStepBase {...defaultProps} allowEdit={false} />);
    expect(
      screen.queryByRole("button", { name: /Edit/i }),
    ).not.toBeInTheDocument();
  });

  it("makes the form editable when the Edit button is clicked", () => {
    useParams.mockReturnValue({
      formSection: "1",
      operation: "create",
    } as QueryParams);
    render(<MultiStepBase {...defaultProps} />);
    expect(screen.getByText(/test field1/i)).toHaveAttribute(
      "class",
      "read-only-widget whitespace-pre-line ",
    );
    const editButton = screen.getByRole("button", { name: /Edit/i });
    fireEvent.click(editButton);
    // this confirms the form is editable because the label is accompanied by an <input>
    expect(screen.getByLabelText(/field1/i)).toHaveValue("test field1");
  });

  it("shows the header with correct steps (formSectionTitles) and no submission step", () => {
    useParams.mockReturnValue({
      formSection: "1",
      operation: "create",
    } as QueryParams);
    render(<MultiStepBase {...defaultProps} />);
    const headerSteps = screen.getAllByTestId(/multistep-header-title/i);
    expect(headerSteps).toHaveLength(3);
    expect(headerSteps[0]).toHaveTextContent(/page1/i);
    expect(headerSteps[1]).toHaveTextContent(/page2/i);
    expect(headerSteps[2]).toHaveTextContent(/page3/i);
  });

  it("navigation buttons work on first form page when no baseUrl is given", async () => {
    mockOnSubmit.mockReturnValue({ id: "uuid" });
    render(
      <MultiStepBase
        {...defaultProps}
        disabled={false}
        schema={{
          ...testSchema,
          title: "page1",
        }}
      />,
    );
    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "page1",
    );

    const saveAndContinueButton = screen.getByRole("button", {
      name: /Save and Continue/i,
    });
    expect(screen.getByLabelText(/field1*/i)).toHaveValue("test field1");
    expect(screen.getByRole("button", { name: /Back/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Cancel/i })).not.toBeDisabled();
    expect(screen.getByRole("link", { name: /Cancel/i })).toHaveAttribute(
      "href",
      "cancelurl.com",
    );
    expect(saveAndContinueButton).not.toBeDisabled();
    fireEvent.click(saveAndContinueButton);
    expect(mockOnSubmit).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("navigation and submit buttons work on subsequent form page", async () => {
    mockOnSubmit.mockReturnValue({ id: 1 });
    render(
      <MultiStepBase
        {...defaultProps}
        disabled={false}
        step={2}
        schema={{
          ...testSchema,
          title: "page2",
        }}
      />,
    );
    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "page2",
    );

    const saveAndContinueButton = screen.getByRole("button", {
      name: /Save and Continue/i,
    });
    expect(screen.getByRole("button", { name: /Back/i })).not.toBeDisabled();
    expect(screen.getByRole("link", { name: /Back/i })).toHaveAttribute(
      "href",
      "baseurl.com/1",
    );
    expect(screen.getByRole("button", { name: /Cancel/i })).not.toBeDisabled();
    expect(screen.getByRole("link", { name: /Cancel/i })).toHaveAttribute(
      "href",
      "cancelurl.com",
    );
    expect(saveAndContinueButton).not.toBeDisabled();
    fireEvent.click(saveAndContinueButton);
    expect(mockOnSubmit).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("baseurl.com/3");
    });
  });

  it("navigation and submit buttons work on last form page", async () => {
    render(
      <MultiStepBase
        {...defaultProps}
        submitButtonText={"test submit button text"}
        disabled={false}
        step={3}
        schema={{
          ...testSchema,
          title: "page3",
        }}
      />,
    );
    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "page3",
    );

    const submitButton = screen.getByRole("button", {
      name: /test submit button text/i,
    });

    expect(screen.getByRole("button", { name: /Back/i })).not.toBeDisabled();
    expect(screen.getByRole("link", { name: /Back/i })).toHaveAttribute(
      "href",
      "baseurl.com/2",
    );
    expect(screen.getByRole("button", { name: /Cancel/i })).not.toBeDisabled();
    expect(screen.getByRole("link", { name: /Cancel/i })).toHaveAttribute(
      "href",
      "cancelurl.com",
    );
    expect(
      screen.getByRole("button", { name: /test submit button text/i }),
    ).not.toBeDisabled();
    fireEvent.click(submitButton);
    expect(mockOnSubmit).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("submission is disabled if form is still submitting", async () => {
    render(
      <MultiStepBase
        {...defaultProps}
        disabled={false}
        onSubmit={mockOnSubmit}
        baseUrl={undefined}
      />,
    );
    const saveAndContinueButton = screen.getByRole("button", {
      name: /Save and Continue/i,
    });

    expect(saveAndContinueButton).not.toBeDisabled();

    fireEvent.click(saveAndContinueButton);

    expect(await screen.findByTestId("spinner")).toBeVisible();

    // re-finding the button is necessary for the test to pass
    // finding by test-id since the text content of the button is hidden when the spinner is visible
    expect(await screen.findByTestId("submit-button")).toBeDisabled();
  });

  it("calls the onChange prop when the form changes", () => {
    useParams.mockReturnValue({
      formSection: "1",
      operation: "create",
    } as QueryParams);

    const changeHandler = vi.fn();
    render(
      <MultiStepBase
        {...defaultProps}
        disabled={false}
        onChange={changeHandler}
      />,
    );
    const input = screen.getByLabelText(/field1*/i);
    fireEvent.change(input, { target: { value: "new value" } });

    expect(changeHandler).toHaveBeenCalled();
  });

  it("renders children", () => {
    useParams.mockReturnValue({
      formSection: "1",
      operation: "create",
    } as QueryParams);

    render(
      <MultiStepBase {...defaultProps}>
        <div data-testid="test-child">Test child</div>
      </MultiStepBase>,
    );
    expect(screen.getByTestId("test-child")).toBeVisible();
  });

  it("shows an error if there was a problem with form validation", () => {
    useParams.mockReturnValue({
      formSection: "1",
      operation: "create",
    } as QueryParams);

    render(<MultiStepBase {...defaultProps} disabled={false} formData={{}} />);
    const saveAndContinueButton = screen.getByRole("button", {
      name: /Save and Continue/i,
    });
    fireEvent.click(saveAndContinueButton);
    expect(screen.getByRole("alert")).toBeVisible();
    expect(mockOnSubmit).not.toHaveBeenCalled(); // submit function is not called because we hit validation errors first
  });

  it("shows an error if passed one", () => {
    render(
      <MultiStepBase
        {...defaultProps}
        disabled={false}
        step={2}
        schema={{
          ...testSchema,
          title: "page2",
        }}
        error={"Test error"}
      />,
    );
    expect(screen.getByRole("alert")).toBeVisible();
    expect(screen.getByText("Test error")).toBeVisible();
  });

  it("shows an error if response returns an error", async () => {
    mockOnSubmit.mockReturnValueOnce({ error: "whoopsie" });
    render(
      <MultiStepBase
        {...defaultProps}
        disabled={false}
        step={2}
        schema={{
          ...testSchema,
          title: "page2",
        }}
      />,
    );

    const saveAndContinueButton = screen.getByRole("button", {
      name: /Save and Continue/i,
    });

    fireEvent.click(saveAndContinueButton);
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
      expect(screen.getByRole("alert")).toBeVisible();
      expect(screen.getByText("whoopsie")).toBeVisible();
    });
  });

  it("clears old errors", async () => {
    render(
      <MultiStepBase
        {...defaultProps}
        disabled={false}
        step={2}
        schema={{
          ...testSchema,
          title: "page2",
        }}
        error="old"
      />,
    );

    const saveAndContinueButton = screen.getByRole("button", {
      name: /Save and Continue/i,
    });

    fireEvent.click(saveAndContinueButton);
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });
});
