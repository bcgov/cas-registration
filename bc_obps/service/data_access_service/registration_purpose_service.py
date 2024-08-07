from registration.models import RegistrationPurpose
from uuid import UUID
from ninja.types import DictStrAny


class registrationpurposeDataAccessService:
    @classmethod
    def create_registration_purpose(
        cls,
        user_guid: UUID,
        operation_id: UUID,
        registration_purpose_data: DictStrAny,
    ) -> RegistrationPurpose:

        registration_purpose = RegistrationPurpose.objects.create(
            **registration_purpose_data,
            operation_id=operation_id,
            created_by_id=user_guid,
        )
        return registration_purpose
