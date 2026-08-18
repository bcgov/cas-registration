# 📄 Validation Error System

## Overview

The validation error system provides a **standardized, end-to-end way** to define, return, and display validation errors across reporting forms.

Validation uses:

```txt
Backend validator → structured error → API → frontend config → UI rendering
```

This ensures:

- consistency across pages
- reusable UI behavior
- centralized control of messages and navigation

---

## 🔄 Flow

```txt
1. Backend validator runs
2. Returns ReportValidationError(s)
3. API serializes errors
4. Frontend stores errors
5. ValidationErrorSummary renders them
6. validationUIConfig controls display + links
```

---

## 🧱 Backend

### 1. Error Structure

Validators return:

```python
dict[str, ReportValidationError]
```

Each error includes:

```python
ReportValidationError(
    severity=Severity.ERROR | WARNING | INFO,
    key=ReportValidationErrorKey.<KEY>,
    context=ErrorContext(...)
)
```

---

### 2. Error Keys

Defined in:

```python
ReportValidationErrorKey
```

Example:

```python
class ReportValidationErrorKey(StrEnum):
    ERROR_REQUIRED_FIELDS = "error_required_fields"
```

---

### 3. Context

Context provides dynamic data for the frontend:

```python
context = ErrorContext(
    report_version_id=report_version.id,
    facility_id=facility_id,
    facility_name=facility_name,
    activity_id=activity_id,
    section=SECTION,
    section_title=SECTION_TITLE,
    missing_fields=[...],
)
```

Used for:

- building links
- customizing messages

---

### 4. Validator Structure

```python
SECTION = "activity_data_coverage"
SECTION_TITLE = "Activity data"

def applies(flow: ReportingFlow) -> bool:
    return applies_to_section(flow, SECTION)

def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    errors = {}

    # validation logic

    if error_condition:
        errors["unique_key"] = ReportValidationError(...)

    return errors
```

---

### 5. Register Section

Add to:

```python
SECTION_APPLICABLE_FLOWS
```

```python
"activity_data_coverage": {
    ReportingFlow.SFO,
    ReportingFlow.LFO,
    ReportingFlow.NEW_ENTRANT_SFO,
    ReportingFlow.NEW_ENTRANT_LFO,
    ReportingFlow.REPORTING_ONLY_SFO,
    ReportingFlow.REPORTING_ONLY_LFO,
},
```

---

### 6. Register Validator

Add to plugin list (`__all__`):

```python
__all__ = [
    "activity_data_coverage_validator",
]
```

---

## 🌐 API Response Shape

Returned as:

```json
{
  "validation": {
    "errors": [
      {
        "key": "activity_data_coverage",
        "error": {
          "severity": "error",
          "context": {
            "reportVersionId": 3,
            "facilityId": "uuid",
            "facilityName": "Main Facility"
          }
        }
      }
    ]
  }
}
```

---

## ➕ Adding a New Validation

### Backend

1. Create validator file
2. Define:

   ```python
   SECTION
   SECTION_TITLE
   TAGS
   ```

3. Implement:

   ```python
   applies()
   validate()
   ```

4. Add error key
5. Register section in `SECTION_APPLICABLE_FLOWS`
6. Register validator in plugin list
7. Add tests

---

### Frontend

1. Add key to `validationUIConfig`
2. Define:

   - label
   - getHref
   - formatMessage

3. Ensure context fields exist

---

## ✅ Checklist

```txt
[ ] Validator created
[ ] SECTION key defined
[ ] Context populated
[ ] SECTION key added to SECTION_APPLICABLE_FLOWS
[ ] Validator registered in `bc_obps/reporting/service/report_validation/validators/__init__.py`
[ ] SECTION key added to `bciers/apps/reporting/src/app/components/validationErrors/types.ts`
[ ] SECTION key added to `bciers/apps/reporting/src/app/components/validationErrors/config.ts`
[ ] Tests added\updated
[ ] Everything wired end-to-end
```
