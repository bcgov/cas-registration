from ninja import Field, ModelSchema, Schema
from reporting.models.report_emission_allocation import ReportEmissionAllocation
from reporting.schema.report_product_emission_allocation import (
    EmissionCategoryAllocationsSchemaIn,
    ReportProductEmissionAllocationSchemaOut,
)


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
    allocation_other_methodology_description: str | None = Field(None)
    # For the product allocations
    report_product_emission_allocations: list[EmissionCategoryAllocationsSchemaIn]


class ReportFacilityEmissionsSchemaOut(Schema):
    emission_category_name: str
    emission_category_id: int
    category_type: str
    emission_total: float
    products: list[ReportProductEmissionAllocationSchemaOut]


class ReportEmissionAllocationSchemaOut(Schema):
    """
    Schema for the get report emission allocations endpoint response
    """

    report_product_emission_allocations: list[ReportFacilityEmissionsSchemaOut]
    facility_total_emissions: float
    report_product_emission_allocation_totals: list[
        ReportProductEmissionAllocationSchemaOut
    ]
    allocation_methodology: str
    allocation_other_methodology_description: str
    has_missing_products: bool
