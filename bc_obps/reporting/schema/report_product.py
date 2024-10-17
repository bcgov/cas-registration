from typing import List
from ninja import ModelSchema, Schema
from registration.schema.v1.regulated_products import RegulatedProductSchema
from reporting.models.report_product import ReportProduct


class ReportProductSchema(ModelSchema):
    class Meta:
        model = ReportProduct
        fields = "__all__"
        fields_optional = "__all__"


class ProductionDataOut(Schema):
    report_products: List[ReportProductSchema]
    allowed_products: List[RegulatedProductSchema]
