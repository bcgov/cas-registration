# Supplementary Report Handlers

This document describes the supplementery report handlers used in the Compliance module of BCIERS. When a supplementary emissions report is submitted, these handlers make decisions based on the compliance impact of the supplementary report & adjust or generate objects based on the results of those decisions.

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

- Decreased Credit Handler
- Decreased Obligation Handler
- Increased Credit Handler
- Increased Obligation Handler
- Manual Handler
- New Earned Credits Handler
- No Change Handler
- Supercede Version Handler
