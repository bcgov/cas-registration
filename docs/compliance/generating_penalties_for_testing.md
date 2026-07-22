# Generating Penalties for QA

This document describes how to generate penalties for manual testing/QA. Because penalties are applied based on dates in the future, penalties are not something we can trigger with a workflow in BCIERS. Penalties are applied when a compliance obligation is paid in full, but it was paid after the deadline (or invoice due date). We can manipulate some dates in the database to force a penalty to generate.

## Generate Penalty

### Steps:

- Submit the obligation not met report
- In the eLicensing test environment, make a payment (or payments) that fully meet the obligation
- Refresh the eLicensing data in bciers
- Note: If you want to test multiple payments over a period, update the received_date(s) of your payment records accordingly
- Manually update eLicensing_invoice.due_date to a date in the past (note that the refresh service will overwrite this change with data from eLicensing after 15 minutes on the next refresh, so make sure to do the next step immediately after changing the date)
- Call PenaltyCalculationService.create_penalty() with the related obligation & the effective deadline (the last date the obligation can be paid before it is considered overdue)

#### Example shell call:

```Python
from compliance.service.penalty_calculation_service import PenaltyCalculationService
from datetime import date
PenaltyCalculationService.create_penalty(obligation_id=<obligation_id>, penalty_type=<CompliancePenalty.PenaltyType>, effective_deadline=<your custom deadline date>)

```

- This would calculate & persist a penalty to the database that is `<received_date of final payment record - effective deadline>` days late

### Notes:

- To start the shell locally, `make shell`
- Command to pull up the shell in a backend pod in openshift: `.venv/bin/python manage.py shell`
- You _can_ manually create invoice & payment data without interacting with eLicensing or the BCIERS app with SQL or Python scripts to generate the necessary objects to trigger a penalty. Just make sure that ElicensingInvoice.last_refreshed is < 15 minutes when calling `create_penalty()` or it will try to contact eLicensing to refresh an invoice that does not exist and break.
