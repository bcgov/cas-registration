import { MuiTelInput } from "mui-tel-input";
import { WidgetProps } from "@rjsf/utils/lib/types";
import { DARK_GREY_BG_COLOR, BC_GOV_SEMANTICS_RED } from "@/app/styles/colors";

const PhoneWidget: React.FC<WidgetProps> = ({
  disabled,
  id,
  onBlur,
  onChange,
  onFocus,
  rawErrors,
  readonly,
  value,
}) => {
  const handleBlur = ({
    target: { value },
  }: React.FocusEvent<HTMLInputElement>) => onBlur(id, value);

  const handleChange = (val: string) => {
    onChange(val);
  };

  const handleFocus = ({
    target: { value },
  }: React.FocusEvent<HTMLInputElement>) => onFocus(id, value);

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
    <MuiTelInput
      id={id}
      disabled={disabled || readonly}
      name={id}
      value={value}
      onBlur={handleBlur}
      onChange={handleChange}
      onFocus={handleFocus}
      forceCallingCode
      defaultCountry="CA"
      onlyCountries={["CA", "US"]}
      sx={styles}
    />
  );
};
export default PhoneWidget;
