# 📄 Validation Error System

### Description

The validation error system provides a **standardized way to handle and display validation errors** across reporting forms.

Instead of passing string errors, the backend returns structured validation objects identified by a key
typed with severity optionally including context data for the frontend which are rendered on the frontend using a shared, config-driven component.

---

### Usage

Validation follows a simple flow:

1. Backend returns structured validation errors
2. Frontend stores them as `ReportValidationErrors`
3. UI renders them using `ReportValidationSummary`
4. Display behavior is controlled via `validationUIConfig`

---

### Example

#### Backend response (array-based model)

```json
{
  "error": [
    {
      "key": "missing_report_verification",
      "error": {
        "severity": "error",
        "context": {
          "reportVersionId": 123
        }
      }
    },
    // Multiple allocation_mismatch keys
    {
      "key": "allocation_mismatch",
      "error": {
        "severity": "error",
        "context": {
          "reportVersionId": 3,
          "facilityId": "9f7b0848-021e-4d08-9852-10524c4e5457",
          "facilityName": "Main Facility",
          "emissionCategoryName": "Combustion",
          "sourceActivityName": "non-processing and non-compression",
          "targetProductName": "non-processing, non-compression product"
        }
      }
    },
    {
      "key": "allocation_mismatch",
      "error": {
        "severity": "error",
        "context": {
          "reportVersionId": 3,
          "facilityId": "9f7b0848-021e-4d08-9852-10524c4e5457",
          "facilityName": "Main Facility",
          "emissionCategoryName": "Flaring",
          "sourceActivityName": "flaring",
          "targetProductName": "flaring product"
        }
      }
    }
  ]
}
```

#### Frontend usage

```ts
const [validationErrors, setValidationErrors] =
  useState<ReportValidationErrors>([]);
```

```ts
if (response?.error) {
  setValidationErrors(response.error);
}
```

```tsx
<ReportValidationSummary errors={validationErrors} />
```

---

### Config-driven UI

Each validation key is mapped in `validationUIConfig`:

```ts
missing_report_verification: {
  label: "Verification page",
  renderMode: "inline_link",
  getHref: (ctx) =>
    `/reporting/report-version/${ctx?.reportVersionId}/verification`,
  getMessage: () =>
    "Verification information must be completed on the Verification page.",
}
```

This controls:

- message text
- navigation links
- rendering style (inline, label, etc.)

---

### Adding a new validation

1. Add a new key to `ReportValidationMessageKey`
2. Return it from backend validation (posibley as an array item)
3. Add config in `validationUIConfig`

---

### Context

Validation errors may include optional context:

```ts
context: {
  reportVersionId,
  facilityId,
  activityId,
}
```

Used to:

- build navigation URLs
- customize messages dynamically

---

### Notes

- Messages should include the label text when using `inline_link`
- Errors are sorted by severity (errors before warnings)
- UI is fully driven by config
- Same validation key can appear multiple times (e.g., per activity)
