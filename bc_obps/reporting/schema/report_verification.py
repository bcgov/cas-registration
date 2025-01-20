from ninja import ModelSchema
from reporting.models import ReportVerification


class BaseReportVerificationSchema(ModelSchema):
    """
    Base schema for shared fields in ReportVerification schemas
    """

    verification_body_name: str
    accredited_by: str
    scope_of_verification: str
    threats_to_independence: bool
    verification_conclusion: str

    class Meta:
        model = ReportVerification
        fields = [
            'verification_body_name',
            'accredited_by',
            'scope_of_verification',
            'threats_to_independence',
            'verification_conclusion',
        ]


class ReportVerificationIn(BaseReportVerificationSchema):
    """
    Schema for the input of report verification data
    """

    pass


class ReportVerificationOut(BaseReportVerificationSchema):
    """
    Schema for the output of report verification data
    """

    class Meta(BaseReportVerificationSchema.Meta):
        fields = BaseReportVerificationSchema.Meta.fields + ['report_version']
