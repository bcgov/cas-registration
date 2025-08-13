# Generating Penalties for QA

This document describes how to generate penalties for manual testing/QA. Because penalties are applied based on dates in the future, penalties are not something we can trigger with a workflow in BCIERS. Penalties are applied when a compliance obligation is paid in full, but it was paid after the deadline (or invoice due date). We can manipulate some dates in the database to force a penalty to generate.

## Generate Penalty (quick)

We can generate a penalty quickly when all we care about is seeing the penalty. This method won't make sense when taking the data in full context as there will be no payment records that reduced the outstanding balance of the invoice to zero, but it's a little quicker if the penalty is all you want.

### Steps:

- Submit the obligation not met report
- Manually update elicensing_invoice.due_date to a date in the past
- Call PenaltyCalculationService.calculate_penalty() from the shell with:
  - the related obligation
  - persist_penalty=True
  - accrual_start_date = 1 day after invoice due date
  - final_accrual_date = however long you want the penalty to accrue for

#### Example shell call:

```Python
from compliance.service.penalty_calculation_service import PenaltyCalculationService
from compliance.models.compliance_obligation import ComplianceObligation
from datetime import date
PenaltyCalculationService.calculate_penalty(
    obligation=ComplianceObligation.objects.get(id=<related_obligation_id>),
    persist_penalty_data=True,
    accrual_start_date=date(2025, 7, 31),
    final_accrual_date=date(2025, 8, 5))

```

- This would calculate & persist a penalty to the database that is 5 days late.

## Generate Penalty (accurate)

If you care about the data being sane, then use this method. It takes a little longer, but the payments will match the amount of the obligation & the last date of penalty calculation will match the date of the last payment.

### Steps:

- Submit the obligation not met report
- In the elicensing test environment, make a payment (or payments) that fully meet the obligation
- Refresh the elicensing data in bciers
- Note: If you want to test multiple payments over a period, update the received_date(s) of your payment records accordingly
- Manually update elicensing_invoice.due_date to a date in the past (note that the refresh service will overwrite this change with data from elicensing after 15 minutes on the next refresh, so make sure to do the next step immediately after changing the date)
- Call PenaltyCalculationService.create_penalty() with the related obligation

#### Example shell call:

```Python
from compliance.service.penalty_calculation_service import PenaltyCalculationService
from compliance.models.compliance_obligation import ComplianceObligation
from datetime import date
PenaltyCalculationService.create_penalty(obligation=ComplianceObligation.objects.get(id=<related_obligation_id>))

```

- This would calculate & persist a penalty to the database that is `<received_date of final payment - due_date of invoice>` days late

### Notes:

- To start the shell locally, `make shell`
- Command to pull up the shell in a backend pod in openshift: `.venv/bin/python manage.py shell`
