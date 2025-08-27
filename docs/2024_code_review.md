## Registration

- Date of first shipment for operations \*\*\*
  - models/operation.py
    - DateOfFirstShipmentChoices specific to 2024
  - schema/operation.py
    - Field for date of first shipment
  - api/.../test_new_entrant_application.py
  - test_changing_registration_purpose.py
  - test_operation_registration.py

## Reporting

- ReportProduction model has an "apr_dec_production" field
- ReportComplianceSummaryProduct has an "apr_dec_production" field
- activities' schemas
  All the activities' schemas are 2024 specific.
  -> Copy/Paste for 2025?
  -> Make rules to know which ones changed?

  - reporting/json\*schemas/2024/\*\*/\_.json
  - tests for the configuration json is also specific to 2024 (See `reporting/tests/models/program_configuration_tests`)

- Compliance Summary

  - ReportConplianceSummary.initial_compliance_period defaults to 2024
  - Compliance service

    - Naics regulatory values hardcoded to fetch with an initial compliance period 2024 (probably not an issue?)
    - allocated_for_compliance_2024 is calculated no matter what (along with the general compliance value)
    - "emissions attributable for compliance" and each products "allocated compliance emissions" use the 2024-specific value
    - excess/credited emissions also use the 2024-specific allocation
    - tests for compliance service (test_compliance_service_static.py) also only test 2024 scenarios

## Service

- test_service_utils.py could use any date and not 2024
- test_operation_service.py checks the date of first shipment according to the 2024 rules

## Frontend

- administrationRegistrationInformation.ts encodes the date of first shipment as 2024 in the options
- newEntrantOperation.ts encodes the date of first shipment as 2024 in the options
- finalReviewFields.ts includes apr-dec production for 2024
- a few references to the "apr_dec" fields in

  - ComplianceSummaryForm.tsx
  - finalReviewFields.ts
  - finalReview/reportTypes.ts
  - jsonSchema/complianceSummary.ts

- lots of compliance tests use 2024 as a base when they don't really have to
