from decimal import Decimal
from typing import List

from ninja import ModelSchema, Schema
from reporting.models.report_product_emission_allocation import ReportProductEmissionAllocation


class ReportProductEmissionAllocationSchema(ModelSchema):
    class Meta:
        model = ReportProductEmissionAllocation
        fields = [
            "allocated_quantity",
            "allocation_methodology",
            "allocation_other_methodology_description",
        ]


class ReportProductEmissionAllocationSchemaIn(Schema):
    report_product_id: int
    product_name: str
    allocated_quantity: Decimal


class EmissionCategoryAllocationsSchemaIn(Schema):
    emission_category_name: str
    emission_total: Decimal  # should probably be removed. only need it for validation, and should get that value from the backend
    products: List[ReportProductEmissionAllocationSchemaIn]


class ReportProductEmissionAllocationsSchemaIn(Schema):
    """
    Schema for the save report product emission allocations endpoint request input
    """

    report_product_emission_allocations: list[EmissionCategoryAllocationsSchemaIn]
    allocation_methodology: str
    allocation_other_methodology_description: str


class ReportProductEmissionAllocationSchemaOut(Schema):
    report_product_id: int
    product_name: str
    allocated_quantity: Decimal | int


class ReportFacilityEmissionsSchemaOut(Schema):
    emission_category: str
    category_type: str
    emission_total: Decimal | int
    products: List[ReportProductEmissionAllocationSchemaOut]


class ReportProductEmissionAllocationsSchemaOut(Schema):
    """
    Schema for the get report product emission allocations endpoint response
    """

    report_product_emission_allocations: List[ReportFacilityEmissionsSchemaOut]
    facility_total_emissions: Decimal | int
    report_product_emission_allocation_totals: List[ReportProductEmissionAllocationSchemaOut]
    allocation_methodology: str
    allocation_other_methodology_description: str
