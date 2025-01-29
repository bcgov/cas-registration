from typing import List, Optional
from ninja import ModelSchema
from pydantic import Field

from reporting.models import ReportVerification, ReportVerificationVisit


class ReportVerificationBase(ModelSchema):
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


class ReportVerificationVisitSchema(ModelSchema):
    """
    Schema for ReportVerificationVisit model
    """

    visit_name: str
    visit_type: Optional[str] = Field(None)
    is_other_visit: bool
    visit_coordinates: str

    class Meta:
        model = ReportVerificationVisit
        fields = [
            'visit_name',
            'visit_type',
            'is_other_visit',
            'visit_coordinates',
        ]


class ReportVerificationIn(ReportVerificationBase):
    """
    Schema for the input of report verification data
    """

    report_verification_visits: List[ReportVerificationVisitSchema] = Field(default_factory=list)

    class Meta(ReportVerificationBase.Meta):
        fields = ReportVerificationBase.Meta.fields


class ReportVerificationOut(ReportVerificationBase):
    """
    Schema for the output of report verification data
    """

    report_verification_visits: List[ReportVerificationVisitSchema] = Field(default_factory=list)

    class Meta(ReportVerificationBase.Meta):
        fields = ReportVerificationBase.Meta.fields + ['report_version']
