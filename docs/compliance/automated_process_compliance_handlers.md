# Automated Processes and Compliance Handlers

This document describes the automated processes that run overnight for compliance and the compliance handlers that are run on each invoice.

## The Automated Process Service

[bc_obps/compliance/service/automated_process/automated_process_service.py](../../bc_obps/compliance/service/automated_process/automated_process_service.py)

This service file iterates over every BCIERS invoice that exists in eLicensing, refreshing the invoice data to ensure that it is working with current information & runs a series of handlers that determine what actions if any the system should take. These processes are run overnight at 4am.

## The Compliance Handlers

- PenaltyPaidHandler,
- PenaltyAccruingHandler,
- ObligationPaidHandler,
- InterestPaidHandler,

### Penalty Paid Handler

#### What can it handle

This `can_handle()` function will return true if the invoice it has been passed is a penalty invoice, the related CompliancePenalty record's status is `Not Paid` and the invoice's outstanding balance is $0.00.

#### What does it do

This `handle()` function will mark the current CompliancePenalty record's status as `Paid`. It will also check to see if there are any other penalties related to the triggering ComplianceObligation record. If there are no other penalties, or all other penalties are also in status `Paid`, then the handler will also set the ComplianceObligation record's penalty status as `Paid`.

### Penalty Accruing Handler

#### What can it handle

This `can_handle()` function will return true if a ComplianceObligation has an invoice with an outstanding balance and it is past the deadline for the obligation to be paid.

#### What does it do

This `handle()` function will set the ComplianceObligation record's penalty status to `Accruing`.

### Obligation Paid Handler

#### What can it handle

This `can_handle()` function will return true if the ComplianceObligation's invoice has a fee_balance (not including any FAA interest) of $0.00 and the ComplianceReportVersion record's status is `Obligation Not Met`.

#### What does it do

This `handle()` function does the following:

1. Check if the ComplianceObligation's invoice has FAA interest owing
   - if it does, it sets the ComplianceReportVersion's status to `Obligation Met, Interest Not Paid`
   - otherwise, it sets the status to `Obligation Met`

2. Determines whether the ComplianceObligation should be charged GGEAPAR Interest (Was the obligation the result of a supplementary report submitted beyond the compliance deadline)
   - if it does, it will call the PenaltyCalculationService with the appropriate parameters to create a GGEAPAR Interest penalty & invoice in eLicensing

3. Determines whether the ComplianceObligation should be charged an Automatic Overdue Penalty (Original obligation paid past the deadline, or supplementary obligation paid after custom due date)
   - if it does, it will call the PenaltyCalculationService with the appropriate parameters to create a Automatic Overdue penalty & invoice in eLicensing

### Interest Paid Handler

#### What can it handle

This `can_handle()` function will return true if the ComplianceObligation's invoice has an interest balance of $0.00 and the related ComplianceReportVersion is still in status `Obligation Met, Interest Not Paid`.

#### What does it do

This `handle()` function will flip the status of the ComplianceReportVersion from `Obligation Met, Interest Not Paid` to `Obligation Met`.
