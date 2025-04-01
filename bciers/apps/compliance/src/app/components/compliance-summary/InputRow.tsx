"use client";

import { TextField, Box } from "@mui/material";
import React from "react";

interface InputRowProps {
  classNames?: string;
  style?: any;
  label?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  helperText?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  endAdornment?: React.ReactNode;
  placeholder?: string;
}

export const InputRow: React.FC<InputRowProps> = ({
  classNames,
  label,
  name,
  value,
  onChange,
  style,
  error,
  helperText,
  inputProps,
  endAdornment,
  placeholder,
}) => {
  return (
    <Box className={`w-full flex mb-2.5 ${classNames || ""}`} style={style}>
      {label && (
        <Box className="flex min-w-[240px] font-normal text-base items-center">
          {label}
        </Box>
      )}
      <Box className="flex-1 flex justify-end w-full ml-2.5">
        <TextField
          fullWidth
          name={name}
          value={value}
          onChange={onChange}
          variant="outlined"
          size="small"
          className="w-full"
          error={error}
          helperText={helperText}
          placeholder={placeholder}
          inputProps={inputProps}
          InputProps={
            endAdornment
              ? {
                  endAdornment: endAdornment,
                }
              : undefined
          }
        />
      </Box>
    </Box>
  );
};

export default InputRow;
