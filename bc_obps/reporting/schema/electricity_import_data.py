from ninja import ModelSchema
from pydantic import alias_generators
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
    Schema for the save electricity import data endpoint request input.
    """

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
