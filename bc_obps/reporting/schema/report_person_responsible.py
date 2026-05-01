from typing import Optional
from ninja import ModelSchema, Field
from pydantic import alias_generators, ConfigDict
from reporting.models import ReportPersonResponsible


def to_snake(string: str) -> str:
    return alias_generators.to_snake(string)


class ReportPersonResponsibleOut(ModelSchema):
    """
    Schema for the get report operation endpoint response output
    """

    model_config = ConfigDict(populate_by_name=True)

    contact_id: Optional[int] = Field(..., alias="contact.id")

    @staticmethod
    def resolve_phone_number(obj: ReportPersonResponsible) -> str:
        return str(obj.phone_number)

    class Meta:
        model = ReportPersonResponsible
        fields = [
            'street_address',
            'municipality',
            'province',
            'postal_code',
            'first_name',
            'phone_number',
            'last_name',
            'email',
            'position_title',
            'business_role',
            'report_version',
        ]


class ReportPersonResponsibleIn(ModelSchema):
    """
    Schema for the save report contact endpoint request input.
    """

    contact_id: Optional[int] = None

    class Meta:
        alias_generator = to_snake
        model = ReportPersonResponsible
        fields = [
            'street_address',
            'municipality',
            'province',
            'postal_code',
            'first_name',
            'phone_number',
            'last_name',
            'email',
            'position_title',
            'business_role',
        ]
