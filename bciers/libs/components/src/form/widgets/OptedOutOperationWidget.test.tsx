import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import OptedOutOperationWidget from "./OptedOutOperationWidget";
import { actionHandler } from "@bciers/actions";

// -------------------- mocks --------------------

vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

interface ComboBoxProps {
  onChange: (value: number) => void;
  disabled: boolean;
  value: number | undefined;
  rawErrors: string[] | undefined;
}

vi.mock("./ComboBox", () => ({
  default: ({ onChange, disabled, value, rawErrors }: ComboBoxProps) => (
    <div>
      <button onClick={() => onChange(2025)} disabled={disabled}>
        select-year
      </button>
      <div>value:{String(value)}</div>
      {rawErrors && <div role="alert">{rawErrors[0]}</div>}
    </div>
  ),
}));

interface ToggleWidgetProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled: boolean;
}

vi.mock("./ToggleWidget", () => ({
  default: ({ value, onChange, disabled }: ToggleWidgetProps) => (
    <button onClick={() => onChange(!value)} disabled={disabled}>
      toggle:{value ? "on" : "off"}
    </button>
  ),
}));

// -------------------- helpers --------------------

interface FormContext {
  isOptedOut: boolean;
  isCasDirector: boolean;
  operationId: string;
}

const baseProps: any = {
  id: "opted-out",
  value: { final_reporting_year: 2024 },
  onChange: vi.fn(),
  registry: {},
  schema: {
    properties: {
      final_reporting_year: {},
    },
  },
  uiSchema: {},
  name: "opted-out",
  options: {},
  onBlur: vi.fn(),
  onFocus: vi.fn(),
  label: "",
};

function renderWidget(formContext: FormContext) {
  return render(
    <OptedOutOperationWidget {...baseProps} formContext={formContext} />,
  );
}

// -------------------- tests --------------------

describe("OptedOutOperationWidget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders opted-out state with year selector", () => {
    renderWidget({
      isOptedOut: true,
      isCasDirector: true,
      operationId: "123",
    });

    expect(screen.getByText("Opt-in status:")).toBeInTheDocument();
    expect(screen.getByText("toggle:off")).toBeInTheDocument();
    expect(screen.getByText("select-year")).toBeInTheDocument();
  });

  it("disables controls for non-CAS director", () => {
    renderWidget({
      isOptedOut: true,
      isCasDirector: false,
      operationId: "123",
    });

    expect(screen.getByText("toggle:off")).toBeDisabled();
    expect(screen.getByText("select-year")).toBeDisabled();
  });

  it("persists final reporting year change", async () => {
    vi.mocked(actionHandler).mockResolvedValue({});

    renderWidget({
      isOptedOut: true,
      isCasDirector: true,
      operationId: "123",
    });

    fireEvent.click(screen.getByText("select-year"));

    await waitFor(() => {
      expect(actionHandler).toHaveBeenCalledWith(
        "registration/operations/123/registration/opted-in-operation-detail/final-reporting-year",
        "PUT",
        "",
        {
          body: JSON.stringify({ final_reporting_year: 2025 }),
        },
      );
    });

    expect(baseProps.onChange).toHaveBeenCalledWith(2025);
  });

  it("shows error when save fails", async () => {
    vi.mocked(actionHandler).mockResolvedValue({
      error: "Something went wrong",
    });

    renderWidget({
      isOptedOut: true,
      isCasDirector: true,
      operationId: "123",
    });

    fireEvent.click(screen.getByText("select-year"));

    const widgetAlert = await screen.findByText("Something went wrong", {
      selector: "span",
    });
    expect(widgetAlert).toBeInTheDocument();
  });

  it("toggles to opted-in and clears final reporting year", async () => {
    vi.mocked(actionHandler).mockResolvedValue({});

    renderWidget({
      isOptedOut: true,
      isCasDirector: true,
      operationId: "123",
    });

    fireEvent.click(screen.getByText("toggle:off"));

    await waitFor(() => {
      expect(actionHandler).toHaveBeenCalledWith(
        "registration/operations/123/registration/opted-in-operation-detail/final-reporting-year",
        "PUT",
        "",
        {
          body: JSON.stringify({ final_reporting_year: null }),
        },
      );
    });

    expect(baseProps.onChange).toHaveBeenCalledWith(undefined);
  });

  it("renders explanatory text when year is selected", () => {
    renderWidget({
      isOptedOut: true,
      isCasDirector: true,
      operationId: "123",
    });

    fireEvent.click(screen.getByText("select-year"));

    expect(
      screen.getByText(
        "Operation will not report for 2026 reporting year and subsequent years",
      ),
    ).toBeInTheDocument();
  });

  it("can toggle between Opted-in and Opted-out multiple times", async () => {
    vi.mocked(actionHandler).mockResolvedValue({});

    // Start in opted-out state
    renderWidget({
      isOptedOut: true,
      isCasDirector: true,
      operationId: "123",
    });

    // Verify initial state: opted-out with year selector visible
    expect(screen.getByText("toggle:off")).toBeInTheDocument();
    expect(screen.getByText("select-year")).toBeInTheDocument();

    // First toggle: opted-out -> opted-in
    fireEvent.click(screen.getByText("toggle:off"));

    await waitFor(() => {
      expect(actionHandler).toHaveBeenCalledWith(
        "registration/operations/123/registration/opted-in-operation-detail/final-reporting-year",
        "PUT",
        "",
        {
          body: JSON.stringify({ final_reporting_year: null }),
        },
      );
    });

    // Verify opted-in state: year selector should be hidden
    expect(screen.getByText("toggle:on")).toBeInTheDocument();
    expect(screen.queryByText("select-year")).not.toBeInTheDocument();

    // Second toggle: opted-in -> opted-out
    fireEvent.click(screen.getByText("toggle:on"));

    // Verify opted-out state: year selector should be visible again
    expect(screen.getByText("toggle:off")).toBeInTheDocument();
    expect(screen.getByText("select-year")).toBeInTheDocument();

    // Third toggle: opted-out -> opted-in again
    fireEvent.click(screen.getByText("toggle:off"));

    await waitFor(() => {
      expect(actionHandler).toHaveBeenCalledWith(
        "registration/operations/123/registration/opted-in-operation-detail/final-reporting-year",
        "PUT",
        "",
        {
          body: JSON.stringify({ final_reporting_year: null }),
        },
      );
    });

    // Verify opted-in state again
    expect(screen.getByText("toggle:on")).toBeInTheDocument();
    expect(screen.queryByText("select-year")).not.toBeInTheDocument();
  });
});
