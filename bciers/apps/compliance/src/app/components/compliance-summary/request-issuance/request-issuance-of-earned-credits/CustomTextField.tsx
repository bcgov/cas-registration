"use client";

import React from "react";
import { WidgetProps } from "@rjsf/utils";
import {
  TextField,
  InputBaseComponentProps,
  Box,
  InputAdornment,
} from "@mui/material";
import { DARK_GREY_BG_COLOR } from "@bciers/styles";
import Check from "@bciers/components/icons/Check";

// Helper function to validate the input value against validation options
const validateInput = (
  value: any,
  validationOptions: {
    expectedValue?: string;
    pattern?: string;
    minLength?: number;
    nonEmpty?: boolean;
  },
): boolean => {
  const {
    expectedValue,
    pattern,
    minLength,
    nonEmpty = false,
  } = validationOptions;

  // If no value, it's valid only if not required
  if (!value) {
    return !nonEmpty;
  }

  // Check against expected value
  if (expectedValue !== undefined && value !== expectedValue) {
    return false;
  }

  // Check against regex pattern
  if (pattern && typeof value === "string") {
    const regex = new RegExp(pattern);
    if (!regex.test(value)) {
      return false;
    }
  }

  // Check minimum length
  if (
    minLength !== undefined &&
    typeof value === "string" &&
    value.length < minLength
  ) {
    return false;
  }

  return true;
};

const CustomTextField = (props: WidgetProps) => {
  const {
    id,
    placeholder,
    disabled,
    readonly,
    value,
    onChange,
    schema,
    uiSchema,
  } = props;

  const type = schema.type === "number" ? "number" : "text";
  const maxNum = Number(uiSchema?.["ui:options"]?.max);

  const handleChange = (e: { target: { value: string } }) => {
    const val = e.target.value;
    if (type === "number" && !isNaN(Number(val)) && Number(val) > maxNum) {
      return;
    }

    onChange(val === "" ? undefined : val);
  };

  const validationOptions =
    (uiSchema?.["ui:options"]?.validation as {
      expectedValue?: string;
      pattern?: string;
      minLength?: number;
      nonEmpty?: boolean;
    }) ?? {};

  const isValid = validateInput(value, validationOptions);

  const styles = {
    height: "40px",
    width: "100%",
    "& .MuiOutlinedInput-root": {
      height: "40px",
      borderColor: DARK_GREY_BG_COLOR,
    },
  };

  return (
    <Box sx={{ width: "100%", "& .MuiFormControl-root": { width: "100%" } }}>
      <TextField
        id={id}
        disabled={disabled ?? readonly}
        name={id}
        value={value ?? ""}
        onChange={handleChange}
        sx={styles}
        type={type}
        placeholder={placeholder}
        inputProps={
          uiSchema?.["ui:options"]?.inputProps as InputBaseComponentProps
        }
        size="small"
        fullWidth={true}
        InputProps={{
          endAdornment: isValid ? (
            <InputAdornment position="end">
              <div className="w-[24px] h-[24px] flex items-center justify-center scale-90 -mr-1">
                {Check}
              </div>
            </InputAdornment>
          ) : undefined,
        }}
      />
    </Box>
  );
};

export default CustomTextField;
