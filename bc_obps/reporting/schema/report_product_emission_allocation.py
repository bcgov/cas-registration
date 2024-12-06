from decimal import Decimal
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


class ReportProductEmissionAllocationSchemaIn(Schema):
    report_product_id: int
    emission_category_name: str
    allocated_quantity: Decimal


class ReportProductEmissionAllocationsSchemaIn(Schema):
    """
    Schema for the save report product emission allocations endpoint request input
    """

    report_product_emission_allocations: List[ReportProductEmissionAllocationSchemaIn]
    methodology: str
    other_methodology_description: str


class ReportProductEmissionAllocationSchemaOut(Schema):
    product_id: int
    product_name: str
    allocated_quantity: Decimal | int


class ReportProductEmissionAllocationSchemaaout:
    product_id: int
    product_name: str
    allocated_quantity: Decimal


class ReportFacilityEmissionsSchemaOut(Schema):
    emission_category: str
    category_type: str
    emission_total: Decimal
    products: List[ReportProductEmissionAllocationSchemaOut]


class ReportProductEmissionAllocationsSchemaOut(Schema):
    """
    Schema for the get report product emission allocations endpoint response
    """

    report_product_emission_allocations: List[ReportFacilityEmissionsSchemaOut]
    facility_total_emissions: Decimal | int
    report_product_emission_allocation_totals: List[ReportProductEmissionAllocationSchemaOut]
    methodology: str
    other_methodology_description: str
