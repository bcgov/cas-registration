from uuid import UUID
from ninja import ModelSchema, Schema
from registration.models import FacilityDesignatedOperationTimeline


class FacilityDesignatedOperationForReviewReport(ModelSchema):
    class Meta:
        model = FacilityDesignatedOperationTimeline
        fields = ('facility', 'end_date', 'status')

    facility__name: str


class ReportReviewFacilitySchemaOut(Schema):
    """
    Schema for the get selected facilities endpoint response
    """

    selected_facilities: list[UUID]
    available_facilities: list[FacilityDesignatedOperationForReviewReport]
