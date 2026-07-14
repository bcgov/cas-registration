# Penalties

This document describes penalties as defined in the [Greenhouse Gas Emission Administrative Penalties and Appeals Regulation](https://www.bclaws.gov.bc.ca/civix/document/id/lc/statreg/248_2015) and how BCIERS handles / applies these penalties. If there is any drift or discrepancy between this document and the penalties regulation, the penalties regulation should be considered the source of truth.

## Types of Penalties

- Imposed
- Automatic Overdue
- GGEAPAR Interest

## Accruing vs Existing

Penalties begin _ACCRUING_ as soon as an obligation owes a balance beyond the due date.
However, a penalty data object in the BCIERS system and a related invoice in eLicensing will not be created until the obligation triggering the penalty has been paid in full (elicensing_invoice.fee_amount_balance == $0.00).
As far as BCIERS is concerned, A penalty does not _EXIST_ while it is _ACCRUING_. It only becomes data in the system with an invoice once the triggering obligation is paid in full.

## Imposed Penalties

BCIERS does not handle imposed penalties. These are levvied at the discretion of the Director & are handled outside of the application.

## Automatic Overdue

### When is it applied

An Automatic Overdue penalty begins to accrue when an obligation is not paid by the due date.
This can apply to both initial obligations & obligations that are the result of a supplementary report.
In the case of initial obligations & supplementary obligations submitted before the compliance deadline, the due date is the compliance deadline.

Example:

```
Compliance Deadline is Nov 30 2026
Initial Obligation (created July 1 2026) - due Nov 30 2026
Supplementary Obligation (created Nov 15 2026) - due Nov 30 2026
```

In the case of supplementary obligations where the report was submitted _after_ the compliance deadline, the due date is 30 days from report submission.

Example:

```
Compliance Deadline is Nov 30 2026
Supplementary Obligation (created March 1 2027) - due 30 days from March 1 2027
```

## GGEAPAR

### When is it applied

GGEAPAR Interest is applied to any supplementary obligation that was created after the compliance deadline.
It can _only_ apply to supplementary obligations.
GGEAPAR Interest is calculated from the day after the compliance deadline until the date that the supplementary obligation is met, using Prime + 3% as the base for each day it is considered late.

Example:

```
Compliance Deadline is Nov 30 2026
Supplementary Obligation is created March 1 2027
Supplementary Obligation is paid March 15 2027

GGEAPAR Interest will generate a penalty invoice calculated from Dec 1 2026 to March 15 2027 @ Prime + 3%
```

## How does BCIERS calculate penalties

- During our overnight processes, each obligation invoice is inspected by the system to see if it has recently been paid (elicensing_invoice.fee_amount_balance == $0.00) and if a penalty or penalties should be applied.
- If, after looking at the type of obligation (supplementary vs initial), the related due dates & the balance owing on the obligation the system determines that a penalty should be created; the overnight process will call the [PenaltyCalculationService.create_penalty()](../../bc_obps/compliance/service/penalty_calculation_service.py) with the appropriate function & parameters for the penalty type.
- The PenaltyCalculationService will create one CompliancePenalty record & several CompliancePenaltyAccrual records for each day that the calculation ran.
- The PenaltyCalculationService will make an API call to eLicensing to create an invoice for the total penalty amount owing
- The BCIERS system will then ingest the penalty invoice data from eLicensing and mirror that data to its own ElicensingInvoice table record

Example:

```
Compliance Deadline is Nov 30 2026
Initial Obligation is paid in full on Jan 15 2027
The overnight process will see this obligation has been paid & that it was paid late
The calculation service will:
- Create a CompliancePenalty record
- Create CompliancePenaltyAccrual records for each day from Dec 1 - Jan 15
- Call eLicensing & have it create an invoice
- Ingest the invoice data & create an ElicensingInvoice record
```

### Partial Payments

Penalties are calculated daily on the _balance owing_ of the obligation. So partial payments will be taken into account when calculating the penalty.
If a penalty is partially paid before the compliance deadline and then paid in full after the deadline. The amount partially paid before the deadline will not be considered when calculating the penalty.
Any partial payment made after the deadline will reduce the base amount value used in the penalty calculation for subsequent days, until the penalty is paid in full.

Example:

```
Compliance Deadline is Nov 30 2026
Initial Obligation is $1,000,000.00
A payment of $200,000.00 is made on Nov 15 2026
A payment of $500,000.00 is made on Dec 20 2026
A final payment of $300,000 is made on Jan 25 2027 (balance is now 0)
The penalty will be calculated with a base of:
$800,000.00 from Dec 1 - Dec 20
$300,000.00 from Dec 21 - Jan 25
```
