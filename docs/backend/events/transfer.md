# Transfer Events

This document explains how transfer events are processed in the system, including the interaction between models,
statuses, and dates. There are two types of transfer events: **Facility transfers** and **Operation transfers**.

---

## What are Transfer Events?

Transfer events manage the movement of facilities between operations or the transfer of an entire operation to a new
operator. These events can be initiated for a specific future date or take effect immediately.

When an internal user creates a transfer, it is stored in the **TransferEvent** model. The event's status and effective
date control when and how the transfer is processed.

---

## How do Transfer Events Work?

### The TransferEvent Model and Statuses

- **TO_BE_TRANSFERRED:** Set when the event is created and pending processing. This status indicates the event is not
  yet finalized.
- **TRANSFERRED:** Used when the event has been processed and its associated timeline updates are complete. (See notes
  below on when this is used.)
- **COMPLETE:** Marks the event as fully finalized in certain contexts.

### Effective Date Behavior

- **Past or Today:** If the event's effective date is today or earlier, the system processes it immediately:
  - The event's timelines are updated to reflect the transfer.
  - The event's status is updated (see the “Processing a Transfer Event” section).
- **Future:** If the effective date is in the future, no immediate action is taken. A **cron job** later processes the
  event when the effective date arrives.

### Interaction with Timeline Models

Timeline models record the historical and current relationships between facilities, operations, and operators. The
system ensures there is always a single active timeline record with no end date for each entity.

---

## Types of Transfer Events

### Facility Transfers

Facility transfers involve:

- Moving facilities from one operation to another.
- Updating both the originating and receiving operations’ timelines.

### Operation Transfers

Operation transfers involve:

- Moving an operation from one operator to another.
- Updating both the originating and receiving operators’ timelines.

---

## Processing Transfer Events

### General Workflow

1. **Validation:** The system ensures no overlapping active transfer events for the same entities.
2. **Timeline Updates:**
   - For facilities: The current timeline's status is updated to `TRANSFERRED`, and its end date is set.
   - For operations: The same update is applied to the operation's timeline.
   - New timelines are created for the receiving operation/operator, with a status of `ACTIVE` and no end date.
3. **Status Update:** The transfer event's status is set to `TRANSFERRED` once the timeline updates are complete.

### Immediate vs. Scheduled Processing

- **Immediate:** For past or present effective dates, timelines are updated immediately.
- **Scheduled:** For future effective dates, a background job periodically processes due events.

### Timeline Integrity

- At any given time, the timeline record with no `end_date` represents the current, active state of the entity.
- The `ACTIVE` status in timeline records reinforces this, but null `end_date` is the definitive check for activeness.

---

### Detailed Example: Facility Transfers

1. **Validation:** Ensures no overlapping transfer events for the facility or operation.
2. **Timeline Update:**
   - The facility's current timeline (linking it to its current operation) is updated with:
     - `end_date`: The transfer's effective date.
     - `status`: `TRANSFERRED`.
   - A new timeline record is created with:
     - `start_date`: The transfer's effective date.
     - `status`: `ACTIVE`.
     - The new operation association.
3. **TransferEvent Status:** Updated to `TRANSFERRED` once processing is complete.

### Detailed Example: Operation Transfers

1. **Validation:** Ensures no overlapping transfer events for the operation or operator.
2. **Timeline Update:**
   - The operation's current timeline (linking it to its current operator) is updated similarly to facilities.
   - A new timeline record is created for the new operator.
3. **TransferEvent Status:** Updated to `TRANSFERRED`.
