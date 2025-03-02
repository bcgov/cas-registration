from typing import List
from ninja import Field, ModelSchema, Schema
from registration.schema.v2.regulated_products import RegulatedProductSchema
from reporting.models.report_product import ReportProduct


class ReportProductSchema(ModelSchema):
    class Meta:
        model = ReportProduct
        fields = [
            "annual_production",
            "production_data_apr_dec",
            "production_methodology",
            "production_methodology_description",
            "storage_quantity_start_of_period",
            "storage_quantity_end_of_period",
            "quantity_sold_during_period",
            "quantity_throughput_during_period",
        ]


class ReportProductSchemaIn(ReportProductSchema):
    product_id: int


class ReportProductSchemaOut(ReportProductSchema):
    product_id: int = Field(..., alias="product.id")
    product_name: str = Field(..., alias="product.name")
    unit: str = Field(..., alias="product.unit")
    is_regulated: bool = Field(..., alias="product.is_regulated")


class ProductionDataOut(Schema):
    report_products: List[ReportProductSchemaOut]
    allowed_products: List[RegulatedProductSchema]
