from decimal import Decimal
from typing import List, Optional
from ninja import ModelSchema, Schema, Field
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
    emission_category_id: int
    emission_total: Decimal
    products: List[ReportProductEmissionAllocationSchemaIn]


class ReportProductEmissionAllocationsSchemaIn(Schema):
    """
    Schema for the save report product emission allocations endpoint request input
    """

    report_product_emission_allocations: list[EmissionCategoryAllocationsSchemaIn]
    allocation_methodology: str
    allocation_other_methodology_description: Optional[str] = Field(None)


class ReportProductEmissionAllocationSchemaOut(Schema):
    report_product_id: int
    product_name: str
    allocated_quantity: Decimal | int


class ReportFacilityEmissionsSchemaOut(Schema):
    emission_category_name: str
    emission_category_id: int
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
