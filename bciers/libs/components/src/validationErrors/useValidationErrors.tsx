import { useState, useMemo, type ReactNode } from "react";
import {
  ValidationErrors,
  ValidationLinks,
  ValidationUIConfig,
  ValidationErrorSummary,
} from "@bciers/components/validationErrors";

export interface UseValidationErrorsOptions<TKey extends string = string> {
  config?: Partial<Record<TKey, ValidationUIConfig<TKey>>>;
  initialErrors?: ValidationErrors<TKey>;
  links?: ValidationLinks;
}

export function useValidationErrors<TKey extends string = string>(
  optionsOrConfig?:
    | Partial<Record<TKey, ValidationUIConfig<TKey>>>
    | UseValidationErrorsOptions<TKey>,
  legacyInitialErrors?: ValidationErrors<TKey>,
) {
  // Support both passing (config, initialErrors) or options object
  const isOptions =
    !!optionsOrConfig &&
    ("config" in optionsOrConfig ||
      "initialErrors" in optionsOrConfig ||
      "links" in optionsOrConfig);
  const options = isOptions
    ? (optionsOrConfig as UseValidationErrorsOptions<TKey>)
    : undefined;

  const config = isOptions
    ? options?.config
    : (optionsOrConfig as
        Partial<Record<TKey, ValidationUIConfig<TKey>>> | undefined);

  const initialErrors =
    options && "initialErrors" in options
      ? options.initialErrors
      : legacyInitialErrors;
  const links = options?.links;

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
        links={links}
      />,
    ];
  }, [errors, config, links]);

  return {
    errors,
    setErrors,
    renderedErrors,
  };
}

export default useValidationErrors;
