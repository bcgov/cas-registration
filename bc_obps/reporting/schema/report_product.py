from ninja import ModelSchema
from reporting.models.report_product import ReportProduct


class ReportProductIn(ModelSchema):
    class Meta:
        model = ReportProduct
        fields = "__all__"
        fields_optional = "__all__"
