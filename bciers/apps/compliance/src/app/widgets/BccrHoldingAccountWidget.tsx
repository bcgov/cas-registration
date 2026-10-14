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

const WRONG_ACCOUNT_TYPE_ERROR =
  "Account exists but does not match the required account type";

const isWrongAccountTypeError = (error?: unknown) =>
  typeof error === "string" && error.includes(WRONG_ACCOUNT_TYPE_ERROR);

const createValidationItem = (
  key: ValidationMessageKey,
  message?: string,
): BccrValidationItem => ({
  key,
  error: { severity: "Error", ...(message ? { message } : {}) },
});

// Maps an account-lookup failure to a validation key, matching the backend
// error keys (e.g. ExceptionHandler's `bccr_error`) before falling back to
// message sniffing for account-level errors
const toValidationItem = (
  errorText?: string,
  response?: BccrAccountDetailsResponse,
): BccrValidationItem => {
  const backendError = response?.validation?.errors?.find(
    (item) => item.key === "bccr_error",
  );
  if (backendError) {
    return createValidationItem("bccr_error", backendError.error?.message);
  }
  if (response?.has_remote_bccr_errors) {
    return createValidationItem("bccr_error");
  }
  if (isWrongAccountTypeError(errorText)) {
    return createValidationItem("wrong_bccr_account_type");
  }
  return createValidationItem("invalid_bccr_account");
};

const renderValidationMessage = ({ key, error }: BccrValidationItem) => {
  const config = validationUIConfig[key];
  const message =
    config?.resolveFormattedMessage(error, key) ?? error.message ?? key;
  const label = config?.resolveLabel(error);
  const href = config?.resolveHref(error);

  if (config?.renderMode !== "inline_link" || !label || !href) {
    return <span className="text-bc-error-red">{message}</span>;
  }

  const index = message.indexOf(label);
  if (index === -1) {
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

  const handleAccountError = (
    errorText?: string,
    response?: BccrAccountDetailsResponse,
  ) => {
    const item = toValidationItem(errorText, response);
    setIsValid(false);
    setValidationError(item);
    onValidAccountResolved?.(undefined);

    // BCCR connectivity errors are shown inline only; other errors are also
    // surfaced to the parent form's validation summary
    if (errorText && item.key !== "bccr_error") {
      onError?.([errorText]);
    }
  };

  const validateAccount = async (accountId: string) => {
    if (accountId.length !== 15 || !validateBccrAccount) return;

    setIsLoading(true);
    setValidationError(null);

    try {
      const response = await validateBccrAccount(
        accountId,
        complianceReportVersionId,
      );

      if (
        response?.has_remote_bccr_errors ||
        response?.bccr_trading_name === null
      ) {
        // An account-not-found / wrong-type result is not a form-level error
        setIsValid(false);
        setValidationError(toValidationItem(response?.error, response));
        onValidAccountResolved?.(undefined);
      } else if (response?.error) {
        handleAccountError(response.error, response);
      } else {
        setIsValid(true);
        setValidationError(null);
        onValidAccountResolved?.(response);
        onError?.(undefined);
      }
    } catch (error) {
      handleAccountError((error as Error).message);
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

  const renderStatusIcon = () => {
    if (isLoading) return <CircularProgress size={20} />;
    if (isValid === true) return <CheckCircleIcon color="success" />;
    if (showError) return <AlertIcon width="20" height="20" />;
    return null;
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
