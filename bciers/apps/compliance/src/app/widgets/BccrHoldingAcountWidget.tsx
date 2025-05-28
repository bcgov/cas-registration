import { WidgetProps } from "@rjsf/utils";
import { useState, useCallback } from "react";
import { TextField, InputAdornment, CircularProgress } from "@mui/material";
import debounce from "lodash.debounce";
import ErrorCircle from "@bciers/components/icons/ErrorCircle";
import { actionHandler } from "@bciers/actions";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { BccrAccountDetailsResponse } from "@/compliance/src/app/types";

// Helper functions
const isValidAccountIdFormat = (accountId: string): boolean =>
  accountId.length === 15 && /^\d{15}$/.test(accountId);

const fetchAccountDetails = async (accountId: string) =>
  actionHandler(`compliance/bccr/accounts/${accountId}`, "GET");

const isValidResponse = (response: BccrAccountDetailsResponse): boolean =>
  !response.error && response.tradingName != null;

const BCCRHoldingAccountWidget = (props: WidgetProps) => {
  const { id, value, onChange, disabled, readonly, placeholder, formContext } =
    props;

  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const validateAccountId = useCallback(
    debounce(async (accountId: string) => {
      if (!isValidAccountIdFormat(accountId)) {
        setIsValid(null);
        formContext?.onValidAccountResolved?.(undefined);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetchAccountDetails(accountId);
        const valid = isValidResponse(response);
        setIsValid(valid);

        formContext?.onValidAccountResolved?.(valid ? response : undefined);
      } catch {
        setIsValid(false);
        formContext?.onValidAccountResolved?.(undefined);
      } finally {
        setIsLoading(false);
      }
    }, 500),
    [],
  );

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue.length > 15) return; // Prevent input longer than 15 characters

    if (/^\d*$/.test(newValue) && newValue.length <= 15) {
      onChange(newValue === "" ? undefined : newValue);
      await validateAccountId(newValue);
    } else {
      setIsValid(null);
      formContext?.onValidAccountResolved?.(undefined);
    }
  };

  return (
    <div className="w-full">
      <TextField
        id={id}
        size="small"
        disabled={disabled || readonly || isLoading}
        name={id}
        value={value ?? ""}
        onChange={handleChange}
        className="w-full"
        placeholder={placeholder}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <div className="flex items-center justify-center">
                {isLoading ? (
                  <CircularProgress size={20} />
                ) : isValid === true ? (
                  <CheckCircleIcon color="success" />
                ) : isValid === false ? (
                  <ErrorCircle sx={{ mr: 0 }} />
                ) : null}
              </div>
            </InputAdornment>
          ),
        }}
      />
    </div>
  );
};

export default BCCRHoldingAccountWidget;
