import { userEvent } from "@testing-library/user-event";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import dayjs from "dayjs";
import {
  checkTextWidgetValidationStyles,
  checkNoValidationErrorIsTriggered,
  typeDate,
} from "@bciers/testConfig/helpers/form";

const dateWidgetFieldLabel = "DateWidget test field";
const dateWidgetLabelRequired = `${dateWidgetFieldLabel}*`;

export const dateWidgetFieldSchema: RJSFSchema = {
  type: "object",
  required: ["dateWidgetTestField"],
  properties: {
    dateWidgetTestField: {
      type: "string",
      title: dateWidgetFieldLabel,
    },
  },
};

export const dateWidgetFieldUiSchema: UiSchema = {
  dateWidgetTestField: {
    "ui:widget": "DateWidget",
  },
};

const checkTypingDate = async (inputString: string, expectedValue: string) => {
  render(
    <FormBase
      schema={dateWidgetFieldSchema}
      uiSchema={dateWidgetFieldUiSchema}
    />,
  );

  const dateWidgetInput = screen.getByLabelText(
    dateWidgetLabelRequired,
  ) as HTMLInputElement;

  await typeDate(dateWidgetInput, inputString);

  expect(dateWidgetInput.value).toBe(expectedValue);
};

describe("RJSF DateWidget", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

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

    const dateWidgetInput = screen.getByLabelText(
      dateWidgetLabelRequired,
    ) as HTMLInputElement;

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
    await checkTypingDate("20240705", "2024-07-05");
  });

  it("should allow typing a date with a separator", async () => {
    await checkTypingDate("2024-07-05", "2024-07-05");
  });

  it("should not allow typing an invalid date", async () => {
    await checkTypingDate("not a date", "");

    const submitButton = screen.getByRole("button", { name: "Submit" });

    await act(async () => {
      fireEvent.click(submitButton);
    });
    expect(screen.getByText(/^.* is required/i)).toBeVisible();
  });

  it("should allow the user to select a date", async () => {
    render(
      <FormBase
        schema={dateWidgetFieldSchema}
        uiSchema={dateWidgetFieldUiSchema}
      />,
    );

    await waitFor(async () => {
      screen.getByTestId("CalendarIcon");
    });

    const dateWidgetClickElement = screen.getByTestId("CalendarIcon")
      .parentElement as HTMLElement;

    await act(async () => {
      fireEvent.click(dateWidgetClickElement);
    });

    const dateWidgetCalendar = screen.getByRole("dialog");
    const dateWidgetCalendarDay = dateWidgetCalendar.querySelector(
      ".MuiPickerDay-today",
    ) as HTMLElement;

    await act(async () => {
      fireEvent.click(dateWidgetCalendarDay);
    });

    const dateWidgetInput = screen.getByLabelText(
      dateWidgetLabelRequired,
    ) as HTMLInputElement;

    // Checking that this is a valid date rather than hardcoding a date.
    // This is because this test selects the current day using the .MuiPickerDay-today class
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

    const dateWidgetInput = screen.getByLabelText(
      dateWidgetLabelRequired,
    ) as HTMLInputElement;
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

  it("should not trigger an error when data is valid", async () => {
    render(
      <FormBase
        schema={dateWidgetFieldSchema}
        formData={{ dateWidgetTestField: "2024-07-05T09:00:00.000Z" }}
        uiSchema={dateWidgetFieldUiSchema}
      />,
    );

    await checkNoValidationErrorIsTriggered();
  });

  it("should trigger validation error for required field", async () => {
    render(
      <FormBase
        schema={dateWidgetFieldSchema}
        uiSchema={dateWidgetFieldUiSchema}
      />,
    );
    const submitButton = screen.getByRole("button", { name: "Submit" });

    await userEvent.click(submitButton);

    expect(screen.getByText(/^.* is required/i)).toBeVisible();
  });

  it("should have the correct styles when the validation error is shown", async () => {
    await checkTextWidgetValidationStyles(
      <FormBase
        schema={dateWidgetFieldSchema}
        uiSchema={dateWidgetFieldUiSchema}
      />,
      dateWidgetLabelRequired,
    );
  });
  it("offers clear and cancel by default", async () => {
    render(
      <FormBase
        schema={dateWidgetFieldSchema}
        formData={{ dateWidgetTestField: "2024-07-05T09:00:00.000Z" }}
        uiSchema={dateWidgetFieldUiSchema}
      />,
    );

    await userEvent.click(
      screen.getByTestId("CalendarIcon").parentElement as HTMLElement,
    );

    expect(screen.getByRole("button", { name: /clear/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeVisible();
  });

  it("shows only the action bar buttons the ui schema asks for", async () => {
    render(
      <FormBase
        schema={dateWidgetFieldSchema}
        formData={{ dateWidgetTestField: "2024-07-05T09:00:00.000Z" }}
        uiSchema={{
          dateWidgetTestField: {
            "ui:widget": "DateWidget",
            "ui:options": { actionBarActions: ["cancel"] },
          },
        }}
      />,
    );

    await userEvent.click(
      screen.getByTestId("CalendarIcon").parentElement as HTMLElement,
    );

    expect(screen.getByRole("button", { name: /cancel/i })).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /clear/i }),
    ).not.toBeInTheDocument();
  });

  it("should trigger validation error when user clears the field and tries to submit", async () => {
    render(
      <FormBase
        schema={dateWidgetFieldSchema}
        formData={{ dateWidgetTestField: "2024-07-05T09:00:00.000Z" }}
        uiSchema={dateWidgetFieldUiSchema}
      />,
    );
    // select the date widget
    const dateWidgetClickElement = screen.getByTestId("CalendarIcon")
      .parentElement as HTMLElement;
    await userEvent.click(dateWidgetClickElement);
    // select the clear button
    await userEvent.click(
      screen.getByRole("button", {
        name: /clear/i,
      }),
    );
    const submitButton = screen.getByRole("button", { name: "Submit" });
    await userEvent.click(submitButton);
    expect(screen.getByText(/^.* is required/i)).toBeVisible();
  });
});

// These pin the timezone and clock to times where the local date and the UTC
// date differ, to check the widget always works with the calendar date
describe("RJSF DateWidget timezone handling", () => {
  const originalTimezone = process.env.TZ;

  const setTimezoneAndNow = (timezone: string, now: string) => {
    process.env.TZ = timezone;
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(now));
  };

  const submitAndGetValue = async (mockSubmit: ReturnType<typeof vi.fn>) => {
    await userEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(mockSubmit).toHaveBeenCalledOnce();
    return mockSubmit.mock.calls[0][0].formData.dateWidgetTestField;
  };

  const renderWidget = (
    props: { formData?: object; uiSchema?: UiSchema } = {},
  ) => {
    const mockSubmit = vi.fn();
    render(
      <FormBase
        schema={dateWidgetFieldSchema}
        uiSchema={props.uiSchema ?? dateWidgetFieldUiSchema}
        formData={props.formData}
        onSubmit={mockSubmit}
      />,
    );
    return mockSubmit;
  };

  afterEach(() => {
    vi.useRealTimers();
    process.env.TZ = originalTimezone;
  });

  it("saves the typed date at 9am UTC late in the evening in Vancouver", async () => {
    // 11:30pm on July 5 in Vancouver is already July 6 in UTC
    setTimezoneAndNow("America/Vancouver", "2024-07-06T06:30:00.000Z");
    const mockSubmit = renderWidget();

    await typeDate(screen.getByLabelText(dateWidgetLabelRequired), "20240710");

    expect(await submitAndGetValue(mockSubmit)).toBe(
      "2024-07-10T09:00:00.000Z",
    );
  });

  it("saves the typed date at 9am UTC early in the morning ahead of UTC", async () => {
    // 1am on July 5 in Auckland is still July 4 in UTC
    setTimezoneAndNow("Pacific/Auckland", "2024-07-04T13:00:00.000Z");
    const mockSubmit = renderWidget();

    await typeDate(screen.getByLabelText(dateWidgetLabelRequired), "20240710");

    expect(await submitAndGetValue(mockSubmit)).toBe(
      "2024-07-10T09:00:00.000Z",
    );
  });

  it("saves today's date when today is picked late in the evening", async () => {
    setTimezoneAndNow("America/Vancouver", "2024-07-06T06:30:00.000Z");
    const mockSubmit = renderWidget();

    await userEvent.click(
      screen.getByTestId("CalendarIcon").parentElement as HTMLElement,
    );
    await userEvent.click(
      screen.getByRole("dialog").querySelector(".MuiPickerDay-today")!,
    );

    expect(await submitAndGetValue(mockSubmit)).toBe(
      "2024-07-05T09:00:00.000Z",
    );
  });

  it("saves only the typed date when simpleDateFormat is set", async () => {
    setTimezoneAndNow("America/Vancouver", "2024-07-06T06:30:00.000Z");
    const mockSubmit = renderWidget({
      uiSchema: {
        dateWidgetTestField: {
          "ui:widget": "DateWidget",
          "ui:options": { simpleDateFormat: true },
        },
      },
    });

    await typeDate(screen.getByLabelText(dateWidgetLabelRequired), "20240710");

    expect(await submitAndGetValue(mockSubmit)).toBe("2024-07-10");
  });

  it("shows and keeps a saved value as its UTC date", async () => {
    // 12:30am UTC on July 5 is still July 4 in Vancouver
    setTimezoneAndNow("America/Vancouver", "2024-07-06T06:30:00.000Z");
    const mockSubmit = renderWidget({
      formData: { dateWidgetTestField: "2024-07-05T00:30:00.000Z" },
    });

    expect(screen.getByLabelText(dateWidgetLabelRequired)).toHaveValue(
      "2024-07-05",
    );
    expect(await submitAndGetValue(mockSubmit)).toBe(
      "2024-07-05T00:30:00.000Z",
    );
  });

  it("shows a saved value as its UTC date ahead of UTC", async () => {
    // 11:30pm UTC on July 5 is already July 6 in Auckland
    setTimezoneAndNow("Pacific/Auckland", "2024-07-04T13:00:00.000Z");
    renderWidget({
      formData: { dateWidgetTestField: "2024-07-05T23:30:00.000Z" },
    });

    expect(screen.getByLabelText(dateWidgetLabelRequired)).toHaveValue(
      "2024-07-05",
    );
  });
});
