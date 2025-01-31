from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock
from uuid import uuid4
from zoneinfo import ZoneInfo

from registration.constants import UNAUTHORIZED_MESSAGE
from registration.models import TransferEvent, FacilityDesignatedOperationTimeline, OperationDesignatedOperatorTimeline
from registration.schema.v2.transfer_event import TransferEventFilterSchema, TransferEventCreateIn
from service.transfer_event_service import TransferEventService
import pytest
from model_bakery import baker

pytestmark = pytest.mark.django_db


class TestTransferEventService:
    @staticmethod
    def test_list_transfer_events():
        # transfer of 3 operations
        baker.make_recipe('utils.transfer_event', operation=baker.make_recipe('utils.operation'), _quantity=3)
        # transfer of 4 facilities
        baker.make_recipe('utils.transfer_event', facilities=baker.make_recipe('utils.facility', _quantity=4))
        # sorting and filtering are tested in the endpoint test in conjunction with pagination
        result = TransferEventService.list_transfer_events(
            "status",
            "desc",
            TransferEventFilterSchema(effective_date=None, operation__name=None, facilities__name=None, status=None),
        )
        assert result.count() == 7

    @staticmethod
    def test_validate_no_overlapping_transfer_events():
        # Scenario 1: No overlapping operation or facility
        new_operation = baker.make_recipe('utils.operation')
        new_facilities = baker.make_recipe('utils.facility', _quantity=2)
        TransferEventService._validate_no_overlapping_transfer_events(
            operation_id=new_operation.id, facility_ids=[facility.id for facility in new_facilities]
        )

        # Scenario 2: Overlapping operation
        operation = baker.make_recipe('utils.operation')
        baker.make_recipe(
            'utils.transfer_event',
            operation=operation,
            status=TransferEvent.Statuses.TO_BE_TRANSFERRED,
        )
        with pytest.raises(Exception, match="An active transfer event already exists for the selected operation."):
            TransferEventService._validate_no_overlapping_transfer_events(operation_id=operation.id)

        # Scenario 3: Overlapping facilities
        facilities = baker.make_recipe('utils.facility', _quantity=2)
        baker.make_recipe(
            'utils.transfer_event',
            facilities=facilities,
            status=TransferEvent.Statuses.COMPLETE,
        )
        with pytest.raises(
            Exception,
            match="One or more facilities in this transfer event are already part of an active transfer event.",
        ):
            TransferEventService._validate_no_overlapping_transfer_events(
                facility_ids=[facility.id for facility in facilities]
            )

        # Scenario 4: Overlapping operation but excluded by current_transfer_id
        overlapping_operation = baker.make_recipe('utils.operation')
        existing_transfer = baker.make_recipe(
            'utils.transfer_event',
            operation=overlapping_operation,
            status=TransferEvent.Statuses.TO_BE_TRANSFERRED,
        )
        TransferEventService._validate_no_overlapping_transfer_events(
            operation_id=overlapping_operation.id,
            current_transfer_id=existing_transfer.id,
        )

        # Scenario 5: Overlapping facilities but excluded by current_transfer_id
        overlapping_facilities = baker.make_recipe('utils.facility', _quantity=2)
        existing_transfer = baker.make_recipe(
            'utils.transfer_event',
            facilities=overlapping_facilities,
            status=TransferEvent.Statuses.COMPLETE,
        )
        TransferEventService._validate_no_overlapping_transfer_events(
            facility_ids=[facility.id for facility in overlapping_facilities],
            current_transfer_id=existing_transfer.id,
        )

    @staticmethod
    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    def test_create_transfer_event_unauthorized_user(mock_get_by_guid):
        cas_admin = baker.make_recipe('utils.cas_admin')
        mock_get_by_guid.return_value = cas_admin
        # Mock user to not be a CAS analyst
        mock_user = MagicMock()
        mock_user.is_cas_analyst.return_value = False
        mock_get_by_guid.return_value = mock_user

        with pytest.raises(Exception, match="User is not authorized to create transfer events."):
            TransferEventService.create_transfer_event(cas_admin.user_guid, {})

    @classmethod
    def _get_transfer_event_payload_for_operation(cls):
        from_operator = baker.make_recipe('utils.operator')
        to_operator = baker.make_recipe('utils.operator')
        operation = baker.make_recipe('utils.operation')
        return TransferEventCreateIn.model_construct(
            transfer_entity="Operation",
            from_operator=from_operator.id,
            to_operator=to_operator.id,
            effective_date=datetime.now(ZoneInfo("UTC")),
            operation=operation.id,
        )

    @classmethod
    @patch("service.transfer_event_service.TransferEventService._validate_no_overlapping_transfer_events")
    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    def test_create_transfer_event_operation_missing_operation(cls, mock_get_by_guid, mock_validate_no_overlap):
        cas_analyst = baker.make_recipe("utils.cas_analyst")
        payload = cls._get_transfer_event_payload_for_operation()
        payload.operation = None

        mock_user = MagicMock()
        mock_user.is_cas_analyst.return_value = True
        mock_get_by_guid.return_value = cas_analyst
        mock_validate_no_overlap.return_value = None

        with pytest.raises(Exception, match="Operation is required for operation transfer events."):
            TransferEventService.create_transfer_event(cas_analyst.user_guid, payload)

    @classmethod
    @patch("service.transfer_event_service.TransferEventService._validate_no_overlapping_transfer_events")
    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    def test_create_transfer_event_operation_using_the_same_operator(cls, mock_get_by_guid, mock_validate_no_overlap):
        cas_analyst = baker.make_recipe("utils.cas_analyst")
        payload_with_same_from_operator_and_to_operator = cls._get_transfer_event_payload_for_operation()
        payload_with_same_from_operator_and_to_operator.to_operator = (
            payload_with_same_from_operator_and_to_operator.from_operator
        )

        mock_user = MagicMock()
        mock_user.is_cas_analyst.return_value = True
        mock_get_by_guid.return_value = cas_analyst
        mock_validate_no_overlap.return_value = None

        with pytest.raises(Exception, match="Operations cannot be transferred within the same operator."):
            TransferEventService.create_transfer_event(
                cas_analyst.user_guid, payload_with_same_from_operator_and_to_operator
            )

    @classmethod
    @patch("service.transfer_event_service.TransferEventService._process_event_if_effective")
    @patch("service.transfer_event_service.TransferEventService._validate_no_overlapping_transfer_events")
    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    @patch("service.data_access_service.transfer_event_service.TransferEventDataAccessService.create_transfer_event")
    def test_create_transfer_event_operation(
        cls, mock_create_transfer_event, mock_get_by_guid, mock_validate_no_overlap, mock_process_event_if_effective
    ):
        cas_analyst = baker.make_recipe('utils.cas_analyst')
        payload = cls._get_transfer_event_payload_for_operation()

        mock_user = MagicMock()
        mock_user.is_cas_analyst.return_value = True
        mock_get_by_guid.return_value = cas_analyst

        # Mock transfer event creation
        mock_transfer_event = MagicMock()
        mock_create_transfer_event.return_value = mock_transfer_event

        result = TransferEventService.create_transfer_event(cas_analyst.user_guid, payload)

        mock_get_by_guid.assert_called_once_with(cas_analyst.user_guid)
        mock_validate_no_overlap.assert_called_once_with(operation_id=payload.operation)
        mock_create_transfer_event.assert_called_once_with(
            cas_analyst.user_guid,
            {
                "from_operator_id": payload.from_operator,
                "to_operator_id": payload.to_operator,
                "effective_date": payload.effective_date,
                "operation_id": payload.operation,
            },
        )
        mock_process_event_if_effective.assert_called_once_with(payload, mock_transfer_event, cas_analyst.user_guid)
        assert result == mock_transfer_event

    @classmethod
    def _get_transfer_event_payload_for_facility(cls):
        from_operator = baker.make_recipe('utils.operator')
        to_operator = baker.make_recipe('utils.operator')
        from_operation = baker.make_recipe('utils.operation')
        to_operation = baker.make_recipe('utils.operation')
        facilities = baker.make_recipe('utils.facility', _quantity=2)
        return TransferEventCreateIn.model_construct(
            transfer_entity="Facility",
            from_operator=from_operator.id,
            to_operator=to_operator.id,
            effective_date=datetime.now(ZoneInfo("UTC")),
            from_operation=from_operation.id,
            to_operation=to_operation.id,
            facilities=[facility.id for facility in facilities],
        )

    @classmethod
    @patch("service.transfer_event_service.TransferEventService._validate_no_overlapping_transfer_events")
    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    def test_create_transfer_event_facility_missing_required_fields(cls, mock_get_by_guid, mock_validate_no_overlap):
        cas_analyst = baker.make_recipe("utils.cas_analyst")
        payload_without_facility = cls._get_transfer_event_payload_for_facility()
        payload_without_facility.facilities = None

        mock_user = MagicMock()
        mock_user.is_cas_analyst.return_value = True
        mock_get_by_guid.return_value = cas_analyst
        mock_validate_no_overlap.return_value = None

        with pytest.raises(
            Exception, match="Facilities, from_operation, and to_operation are required for facility transfer events."
        ):
            TransferEventService.create_transfer_event(cas_analyst.user_guid, payload_without_facility)

        payload_without_from_operation = cls._get_transfer_event_payload_for_facility()
        payload_without_from_operation.from_operation = None
        with pytest.raises(
            Exception, match="Facilities, from_operation, and to_operation are required for facility transfer events."
        ):
            TransferEventService.create_transfer_event(cas_analyst.user_guid, payload_without_from_operation)

        payload_without_to_operation = cls._get_transfer_event_payload_for_facility()
        payload_without_to_operation.to_operation = None
        with pytest.raises(
            Exception, match="Facilities, from_operation, and to_operation are required for facility transfer events."
        ):
            TransferEventService.create_transfer_event(cas_analyst.user_guid, payload_without_to_operation)

    @classmethod
    @patch("service.transfer_event_service.TransferEventService._validate_no_overlapping_transfer_events")
    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    def test_create_transfer_event_facility_between_the_same_operation(cls, mock_get_by_guid, mock_validate_no_overlap):
        cas_analyst = baker.make_recipe("utils.cas_analyst")
        payload_with_same_from_and_to_operation = cls._get_transfer_event_payload_for_facility()
        payload_with_same_from_and_to_operation.to_operation = payload_with_same_from_and_to_operation.from_operation

        mock_user = MagicMock()
        mock_user.is_cas_analyst.return_value = True
        mock_get_by_guid.return_value = cas_analyst
        mock_validate_no_overlap.return_value = None

        with pytest.raises(Exception, match="Facilities cannot be transferred within the same operation."):
            TransferEventService.create_transfer_event(cas_analyst.user_guid, payload_with_same_from_and_to_operation)

    @classmethod
    @patch("service.transfer_event_service.TransferEventService._process_event_if_effective")
    @patch("service.transfer_event_service.TransferEventService._validate_no_overlapping_transfer_events")
    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    @patch("service.data_access_service.transfer_event_service.TransferEventDataAccessService.create_transfer_event")
    def test_create_transfer_event_facility(
        cls, mock_create_transfer_event, mock_get_by_guid, mock_validate_no_overlap, mock_process_event_if_effective
    ):
        cas_analyst = baker.make_recipe("utils.cas_analyst")
        payload = cls._get_transfer_event_payload_for_facility()

        mock_user = MagicMock()
        mock_user.is_cas_analyst.return_value = True
        mock_get_by_guid.return_value = cas_analyst

        mock_transfer_event = MagicMock()
        mock_create_transfer_event.return_value = mock_transfer_event

        result = TransferEventService.create_transfer_event(cas_analyst.user_guid, payload)

        mock_get_by_guid.assert_called_once_with(cas_analyst.user_guid)
        mock_validate_no_overlap.assert_called_once_with(facility_ids=payload.facilities)
        mock_create_transfer_event.assert_called_once_with(
            cas_analyst.user_guid,
            {
                "from_operator_id": payload.from_operator,
                "to_operator_id": payload.to_operator,
                "effective_date": payload.effective_date,
                "from_operation_id": payload.from_operation,
                "to_operation_id": payload.to_operation,
            },
        )
        mock_transfer_event.facilities.set.assert_called_once_with(payload.facilities)
        mock_process_event_if_effective.assert_called_once_with(payload, mock_transfer_event, cas_analyst.user_guid)
        assert result == mock_transfer_event

    @classmethod
    @patch("service.transfer_event_service.TransferEventService._process_single_event")
    @patch("service.transfer_event_service.TransferEventService._validate_no_overlapping_transfer_events")
    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    @patch("service.data_access_service.transfer_event_service.TransferEventDataAccessService.create_transfer_event")
    def test_process_event_on_effective_date(
        cls, mock_create_transfer_event, mock_get_by_guid, mock_validate_no_overlap, mock_process_event
    ):
        cas_analyst = baker.make_recipe("utils.cas_analyst")

        # Use an effective date that is yesterday
        payload = cls._get_transfer_event_payload_for_operation()
        payload.effective_date = datetime.now(ZoneInfo("UTC")) - timedelta(days=1)

        mock_user = MagicMock()
        mock_user.is_cas_analyst.return_value = True
        mock_get_by_guid.return_value = cas_analyst
        mock_validate_no_overlap.return_value = None

        # Mock transfer event creation
        mock_transfer_event = MagicMock()
        mock_create_transfer_event.return_value = mock_transfer_event

        result = TransferEventService.create_transfer_event(cas_analyst.user_guid, payload)

        mock_process_event.assert_called_once_with(mock_transfer_event, cas_analyst.user_guid)
        assert result == mock_transfer_event

    @staticmethod
    @patch("service.transfer_event_service.TransferEventService._process_single_event")
    @patch("service.transfer_event_service.logger")
    def test_process_due_transfer_events(mock_logger: MagicMock, mock_process_single_event: MagicMock):
        # Setup test data: Three transfer events, two of which are due today and one is due in the future
        today = datetime.now(ZoneInfo("UTC"))
        due_event_1 = baker.make_recipe(
            "utils.transfer_event", effective_date=today, status=TransferEvent.Statuses.TO_BE_TRANSFERRED
        )
        due_event_2 = baker.make_recipe(
            "utils.transfer_event",
            effective_date=today - timedelta(days=1),
            status=TransferEvent.Statuses.TO_BE_TRANSFERRED,
        )
        # future_event to ensure it is not processed
        future_event = baker.make_recipe(
            "utils.transfer_event",
            effective_date=today + timedelta(days=1),
            status=TransferEvent.Statuses.TO_BE_TRANSFERRED,
        )

        # Simulate processing behavior
        mock_process_single_event.side_effect = [None, Exception("Processing failed")]

        # Call the function
        TransferEventService.process_due_transfer_events()

        # Verify that process_single_event is called for each due event
        mock_process_single_event.assert_any_call(due_event_1)
        mock_process_single_event.assert_any_call(due_event_2)
        assert mock_process_single_event.call_count == 2

        # Ensure the future event is not processed
        processed_events = [call[0][0] for call in mock_process_single_event.call_args_list]
        assert future_event not in processed_events

        # Verify logger calls
        mock_logger.info.assert_any_call("Successfully processed 1 transfer events.")
        mock_logger.info.assert_any_call(f"Event IDs: {[due_event_1.id]}")
        mock_logger.error.assert_called_once_with(f"Failed to process event {due_event_2.id}: Processing failed")

    @staticmethod
    @patch("service.transfer_event_service.TransferEventService._process_facilities_transfer")
    @patch("service.transfer_event_service.TransferEventService._process_operation_transfer")
    def test_process_single_event_success(
        mock_process_operation_transfer: MagicMock,
        mock_process_facilities_transfer: MagicMock,
    ):
        user_guid = uuid4()
        # Scenario 1: Transfer event with facilities
        transfer_event_facilities = baker.make_recipe(
            "utils.transfer_event",
            facilities=baker.make_recipe("utils.facility", _quantity=3),
            status=TransferEvent.Statuses.TO_BE_TRANSFERRED,
        )

        # Call the function for facilities
        TransferEventService._process_single_event(transfer_event_facilities, user_guid)

        # Verify facilities transfer processing
        mock_process_facilities_transfer.assert_called_once_with(transfer_event_facilities, user_guid)
        mock_process_operation_transfer.assert_not_called()

        # Verify transfer event is marked as transferred
        transfer_event_facilities.refresh_from_db()
        assert transfer_event_facilities.status == TransferEvent.Statuses.TRANSFERRED

        # Scenario 2: Transfer event with an operation
        transfer_event_operation = baker.make_recipe(
            "utils.transfer_event",
            operation=baker.make_recipe("utils.operation"),
            status=TransferEvent.Statuses.TO_BE_TRANSFERRED,
            created_by=baker.make_recipe("utils.cas_analyst"),
        )

        # Reset the mock for the next scenario(otherwise we will get a call count 1 from the previous scenario)
        mock_process_facilities_transfer.reset_mock()

        # Call the function for operations
        TransferEventService._process_single_event(transfer_event_operation, None)

        # Verify operation transfer processing
        mock_process_operation_transfer.assert_called_once_with(
            transfer_event_operation, transfer_event_operation.created_by.pk
        )
        mock_process_facilities_transfer.assert_not_called()

        # Verify transfer event is marked as transferred
        transfer_event_operation.refresh_from_db()
        assert transfer_event_operation.status == TransferEvent.Statuses.TRANSFERRED

    @staticmethod
    @patch("service.transfer_event_service.TransferEventService._process_facilities_transfer")
    @patch("service.transfer_event_service.TransferEventService._process_operation_transfer")
    def test_process_single_event_failure(mock_process_operation: MagicMock, mock_process_facilities: MagicMock):
        user_guid = uuid4()
        operation_event = baker.make_recipe(
            "utils.transfer_event",
            operation=baker.make_recipe("utils.operation"),
            status=TransferEvent.Statuses.TO_BE_TRANSFERRED,
        )
        facility_event = baker.make_recipe(
            "utils.transfer_event",
            facilities=[baker.make_recipe("utils.facility")],
            status=TransferEvent.Statuses.TO_BE_TRANSFERRED,
        )

        # Simulate failure in processing functions
        mock_process_operation.side_effect = Exception("Operation processing failed")
        mock_process_facilities.side_effect = Exception("Facilities processing failed")

        # Test operation transfer failure
        with pytest.raises(Exception, match="Operation processing failed"):
            TransferEventService._process_single_event(operation_event, user_guid)
        operation_event.refresh_from_db()
        # Make sure the status is still TO_BE_TRANSFERRED
        assert operation_event.status == TransferEvent.Statuses.TO_BE_TRANSFERRED

        # Test facilities transfer failure
        with pytest.raises(Exception, match="Facilities processing failed"):
            TransferEventService._process_single_event(facility_event, user_guid)
        facility_event.refresh_from_db()
        # Make sure the status is still TO_BE_TRANSFERRED
        assert facility_event.status == TransferEvent.Statuses.TO_BE_TRANSFERRED

    @staticmethod
    @patch("service.transfer_event_service.FacilityDesignatedOperationTimelineService.get_current_timeline")
    @patch("service.transfer_event_service.FacilityDesignatedOperationTimelineService.set_timeline_status_and_end_date")
    @patch(
        "service.transfer_event_service.FacilityDesignatedOperationTimelineDataAccessService.create_facility_designated_operation_timeline"
    )
    @patch("service.facility_service.FacilityService.update_operation_for_facility")
    def test_process_facilities_transfer(
        mock_update_operation_for_facility: MagicMock,
        mock_create_timeline: MagicMock,
        mock_set_timeline: MagicMock,
        mock_get_current_timeline: MagicMock,
    ):
        facility_1 = baker.make_recipe("utils.facility")
        facility_2 = baker.make_recipe("utils.facility")
        from_operation = baker.make_recipe("utils.operation")
        to_operation = baker.make_recipe("utils.operation")
        transfer_event = baker.make_recipe(
            "utils.transfer_event",
            status=TransferEvent.Statuses.TO_BE_TRANSFERRED,
            facilities=[facility_1, facility_2],
            from_operation=from_operation,
            to_operation=to_operation,
        )

        user_guid = uuid4()

        # Mock the behavior of get_current_timeline for facility 1 and 2
        timeline_1 = MagicMock()  # Simulate an existing timeline for facility_1
        mock_get_current_timeline.side_effect = [timeline_1, None]  # First call returns timeline_1, second returns None

        # Simulate the behavior of setting the timeline status and creating a new timeline
        mock_set_timeline.return_value = None
        mock_create_timeline.return_value = None

        # Call the method under test
        TransferEventService._process_facilities_transfer(transfer_event, user_guid)

        # Verify that get_current_timeline was called for each facility
        mock_get_current_timeline.assert_any_call(transfer_event.from_operation.id, facility_1.id)
        mock_get_current_timeline.assert_any_call(transfer_event.from_operation.id, facility_2.id)

        # Verify that set_timeline_status_and_end_date was called for facility_1 (existing timeline)
        mock_set_timeline.assert_called_once_with(
            user_guid,
            timeline_1,
            FacilityDesignatedOperationTimeline.Statuses.TRANSFERRED,
            transfer_event.effective_date,
        )

        # Verify that create_facility_designated_operation_timeline was called twice, once for each facility
        mock_create_timeline.assert_any_call(
            user_guid=user_guid,
            facility_designated_operation_timeline_data={
                "facility": facility_2,
                "operation": transfer_event.to_operation,
                "start_date": transfer_event.effective_date,
                "status": FacilityDesignatedOperationTimeline.Statuses.ACTIVE,
            },
        )

        mock_create_timeline.assert_any_call(
            user_guid=user_guid,
            facility_designated_operation_timeline_data={
                "facility": facility_1,
                "operation": transfer_event.to_operation,
                "start_date": transfer_event.effective_date,
                "status": FacilityDesignatedOperationTimeline.Statuses.ACTIVE,
            },
        )
        # Verify that update_operation_for_facility was called twice, once for each facility
        mock_update_operation_for_facility.assert_any_call(
            user_guid=user_guid, facility=facility_1, operation_id=to_operation.id
        )
        mock_update_operation_for_facility.assert_any_call(
            user_guid=user_guid, facility=facility_2, operation_id=to_operation.id
        )

    @patch("service.transfer_event_service.OperationDesignatedOperatorTimelineService.get_current_timeline")
    @patch("service.transfer_event_service.OperationDesignatedOperatorTimelineService.set_timeline_status_and_end_date")
    @patch(
        "service.transfer_event_service.OperationDesignatedOperatorTimelineDataAccessService.create_operation_designated_operator_timeline"
    )
    @patch("service.operation_service_v2.OperationServiceV2.update_operator")
    def test_process_operation_transfer(
        self,
        mock_update_operator,
        mock_create_timeline,
        mock_set_timeline,
        mock_get_current_timeline,
    ):
        transfer_event = baker.make_recipe(
            "utils.transfer_event",
            status=TransferEvent.Statuses.TO_BE_TRANSFERRED,
            operation=baker.make_recipe("utils.operation"),
        )

        user_guid = uuid4()  # Simulating the user GUID

        # Scenario 1: Current timeline exists
        mock_get_current_timeline.return_value = MagicMock()

        # Call the method under test for the first scenario (with existing timeline)
        TransferEventService._process_operation_transfer(transfer_event, user_guid)

        # Verify that get_current_timeline was called for the operation and operator
        mock_get_current_timeline.assert_called_once_with(transfer_event.from_operator.id, transfer_event.operation.id)

        # Verify that set_timeline_status_and_end_date was called since the timeline exists
        mock_set_timeline.assert_called_once_with(
            user_guid,
            mock_get_current_timeline.return_value,
            OperationDesignatedOperatorTimeline.Statuses.TRANSFERRED,
            transfer_event.effective_date,
        )

        # Scenario 2: No current timeline
        mock_get_current_timeline.return_value = None
        mock_set_timeline.reset_mock()  # Reset mock for the next call
        mock_create_timeline.reset_mock()  # Reset mock for the next call
        mock_update_operator.reset_mock()  # Reset mock for the next call

        # Call the method under test for the second scenario (no existing timeline)
        TransferEventService._process_operation_transfer(transfer_event, user_guid)

        # Verify that create_operation_designated_operator_timeline was called since the timeline does not exist
        mock_create_timeline.assert_called_once_with(
            user_guid=user_guid,
            operation_designated_operator_timeline_data={
                "operation": transfer_event.operation,
                "operator": transfer_event.to_operator,
                "start_date": transfer_event.effective_date,
                "status": OperationDesignatedOperatorTimeline.Statuses.ACTIVE,
            },
        )

        # Verify that set_timeline_status_and_end_date was not called, since the timeline did not exist
        mock_set_timeline.assert_not_called()
        mock_update_operator.assert_called_once_with(
            user_guid,
            transfer_event.operation,
            transfer_event.to_operator.id,
        )

    @staticmethod
    @patch("service.transfer_event_service.TransferEventDataAccessService.get_by_id")
    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    def test_get_if_authorized(mock_get_by_guid, mock_get_by_id):
        # Scenario 1: Unauthorized user
        mock_get_by_id.return_value = transfer_event = MagicMock(id=uuid4())
        mock_get_by_guid.return_value = unauthorized_user = MagicMock(user_guid=uuid4())
        unauthorized_user.is_industry_user.return_value = True

        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            TransferEventService.get_if_authorized(unauthorized_user.user_guid, transfer_event.id)

        # Scenario 2: Authorized user
        mock_get_by_guid.return_value = cas_admin = baker.make_recipe('utils.cas_admin')
        result = TransferEventService.get_if_authorized(cas_admin.user_guid, uuid4())
        assert result == transfer_event

    @staticmethod
    @patch("service.transfer_event_service.TransferEventDataAccessService.get_by_id")
    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    def test_get_and_validate_transfer_event_for_update(mock_get_by_guid, mock_get_by_id):
        # Scenario 1: Unauthorized user
        mock_get_by_id.return_value = transfer_event = MagicMock(
            id=uuid4(), status=TransferEvent.Statuses.TO_BE_TRANSFERRED
        )
        mock_get_by_guid.return_value = unauthorized_user = MagicMock(user_guid=uuid4())
        unauthorized_user.is_cas_analyst.return_value = False

        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            TransferEventService._get_and_validate_transfer_event_for_update(
                transfer_event.id, unauthorized_user.user_guid
            )

        # Scenario 2: Valid transfer event and authorized user
        mock_get_by_guid.return_value = authorized_user = MagicMock()
        authorized_user.is_cas_analyst.return_value = True

        result = TransferEventService._get_and_validate_transfer_event_for_update(
            transfer_event.id, authorized_user.user_guid
        )
        assert result == transfer_event

        # Scenario 3: Invalid transfer event status
        mock_get_by_id.return_value = invalid_transfer = MagicMock(id=uuid4(), status=TransferEvent.Statuses.COMPLETE)
        mock_get_by_guid.return_value = authorized_user

        with pytest.raises(Exception, match="Only transfer events with status 'To be transferred' can be modified."):
            TransferEventService._get_and_validate_transfer_event_for_update(
                invalid_transfer.id, authorized_user.user_guid
            )

    @staticmethod
    @patch("service.transfer_event_service.TransferEventService._get_and_validate_transfer_event_for_update")
    def test_delete_transfer_event(mock_get_and_validate_transfer_event_for_update):
        transfer_event_mock = MagicMock(id=uuid4())
        mock_get_and_validate_transfer_event_for_update.return_value = transfer_event_mock
        user_guid = uuid4()
        TransferEventService.delete_transfer_event(user_guid=user_guid, transfer_id=transfer_event_mock.id)
        mock_get_and_validate_transfer_event_for_update.assert_called_once_with(transfer_event_mock.id, user_guid)
        transfer_event_mock.delete.assert_called_once()

    @staticmethod
    @patch("service.transfer_event_service.TransferEventService._validate_no_overlapping_transfer_events")
    @patch("service.transfer_event_service.TransferEventDataAccessService.update_transfer_event")
    def test_update_operation_transfer_event(mock_update_transfer_event, mock_validate_no_overlapping):
        user_guid = uuid4()
        transfer_id = uuid4()
        operation_id = uuid4()
        payload = MagicMock(operation=operation_id, effective_date=datetime.now(ZoneInfo("UTC")))

        # Test with valid operation ID
        TransferEventService._update_operation_transfer_event(user_guid, transfer_id, payload)

        mock_validate_no_overlapping.assert_called_once_with(operation_id=operation_id, current_transfer_id=transfer_id)
        mock_update_transfer_event.assert_called_once_with(
            user_guid, transfer_id, {"operation_id": operation_id, "effective_date": payload.effective_date}
        )

        # Test with missing operation ID
        payload.operation = None
        with pytest.raises(Exception, match="Operation is required for operation transfer events."):
            TransferEventService._update_operation_transfer_event(user_guid, transfer_id, payload)

    @staticmethod
    @patch("service.transfer_event_service.TransferEventService._validate_no_overlapping_transfer_events")
    @patch("service.transfer_event_service.TransferEventDataAccessService.update_transfer_event")
    def test_update_facility_transfer_event(mock_update_transfer_event, mock_validate_no_overlapping):
        user_guid = uuid4()
        transfer_id = uuid4()
        facility_ids = [uuid4(), uuid4()]
        payload = MagicMock(facilities=facility_ids, effective_date=datetime.now(ZoneInfo("UTC")))

        updated_transfer_event_mock = MagicMock()
        mock_update_transfer_event.return_value = updated_transfer_event_mock

        # Test with valid facility IDs
        TransferEventService._update_facility_transfer_event(user_guid, transfer_id, payload)

        mock_validate_no_overlapping.assert_called_once_with(facility_ids=facility_ids, current_transfer_id=transfer_id)
        mock_update_transfer_event.assert_called_once_with(
            user_guid, transfer_id, payload.dict(include=["effective_date"])
        )
        updated_transfer_event_mock.facilities.set.assert_called_once_with(facility_ids)

        # Test with missing facility IDs
        payload.facilities = []
        with pytest.raises(Exception, match="Facilities are required for facility transfer events."):
            TransferEventService._update_facility_transfer_event(user_guid, transfer_id, payload)

    @staticmethod
    @patch("service.transfer_event_service.TransferEventService._get_and_validate_transfer_event_for_update")
    @patch("service.transfer_event_service.TransferEventService._update_operation_transfer_event")
    @patch("service.transfer_event_service.TransferEventService._update_facility_transfer_event")
    @patch("service.transfer_event_service.TransferEventService._process_event_if_effective")
    def test_update_transfer_event(
        mock_process_event_if_effective,
        mock_update_facility_transfer_event,
        mock_update_operation_transfer_event,
        mock_get_and_validate_transfer_event_for_update,
    ):
        user_guid = uuid4()
        transfer_id = uuid4()
        transfer_event_mock = MagicMock()
        mock_get_and_validate_transfer_event_for_update.return_value = transfer_event_mock

        # Scenario 1: Updating an operation transfer event
        payload_operation = MagicMock(transfer_entity="Operation", operation=uuid4(), effective_date="2025-01-20")
        TransferEventService.update_transfer_event(user_guid, transfer_id, payload_operation)
        mock_update_operation_transfer_event.assert_called_once_with(user_guid, transfer_id, payload_operation)
        mock_process_event_if_effective.assert_called_once_with(payload_operation, transfer_event_mock, user_guid)

        # Scenario 2: Updating a facility transfer event
        payload_facility = MagicMock(
            transfer_entity="Facility", facilities=[uuid4(), uuid4()], effective_date="2025-01-20"
        )
        TransferEventService.update_transfer_event(user_guid, transfer_id, payload_facility)
        mock_update_facility_transfer_event.assert_called_once_with(user_guid, transfer_id, payload_facility)
        mock_process_event_if_effective.assert_called_with(payload_facility, transfer_event_mock, user_guid)

        # Scenario 3: Invalid transfer entity
        payload_invalid = MagicMock(transfer_entity="Invalid", effective_date="2025-01-20")
        with pytest.raises(KeyError):
            TransferEventService.update_transfer_event(user_guid, transfer_id, payload_invalid)
