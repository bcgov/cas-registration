import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { WidgetProps } from "@rjsf/utils/lib/types";
import {
  DARK_GREY_BG_COLOR,
  BC_GOV_SEMANTICS_RED,
} from "@bciers/styles/colors";

dayjs.extend(utc);

const DateWidget: React.FC<WidgetProps> = ({
  disabled,
  id,
  onChange,
  rawErrors,
  readonly,
  value,
  options,
}) => {
  const simpleDateFormat = options?.simpleDateFormat || false;

  const handleChange = (d: Dayjs | null) => {
    if (!d || !d.isValid()) {
      return onChange("invalid date");
    }

    const newDate = simpleDateFormat
      ? d.utc().format("YYYY-MM-DD") // Return just the date (no time)
      : d.utc().set("hour", 9).toISOString(); // Return full ISO string with time

    return onChange(newDate);
  };

  const isError = rawErrors && rawErrors.length > 0;
  const borderColor = isError ? BC_GOV_SEMANTICS_RED : DARK_GREY_BG_COLOR;

  const styles = {
    width: "100%",
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor,
      },
    },
  };

  // Ensure the value is in the correct format
  const formattedValue = value ? dayjs(value).utc().format("YYYY-MM-DD") : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        value={formattedValue ? dayjs(formattedValue).utc() : null}
        onChange={handleChange}
        disabled={disabled || readonly}
        format="YYYY-MM-DD"
        maxDate={dayjs((options?.maxDate as Date) || null)}
        minDate={dayjs((options?.minDate as Date) || null)}
        slotProps={{
          actionBar: {
            actions: ["clear", "cancel"],
          },
          textField: {
            id,
          },
        }}
        sx={styles}
      />
    </LocalizationProvider>
  );
};

export default DateWidget;
