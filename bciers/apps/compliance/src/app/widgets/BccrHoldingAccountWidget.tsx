import { WidgetProps } from "@rjsf/utils";
import {
  TextField,
  InputAdornment,
  CircularProgress,
  Link,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AlertIcon from "@bciers/components/icons/AlertIcon";
import { bcCarbonRegistryLink } from "@bciers/utils/src/urls";
import { useState } from "react";
import { ValidationItem } from "@bciers/components/validationErrors";
import { validationUIConfig } from "@/compliance/src/app/components/validationErrors/config";
import { ValidationMessageKey } from "@/compliance/src/app/components/validationErrors/types";
import { BccrAccountDetailsResponse } from "@/compliance/src/app/types";

type BccrValidationItem = ValidationItem<ValidationMessageKey>;

// The backend returns this as a generic `user_error`, so the message identifies it
const WRONG_ACCOUNT_TYPE_ERROR =
  "Account exists but does not match the required account type";

const isWrongAccountTypeError = (error?: unknown) =>
  typeof error === "string" && error.includes(WRONG_ACCOUNT_TYPE_ERROR);

const getErrorMessage = (response: BccrAccountDetailsResponse) =>
  response.validation?.errors?.[0]?.error?.message ?? response.error;

const createValidationItem = (
  key: ValidationMessageKey,
  message?: string,
): BccrValidationItem => ({
  key,
  error: { severity: "Error", ...(message ? { message } : {}) },
});

// Server errors (5xx) and failures with no response are system issues, not
// account issues, so they are shown inline rather than in the error summary
const isSystemError = (response: BccrAccountDetailsResponse) =>
  !response.status || response.status >= 500;

// Maps an unsuccessful account lookup response to an inline validation item,
// using the backend error keys when present. Returns null for other client
// errors (e.g. a user_error), which belong in the parent form's error summary
const toValidationItem = (
  response: BccrAccountDetailsResponse,
): BccrValidationItem | null => {
  if (response.has_remote_bccr_errors)
    return createValidationItem("bccr_error");

  const backendError = response.validation?.errors?.[0];
  if (backendError?.key === "bccr_error") {
    return createValidationItem("bccr_error", backendError.error?.message);
  }

  const message = getErrorMessage(response);
  if (isWrongAccountTypeError(message)) {
    return createValidationItem("wrong_bccr_account_type", message);
  }

  if (response.bccr_trading_name === null) {
    return createValidationItem("invalid_bccr_account", message);
  }

  if (isSystemError(response)) return createValidationItem("bccr_error");

  return null;
};

const renderValidationMessage = ({ key, error }: BccrValidationItem) => {
  const config = validationUIConfig[key];
  const message = config?.resolveFormattedMessage(error, key) ?? key;
  const label = config?.resolveLabel(error);
  const href = config?.resolveHref(error);
  const index = label ? message.indexOf(label) : -1;

  if (config?.renderMode !== "inline_link" || !label || !href || index === -1) {
    return <span className="text-bc-error-red">{message}</span>;
  }

  return (
    <span className="text-bc-error-red">
      {message.slice(0, index)}
      <a href={href} className="text-bc-link-blue hover:underline">
        {label}
      </a>
      {message.slice(index + label.length)}
    </span>
  );
};

const BccrHoldingAccountWidget = (props: WidgetProps) => {
  const { id, value, disabled, readonly, onChange, registry } = props;
  const { formContext } = registry;
  const {
    onValidAccountResolved,
    validateBccrAccount,
    onError,
    complianceReportVersionId,
  } = formContext || {};

  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [validationError, setValidationError] =
    useState<BccrValidationItem | null>(null);

  const isReadOnly = disabled || readonly || isLoading;
  const showError = validationError !== null;

  const renderStatusIcon = () => {
    if (isLoading) return <CircularProgress size={20} />;
    if (isValid === true) return <CheckCircleIcon color="success" />;
    if (showError) return <AlertIcon width="20" height="20" />;
    return null;
  };

  // Lookup errors are handled the same whether they were returned or thrown
  const handleAccountError = (response: BccrAccountDetailsResponse) => {
    const item = toValidationItem(response);
    setIsValid(false);
    setValidationError(item);
    onValidAccountResolved?.(undefined);

    if (!item) {
      onError?.([getErrorMessage(response) ?? "An unexpected error occurred."]);
    }
  };

  const validateAccount = async (accountId: string) => {
    if (accountId.length !== 15 || !validateBccrAccount) return;

    setIsLoading(true);
    setValidationError(null);

    try {
      const response: BccrAccountDetailsResponse = await validateBccrAccount(
        accountId,
        complianceReportVersionId,
      );

      if (
        response?.has_remote_bccr_errors ||
        response?.bccr_trading_name === null ||
        response?.error
      ) {
        handleAccountError(response);
      } else {
        setIsValid(true);
        setValidationError(null);
        onValidAccountResolved?.(response);
        onError?.(undefined);
      }
    } catch (error) {
      handleAccountError({ error: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, "").slice(0, 15);
    onChange(newValue);

    if (newValue.length === 15) {
      void validateAccount(newValue);
    } else {
      setIsValid(null);
      setValidationError(null);
      onValidAccountResolved?.(undefined);
      onError?.(undefined);
    }
  };

  return (
    <div className="w-full">
      <TextField
        id={id}
        helperText={validationError && renderValidationMessage(validationError)}
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
                {renderStatusIcon()}
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
