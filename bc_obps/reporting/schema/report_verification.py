from ninja import ModelSchema
from reporting.models import ReportVerification


class ReportVerificationBase(ModelSchema):
    """
    Base schema for shared fields in ReportVerification schemas
    """

    verification_body_name: str | None = None
    accredited_by: str | None = None
    scope_of_verification: str | None = None
    threats_to_independence: bool | None = None
    verification_conclusion: str | None = None

    class Meta:
        model = ReportVerification
        fields = [
            "verification_body_name",
            "accredited_by",
            "scope_of_verification",
            "threats_to_independence",
            "verification_conclusion",
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
        fields = ReportVerificationBase.Meta.fields + ["report_version"]
