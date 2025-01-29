from uuid import UUID
from registration.models import WellAuthorizationNumber


class WellAuthorizationNumberDataAccessService:
    @classmethod
    def create_well_authorization_number(cls, user_guid: UUID, number: int) -> WellAuthorizationNumber:
        well_authorization_number = WellAuthorizationNumber.objects.create(
            well_authorization_number=number,
            created_by_id=user_guid,
        )

        return well_authorization_number
