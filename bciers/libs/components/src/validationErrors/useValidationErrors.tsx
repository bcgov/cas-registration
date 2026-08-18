import { useState, useMemo, type ReactNode } from "react";
import {
  ValidationErrors,
  ValidationUIConfig,
  ValidationErrorSummary,
} from "@bciers/components/validationErrors";

export interface UseValidationErrorsOptions<TKey extends string = string> {
  config?: Partial<Record<TKey, ValidationUIConfig<TKey>>>;
  initialErrors?: ValidationErrors<TKey>;
}

export function useValidationErrors<TKey extends string = string>(
  optionsOrConfig?:
    | Partial<Record<TKey, ValidationUIConfig<TKey>>>
    | UseValidationErrorsOptions<TKey>,
  legacyInitialErrors?: ValidationErrors<TKey>,
) {
  // Support both passing (config, initialErrors) or options object
  const config =
    optionsOrConfig && "config" in optionsOrConfig
      ? optionsOrConfig.config
      : (optionsOrConfig as
          Partial<Record<TKey, ValidationUIConfig<TKey>>> | undefined);

  const initialErrors =
    optionsOrConfig && "initialErrors" in optionsOrConfig
      ? optionsOrConfig.initialErrors
      : legacyInitialErrors;

  const [errors, setErrors] = useState<ValidationErrors<TKey> | undefined>(
    initialErrors,
  );

  const renderedErrors = useMemo<ReactNode[] | undefined>(() => {
    if (!errors || errors.length === 0) return undefined;

    return [
      <ValidationErrorSummary
        key="validation-errors"
        errors={errors}
        config={config}
      />,
    ];
  }, [errors, config]);

  return {
    errors,
    setErrors,
    renderedErrors,
  };
}

export default useValidationErrors;
