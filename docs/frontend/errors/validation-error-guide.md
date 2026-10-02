# Validation Error System Architecture

The validation error system uses a **configuration-driven frontend architecture** to provide consistent error handling, sorting, messaging, linking, and rendering across forms.

Forms focus solely on triggering requests delegating all formatting, sorting, and rendering logic entirely to the shared validation architecture.

Presentation behavior is centralized in domain-specific `validationUIConfig` definitions (which extend shared base keys like `generic_error` and `user_error`) and the shared `ValidationErrorSummary` component.

```

Form Submission / User Action / Client Guard
│
├───────────────────────────────┐
▼                               ▼
actionHandler / async API call   Client-Side Guard Check
Handles request / normalizes          │
│                               ▼
▼                         setClientError
handleApiResponse          Sets generic error
Evaluates status & errors             │
│                               │
└──────────────┬────────────────┘
│
▼
useValidationErrors
Manages error state & memoizes summary
│
├──── Domain-Specific validationUIConfig (optional)
│     (e.g., reporting, compliance, registration)
│     priority
│     message / label
│     getHref
│     renderMode
▼
ValidationErrorSummary
Sorts and renders errors via AlertNote
│
▼
Form UI

```

---

## Core Components & Types

### `types.ts` & Base Definitions

All base types, including extensible system keys, are exported from the shared package `@bciers/components/validationErrors`:

```ts
export type ValidationSeverity = "Error" | "Warning" | "Info";

export type ValidationRenderMode = "message_only" | "label_then_message" | "inline_link";

export interface ValidationItemError {
  severity: ValidationSeverity;
  message?: string;
  context?: Record<string, unknown>;
}

export interface ValidationItem<TKey extends string="string"> {
  key: TKey;
  error: ValidationItemError;
}

export type ValidationErrors<TKey extends string="string"> =
  ValidationItem<TKey>[];

/**
 * Base system-level error keys built into the shared component library.
 */
export type BaseValidationMessageKey = "generic_error" | "user_error";

/**
 * Extensible validation message key type allowing applications to merge
 * domain keys with shared base system keys.
 */
export type ValidationMessageKey<T string> = BaseValidationMessageKey | T;

```

---

## Helpers: Factories & Dispatchers

### 1. `createGenericValidationError`

Creates a standardized `ValidationItem` object with zero side effects. Use it when mapping arrays of error strings, data transformations, or unit test assertions.

```
export const createGenericValidationError = <TKey extends string = "string">(
  message: string,
  severity: ValidationSeverity = "Error"
): ValidationItem<TKey> => ({
  key: "generic_error" as TKey,
  error: {
    message,
    severity,
  },
});
```

### 2. `setClientError`

Sets a client-side validation error directly into state, ideal for client-side guard conditions.

```
export const setClientError = <TKey extends string = "string">(
  message: string,
  setErrors: (errors: ValidationItem<TKey>[] | undefined) => void,
  severity: ValidationSeverity = "Error"
): boolean => {
  setErrors([createGenericValidationError<TKey>(message, severity)]);
  return false;
};
```

#### Usage Example: Client-Side Pre-Submit Guard

```
const onSubmit = async (data: { formData?: OperationFormData }) => {
  setErrors(undefined);

  // Client-side business rule guard
  if (!data.formData?.product_selection?.includes("Pulp and paper: chemical pulp")) {
    return setClientError(
      "Missing Product: 'Pulp and paper: chemical pulp'. Please add the product on the operation review page.",
      setErrors,
    );
  }

  const response = await actionHandler("registration/operations", "POST", ...);

  const isSuccess = handleApiResponse(response, setErrors);
  if (!isSuccess) return;

  router.push("/operations");
};

```

---

## Domain-Specific `validationUIConfig`

Each domain defines its own `validationUIConfig` tailored to its distinct validation keys, business routes, and messages.

Domain configurations leverage the shared `sharedValidationUIConfig` spread and the `createValidationUIConfig` helper.

```
// src/app/components/validationErrors/config.ts (Domain-Specific)
import {
  createValidationUIConfig,
  ValidationUIConfig,
  sharedValidationUIConfig,
} from "@bciers/components/validationErrors";
import { ValidationMessageKey } from "./types";

export const validationUIConfig: Partial<
  Record<ValidationMessageKey, ValidationUIConfig<ValidationMessageKey>>
> = {
  // Inherit standard system-level fallback keys (generic_error, user_error)
  ...sharedValidationUIConfig,

  no_bceid_access: createValidationUIConfig<ValidationMessageKey>({
    priority: 10,
    renderMode: "inline_link",
    label: () => "ghgregulator@gov.bc.ca",
    getHref: () => ghgRegulatorEmail,
    getMessage: (error) =>
      error.message ??
      "Your business BCeID does not have access to this operator. Please contact ghgregulator@gov.bc.ca",
  }),
};
```

Configuration can define:

- **Sorting priority:** Lower numbers render first.
- **Message / Label:** Dynamic resolution from `error.context` or string constants.
- **Deep Links (`getHref`):** Context-aware domain URLs for navigation jumps.
- **Rendering strategy (`renderMode`):** `message_only`, `label_then_message`, or `inline_link`.

---

## Hook API: `useValidationErrors`

Provides the standard hook interface components use to manage validation errors.

```
// 1. Unconfigured / Generic Mode (Uses default fallback):
const { setErrors, renderedErrors } = useValidationErrors();

// 2. Domain-Configured / Type-Safe Mode:
const { setErrors, renderedErrors } = useValidationErrors({
  config: validationUIConfig, // Domain config imported from local feature folder
});
```

- **`setErrors`** — Sets or clears validation errors (`setErrors(undefined)` clears errors).
- **`renderedErrors`** — Memoized `ValidationErrorSummary` element ready to insert directly into JSX.
- **`config`** — Provides domain-specific presentation rules.
- **`ValidationMessageKey`** — Domain union extending shared system keys with strictly defined feature values.

---

## `ValidationErrorSummary`

Handles the presentation of validation errors:

1. Filters out empty and inactive errors.
2. Sorts errors by severity (`Error` > `Warning` > `Info`) and configured `priority`.
3. Looks up the domain UI configuration for each error (falling back to `defaultGenericErrorConfig` for unmapped keys).
4. Resolves messages, labels, and links.
5. Renders the appropriate `AlertNote`.

---

## Architectural Principle

```
Form / Action Component
  → Execute client validation guard (via setClientError) or dispatch server action
  → Pass response payload to handleApiResponse
  → Render renderedErrors inline in JSX

Domain Configuration
  → Define business error keys and dynamic links per feature module
  → Spread ...sharedValidationUIConfig for base system errors
  → Map domain rules via createValidationUIConfig

Shared Validation System
  → Maintain reactive error state
  → Determine severity and priority ordering
  → Resolve dynamic messages, field labels, and links
  → Render accessible AlertNote banners

```

---

![Understanding Validation Errors](../images/validationErrors.png)

#### Image Generation details

- **Tool:** ChatGPT (OpenAI), including AI image generation
- **Input:** Technical information contained in this document

> [!NOTE]
> AI-generated diagrams are for explanatory purposes only. If a diagram conflicts with the application code, technical documentation, or applicable regulations, those sources take precedence.
