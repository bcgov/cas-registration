from ninja import ModelSchema
from pydantic import alias_generators

from reporting.models import ReportPersonResponsible


def to_snake(string: str) -> str:
    return alias_generators.to_snake(string)


class ReportPersonResponsibleOut(ModelSchema):
    """
    Schema for the get report operation endpoint request output
    """

    @staticmethod
    def resolve_phone_number(obj: ReportPersonResponsible) -> str:
        return str(obj.phone_number)

    class Meta:
        # alias_generator = to_snake
        model = ReportPersonResponsible
        populate_by_name = True
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

    report_version: int
    street_address: str
    municipality: str
    province: str
    postal_code: str
    first_name: str
    phone_number: str
    last_name: str
    email: str
    position_title: str
    business_role: str

    class Meta:
        alias_generator = to_snake
        model = ReportPersonResponsible
        fields = [
            'report_version',
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
