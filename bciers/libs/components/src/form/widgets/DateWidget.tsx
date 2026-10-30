import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { WidgetProps } from "@rjsf/utils";
import {
  DARK_GREY_BG_COLOR,
  BC_GOV_SEMANTICS_RED,
} from "@bciers/styles/colors";

dayjs.extend(utc);

const DateWidget: React.FC<WidgetProps> = ({
  disabled,
  id,
  label,
  onChange,
  rawErrors,
  readonly,
  value,
  options,
}) => {
  const simpleDateFormat = options?.simpleDateFormat || false;

  const handleChange = (d: Dayjs | null) => {
    if (d === null) return onChange(undefined);

    if (!d.isValid()) {
      return onChange("invalid date");
    }

    // Build the value from the calendar date the user sees. Converting d itself to
    // UTC can shift the day, e.g. ahead of UTC or when d carries the current time
    const selectedDate = d.format("YYYY-MM-DD");
    const newDate = simpleDateFormat
      ? selectedDate // Return just the date (no time)
      : dayjs.utc(selectedDate).hour(9).toISOString(); // Return full ISO string with time

    return onChange(newDate);
  };

  const isError = rawErrors && rawErrors.length > 0;
  const borderColor = isError ? BC_GOV_SEMANTICS_RED : DARK_GREY_BG_COLOR;

  const styles = {
    width: "100%",
    "& .MuiPickersOutlinedInput-root": {
      "& fieldset": {
        borderColor,
      },
    },
  };

  // Ensure the value is in the correct format
  const formattedValue = value ? dayjs.utc(value).format("YYYY-MM-DD") : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        // Parse as UTC: parsing as local time first shifts the date back a day ahead of UTC
        value={formattedValue ? dayjs.utc(formattedValue) : null}
        onChange={handleChange}
        disabled={disabled || readonly}
        format="YYYY-MM-DD"
        maxDate={dayjs((options?.maxDate as Date) || null)}
        minDate={dayjs((options?.minDate as Date) || null)}
        slotProps={{
          actionBar: {
            actions: (options?.actionBarActions as (
              "clear" | "cancel" | "accept" | "today"
            )[]) ?? ["clear", "cancel"],
          },
          textField: {
            id,
          },
          // MUI only names the calendar dialog from its own `label`, which RJSF renders separately
          popper: {
            "aria-label": label ? `${label} calendar` : "Calendar",
          },
        }}
        sx={styles}
      />
    </LocalizationProvider>
  );
};

export default DateWidget;
