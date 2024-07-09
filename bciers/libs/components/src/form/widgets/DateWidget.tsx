import { useState } from "react";
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
}) => {
  const [open, setOpen] = useState(false);
  const handleChange = (d: Dayjs | null) => {
    if (!d || !d.isValid()) {
      return onChange(null);
    }

    // Set the time to 9am UTC to avoid timezone issues since PST is UTC -8 hours
    // This should be enough offset to take eastern timezones into account which have
    // less than 8 hours difference eg Atlantic Standard Time is UTC -4 hours
    const newDate = dayjs(d).utc().set("hour", 9).toISOString();

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

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        value={value ? dayjs(value).utc() : null}
        onChange={handleChange}
        disabled={disabled || readonly}
        format="YYYY-MM-DD"
        open={open}
        slotProps={{
          actionBar: {
            actions: ["clear", "cancel"],
          },
          inputAdornment: {
            onClick: () => setOpen(true),
          },
          textField: {
            onFocus: () => setOpen(true),
            id,
          },
        }}
        onClose={() => setOpen(false)}
        sx={styles}
      />
    </LocalizationProvider>
  );
};

export default DateWidget;
