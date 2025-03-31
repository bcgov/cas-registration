from decimal import Decimal
from typing import List, Optional
from reporting.schema.report_product_emission_allocation import (
    EmissionCategoryAllocationsSchemaIn, 
    ReportProductEmissionAllocationSchemaOut
)
from ninja import ModelSchema, Schema, Field
from reporting.models.report_emission_allocation import ReportEmissionAllocation


class ReportEmissionAllocationSchema(ModelSchema):
    class Meta:
        model = ReportEmissionAllocation
        fields = [
            "allocation_methodology",
            "allocation_other_methodology_description",
        ]

class ReportEmissionAllocationsSchemaIn(Schema):
    """
    Schema for the save report emission allocation endpoint request input
    """

    allocation_methodology: str
    allocation_other_methodology_description: Optional[str] = Field(None)
    # For the product allocations
    report_product_emission_allocations: list[EmissionCategoryAllocationsSchemaIn]

class ReportFacilityEmissionsSchemaOut(Schema):
    emission_category_name: str
    emission_category_id: int
    category_type: str
    emission_total: Decimal | int
    products: List[ReportProductEmissionAllocationSchemaOut]

class ReportEmissionAllocationSchemaOut(Schema):
    """
    Schema for the get report emission allocations endpoint response
    """

    report_product_emission_allocations: List[ReportFacilityEmissionsSchemaOut]
    facility_total_emissions: Decimal | int
    report_product_emission_allocation_totals: List[ReportProductEmissionAllocationSchemaOut]
    allocation_methodology: str
    allocation_other_methodology_description: str
