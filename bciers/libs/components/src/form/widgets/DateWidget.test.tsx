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

    const dateWidgetClickElement =
      screen.getByTestId("CalendarIcon").parentElement;

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
});
