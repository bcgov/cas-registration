# Supplementary Report Handlers

This document describes the supplementary report handlers used in the Compliance module of BCIERS. When a supplementary emissions report is submitted, these handlers make decisions based on the compliance impact of the supplementary report on the previous version & adjust or generate objects based on the results of those decisions. The decisions inside each handler are based on the state in which the previous compliance report version is in.

## The base service

[bc_obps/compliance/service/supplementary_report_version_service/service.py](../../bc_obps/compliance/service/supplementary_version_service/service.py)

This base service file contains the base class for all handlers (SupplementaryScenarioHandler) and the service that is called when a supplementary report is submitted (SupplementaryVersionService).

Base class:

- has a `can_handle()` function that is used by each handler to determine whether it can process the change based on the results of the supplementary emissions report.
- has a `handle()` function that each handler uses to execute its workflow if `can_handle()` returned true.

Service:

- contains logic that iterates through all the `can_handle()` functions of each handler and when it arrives at one that can process the change, stops and executes that handler's `handle()` function.
- has a couple early exits when it determines that the new compliance report version either requires `Manual Handling` or if the previous compliance report version can just be `Superceded` & the new version can become the source of truth by itself.

## The handlers

- Supercede Version Handler
- Manual Handler
- Decreased Credit Handler
- Decreased Obligation Handler
- Increased Credit Handler
- Increased Obligation Handler
- New Earned Credits Handler
- No Change Handler

### Supercede Version Handler

The supercede handler is a short circuit that runs before other handlers. The simplest way to handle the results of a supplementary emissions report is to replace the previous compliance report version with the new one as the single source of truth & the only version that requires any action. This can only be done when nothing has yet happened to the previous version that requires action.

#### What can it handle

This `can_handle()` function will return true if all ancestor versions (all previous versions except the latest version) have been superceded and if the previous compliance report version has an obligation that has not yet generated an invoice or if the previous compliance report version has earned credits that have not yet been requested.

#### What does it do

This `handle()` function will delete previous obligation or earned_credit records, set the previous compliance report version's status to `SUPERCEDED` (which we filter out of all views) and creates new obligation or earned_credit records attached to the new compliance report version. This effectively replaces the previous version leaving a single compliance report version that requires attention.

### Manual Handler

The manual handler is a short circuit that runs before other handlers. Once a compliance report version has been marked as needing manual handling, all subsequent versions will require manual handling as BCIERS has lost the context of how to resolve them since the previous resolution was done outside the app. Other handlers have logic to mark a compliance report version as requiring manual handling if their context is triggered, but cannot resolve it.

#### What can it handle

This `can_handle()` function will return true if the previous compliance report version was marked for manual handling.

#### What does it do

This `handle()` function will create the new compliance report version and mark it for manual handling.

### Decreased Credit Handler

#### What can it handle

This `can_handle()` function will return true if the credited_emission value resulting from the new emissions report is less than the previous version's credited_emission value.

#### What does it do

This `handle()` function determines what action to take based on the state of the latest compliance report version and earned credit record.

```
Case: Issuance has been approved (credits issued)

Result: Mark for manual handling. This will have to be resolved with the operation outside the app to determine how to return the delta of credits issued.
```

```
Case: Issuance has not yet been requested

Result: Reduce the original earned_credit record by the delta & mark the new version as `No Obligation or Earned Credits`
```

```
Case: Issuance has not yet been requested

Result: Reduce the previous earned_credit record by the delta & mark the new version as `No Obligation or Earned Credits`
```

```
Case: Issuance requested, pending decision

Result: Decline the previous earned_credit record, create a new one and mark the new version as `Earned Credits`
```

### Decreased Obligation Handler

The Decreased Obligation Handler is the most complicated handler in the set because it can potentially have to traverse multiple versions to apply the decrease or may result in complicated scenarios where credits need to be returned due to beging over the allowed usage cap or a dollar amount refund issued.

#### What can it handle

This `can_handle()` function will return true if the excess_emission value resulting from the new emissions report is less than the previous version's excess_emission value.

#### What does it do

This `handle()` function determines what action to take based on the state of the latest compliance report version and obligation record.

```
Case: Single unpaid ancestor obligation, amount owing > delta of difference

Result: Pushes an adjustment to the related invoice for the delta of difference between the previous version and the new one.
```

```
Case: Single unpaid ancestor obligation, amount owing < delta of difference

Result: Pushes an adjustment to the related invoice for the delta of difference between the previous version and the new one. Because the difference is greater than the amount owing, it will mark the previous version as `Obligation Met`. Marks the new version for manual handling for someone to issue a refund for outside of BCIERS.
```

```
Case: Single paid ancestor obligation

Result: Marks the new version for manual handling for someone to issue a refund outside of BCIERS.
```

```
Case: Multiple ancestors

Result: This handler can traverse several versions and apply the above logic to each previous version if necessary until the delta of decrease is spent.

Example:
Decrease amount: 500
previous obligation (unpaid): 200
previous-1 obligation (unpaid): 200
previous-2 obligation (paid): 400

In this example, the handler will mark the previous & previous-1 obligations as met, see that it still has leftover decrease to apply, hit previous-2, see that it is paid & stop. At this point it will mark the new compliance report version for manual handling to issue a refund for the difference of 100.
```

### Increased Credit Handler

#### What can it handle

This `can_handle()` function will return true if the credited_emission value resulting from the new emissions report is greater than the previous version's credited_emission value.

#### What does it do

This `handle()` function determines what action to take based on the state of the latest compliance report version and earned credit record.

```
Case: Previous earned credit record's issuance status is Credits Not Issued

Result: Adjusts the original earned credit record with the increase and sets the latest compliance report version to the No Obligation or Earned Credits status. Note: This case is unlikely to be hit, this flow was written before the Supercede Handler & except in very rare cases this will be scooped up by that handler before ever getting here.
```

```
Case: Previous earned credit record's issuance status is Approved (ie: credits have been issued)

Result: Creates a new earned credit record.
```

```
Case: Previous earned credit record's issuance status is Declined, Issuance Requested or Changes Requested

Result: Set the previous earned credit record's status to Declined & create a new earned credit record with the larger amount of credits.
```

### Increased Obligation Handler

#### What can it handle

This `can_handle()` function will return true if the excess_emission value resulting from the new emissions report is greater than the previous version's excess_emission value.

#### What does it do

This `handle()` function will create a new compliance obligation record & related eLicensing invoice from the delta of difference between the previous and new version's tCO2e amounts.

### New Earned Credits Handler

This handler was created to handle a missed edge case where no action would be taken if there was no earned_credit record to compare the new version's amount against in the case of an increase. Unlikely scenario.

#### What can it handle

This `can_handle()` function will return true if the credited_emission value resulting from the new emissions report is greater than the previous version's excess_emission value and the previous compliance report version did not have an obligation or an earned credit record.

#### What does it do

This `handle()` function will create a new earned credits record using the new emission report version's credit_emissions amount.

### No Change Handler

#### What can it handle

This `can_handle()` function will return true if the credited_emission values and the excess_emission values from the previous and new emission report version are equal. For example, if a supplementary report was created to update some incorrect admin data that had no bearing on the outcome for compliance.

#### What does it do

This `handle()` function will create a compliance report version with the No Obligation or Earned Credits status. No related obligation or earned credit record will be created in this case.
