from typing import List
from ninja import ModelSchema, Schema
from reporting.models.report_product_emission_allocation import ReportProductEmissionAllocation


class ReportProductEmissionAllocationSchema(ModelSchema):
    class Meta:
        model = ReportProductEmissionAllocation
        fields = [
            "allocated_quantity",
            "methodology",
            "other_methodology_description",
        ]


class ReportProductEmissionAllocationSchemaIn(ReportProductEmissionAllocationSchema):
    report_product_id: int
    emission_category_name: str
    allocated_quantity: float


class ReportProductEmissionAllocationsSchemaIn(ReportProductEmissionAllocationSchema):
    report_product_emission_allocations: List[ReportProductEmissionAllocationSchemaIn]
    report_version_id: int
    facility_id: int
    methodology: str
    other_methodology_description: str


class ReportProductEmissionAllocationSchemaOut(ReportProductEmissionAllocationSchema):
    product_id: int
    product_name: str
    allocated_quantity: float


class ReportProductEmissionAllocationTotalSchemaOut(ReportProductEmissionAllocationSchema):
    product_id: int
    product_name: str
    allocated_quantity: float


class ReportProductEmissionAllocationsSchemaOut(Schema):
    report_product_emission_allocations: List[ReportFacilityEmissionsSchemaOut]
    facility_total_emissions: float
    report_product_emission_allocation_totals: List[ReportProductEmissionAllocationTotalSchemaOut]
    methodology: str
    other_methodology_description: str
