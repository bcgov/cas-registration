import { userEvent } from "@testing-library/user-event";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import dayjs from "dayjs";
const dateWidgetFieldLabel = "DateWidget test field";
const dateWidgetLabelRequired = `${dateWidgetFieldLabel}*`;

export const dateWidgetFieldSchema = {
  type: "object",
  required: ["dateWidgetTestField"],
  properties: {
    dateWidgetTestField: {
      type: "string",
      title: dateWidgetFieldLabel,
    },
  },
} as RJSFSchema;

export const dateWidgetFieldUiSchema = {
  dateWidgetTestField: {
    "ui:widget": "DateWidget",
  },
};

describe("RJSF DateWidget", () => {
  it("should render a date widget field", async () => {
    render(
      <FormBase
        schema={dateWidgetFieldSchema}
        uiSchema={dateWidgetFieldUiSchema}
      />,
    );
    expect(screen.getByLabelText(dateWidgetLabelRequired)).toBeVisible();
  });

  it("should be empty by default", async () => {
    render(
      <FormBase
        schema={dateWidgetFieldSchema}
        uiSchema={dateWidgetFieldUiSchema}
      />,
    );

    const dateWidgetInput = screen.getByRole("textbox") as HTMLInputElement;

    expect(dateWidgetInput.value).toBe("");
  });

  it("should have the correct value when formData is provided", async () => {
    render(
      <FormBase
        schema={dateWidgetFieldSchema}
        uiSchema={dateWidgetFieldUiSchema}
        formData={{ dateWidgetTestField: "2024-07-05T09:00:00.000Z" }}
      />,
    );

    const dateWidgetInput: HTMLInputElement = screen.getByLabelText(
      dateWidgetLabelRequired,
    );

    expect(dateWidgetInput.value).toBe("2024-07-05");
  });

  it("should allow typing a date", async () => {
    render(
      <FormBase
        schema={dateWidgetFieldSchema}
        uiSchema={dateWidgetFieldUiSchema}
      />,
    );

    const dateWidgetInput = screen.getByRole("textbox") as HTMLInputElement;
    await act(async () => {
      await userEvent.type(dateWidgetInput, "020240705");
    });

    expect(dateWidgetInput.value).toBe("2024-07-05");
  });

  it("should allow typing a date with a separator", async () => {
    render(
      <FormBase
        schema={dateWidgetFieldSchema}
        uiSchema={dateWidgetFieldUiSchema}
      />,
    );

    const dateWidgetInput = screen.getByRole("textbox") as HTMLInputElement;

    await act(async () => {
      await userEvent.type(dateWidgetInput, "02024-07-05");
    });

    expect(dateWidgetInput.value).toBe("2024-07-05");
  });

  it("should not allow typing an invalid date", async () => {
    render(
      <FormBase
        schema={dateWidgetFieldSchema}
        uiSchema={dateWidgetFieldUiSchema}
      />,
    );

    const dateWidgetInput = screen.getByLabelText(
      dateWidgetLabelRequired,
    ) as HTMLInputElement;

    await act(async () => {
      userEvent.type(dateWidgetInput, "not a date");
    });

    expect(dateWidgetInput.value).toBe("");
  });

  it("should allow the user to select a date", async () => {
    render(
      <FormBase
        schema={dateWidgetFieldSchema}
        uiSchema={dateWidgetFieldUiSchema}
      />,
    );

    waitFor(async () => {
      screen.getByTestId("CalendarIcon");
    });

    const dateWidgetClickElement = screen.getByTestId("CalendarIcon")
      .parentElement as HTMLElement;

    await act(async () => {
      fireEvent.click(dateWidgetClickElement);
    });

    const dateWidgetCalendar = screen.getByRole("dialog");
    const dateWidgetCalendarDay = dateWidgetCalendar.querySelector(
      ".MuiPickersDay-today",
    ) as HTMLElement;

    await act(async () => {
      fireEvent.click(dateWidgetCalendarDay);
    });

    const dateWidgetInput = screen.getByLabelText(
      dateWidgetLabelRequired,
    ) as HTMLInputElement;

    // Checking that this is a valid date rather than hardcoding a date.
    // This is because this test selects the current day using the .MuiPickersDay-today class
    // So that the test will work regardless of when it is run.
    expect(dateWidgetInput.value).toBe(dayjs().format("YYYY-MM-DD"));
    expect(dayjs(dateWidgetInput.value).isValid()).toBe(true);
  });

  it("always saves the date as 9am UTC", async () => {
    const mockSubmit = vi.fn();
    render(
      <FormBase
        schema={dateWidgetFieldSchema}
        uiSchema={dateWidgetFieldUiSchema}
        onSubmit={mockSubmit}
      />,
    );

    const dateWidgetInput = screen.getByRole("textbox") as HTMLInputElement;
    await act(async () => {
      fireEvent.change(dateWidgetInput, {
        target: { value: "2024-07-05" },
      });
    });

    expect(dateWidgetInput.value).toBe("2024-07-05");

    const submitButton = screen.getByRole("button", { name: "Submit" });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(mockSubmit).toHaveBeenCalledOnce();
    const formData = mockSubmit.mock.calls[0][0].formData;

    const submittedDate = formData.dateWidgetTestField;
    const submittedDateConverted = dayjs(formData.dateWidgetTestField);

    // Check the date string time is 9am
    expect(submittedDate).toMatch(/9:00:00.000/);

    // Check that the date string is in UTC (ends with Z)
    expect(submittedDate.slice(-1)).toBe("Z");

    // Check time converted to dayjs is the same as the date submitted
    expect(submittedDateConverted.utc().hour()).toBe(9);
    expect(submittedDateConverted.utc().minute()).toBe(0);
    expect(submittedDateConverted.utc().second()).toBe(0);
  });
});
