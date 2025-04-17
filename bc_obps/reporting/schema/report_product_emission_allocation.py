from decimal import Decimal
from typing import Any, List
from ninja import ModelSchema, Schema
from reporting.models.report_product_emission_allocation import ReportProductEmissionAllocation


class ReportProductEmissionAllocationSchema(ModelSchema):
    class Meta:
        model = ReportProductEmissionAllocation
        fields = [
            "allocated_quantity",
        ]


class ReportProductEmissionAllocationSchemaIn(Schema):
    report_product_id: int
    product_name: str
    allocated_quantity: Decimal


class EmissionCategoryAllocationsSchemaIn(Schema):
    emission_category_id: int
    emission_total: Decimal
    products: List[ReportProductEmissionAllocationSchemaIn]


class ReportProductEmissionAllocationsSchemaIn(Schema):
    """
    Schema for the save report product emission allocations endpoint request input
    """

    report_product_emission_allocations: list[EmissionCategoryAllocationsSchemaIn]


class ReportProductEmissionAllocationSchemaOut(Schema):
    report_product_id: int
    product_name: str
    allocated_quantity: str

    @staticmethod
    def resolve_allocated_quantity(obj: Any) -> str:
        return str(obj.allocated_quantity)
