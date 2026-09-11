import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WidgetProps } from "@rjsf/utils";
import PenaltyTypeRadioWidget from "@/compliance/src/app/widgets/PenaltyTypeRadioWidget";
import { PenaltyType } from "@/compliance/src/app/types";

const buildProps = (overrides: Partial<WidgetProps> = {}) =>
  ({
    id: "root_requested_penalty_type",
    value: PenaltyType.AUTOMATIC_OVERDUE,
    onChange: vi.fn(),
    options: {
      enumOptions: [
        { value: PenaltyType.AUTOMATIC_OVERDUE, label: "Automatic overdue" },
        { value: PenaltyType.LATE_SUBMISSION, label: "GGEAPAR" },
      ],
    },
    ...overrides,
  }) as unknown as WidgetProps;

describe("PenaltyTypeRadioWidget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a radio per option", () => {
    render(<PenaltyTypeRadioWidget {...buildProps()} />);

    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });

  it("checks the option matching the current value", () => {
    render(<PenaltyTypeRadioWidget {...buildProps()} />);

    expect(
      screen.getByRole("radio", { name: "Automatic overdue" }),
    ).toBeChecked();
    expect(screen.getByRole("radio", { name: "GGEAPAR" })).not.toBeChecked();
  });

  it("checks nothing when the value matches no option", () => {
    render(<PenaltyTypeRadioWidget {...buildProps({ value: undefined })} />);

    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).not.toBeChecked();
    }
  });

  it("reports the option value rather than its index or label", async () => {
    const onChange = vi.fn();
    render(<PenaltyTypeRadioWidget {...buildProps({ onChange })} />);

    await userEvent.click(screen.getByRole("radio", { name: "GGEAPAR" }));

    expect(onChange).toHaveBeenCalledWith(PenaltyType.LATE_SUBMISSION);
  });

  // The input is visually hidden rather than display:none, so it has to stay operable.
  it("keeps the radios reachable when the widget is enabled", () => {
    render(<PenaltyTypeRadioWidget {...buildProps()} />);

    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).toBeEnabled();
    }
  });

  it.each([
    ["disabled", { disabled: true }],
    ["readonly", { readonly: true }],
  ])("disables every option when %s", (_label, props) => {
    render(<PenaltyTypeRadioWidget {...buildProps(props)} />);

    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).toBeDisabled();
    }
  });

  it("renders nothing to choose from when there are no options", () => {
    render(<PenaltyTypeRadioWidget {...buildProps({ options: {} })} />);

    expect(screen.queryAllByRole("radio")).toHaveLength(0);
  });
});
