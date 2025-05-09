from ninja import ModelSchema
from reporting.models.report_change import ReportChange


class _ReportChangeBase(ModelSchema):
    reason_for_change: str

    class Meta:
        model = ReportChange
        fields = ["reason_for_change"]


class ReportChangeIn(_ReportChangeBase):
    pass


class ReportChangeOut(_ReportChangeBase):
    pass
