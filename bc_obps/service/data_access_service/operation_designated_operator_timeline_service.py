from uuid import UUID
from registration.models import OperationDesignatedOperatorTimeline
from ninja.types import DictStrAny


class OperationDesignatedOperatorTimelineDataAccessService:
    @classmethod
    def create_operation_designated_operator_timeline(
        cls,
        user_guid: UUID,
        operation_designated_operator_timeline_data: DictStrAny,
    ) -> OperationDesignatedOperatorTimeline:
        operation_designated_operator_timeline = OperationDesignatedOperatorTimeline.objects.create(
            **operation_designated_operator_timeline_data,
            created_by_id=user_guid,
        )
        operation_designated_operator_timeline.set_create_or_update(user_guid)
        return operation_designated_operator_timeline
