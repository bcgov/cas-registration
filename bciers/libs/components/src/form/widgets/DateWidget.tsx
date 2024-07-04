import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { WidgetProps } from "@rjsf/utils/lib/types";

const DateWidget: React.FC<WidgetProps> = ({
  id,
  onChange,
  value,
  required,
  disabled,
}) => {
  const handleChange = (date: string) => {
    console.log(date);
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        value={value ? dayjs(value) : null}
        onChange={handleChange}
        disabled={disabled}
        format="YYYY-MM-DD"
        slotProps={{
          actionBar: {
            actions: ["clear", "cancel"],
          },
          textField: {
            inputProps: {
              id,
              "data-testid": "datepicker-widget-input",
            },
          },
        }}
        sx={{ width: "100%" }}
      />
    </LocalizationProvider>
  );
};

export default DateWidget;
