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

const WRONG_ACCOUNT_TYPE_MESSAGE = (
  <span className="text-bc-error-red">
    Please enter a BCCR Account ID with the account type &apos;Operator of
    Regulated Operation&apos;, or contact{" "}
    <a href={ghgRegulatorEmail} className="text-bc-link-blue hover:underline">
      GHGRegulator@gov.bc.ca
    </a>{" "}
    if you have any questions.
  </span>
);

const REMOTE_BCCR_ISSUE_MESSAGE = (
  <span className="text-bc-error-red">
    Remote BC Carbon Registry system issues, please try again later or contact{" "}
    <a href={ghgRegulatorEmail} className="text-bc-link-blue hover:underline">
      GHGRegulator@gov.bc.ca
    </a>{" "}
    if you have any questions.
  </span>
);

const WRONG_ACCOUNT_TYPE_ERROR =
  "Account exists but does not match the required account type";

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
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<React.ReactNode>(
    INVALID_ACCOUNT_MESSAGE,
  );

  const isReadOnly = disabled || readonly || isLoading;

  const showValidationError = (message: React.ReactNode) => {
    setIsValid(false);
    setShowError(true);
    setErrorMessage(message);
    onValidAccountResolved?.(undefined);
  };

  const validateAccount = async (accountId: string) => {
    if (accountId.length !== 15 || !validateBccrAccount) return;

    setIsLoading(true);
    setShowError(false);

    try {
      const response = await validateBccrAccount(
        accountId,
        complianceReportVersionId,
      );

      if (response?.error) {
        showValidationError(
          response.error.includes(WRONG_ACCOUNT_TYPE_ERROR)
            ? WRONG_ACCOUNT_TYPE_MESSAGE
            : INVALID_ACCOUNT_MESSAGE,
        );
      } else if (response?.has_remote_bccr_errors) {
        showValidationError(REMOTE_BCCR_ISSUE_MESSAGE);
      } else if (!response?.bccr_trading_name) {
        showValidationError(INVALID_ACCOUNT_MESSAGE);
      } else {
        setIsValid(true);
        setShowError(false);
        onValidAccountResolved?.(response);
      }
    } catch {
      showValidationError(REMOTE_BCCR_ISSUE_MESSAGE);
    } finally {
      setIsLoading(false);
      onError?.(undefined);
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
      setErrorMessage(INVALID_ACCOUNT_MESSAGE);
      onValidAccountResolved?.(undefined);
      onError?.(undefined);
    }
  };

  return (
    <div className="w-full">
      <TextField
        id={id}
        helperText={showError && errorMessage}
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
