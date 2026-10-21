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
import {
  ValidationItem,
  ValidationMessage,
} from "@bciers/components/validationErrors";
import {
  validationLinks,
  validationUIConfig,
} from "@/compliance/src/app/components/validationErrors/config";
import { ValidationMessageKey } from "@/compliance/src/app/components/validationErrors/types";
import { BccrAccountDetailsResponse } from "@/compliance/src/app/types";

type BccrValidationItem = ValidationItem<ValidationMessageKey>;

const getErrorMessage = (response: BccrAccountDetailsResponse) =>
  response.validation?.errors?.[0]?.error?.message ?? response.error;

const createValidationItem = (
  key: ValidationMessageKey,
  message?: string,
): BccrValidationItem => ({
  key,
  error: { severity: "Error", ...(message ? { message } : {}) },
});

// Maps an unsuccessful account lookup response to an inline validation item
const toValidationItem = (
  response: BccrAccountDetailsResponse,
): BccrValidationItem | null => {
  if (
    response.has_remote_bccr_errors ||
    response.validation?.errors?.[0]?.key === "bccr_error"
  )
    return createValidationItem("bccr_error");

  const message = getErrorMessage(response);
  if (response.validation?.errors?.[0]?.key === "user_error")
    return createValidationItem("user_error", message);

  if (response.bccr_trading_name === null || response.error)
    return createValidationItem("invalid_bccr_account", message);

  return null;
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
    response: BccrAccountDetailsResponse,
    isThrown = false,
  ) => {
    const item = isThrown ? null : toValidationItem(response);
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
      handleAccountError({ error: (error as Error).message }, true);
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

  let statusIcon: React.ReactNode = null;
  if (isLoading) {
    statusIcon = <CircularProgress size={20} />;
  } else if (isValid === true) {
    statusIcon = <CheckCircleIcon color="success" />;
  } else if (showError) {
    statusIcon = <AlertIcon width="20" height="20" />;
  }

  return (
    <div className="w-full">
      <TextField
        id={id}
        helperText={
          validationError && (
            <span className="text-bc-error-red">
              <ValidationMessage
                item={validationError}
                config={validationUIConfig}
                links={validationLinks}
              />
            </span>
          )
        }
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
                {statusIcon}
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
