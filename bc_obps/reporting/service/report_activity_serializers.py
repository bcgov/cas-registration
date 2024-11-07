from abc import ABC, abstractmethod
from collections.abc import Iterable
from typing import Generic, TypeVar

from reporting.models.report_activity import ReportActivity
from reporting.models.report_emission import ReportEmission
from reporting.models.report_fuel import ReportFuel
from reporting.models.report_methodology import ReportMethodology
from reporting.models.report_source_type import ReportSourceType
from reporting.models.report_unit import ReportUnit

TSerialized = TypeVar("TSerialized")


class BaseSerializer(ABC, Generic[TSerialized]):
    @classmethod
    @abstractmethod
    def serialize(cls, obj: TSerialized) -> dict | list[dict]:
        raise NotImplementedError("BaseSerializer.serialize : This is an abstract method that should be overridden.")


class ReportMethodologySerializer(BaseSerializer[ReportMethodology]):
    @classmethod
    def serialize(cls, obj: ReportMethodology) -> dict | list[dict]:
        return {
            "id": obj.id,
            "methodology": obj.methodology.name,
            **obj.json_data,
        }


class ReportEmissionIterableSerializer(BaseSerializer[Iterable[ReportEmission]]):
    @classmethod
    def serialize(cls, obj: Iterable[ReportEmission]) -> list[dict]:
        return [
            {
                "id": report_emission.id,
                "gasType": report_emission.gas_type.chemical_formula,
                **report_emission.json_data,
                "methodology": ReportMethodologySerializer.serialize(report_emission.report_methodology),
            }
            for report_emission in obj
        ]


class ReportFuelIterableSerializer(BaseSerializer[Iterable[ReportFuel]]):
    @classmethod
    def serialize(cls, obj: Iterable[ReportFuel]) -> list[dict]:
        return [
            {
                "id": report_fuel.id,
                **report_fuel.json_data,
                "fuelType": {
                    "fuelName": report_fuel.fuel_type.name,
                    "fuelUnit": report_fuel.fuel_type.unit,
                    "fuelClassification": report_fuel.fuel_type.classification,
                },
                "emissions": ReportEmissionIterableSerializer.serialize(report_fuel.reportemission_records.all()),
            }
            for report_fuel in obj
        ]


class ReportUnitIterableSerializer(BaseSerializer[Iterable[ReportUnit]]):
    @classmethod
    def serialize(cls, obj: Iterable[ReportUnit]) -> list[dict]:
        return [
            {
                "id": unit.id,
                **unit.json_data,
                "fuels": ReportFuelIterableSerializer.serialize(unit.reportfuel_records.all()),
            }
            for unit in obj
        ]


class ReportSourceTypeIterableSerializer(BaseSerializer[Iterable[ReportSourceType]]):
    @classmethod
    def serialize(cls, obj: Iterable[ReportSourceType]) -> dict:
        return {
            report_source_type.source_type.json_key: cls.serialize_source_type(report_source_type)
            for report_source_type in obj
        }

    @classmethod
    def serialize_source_type(cls, obj: ReportSourceType) -> dict:
        serialized = {
            "id": obj.id,
            **obj.json_data,
        }
        if obj.activity_source_type_base_schema.has_unit:
            return {**serialized, "units": ReportUnitIterableSerializer.serialize(obj.reportunit_records.all())}
        if obj.activity_source_type_base_schema.has_fuel:
            return {**serialized, "fuels": ReportFuelIterableSerializer.serialize(obj.reportfuel_records.all())}
        return {**serialized, "emissions": ReportEmissionIterableSerializer.serialize(obj.reportemission_records.all())}


class ReportActivitySerializer(BaseSerializer[ReportActivity]):
    """
    Serializes a ReportActivity object into a dict that can be loaded into the form that created it.
    """

    @classmethod
    def serialize(cls, obj: ReportActivity) -> dict:
        return {
            "id": obj.id,
            **obj.json_data,
            "sourceTypes": ReportSourceTypeIterableSerializer.serialize(obj.reportsourcetype_records.all()),
        }
