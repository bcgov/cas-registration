from ninja import ModelSchema
from reporting.models.report_product_emission_allocation import ReportProductEmissionAllocation


class ReportProductEmissionAllocationSchema(ModelSchema):
    class Meta:
        model = ReportProductEmissionAllocation
        fields = [
            "allocated_quantity",
        ]


class ReportProductEmissionAllocationSchemaIn(ReportProductEmissionAllocationSchema):
    report_product_id: int
    emission_category_id: int
