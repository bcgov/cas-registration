import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { describe, expect } from "vitest";
import MultiStepFormBase from "./MultiStepFormBase";
import { useSession, useParams } from "@bciers/testConfig/mocks";
import { QueryParams, Session } from "@bciers/testConfig/types";
import userEvent from "@testing-library/user-event";

const testSchema = {
  type: "object",
  properties: {
    page1: {
      type: "object",
      title: "page1 header",
      required: ["field1"],
      properties: {
        field1: {
          type: "string",
        },
      },
    },
    page2: {
      type: "object",
      title: "page2 header",
      required: ["field2"],
      properties: {
        field2: {
          type: "string",
        },
      },
    },
    page3: {
      type: "object",
      title: "page3 header",
      required: ["field3"],
      properties: {
        field3: {
          type: "string",
        },
      },
    },
  },
};

const testUiSchema = {
  type: {
    "ui:widget": "TextWidget",
  },
};
const mockOnSubmit = vi.fn();
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
    field2: "test field2",
    field3: "test field3",
  },
  onSubmit: mockOnSubmit,
  schema: testSchema,
  setErrorReset: vi.fn(),
  showSubmissionStep: false,
  submitButtonText: "test submit button text",
  uiSchema: testUiSchema,
};

describe("The MultiStepFormBase component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useSession.mockReturnValue({
      data: {
        user: {
          app_role: "industry_user_admin",
        },
      },
    } as Session);
  });
  it("does not show the Edit button when allowEdit is false", () => {
    useParams.mockReturnValue({
      formSection: "1",
      operation: "create",
    } as QueryParams);

    render(<MultiStepFormBase {...defaultProps} allowEdit={false} />);
    expect(
      screen.queryByRole("button", { name: /Edit/i }),
    ).not.toBeInTheDocument();
  });

  it("makes the form editable when the Edit button is clicked", () => {
    useParams.mockReturnValue({
      formSection: "1",
      operation: "create",
    } as QueryParams);
    render(<MultiStepFormBase {...defaultProps} />);
    expect(screen.getByText(/test field1/i)).toHaveAttribute(
      "class",
      "read-only-widget whitespace-pre-line",
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
    render(<MultiStepFormBase {...defaultProps} />);
    const headerSteps = screen.getAllByTestId(/multistep-header-title/i);
    expect(headerSteps).toHaveLength(3);
    expect(headerSteps[0]).toHaveTextContent(/page1/i);
    expect(headerSteps[1]).toHaveTextContent(/page2/i);
    expect(headerSteps[2]).toHaveTextContent(/page3/i);
  });

  it("shows the header with correct steps (customStepNames) and submission step", () => {
    useParams.mockReturnValue({
      formSection: "1",
      operation: "create",
    } as QueryParams);
    render(
      <MultiStepFormBase
        {...defaultProps}
        showSubmissionStep={true}
        customStepNames={[
          "I am custom",
          "So am I",
          "Me too",
          "I am custom submit",
        ]}
      />,
    );
    const headerSteps = screen.getAllByTestId(/multistep-header-title/i);
    expect(headerSteps).toHaveLength(4);
    expect(headerSteps[0]).toHaveTextContent(/I am custom/i);
    expect(headerSteps[1]).toHaveTextContent(/So am I/i);
    expect(headerSteps[2]).toHaveTextContent(/Me too/i);
    expect(headerSteps[3]).toHaveTextContent(/I am custom submit/i);
  });

  it("throws error if there's something wrong with the header steps", () => {
    useParams.mockReturnValue({
      formSection: "1",
      operation: "create",
    } as QueryParams);
    expect(() =>
      render(
        <MultiStepFormBase
          {...defaultProps}
          showSubmissionStep={true}
          customStepNames={["I am custom"]}
        />,
      ),
    ).toThrow(
      "The number of custom header titles must match the number of form sections",
    );
  });

  it("navigation buttons work on first form page", () => {
    useParams.mockReturnValue({
      formSection: "1",
      operation: "create",
    } as QueryParams);
    render(<MultiStepFormBase {...defaultProps} disabled={false} />);
    const saveAndContinueButton = screen.getByRole("button", {
      name: /test submit button text/i,
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
  });

  it("navigation and submit buttons work on second form page", () => {
    useParams.mockReturnValue({
      formSection: "2",
      operation: "025328a0-f9e8-4e1a-888d-aa192cb053db",
    } as QueryParams);

    render(<MultiStepFormBase {...defaultProps} disabled={false} />);
    const saveAndContinueButton = screen.getByRole("button", {
      name: /test submit button text/i,
    });
    expect(screen.getByLabelText(/field2*/i)).toHaveValue("test field2");
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
  });

  it("navigation and submit buttons work on last form page", () => {
    useParams.mockReturnValue({
      formSection: "3",
      operation: "025328a0-f9e8-4e1a-888d-aa192cb053db",
    } as QueryParams);
    render(<MultiStepFormBase {...defaultProps} disabled={false} />);
    expect(screen.getByLabelText(/field3*/i)).toHaveValue("test field3");
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
  });

  it("submission is disabled if form is still submitting", async () => {
    useParams.mockReturnValue({
      formSection: "1",
      operation: "create",
    } as QueryParams);
    const user = userEvent.setup();
    let resolve: (v: unknown) => void;

    const mockPromiseOnSubmit = vitest.fn().mockReturnValue(
      new Promise((_resolve) => {
        resolve = _resolve;
      }),
    );

    render(
      <MultiStepFormBase
        {...defaultProps}
        disabled={false}
        onSubmit={mockPromiseOnSubmit}
      />,
    );
    const saveAndContinueButton = screen.getByRole("button", {
      name: /test submit button text/i,
    });

    await act(async () => {
      await user.click(saveAndContinueButton);
    });

    waitFor(() => {
      expect(saveAndContinueButton).toBeDisabled();
    });

    await act(async () => {
      resolve(vitest.fn);
    });

    expect(saveAndContinueButton).not.toBeDisabled();
  });

  it("shows an error if there was a problem with form submission", () => {
    useParams.mockReturnValue({
      formSection: "1",
      operation: "create",
    } as QueryParams);

    render(
      <MultiStepFormBase {...defaultProps} disabled={false} formData={{}} />,
    );
    const saveAndContinueButton = screen.getByRole("button", {
      name: /test submit button text/i,
    });
    fireEvent.click(saveAndContinueButton);
    expect(screen.getByRole("alert")).toBeVisible();
    expect(mockOnSubmit).not.toHaveBeenCalled(); // submit function is not called because we hit validation errors first
  });

  it("calls the onChange prop when the form changes", () => {
    useParams.mockReturnValue({
      formSection: "1",
      operation: "create",
    } as QueryParams);

    const changeHandler = vi.fn();
    render(
      <MultiStepFormBase
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
      <MultiStepFormBase {...defaultProps}>
        <div data-testid="test-child">Test child</div>
      </MultiStepFormBase>,
    );
    expect(screen.getByTestId("test-child")).toBeVisible();
  });
});
