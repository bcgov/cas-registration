"use client";

import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import { WidgetProps } from "@rjsf/utils";
import {
  BC_GOV_BACKGROUND_COLOR_BLUE,
  BC_GOV_COMPONENTS_GREY,
  DARK_GREY_BG_COLOR,
  WHITE,
} from "@bciers/styles/colors";

const segmentStyles = {
  flex: 1,
  margin: 0,
  justifyContent: "center",
  minHeight: "37.5px",
  paddingX: 2,
  paddingY: 0.5,
  border: `1px solid ${DARK_GREY_BG_COLOR}`,
  backgroundColor: WHITE,
  transition: "background-color 150ms ease, border-color 150ms ease",
  "& .MuiRadio-root": {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0 0 0 0)",
    whiteSpace: "nowrap",
    border: 0,
  },
  "& .MuiFormControlLabel-label": {
    width: "100%",
    textAlign: "center",
    whiteSpace: "nowrap",
    fontSize: "1rem",
    lineHeight: 1.25,
    color: BC_GOV_COMPONENTS_GREY,
  },
};

const selectedSegmentStyles = {
  borderColor: BC_GOV_BACKGROUND_COLOR_BLUE,
  backgroundColor: BC_GOV_BACKGROUND_COLOR_BLUE,
  "& .MuiFormControlLabel-label": {
    color: WHITE,
  },
};

const PenaltyTypeRadioWidget = ({
  id,
  value,
  options,
  onChange,
  disabled,
  readonly,
}: WidgetProps) => (
  <RadioGroup
    id={id}
    name={id}
    row
    value={value ?? ""}
    onChange={(_, selected) => onChange(selected)}
    sx={{ flexWrap: "nowrap", gap: 0 }}
  >
    {(options.enumOptions ?? []).map((option, index) => (
      <FormControlLabel
        key={option.value}
        value={option.value}
        label={option.label}
        disabled={disabled || readonly}
        control={<Radio />}
        // Base styles, then drop the shared border so the pair reads as one control,
        // then the selected state. sx skips the falsy entries
        sx={[
          segmentStyles,
          index === 0 && { borderRight: 0 },
          value === option.value && selectedSegmentStyles,
        ]}
      />
    ))}
  </RadioGroup>
);

export default PenaltyTypeRadioWidget;
