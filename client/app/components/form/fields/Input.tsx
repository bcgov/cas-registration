import {
  Input as MuiInput,
  InputLabel,
  FormLabel,
  FormGroup,
} from "@mui/material";
import { InputProps as MuiInputProps } from "@mui/material";
import { FormikErrors } from "formik";
import React from "react";

export interface InputProps extends MuiInputProps {
  name: string;
  labelText: string;
  errorText: string | FormikErrors<any> | undefined;
  isError: boolean;
}

export const InputField = ({
  name,
  labelText,
  isError,
  errorText,
  ...rest
}: InputProps) => {
  // Convert FormikErrors to a string if it's not already a string
  const errorString = typeof errorText === "string" ? errorText : "";

  return (
    <FormGroup sx={{ width: "100%", marginBottom: "2rem" }}>
      <InputLabel
        sx={{ marginBottom: "1rem", fontWeight: "bold" }}
        aria-label={labelText}
      >
        {labelText}
      </InputLabel>
      <MuiInput name={name} aria-label={labelText} {...rest} />
      {isError && (
        <FormLabel sx={{ color: "#FF3333" }}>{errorString}</FormLabel>
      )}
    </FormGroup>
  );
};
