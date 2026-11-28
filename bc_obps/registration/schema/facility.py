import decimal
from uuid import UUID

from ninja import Field, ModelSchema
from pydantic import ConfigDict
from registration.models import Facility


class FacilityIn(ModelSchema):
    street_address: str | None = None
    municipality: str | None = None
    province: str | None = None
    postal_code: str | None = None
    operation_id: UUID
    well_authorization_numbers: list[str] = []
    latitude_of_largest_emissions: decimal.Decimal | None = None
    longitude_of_largest_emissions: decimal.Decimal | None = None

    model_config = ConfigDict(populate_by_name=True)

    class Meta:
        model = Facility
        fields = [
            "name",
            "type",
            "is_current_year",
            "starting_date",
        ]


class FacilityOut(ModelSchema):
    street_address: str | None = Field(None, alias="address.street_address")
    municipality: str | None = Field(None, alias="address.municipality")
    province: str | None = Field(None, alias="address.province")
    postal_code: str | None = Field(None, alias="address.postal_code")
    latitude_of_largest_emissions: float | None = Field(
        None, alias="latitude_of_largest_emissions"
    )
    longitude_of_largest_emissions: float | None = Field(
        None, alias="longitude_of_largest_emissions"
    )
    bcghg_id: str | None = Field(None, alias="bcghg_id.id")
    well_authorization_numbers: list[str]

    model_config = ConfigDict(populate_by_name=True)

    @staticmethod
    def resolve_well_authorization_numbers(obj: Facility) -> list[str]:
        """
        Converts the list of well authorization numbers (as integers) to a list of strings.
        This is necessary because the well_authorization_numbers field in the Facility model
        is a list of integers, but we want to return them as strings in the API response.
        """
        return [
            str(wan.well_authorization_number)
            for wan in obj.well_authorization_numbers.all()
        ]

    class Meta:
        model = Facility
        fields = [
            "id",
            "name",
            "type",
            "latitude_of_largest_emissions",
            "longitude_of_largest_emissions",
            "is_current_year",
            "starting_date",
        ]
