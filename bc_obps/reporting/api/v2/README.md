# Reporting API V2

Solving issues:

- Support form versions. Multiple data/rjsf schema requirements for the same endpoint, depending on reporting year or program configuration
- Reporting pages often require the same things:
  - Reporting Year
  - Report version ID
  - Reporting flow (registration purpose, operation type)
  - ...

## Payload standardization

- Standard payload:

```json
{
  "program_data": {
    // Program-wide constants that most page typically use:
    // Reporting year, Report ID, Operation ID, ...
  },
  "payload": {
    // Answer to the API request
  }
}
```

- With schema instead of program data

```json
{
  "json_schema": {
    // ...
  },
  "payload": {
    // ...
  }
}
```

- Why not both?

## Assumptions

- API requests for reporting forms are similar
- The backend

## Schemas

Use generics?
https://docs.pydantic.dev/latest/concepts/models/#generic-models

```py
# A payload type that is a ninja schema itself
TPayload = TypeVar('TPayload', bound=Schema)

class ReportingBaseSchema(Generic[TPayload]):
    payload: TPayload
    json_schema: dict # or some fancier type?
    program_data: ProgramDataSchema

```

## Schema location

Next to the api file
There is an unofficial pattern that /api/report_stuff.py should have a matching /schema/report_stuff.py but that is not always true.
A more classic approach would make sense here: specific schema should be next to the API endpoint, and if it makes sense to share some pieces between API files we can handle that in a /common/ or /shared/ path

## API spec

- handling forms
  POST /api/reporting/v2/{report_version}/forms/production_data
  GET /api/reporting/v2/{report_version}/forms/production_data

- everything else
  /api/reporting/v2/{report_version}/submit
