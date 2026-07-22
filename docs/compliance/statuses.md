# Statuses

This document describes the various statuses that each compliance object can be assigned.

## Objects that have statuses

- ComplianceReportVersion
- ComplianceEarnedCredit
- ComplianceObligation
- CompliancePenalty

### ComplianceReportVersion

#### Statuses

- Obligation pending invoice creation
- Obligation not met
- Obligation Met - Interest not paid
- Obligation fully met
- Earned credits
- No obligation or earned credits
- Requires manual handling
- Superceded

##### Obligation pending invoice creation

- Indicates that this ComplianceReportVersion record has a related obligation, but the eLicensing invoice has not yet been generated for this obligation. No actions for the reporter to take in this state.
- Moves to `Obligation not met` once an invoice has been generated.
- Moves to `Superceded` if a supplementary report is submitted.

##### Obligation not met

- Indicates that this ComplianceReportVersion record has a related obligation (with an invoice) that has not yet been met.
- Moves to `Obligation Met - Interest not paid` if the obligation amount is paid, but any FAA interest amount is still owing.
- Moves to `Obligation Fully Met` if the obligation amount is paid and there is no outstanding balance including FAA interest on the invoice.

##### Obligation met - Interest not paid

- Indicates that this ComplianceReportVersion record has a related obligation (with an invoice) where the tCO2e obligation has been paid, but there is FAA interest still owing on the invoice.
- Moves to `Obligation Fully Met` if the FAA interest on the invoice is fully paid.

##### Obligation fully met

- Indicates that this ComplianceReportVersion record has a related obligation (with an invoice) that has been fully paid off (no outstanding balance owing including FAA interest).
- Shown as `Obligation met` to users. Removed `fully` from the display.
- This status does not move to any other state.

##### Earned credits

- Indicates that this ComplianceReportVersion record has a related ComplianceEarnedCredit record.
- Moves to `Superceded` if a supplementary report is submitted before credits are issued.
- Otherwise, this status does not move to any other state.

##### No Obligation or earned credits

- Indicates that this ComplianceReportVersion has no actions needed for compliance.
- These versions are filtered from view on the Compliance Summaries tab.
- This status is applied if a version has no material change to an obligation or credits or if it simply applies its change to a previous version.
- This status does not move to any other state.

##### Requires manual handling

- Indicates that this ComplianceReportVersion requires attention from an internal user & that some actions will need to be taken outside of the scope of BCIERS to resolve.
- This status does not move to any other state.
- Any subsequent ComplianceReportVersion records created after this one will automatically be flagged for manual handling as well.

##### Superceded

- Indicates that this ComplianceReportVersion is to be ignored. It has been replaced as the source of truth by a subsequent version.
- When no binding action has occured on a version (obligation has created an invoice or earned credits have been issued) then we can cleanly replace it with the new version.
- This status does not move to any other state.

### ComplianceEarnedCredit

#### Statuses

- Credits Not Issued in BCCR
- Issuance Requested
- Changes Required
- Approved
- Declined

##### Credits Not Issued in BCCR

- Indicates that this ComplianceEarnedCredit record has not yet had a reporter request issuance of the credits.
- Moves to `Issuance Requested` once a reporter has requested the issuance of the credits via BCIERS.
- Moves to `Superceded` if a supplementary report is submitted before the credits are issued.

##### Issuance Requested

- Indicates that this ComplianceEarnedCredit record been requested for issuance by the reporter, but has not yet been reviewed.
- Moves to `Changes Requested` if during review, there are changes that must be made before they can be approved.
- Moves to `Approved` if after review, both an analyst and the director are satisfied that all requirements are met and they should be issued in BCCR. This status implies that the credits have been issued in BCCR.
- Moves to `Declined` if after review, either an analyst and the director are unsatisfied that all requirements are met and they should not be issued in BCCR.
- Moves to `Superceded` if a supplementary report is submitted before the credits are issued.

##### Changes Required

- Indicates that this ComplianceEarnedCredit record been reviewed, but there are changes that must be made before the analyst or director feel that the issuance can be granted.
- Moves to `Changes Requested` if during review, there are changes that must be made before they can be approved.
- Moves to `Superceded` if a supplementary report is submitted before the credits are issued.

##### Approved

- Indicates that this ComplianceEarnedCredit record been reviewed and approved for issuance by both an analyst & the director. This status means the credits have been issued in BCCR.
- This status does not move to any other state.

##### Declined

- Indicates that this ComplianceEarnedCredit record been reviewed and declined by either an analyst or the director.
- This status does not move to any other state.

### ComplianceObligation

#### Statuses (PenaltyStatus)

The complianceObligation has no status that describes its own state. It does have a status that describes the state of any penalties that may have been incurred by the obligation.

- None
- Accruing
- Paid
- Not Paid

##### None

- Indicates that this ComplianceObligation has no penalty.
- Moves to `Accruing` if the obligation is still unpaid after the compliance deadline (or custom due date in the case of supplementary obligations submitted after the deadline)

##### Accruing

- Indicates that this ComplianceObligation will incur a penalty (or penalties) once the obligation is paid.
- No CompliancePenalty object or eLicensing invoice has been generated at this point.
- Moves to `Not Paid` once the triggering obligation has been paid.

##### Not Paid

- Indicates that this ComplianceObligation has incurred a penalty (or penalties).
- Both a related CompliancePenalty object and an eLicensing invoice have been generated.
- Moves to `Paid` once the penalty has been paid.

##### Paid

- Indicates that this ComplianceObligation has incurred a penalty or penalties and that all related penalties have been paid.
- This status does not move to any other state.

### CompliancePenalty

#### Statuses

It may appear that there is redundancy with the ComplianceObligation.PenaltyStatus statuses and the CompliancePenalty statuses. Since an obligation can have multiple penalties associated with it, it's necessary to track them at both levels to determine if an obligation has paid ALL penalties, none of the penalties or only one of the penalties.

- Not Paid
- Paid

##### Not Paid

- Indicates that this CompliancePenalty has not yet been paid.
- Moves to `Paid` once the penalty has been paid.

##### Paid

- Indicates that this CompliancePenalty has been paid.
- This status does not move to any other state.
