import { WidgetProps } from "@rjsf/utils";
import {
  TextField,
  InputAdornment,
  CircularProgress,
  Link,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AlertIcon from "@bciers/components/icons/AlertIcon";
import {
  bcCarbonRegistryLink,
  ghgRegulatorEmail,
} from "@bciers/utils/src/urls";
import { useState } from "react";

const INVALID_ACCOUNT_MESSAGE = (
  <span className="text-bc-error-red">
    Please enter a valid BCCR Holding Account ID to move to the next step, or
    contact{" "}
    <a href={ghgRegulatorEmail} className="text-bc-link-blue hover:underline">
      GHGRegulator@gov.bc.ca
    </a>{" "}
    if you have any questions.
  </span>
);

const BccrHoldingAccountWidget = (props: WidgetProps) => {
  const { id, value, disabled, readonly, onChange, formContext } = props;
  const { onValidAccountResolved, validateBccrAccount, onError } =
    formContext || {};

  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [showError, setShowError] = useState(false);

  const isReadOnly = disabled || readonly || isLoading;

  const validateAccount = async (accountId: string) => {
    if (accountId.length !== 15 || !validateBccrAccount) {
      return;
    }

    setIsLoading(true);
    setShowError(false);

    try {
      const response = await validateBccrAccount(accountId);

      if (response?.bccr_trading_name === null) {
        setIsValid(false);
        setShowError(true);
        onValidAccountResolved?.(undefined);
      } else {
        setIsValid(true);
        setShowError(false);
        onValidAccountResolved?.(response);
        onError?.(undefined);
      }
    } catch (error) {
      setIsValid(false);
      setShowError(false);
      onValidAccountResolved?.(undefined);
      onError?.([(error as Error).message]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[^0-9]/g, "").slice(0, 15);
    onChange(newValue);

    if (newValue.length === 15) {
      validateAccount(newValue);
    } else {
      setIsValid(null);
      setShowError(false);
      onValidAccountResolved?.(undefined);
      onError?.(undefined);
    }
  };

  return (
    <div className="w-full">
      <TextField
        id={id}
        helperText={showError && INVALID_ACCOUNT_MESSAGE}
        size="small"
        disabled={isReadOnly}
        name={id}
        value={value || ""}
        onChange={handleChange}
        className="w-full"
        error={showError}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <div className="flex items-center justify-center">
                {isLoading ? (
                  <CircularProgress size={20} />
                ) : isValid === true ? (
                  <CheckCircleIcon color="success" />
                ) : showError ? (
                  <AlertIcon width="20" height="20" />
                ) : null}
              </div>
            </InputAdornment>
          ),
        }}
      />
      <small>
        No account?{" "}
        <Link
          href={bcCarbonRegistryLink}
          underline="hover"
          className="text-bc-link-blue font-medium"
          rel="noopener noreferrer"
          target="_blank"
        >
          Create account
        </Link>{" "}
        in BCCR.
      </small>
    </div>
  );
};

export default BccrHoldingAccountWidget;
