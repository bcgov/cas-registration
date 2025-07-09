from ninja import ModelSchema, Field
from registration.models import Facility
from uuid import UUID
from typing import List, Optional
import decimal


class FacilityIn(ModelSchema):
    street_address: Optional[str] = None
    municipality: Optional[str] = None
    province: Optional[str] = None
    postal_code: Optional[str] = None
    operation_id: UUID
    well_authorization_numbers: List[str] = []
    latitude_of_largest_emissions: Optional[decimal.Decimal] = None
    longitude_of_largest_emissions: Optional[decimal.Decimal] = None

    class Meta:
        model = Facility
        fields = [
            "name",
            "type",
            "is_current_year",
            "starting_date",
        ]
        populate_by_name = True


class FacilityOut(ModelSchema):
    street_address: Optional[str] = Field(None, alias="address.street_address")
    municipality: Optional[str] = Field(None, alias="address.municipality")
    province: Optional[str] = Field(None, alias="address.province")
    postal_code: Optional[str] = Field(None, alias="address.postal_code")
    latitude_of_largest_emissions: Optional[float] = Field(None, alias="latitude_of_largest_emissions")
    longitude_of_largest_emissions: Optional[float] = Field(None, alias="longitude_of_largest_emissions")
    bcghg_id: Optional[str] = Field(None, alias="bcghg_id.id")
    well_authorization_numbers: List[str]

    @staticmethod
    def resolve_well_authorization_numbers(obj: Facility) -> List[str]:
        """
        Converts the list of well authorization numbers (as integers) to a list of strings.
        This is necessary because the well_authorization_numbers field in the Facility model
        is a list of integers, but we want to return them as strings in the API response.
        """
        print("\n\n\n\n\n")
        print(f"in FacilityOut: {obj.well_authorization_numbers}")
        return [str(wan.well_authorization_number) for wan in obj.well_authorization_numbers.all()]

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
            # "well_authorization_numbers",
        ]
        populate_by_name = True
