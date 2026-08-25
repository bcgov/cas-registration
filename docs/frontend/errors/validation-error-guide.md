# Validation Error System Architecture

The validation error system uses a **configuration-driven frontend architecture** to provide consistent error handling, sorting, messaging, linking, and rendering across forms.

The core idea is that forms only need to submit the request and pass validation errors into the shared system. Presentation behavior is centralized in `validationUIConfig` and `ValidationErrorSummary`.

```
Form Submission
      │
      ▼
actionHandler
Handles request / normalizes errors
      │
      ▼
handleApiResponse
Updates validation state
      │
      ▼
useValidationErrors
Manages error state
      │
      ├──── validationUIConfig
      │     priority
      │     message
      │     link
      │     renderMode
      ▼
ValidationErrorSummary
Sorts and renders errors
      │
      ▼
    Form UI

```

## Core Components

### `validationUIConfig`

Centralizes how each validation error should be presented.

```ts
const validationUIConfig = {
  some_error_key: {
    priority: 10,
    renderMode: "inline_link",
    message: (context) => "...",
    route: (context) => "...",
  },
};
```

Configuration can define:

- sorting priority
- message
- link/route
- rendering strategy

### `useValidationErrors`

Provides the standard interface forms use to manage validation errors.

```ts
const { setErrors, renderedErrors } = useValidationErrors();

const { setErrors, renderedErrors } = useValidationErrors<ValidationMessageKey>(
  {
    config: validationUIConfig,
  }
);
```

- `setErrors` — sets or clears validation errors.
- `renderedErrors` — memoized `ValidationErrorSummary`.
- `config` — provides the module-specific presentation rules.
- `ValidationMessageKey` — provides type safety for configured validation keys.

### `ValidationErrorSummary`

Handles the actual presentation of validation errors.

It:

1. Sorts errors by severity and configured priority.
2. Looks up the UI configuration for each error.
3. Resolves messages and links.
4. Selects the configured `renderMode`.
5. Renders the appropriate `AlertNote`.

## Standard Form Implementation

```tsx
import {
  useValidationErrors,
  handleApiResponse,
} from "@bciers/components/validationErrors";
import { validationUIConfig } from "@reporting/src/app/components/validationErrors/config";
import type { ValidationMessageKey } from "@reporting/src/app/components/validationErrors/types";

const { setErrors, renderedErrors } = useValidationErrors<ValidationMessageKey>(
  {
    config: validationUIConfig,
  }
);

const handleSubmit = async (data: { formData: unknown }) => {
  setErrors(undefined);

  const response = await actionHandler(
    `reporting/report-version/${versionId}/submit`,
    "POST",
    "/reports/current",
    { body: JSON.stringify(data.formData) }
  );

  return handleApiResponse(response, setErrors);
};

return (
  <MultiStepFormWithTaskList
    onSubmit={handleSubmit}
    errors={renderedErrors}
    {...formProps}
  />
);
```

## Generic Error Usage (No Domain Config)

If a component only handles generic error messages (like API network or server failures) and does not need domain-specific deep links, priority sorting, or mapped keys, you do not need to import a domain `validationUIConfig` or `ValidationMessageKey`.

You can use the base generic types with an empty or fallback configuration:

```tsx
import {
  useValidationErrors,
  handleApiResponse,
  createGenericValidationError,
} from "@bciers/components/validationErrors";

const { setErrors, renderedErrors } = useValidationErrors();

const handleAction = async () => {
  setErrors(undefined);

  const response = await triggerAction();
  const isSuccess = handleApiResponse(response, setErrors);
  if (!isSuccess) return;
};

return <div>{renderedErrors}</div>;
```

**How the fallback works:**

- `createGenericValidationError(msg)` creates an item with `key: "generic_error"` and assigns the message.
- `ValidationErrorSummary` automatically defaults unconfigured keys to `message_only` mode, rendering `error.message` directly in an error alert without requiring a custom link resolver or config entry.

## Implementation Flow

```text
Form
 │
 │ actionHandler(...)
 ▼
API Response
 │
 │ handleApiResponse(...)
 ▼
setErrors(...)
 │
 ▼
useValidationErrors
 │
 ├── validationUIConfig (or fallback {})
 │
 ▼
ValidationErrorSummary
 │
 ▼
Rendered AlertNote(s)

```

## Architectural Principle

Forms and action components should not contain validation-specific presentation logic.

```text
Form / Component
  → submit request / trigger action
  → pass response to handleApiResponse (or createGenericValidationError on catch)
  → render renderedErrors

Shared Validation System
  → manage error state
  → determine ordering
  → resolve messages and links
  → select rendering strategy (or fallback to message_only)
  → render errors

```

This keeps components simple while ensuring validation errors are presented consistently across the application.

![Understanding Validation Errors](../images/validationErrors.png)

#### Image Generation details

- **Tool:** ChatGPT (OpenAI), including AI image generation
- **Input:** Technical information contained in this document

> [!NOTE]
> AI-generated diagrams are for explanatory purposes only. If a diagram conflicts with the application code, technical documentation, or applicable regulations, those sources take precedence.
