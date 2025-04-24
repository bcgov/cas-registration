from ninja import ModelSchema
from pydantic import alias_generators
from decimal import Decimal
from reporting.models import ElectricityImportData


def to_snake(string: str) -> str:
    return alias_generators.to_snake(string)


class ElectricityImportDataOut(ModelSchema):
    class Meta:
        alias_generator = to_snake
        model = ElectricityImportData
        fields = [
            'import_specified_electricity',
            'import_specified_emissions',
            'import_unspecified_electricity',
            'import_unspecified_emissions',
            'export_specified_electricity',
            'export_specified_emissions',
            'export_unspecified_electricity',
            'export_unspecified_emissions',
            'canadian_entitlement_electricity',
            'canadian_entitlement_emissions',
        ]


class ElectricityImportDataIn(ModelSchema):
    """
    Schema for the save report additional data endpoint request input.
    """

    import_specified_electricity: Decimal | int
    import_specified_emissions: Decimal | int
    import_unspecified_electricity: Decimal | int
    import_unspecified_emissions: Decimal | int
    export_specified_electricity: Decimal | int
    export_specified_emissions: Decimal | int
    export_unspecified_electricity: Decimal | int
    export_unspecified_emissions: Decimal | int
    canadian_entitlement_electricity: Decimal | int
    canadian_entitlement_emissions: Decimal | int

    class Meta:
        alias_generator = to_snake
        model = ElectricityImportData
        fields = [
            'import_specified_emissions',
            'import_unspecified_electricity',
            'import_unspecified_emissions',
            'export_specified_electricity',
            'export_specified_emissions',
            'export_unspecified_electricity',
            'export_unspecified_emissions',
            'canadian_entitlement_electricity',
            'canadian_entitlement_emissions',
        ]
