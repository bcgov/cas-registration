from ninja import ModelSchema, Field
from reporting.models import ReportVerification, ReportVerificationVisit
from typing import List


class BaseReportVerificationSchema(ModelSchema):
    """
    Base schema for shared fields in ReportVerification schemas
    """

    verification_body_name: str = Field(...)
    accredited_by: str = Field(...)
    scope_of_verification: str = Field(...)
    threats_to_independence: bool = Field(...)
    verification_conclusion: str = Field(...)

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


class ReportVerificationVisitSchema(ModelSchema):
    """
    Schema for ReportVerificationVisit model
    """

    visit_name: str = Field(...)
    visit_type: str = Field(choices=ReportVerificationVisit.VisitType.choices)
    visit_coordinates: str = Field(required=False) 
    is_other_facility: bool = Field(default=False) 

    class Config:
        model = ReportVerificationVisit
        fields = [
            'visit_name',
            'visit_type',
            'visit_coordinates',
            'is_other_facility',
        ]

class ReportVerificationOut(BaseReportVerificationSchema):
    """
    Schema for the output of report verification data
    """

    visit_names: List[str] = Field(default_factory=list) 
    report_verification_visits: List[ReportVerificationVisitSchema] = Field(default_factory=list) 

    class Meta(BaseReportVerificationSchema.Meta):
        fields = BaseReportVerificationSchema.Meta.fields + ['report_version']