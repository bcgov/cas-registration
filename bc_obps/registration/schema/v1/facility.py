from ninja import FilterSchema, ModelSchema, Field
from registration.models import Facility
from decimal import Decimal
from uuid import UUID
from ninja import Schema
from pydantic import model_validator
from typing import Optional, Union, Any, Dict


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
    street_address: Optional[str] = None
    municipality: Optional[str] = None
    province: Optional[str] = None
    postal_code: Optional[str] = None

    @model_validator(mode='after')
    def handle_address_data(cls, values: Any) -> Any:
        data = values.dict(include={"latitude_of_largest_emissions", "longitude_of_largest_emissions"})
        if values.street_address:
            data.update(
                {
                    "street_address": values.street_address,
                    "municipality": values.municipality,
                    "province": values.province,
                    "postal_code": values.postal_code,
                }
            )
        return data

    class Config:
        model = Facility
        model_fields = [
            "address",
            "latitude_of_largest_emissions",
            "longitude_of_largest_emissions",
        ]


class FacilityIn(ModelSchema):
    street_address: Optional[str] = None
    municipality: Optional[str] = None
    province: Optional[str] = None
    postal_code: Optional[str] = None
    operation_id: UUID
    well_authorization_numbers: Optional[list] = None

    @model_validator(mode='after')  # type: ignore
    def create_address_data(cls, values):
        payload = {}
        if hasattr(values, 'street_address') and values.street_address:
            address_data = values.dict(include={'street_address', 'municipality', 'province', 'postal_code'})
            payload['address_data'] = address_data

        if hasattr(values, 'well_authorization_numbers') and values.well_authorization_numbers:
            payload['well_data'] = values.dict(include={'well_authorization_numbers'})['well_authorization_numbers']

        payload['facility_data'] = values.dict(
            exclude={
                'street_address',
                'municipality',
                'province',
                'postal_code',
                'operation_id',
                'well_authorization_numbers',
            }
        )

        payload['operation_id'] = values.dict(include={'operation_id'})['operation_id']

        return payload

    class Config:
        model = Facility
        model_fields = [
            "name",
            "type",
            "latitude_of_largest_emissions",
            "longitude_of_largest_emissions",
            "well_authorization_numbers",
        ]
        populate_by_name = True


class FacilityOut(Schema):
    section1: FacilitySection1
    section2: FacilitySection2
    id: UUID

    @staticmethod
    def resolve_section1(obj: Facility) -> Dict[str, Any]:
        return {"name": obj.name, "type": obj.type, 'well_authorization_numbers': obj.well_authorization_numbers}

    @staticmethod
    def resolve_section2(obj: Facility) -> Dict[str, Union[Decimal, str, None]]:
        data: Dict[str, Union[Decimal, str, None]] = {
            "latitude_of_largest_emissions": obj.latitude_of_largest_emissions,
            "longitude_of_largest_emissions": obj.longitude_of_largest_emissions,
        }
        if obj.address:
            data.update(
                {
                    "street_address": obj.address.street_address,
                    "municipality": obj.address.municipality,
                    "province": obj.address.province,
                    "postal_code": obj.address.postal_code,
                }
            )
        return data
