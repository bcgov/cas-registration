# Transfer Events

This document explains how transfer events are processed in the system. There are two types of transfer events: Facility
transfers and Operation transfers.

## What are Transfer Events?

Transfer events are used to manage the movement of facilities between operations or the transfer of an entire operation
to a new operator. These events can be initiated for a specific date in the future, or they can be set to take effect
immediately.

## How do Transfer Events Work?

The system categorizes transfer events based on the entity being transferred: Facility or Operation.

### Transferring Facilities

* The facility's current operation (the one it's assigned to before the transfer).
* The new operation (the one the facility will be assigned to after the transfer).
* The effective date of the transfer.

### Transferring Operations

* The Operation's current operator (the one it's assigned to before the transfer).
* The operation being transferred.
* The new operator that will take over the operation.
* The effective date of the transfer.

## Processing Transfer Events

The system processes transfer events differently depending on their effective date:

* **Today or Past Effective Date:** If a transfer event's effective date is today or in the past, the transfer is
  processed immediately upon creation.
* **Future Effective Date:** Transfer events with a future effective date are handled by a scheduled background job (
  cron job). This job runs periodically and utilizes the `process_due_transfer_events` service to identify and process
  any transfer events that have become due (effective date has arrived).

## Processing a Transfer Event

Once a transfer event is identified for processing (either immediately or by the cron job), the system performs the
following actions specific to the transfer type:

### Facility Transfer

1. **For each facility in the transfer:**
    * Identify the current timeline record linking the facility to its original operation using the
      `FacilityDesignatedOperationTimelineService.get_current_timeline` service.
    * If a current timeline exists, update its end date and status to reflect the transfer using the
      `FacilityDesignatedOperationTimelineService.set_timeline_status_and_end_date` service. The new status will be set
      to `TRANSFERRED` and the end date will be set to the transfer's effective date.
    * Create a new timeline record using the
      `FacilityDesignatedOperationTimelineDataAccessService.create_facility_designated_operation_timeline` service. This
      new record links the facility to the new operation, sets the start date to the transfer's effective date, and sets
      the status to `ACTIVE`.

### Operation Transfer

1. Identify the current timeline record linking the operation to its original operator using the
   `OperationDesignatedOperatorTimelineService.get_current_timeline` service.
2. If a current timeline exists, update its end date and status to reflect the transfer using the
   `OperationDesignatedOperatorTimelineService.set_timeline_status_and_end_date` service. The new status will be set to
   `TRANSFERRED` and the end date will be set to the transfer's effective date.
3. Create a new timeline record using the
   `OperationDesignatedOperatorTimelineDataAccessService.create_operation_designated_operator_timeline` service. This
   new record links the operation to the new operator, sets the start date to the transfer's effective date, and sets
   the status to `ACTIVE`.