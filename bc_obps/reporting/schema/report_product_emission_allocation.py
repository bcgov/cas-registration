from tokenize import String
from typing import List
from ninja import ModelSchema, Schema
from reporting.models.report_product_emission_allocation import ReportProductEmissionAllocation

class ReportProductEmissionAllocationSchema(ModelSchema):
    class Meta:
        model = ReportProductEmissionAllocation
        fields = [
            "allocated_quantity",
        ]


class ReportProductEmissionAllocationSchemaIn(ReportProductEmissionAllocationSchema):
    report_version_id: int
    report_product_id: int
    emission_category_name: str


class ReportProductEmissionAllocationSchemaOut(ReportProductEmissionAllocationSchema):
    product_id: int
    product_name: str
    emission_category_name: str
    allocated_quantity: float


class ReportProductEmissionAllocationsSchemaOut(Schema):
    report_product_emission_allocations: List[ReportProductEmissionAllocationSchemaOut]
    facility_total_emissions: float
