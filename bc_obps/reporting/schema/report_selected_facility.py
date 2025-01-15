from uuid import UUID


class ReportSelectedFacilitySchemaOut(Schema):
    """
    Schema for the get selected facilities endpoint response
    """
    facility_id: UUID
    is_selected: bool
    is_current: bool
