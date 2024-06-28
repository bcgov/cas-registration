from ninja import FilterSchema, ModelSchema, Field
from registration.models import Facility
from uuid import UUID
from ninja import Schema
from typing import List, Optional


class FacilityListOut(ModelSchema):
    class Config:
        model = Facility
        model_fields = ['id', 'name', 'type', 'bcghg_id']


class FacilityFilterSchema(FilterSchema):
    # NOTE: we could simply use the `q` parameter to filter by name and ... but,
    # due to this issue: https://github.com/vitalik/django-ninja/issues/1037 mypy is unhappy so I'm using the `json_schema_extra` parameter
    # If we want to achieve more by using the `q` parameter, we should use it and ignore the mypy error
    bcghg_id: Optional[str] = Field(None, json_schema_extra={'q': 'bcghg_id__icontains'})
    name: Optional[str] = Field(None, json_schema_extra={'q': 'name__icontains'})
    type: Optional[str] = Field(None, json_schema_extra={'q': 'type__icontains'})


class FacilitySection1(ModelSchema):
    class Config:
        model = Facility
        model_fields = ["name", "type", 'well_authorization_numbers']


class FacilitySection2(ModelSchema):
    street_address: Optional[str] = Field(None, alias="address.street_address")
    municipality: Optional[str] = Field(None, alias="address.municipality")
    province: Optional[str] = Field(None, alias="address.province")
    postal_code: Optional[str] = Field(None, alias="address.postal_code")
    latitude_of_largest_emissions: float = Field(..., alias="latitude_of_largest_emissions")
    longitude_of_largest_emissions: float = Field(..., alias="longitude_of_largest_emissions")

    class Config:
        model = Facility
        model_fields = [
            "latitude_of_largest_emissions",
            "longitude_of_largest_emissions",
        ]
        populate_by_name = True


class FacilityIn(ModelSchema):
    street_address: Optional[str] = None
    municipality: Optional[str] = None
    province: Optional[str] = None
    postal_code: Optional[str] = None
    operation_id: UUID
    well_authorization_numbers: List[int] = []

    class Config:
        model = Facility
        model_fields = [
            "name",
            "type",
            "latitude_of_largest_emissions",
            "longitude_of_largest_emissions",
        ]
        populate_by_name = True


class FacilityOut(Schema):
    section1: FacilitySection1
    section2: FacilitySection2
    id: UUID

    @staticmethod
    def resolve_section1(obj: Facility) -> FacilitySection1:
        return FacilitySection1.from_orm(obj)

    @staticmethod
    def resolve_section2(obj: Facility) -> FacilitySection2:
        return FacilitySection2.from_orm(obj)
