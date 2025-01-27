from ninja import ModelSchema, Field
from reporting.models import ReportVerification, ReportVerificationVisit
from typing import List


class BaseReportVerification(ModelSchema):
    """
    Base schema for shared fields in ReportVerification schemas
    """

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

    class Meta:
        model = ReportVerificationVisit
        fields = [
            'visit_name',
            'visit_type',
            'is_other_visit',
            'visit_coordinates',
        ]



class ReportVerificationIn(BaseReportVerification):
    """
    Schema for the input of report verification data
    """

    report_verification_visits: List[ReportVerificationVisitSchema] = Field(
        default_factory=list
    )


class ReportVerificationOut(BaseReportVerification):
    """
    Schema for the output of report verification data
    """

    report_verification_visits: List[ReportVerificationVisitSchema] = Field(default_factory=list) 

    class Meta(BaseReportVerification.Meta):
        fields = BaseReportVerification.Meta.fields + ['report_version']