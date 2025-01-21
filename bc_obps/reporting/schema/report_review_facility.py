from uuid import UUID
from ninja import Schema


class FacilityForReview(Schema):
    """
    Schema for facilities in the review page.
    """

    facility_id: UUID
    facility__name: str
    is_selected: bool


class ReportReviewFacilitySchemaOut(Schema):
    """
    Schema for the get facilities for review page.
    """

    current_facilities: list[FacilityForReview]
    past_facilities: list[FacilityForReview]
