import { userEvent } from "@testing-library/user-event";
import { act, render, screen, waitFor } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import { actionHandler } from "@bciers/testConfig/mocks";
import {
  checkComboBoxWidgetValidationStyles,
  checkNoValidationErrorIsTriggered,
} from "@bciers/testConfig/helpers/form";

const operatorSearchFieldLabel = "OperatorSearchWidget test field";
const operatorSearchRequiredLabel = `${operatorSearchFieldLabel}*`;
const operatorPlaceholder = "Search for an operator...";

const operatorSearchFieldSchema = {
  type: "object",
  required: ["operatorSearchTestField"],
  properties: {
    operatorSearchTestField: {
      type: "string",
      title: operatorSearchFieldLabel,
    },
  },
} as RJSFSchema;

const operatorSearchFieldUiSchema = {
  operatorSearchTestField: {
    "ui:widget": "OperatorSearchWidget",
    "ui:placeholder": operatorPlaceholder,
  },
};

describe("RJSF OperatorSearchWidget", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should render the search field", async () => {
    render(
      <FormBase
        schema={operatorSearchFieldSchema}
        uiSchema={operatorSearchFieldUiSchema}
      />,
    );
    expect(screen.getByLabelText(operatorSearchRequiredLabel)).toBeVisible();
  });

  it("should be empty by default", async () => {
    render(
      <FormBase
        schema={operatorSearchFieldSchema}
        uiSchema={operatorSearchFieldUiSchema}
      />,
    );

    const searchField = screen.getByRole("combobox") as HTMLInputElement;

    expect(searchField).toHaveValue("");
  });

  it("should render the search field placeholder text", async () => {
    render(
      <FormBase
        schema={operatorSearchFieldSchema}
        uiSchema={operatorSearchFieldUiSchema}
      />,
    );
    expect(
      screen.getByPlaceholderText("Search for an operator..."),
    ).toBeVisible();
  });

  it("should render the correct values when the search field returns results", async () => {
    render(
      <FormBase
        schema={operatorSearchFieldSchema}
        uiSchema={operatorSearchFieldUiSchema}
      />,
    );

    const searchField = screen.getByRole("combobox");

    await act(async () => {
      await userEvent.type(searchField, "Operator");
    });

    actionHandler.mockResolvedValueOnce([
      {
        id: "1",
        legal_name: "Operator 1",
      },
      {
        id: "2",
        legal_name: "Operator 2",
      },
      {
        id: "3",
        legal_name: "Operator 3",
      },
      {
        id: "4",
        legal_name: "turtle",
      },
    ]);

    await waitFor(async () => {
      expect(searchField).toHaveValue("Operator");
    });

    await waitFor(async () => {
      expect(screen.getByText("Operator 1")).toBeVisible();
      expect(screen.getByText("Operator 2")).toBeVisible();
      expect(screen.getByText("Operator 3")).toBeVisible();
      expect(screen.queryByText("turtle")).not.toBeInTheDocument();
    });
  });

  it("should close the dropdown when the field loses focus", async () => {
    render(
      <FormBase
        schema={operatorSearchFieldSchema}
        uiSchema={operatorSearchFieldUiSchema}
      />,
    );

    const searchField = screen.getByRole("combobox");

    await act(async () => {
      await userEvent.type(searchField, "Operator");
    });

    actionHandler.mockResolvedValueOnce([
      {
        id: "1",
        legal_name: "Operator 1",
      },
    ]);

    await waitFor(async () => {
      expect(searchField).toHaveValue("Operator");
    });

    await waitFor(async () => {
      expect(screen.getByText("Operator 1")).toBeVisible();
    });

    searchField.blur();

    await waitFor(async () => {
      expect(screen.queryByText("Operator 1")).not.toBeInTheDocument();
    });
  });

  it("should render the no results message when the search field returns no results", async () => {
    render(
      <FormBase
        schema={operatorSearchFieldSchema}
        uiSchema={operatorSearchFieldUiSchema}
      />,
    );

    const searchField = screen.getByRole("combobox");

    await act(async () => {
      await userEvent.type(searchField, "Operator");
    });

    actionHandler.mockResolvedValueOnce([]);

    await waitFor(async () => {
      expect(searchField).toHaveValue("Operator");
    });

    await waitFor(async () => {
      expect(
        screen.getByText("No results found. Retry or create an operator."),
      ).toBeVisible();
    });
  });

  it("should allow selecting an operator", async () => {
    render(
      <FormBase
        schema={operatorSearchFieldSchema}
        uiSchema={operatorSearchFieldUiSchema}
      />,
    );

    const searchField = screen.getByRole("combobox");

    await act(async () => {
      await userEvent.type(searchField, "Operator");
    });

    actionHandler.mockResolvedValueOnce([
      {
        id: "1",
        legal_name: "Operator 1",
      },
    ]);

    await waitFor(async () => {
      expect(searchField).toHaveValue("Operator");
    });

    await waitFor(async () => {
      expect(screen.getByText("Operator 1")).toBeVisible();
    });

    const operator1 = screen.getByText("Operator 1");

    await act(async () => {
      await userEvent.click(operator1);
    });

    expect(searchField).toHaveValue("Operator 1");

    await checkNoValidationErrorIsTriggered();
  });

  it("should show the validation error message when the search field is required", async () => {
    render(
      <FormBase
        schema={operatorSearchFieldSchema}
        uiSchema={operatorSearchFieldUiSchema}
      />,
    );

    const submitButton = screen.getByRole("button", { name: "Submit" });

    await act(async () => {
      await userEvent.click(submitButton);
    });

    expect(screen.getByText("Required field")).toBeVisible();
  });

  it("should have the correct styles when the validation error is shown", async () => {
    actionHandler.mockResolvedValueOnce([]);
    await checkComboBoxWidgetValidationStyles(
      <FormBase
        schema={operatorSearchFieldSchema}
        uiSchema={operatorSearchFieldUiSchema}
      />,
    );
  });
});
