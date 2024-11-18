from typing import Optional
from ninja import ModelSchema
from pydantic import Field
from reporting.models import ReportVerification


class ReportVerificationIn(ModelSchema):
    """
    Schema for the input of report verification data
    """
    verification_body_name: str
    accredited_by: str
    scope_of_verification: str
    threats_to_independence: str
    verification_conclusion: str
    visit_name: str
    visit_type: Optional[str] = Field(None)
    other_facility_name: Optional[str] = Field(None)
    other_facility_coordinates: Optional[str] = Field(None)

    class Meta:
        model = ReportVerification
        fields = [
            'verification_body_name', 'accredited_by', 
            'scope_of_verification', 'threats_to_independence','verification_conclusion',
            'visit_name', 'visit_type', 'other_facility_name', 'other_facility_coordinates'
        ]

class ReportVerificationOut(ModelSchema):
    """
    Schema for the output of a report verification data
    """

    class Meta:
        model = ReportVerification
        populate_by_name = True
        fields = [
            'report_version','verification_body_name', 'accredited_by', 
            'scope_of_verification', 'threats_to_independence', 'verification_conclusion',
            'visit_name', 'visit_type', 'other_facility_name', 'other_facility_coordinates'
        ]