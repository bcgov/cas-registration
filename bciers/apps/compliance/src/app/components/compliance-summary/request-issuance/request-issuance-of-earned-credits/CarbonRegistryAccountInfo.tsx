"use client";

import { useState, useEffect } from "react";
import { TitleRow } from "../../TitleRow";
import InputRow from "../../InputRow";
import { InputAdornment, Box, Typography, Link } from "@mui/material";
import Check from "@bciers/components/icons/Check";
import { RequestIssuanceData } from "@/compliance/src/app/utils/getRequestIssuanceData";
import { BC_GOV_LINKS_COLOR, BC_GOV_TEXT } from "@bciers/styles";

interface CarbonRegistryAccountInfoProps {
  data: RequestIssuanceData;
  onValidationChange?: (isValid: boolean) => void;
}

export const CarbonRegistryAccountInfo = ({
  data,
  onValidationChange,
}: CarbonRegistryAccountInfoProps) => {
  const [formData, setFormData] = useState({
    bccrHoldingAccountId: "",
    bccrTradingName: "",
  });

  const [validation, setValidation] = useState({
    holdingAccount: {
      isValid: false,
      errorMessage: "",
    },
    tradingName: {
      isValid: false,
      errorMessage: "",
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    const holdingAccountValue = formData.bccrHoldingAccountId;
    let holdingAccountValid = false;
    let holdingAccountError = "";

    if (holdingAccountValue.length > 0) {
      const isValid15Digits = /^\d{15}$/.test(holdingAccountValue);
      const matchesValidId =
        holdingAccountValue === data.validBccrHoldingAccountId;
      holdingAccountValid = isValid15Digits && matchesValidId;

      if (!isValid15Digits) {
        holdingAccountError = "Must be exactly 15 digits";
      } else if (!matchesValidId) {
        holdingAccountError = "Invalid account ID";
      }
    }

    const tradingNameValue = formData.bccrTradingName;
    let tradingNameValid = false;
    let tradingNameError = "";

    if (tradingNameValue.length > 0) {
      tradingNameValid = tradingNameValue === data.bccrTradingName;
      if (!tradingNameValid) {
        tradingNameError = "Invalid trading name";
      }
    }

    setValidation({
      holdingAccount: {
        isValid: holdingAccountValid,
        errorMessage: holdingAccountError,
      },
      tradingName: {
        isValid: tradingNameValid,
        errorMessage: tradingNameError,
      },
    });

    if (onValidationChange) {
      const isFormValid =
        holdingAccountValid &&
        (tradingNameValue.length === 0 || tradingNameValid);
      onValidationChange(isFormValid);
    }
  }, [
    formData.bccrHoldingAccountId,
    formData.bccrTradingName,
    data.validBccrHoldingAccountId,
    data.bccrTradingName,
    onValidationChange,
  ]);

  return (
    <Box className="mt-[20px]">
      <TitleRow label="B.C. Carbon Registry (BCCR) Account Information" />
      {/* Trading Name - input field */}
      {/* For tests use this Trading Name: Colour Co. */}
      <Box className="flex flex-col">
        <InputRow
          label="BCCR Trading Name:"
          name="bccrTradingName"
          value={formData.bccrTradingName}
          onChange={handleChange}
          error={
            formData.bccrTradingName.length > 0 &&
            !validation.tradingName.isValid
          }
          helperText={validation.tradingName.errorMessage}
          endAdornment={
            validation.tradingName.isValid &&
            formData.bccrTradingName.length > 0 ? (
              <InputAdornment className="w-5 h-5" position="end">
                {Check}
              </InputAdornment>
            ) : undefined
          }
        />
        {/* BCCR Holding Account ID - input field */}
        {/* For tests use this account ID: 123456789012345 */}
        <InputRow
          label="BCCR Holding Account ID:"
          name="bccrHoldingAccountId"
          value={formData.bccrHoldingAccountId}
          onChange={handleChange}
          error={
            formData.bccrHoldingAccountId.length > 0 &&
            !validation.holdingAccount.isValid
          }
          helperText={validation.holdingAccount.errorMessage}
          inputProps={{
            maxLength: 15,
            inputMode: "numeric",
            pattern: "[0-9]*",
          }}
          endAdornment={
            validation.holdingAccount.isValid &&
            formData.bccrHoldingAccountId.length > 0 ? (
              <InputAdornment className="w-5 h-5" position="end">
                {Check}
              </InputAdornment>
            ) : undefined
          }
        >
          <Box>
            <Typography variant="body2" color={BC_GOV_TEXT}>
              No account?{" "}
              <Link
                href="#"
                underline="hover"
                sx={{ fontWeight: 500, color: BC_GOV_LINKS_COLOR }}
              >
                Create account
              </Link>{" "}
              in BCCR.
            </Typography>
          </Box>
        </InputRow>
      </Box>
    </Box>
  );
};

export default CarbonRegistryAccountInfo;
