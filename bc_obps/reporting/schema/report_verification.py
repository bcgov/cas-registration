from typing import Optional
from ninja import ModelSchema

from reporting.models import ReportVerification


class ReportVerificationBase(ModelSchema):
    """
    Base schema for shared fields in ReportVerification schemas
    """

    verification_body_name: Optional[str] = None
    accredited_by: Optional[str] = None
    scope_of_verification: Optional[str] = None
    threats_to_independence: Optional[bool] = None
    verification_conclusion: Optional[str] = None

    class Meta:
        model = ReportVerification
        fields = [
            'verification_body_name',
            'accredited_by',
            'scope_of_verification',
            'threats_to_independence',
            'verification_conclusion',
        ]


class ReportVerificationIn(ReportVerificationBase):
    """
    Schema for the input of report verification data
    """

    class Meta(ReportVerificationBase.Meta):
        fields = ReportVerificationBase.Meta.fields


class ReportVerificationOut(ReportVerificationBase):
    """
    Schema for the output of report verification data
    """

    class Meta(ReportVerificationBase.Meta):
        fields = ReportVerificationBase.Meta.fields + ['report_version']
