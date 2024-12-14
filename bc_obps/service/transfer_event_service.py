import logging
from datetime import datetime
from typing import cast, List
from uuid import UUID
from zoneinfo import ZoneInfo
from django.db import transaction
from django.db.models import QuerySet
from registration.models import FacilityDesignatedOperationTimeline, OperationDesignatedOperatorTimeline
from registration.models.event.transfer_event import TransferEvent
from typing import Optional
from ninja import Query
from registration.schema.v2.transfer_event import TransferEventCreateIn, TransferEventFilterSchema
from service.data_access_service.facility_designated_operation_timeline_service import (
    FacilityDesignatedOperationTimelineDataAccessService,
)
from service.data_access_service.operation_designated_operator_timeline_service import (
    OperationDesignatedOperatorTimelineDataAccessService,
)
from service.data_access_service.transfer_event_service import TransferEventDataAccessService
from service.data_access_service.user_service import UserDataAccessService
from service.facility_designated_operation_timeline_service import FacilityDesignatedOperationTimelineService
from service.operation_designated_operator_timeline_service import OperationDesignatedOperatorTimelineService
from service.operation_service_v2 import OperationServiceV2

logger = logging.getLogger(__name__)


class TransferEventService:
    @classmethod
    def list_transfer_events(
        cls,
        sort_field: Optional[str],
        sort_order: Optional[str],
        filters: TransferEventFilterSchema = Query(...),
    ) -> QuerySet[TransferEvent]:
        sort_direction = "-" if sort_order == "desc" else ""
        sort_by = f"{sort_direction}{sort_field}"
        queryset = (
            filters.filter(TransferEvent.objects.order_by(sort_by))
            .values(
                'effective_date',
                'status',
                'created_at',
                'operation__name',
                'operation__id',
                'facilities__name',
                'facilities__id',
            )
            .distinct()
        )
        return cast(QuerySet[TransferEvent], queryset)

    @classmethod
    def validate_no_overlapping_transfer_events(
        cls, operation_id: Optional[UUID] = None, facility_ids: Optional[List[UUID]] = None
    ) -> None:
        """
        Validates that there are no overlapping active transfer events for the given operation or facilities.
        """
        if operation_id:
            # Check for overlapping transfer events with the operation
            overlapping_operation = TransferEvent.objects.filter(
                operation_id=operation_id,
                status__in=[
                    TransferEvent.Statuses.TO_BE_TRANSFERRED,
                    TransferEvent.Statuses.COMPLETE,
                ],
            )
            if overlapping_operation.exists():
                raise Exception("An active transfer event already exists for the selected operation.")

        if facility_ids:
            # Check for overlapping transfer events with the facilities
            overlapping_facilities = TransferEvent.objects.filter(
                facilities__id__in=facility_ids,
                status__in=[
                    TransferEvent.Statuses.TO_BE_TRANSFERRED,
                    TransferEvent.Statuses.COMPLETE,
                ],
            ).distinct()
            if overlapping_facilities.exists():
                raise Exception(
                    "One or more facilities in this transfer event are already part of an active transfer event."
                )

    @classmethod
    def create_transfer_event(cls, user_guid: UUID, payload: TransferEventCreateIn) -> TransferEvent:
        user = UserDataAccessService.get_by_guid(user_guid)

        if not user.is_cas_analyst():
            raise Exception("User is not authorized to create transfer events.")

        # Validate against overlapping transfer events
        if payload.transfer_entity == "Operation":
            cls.validate_no_overlapping_transfer_events(operation_id=payload.operation)
        elif payload.transfer_entity == "Facility":
            cls.validate_no_overlapping_transfer_events(facility_ids=payload.facilities)

        # Prepare the payload for the data access service
        prepared_payload = {
            "from_operator_id": payload.from_operator,
            "to_operator_id": payload.to_operator,
            "effective_date": payload.effective_date,  # type: ignore[attr-defined] # mypy not aware of model schema field
        }

        transfer_event = None
        if payload.transfer_entity == "Operation":
            if not payload.operation:
                raise Exception("Operation is required for operation transfer events.")

            # make sure that the from_operator and to_operator are different(we can't transfer operations within the same operator)
            if payload.from_operator == payload.to_operator:
                raise Exception("Operations cannot be transferred within the same operator.")

            prepared_payload.update(
                {
                    "operation_id": payload.operation,
                }
            )
            transfer_event = TransferEventDataAccessService.create_transfer_event(user_guid, prepared_payload)

        elif payload.transfer_entity == "Facility":
            if not all([payload.facilities, payload.from_operation, payload.to_operation]):
                raise Exception(
                    "Facilities, from_operation, and to_operation are required for facility transfer events."
                )

            # make sure that the from_operation and to_operation are different(we can't transfer facilities within the same operation)
            if payload.from_operation == payload.to_operation:
                raise Exception("Facilities cannot be transferred within the same operation.")

            prepared_payload.update(
                {
                    "from_operation_id": payload.from_operation,
                    "to_operation_id": payload.to_operation,
                }
            )
            transfer_event = TransferEventDataAccessService.create_transfer_event(user_guid, prepared_payload)

            # doing a check just to make mypy happy
            payload_facilities = payload.facilities
            if payload_facilities:
                transfer_event.facilities.set(payload_facilities)

        # Check if the effective date is today or in the past and process the event
        now = datetime.now(ZoneInfo("UTC"))
        if payload.effective_date <= now:  # type: ignore[attr-defined] # mypy not aware of model schema field
            cls._process_single_event(transfer_event, user_guid)

        return transfer_event

    @classmethod
    def process_due_transfer_events(cls) -> None:
        """
        Process all due transfer events (effective date <= today and status = 'To be transferred').
        Updates timelines and marks the events as 'Transferred'.
        """
        today = datetime.now(ZoneInfo("UTC")).date()

        # Fetch all due transfer events with related fields to optimize queries
        transfer_events = TransferEvent.objects.filter(
            status=TransferEvent.Statuses.TO_BE_TRANSFERRED,
            effective_date__date__lte=today,
        )

        if not transfer_events:
            return

        processed_events = []

        for event in transfer_events:
            try:
                cls._process_single_event(event)
                processed_events.append(event.id)
            except Exception as e:
                logger.error(f"Failed to process event {event.id}: {e}")

        logger.info(f"Successfully processed {len(processed_events)} transfer events.")
        if processed_events:
            logger.info(f"Event IDs: {processed_events}")

    @classmethod
    @transaction.atomic
    def _process_single_event(cls, event: TransferEvent, user_guid: Optional[UUID] = None) -> None:
        """
        Processes a single transfer event, delegating based on its type.
        """
        # If the timeline update is user-triggered (via a transfer event with a past effective date), use the user_guid.
        # Otherwise, for cronjob updates, use created_by_id from the event.
        processed_by_id: UUID = user_guid if user_guid else event.created_by.pk  # type: ignore # we are sure that created_by is not None

        if event.facilities.exists():
            cls._process_facilities_transfer(event, processed_by_id)
        elif event.operation:
            cls._process_operation_transfer(event, processed_by_id)

        # Mark the transfer event as 'Transferred'
        event.status = TransferEvent.Statuses.TRANSFERRED
        event.save(update_fields=["status"])
        event.set_create_or_update(processed_by_id)

    @classmethod
    def _process_facilities_transfer(cls, event: TransferEvent, user_guid: UUID) -> None:
        """
        Process a facility transfer event. Updates the timelines for all associated facilities.
        """
        for facility in event.facilities.all():
            # get the current timeline for the facility and operation
            current_timeline = FacilityDesignatedOperationTimelineService.get_current_timeline(
                event.from_operation.id, facility.id  # type: ignore # we are sure that from_operation is not None
            )

            if current_timeline:
                FacilityDesignatedOperationTimelineService.set_timeline_status_and_end_date(
                    user_guid,
                    current_timeline,
                    FacilityDesignatedOperationTimeline.Statuses.TRANSFERRED,
                    event.effective_date,
                )

            # Create a new timeline
            FacilityDesignatedOperationTimelineDataAccessService.create_facility_designated_operation_timeline(
                user_guid=user_guid,
                facility_designated_operation_timeline_data={
                    "facility": facility,
                    "operation": event.to_operation,
                    "start_date": event.effective_date,
                    "status": FacilityDesignatedOperationTimeline.Statuses.ACTIVE,
                },
            )

    @classmethod
    def _process_operation_transfer(cls, event: TransferEvent, user_guid: UUID) -> None:
        """
        Process an operation transfer event. Updates the timelines for the associated operation.
        """
        # get the current timeline for the operation and operator
        current_timeline = OperationDesignatedOperatorTimelineService.get_current_timeline(
            event.from_operator.id, event.operation.id  # type: ignore # we are sure that operation is not None
        )

        if current_timeline:
            OperationDesignatedOperatorTimelineService.set_timeline_status_and_end_date(
                user_guid,
                current_timeline,
                OperationDesignatedOperatorTimeline.Statuses.TRANSFERRED,
                event.effective_date,
            )

        # Create a new timeline
        OperationDesignatedOperatorTimelineDataAccessService.create_operation_designated_operator_timeline(
            user_guid=user_guid,
            operation_designated_operator_timeline_data={
                "operation": event.operation,
                "operator": event.to_operator,
                "start_date": event.effective_date,
                "status": OperationDesignatedOperatorTimeline.Statuses.ACTIVE,
            },
        )

        # update the operation's operator
        OperationServiceV2.update_operator(user_guid, event.operation, event.to_operator.id)  # type: ignore # we are sure that operation is not None
