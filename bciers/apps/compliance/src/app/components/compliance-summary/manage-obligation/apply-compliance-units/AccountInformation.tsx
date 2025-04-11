"use client";

import React, { useState, useEffect } from "react";
import { InputAdornment, Box } from "@mui/material";
import { TitleRow } from "../../TitleRow";
import { InfoRow } from "../../InfoRow";
import { InputRow } from "../../InputRow";
import Check from "@bciers/components/icons/Check";

interface AccountInformationProps {
  data: {
    bccrTradingName: string;
    obpsComplianceAccountId: string;
    validBccrHoldingAccountId: string;
  };
  onValidationChange?: (isValid: boolean) => void;
  title?: string;
}

const AccountInformation: React.FC<AccountInformationProps> = ({
  data,
  onValidationChange,
  title = "Enter account ID",
}) => {
  const [formData, setFormData] = useState({
    bccrHoldingAccountId: "",
  });
  const [isValid, setIsValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    const value = formData.bccrHoldingAccountId;

    if (value.length === 0) {
      setIsValid(false);

      if (onValidationChange) {
        onValidationChange(false);
      }
      setErrorMessage("");
      return;
    }

    const isValid15Digits = /^\d{15}$/.test(value);
    const matchesValidId = value === data.validBccrHoldingAccountId;

    const validationResult = isValid15Digits && matchesValidId;
    setIsValid(validationResult);

    if (onValidationChange) {
      onValidationChange(validationResult);
    }

    if (!isValid15Digits) {
      setErrorMessage("Must be exactly 15 digits");
    } else if (!matchesValidId) {
      setErrorMessage("Invalid account ID");
    } else {
      setErrorMessage("");
    }
  }, [
    formData.bccrHoldingAccountId,
    data.validBccrHoldingAccountId,
    onValidationChange,
  ]);

  return (
    <Box className="w-full mb-4">
      <TitleRow label={title} />

      {/* BCCR Holding Account ID - input field */}
      {/* For tests use this account ID: 123456789012345 */}
      <InputRow
        label="BCCR Holding Account ID:"
        name="bccrHoldingAccountId"
        value={formData.bccrHoldingAccountId}
        onChange={handleChange}
        error={formData.bccrHoldingAccountId.length > 0 && !isValid}
        helperText={errorMessage}
        inputProps={{
          maxLength: 15,
          inputMode: "numeric",
          pattern: "[0-9]*",
        }}
        endAdornment={
          isValid ? (
            <InputAdornment className="w-5 h-5" position="end">
              {Check}
            </InputAdornment>
          ) : undefined
        }
      />

      <InfoRow label="BCCR Trading Name:" value={data.bccrTradingName} />

      <InfoRow
        label="OBPS Compliance Account ID:"
        value={data.obpsComplianceAccountId}
        classNames="mb-5"
      />
    </Box>
  );
};

export default AccountInformation;
