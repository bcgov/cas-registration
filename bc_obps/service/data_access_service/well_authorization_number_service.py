from registration.models import WellAuthorizationNumber


class WellAuthorizationNumberDataAccessService:
    @classmethod
    def create_well_authorization_number(cls, number: int) -> WellAuthorizationNumber:
        well_authorization_number = WellAuthorizationNumber.objects.create(well_authorization_number=number)
        return well_authorization_number
