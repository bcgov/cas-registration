from uuid import UUID
from typing import List, Optional, Union
from ninja import Field, FilterSchema, ModelSchema, Schema
from registration.models import Operation
from service.data_access_service.facility_service import FacilityDataAccessService
from registration.enums.enums import OperationTypes

#### Operation schemas


class RegistrationPurposeIn(Schema):
    registration_purpose: str
    regulated_products: Optional[list] = None


class OperationUpdateOut(ModelSchema):
    class Meta:
        model = Operation
        fields = ['id', 'name']


class OperationFilterSchema(FilterSchema):
    bcghg_id: Optional[str] = None
    name: Optional[str] = None
    operator: Optional[str] = None
    type: Optional[str] = None
    page: Union[int, float, str] = 1
    sort_field: Optional[str] = "created_at"
    sort_order: Optional[str] = "desc"


class OperationListOut(ModelSchema):
    operator: str = Field(..., alias="operator.legal_name")
    sfo_facility_id: Optional[UUID] = None

    class Config:
        model = Operation
        model_fields = [
            'id',
            'name',
            'bcghg_id',
            'type',
        ]
        from_attributes = True

    @staticmethod
    def resolve_sfo_facility_id(obj: Operation) -> Optional[UUID]:
        # Resolve a single facility id for SFO operations
        facilities = FacilityDataAccessService.get_current_facilities_by_operation(obj)
        if obj.type == OperationTypes.SFO.value and facilities:
            first_facility = facilities.first()
            if first_facility:
                return first_facility.pk
        return None


class OperationPaginatedOut(Schema):
    data: List[OperationListOut]
    row_count: int


class OperationCurrentOut(ModelSchema):
    class Meta:
        model = Operation
        fields = ["id", "name"]


class OperationRegistrationSubmissionIn(Schema):
    acknowledgement_of_review: bool
    acknowledgement_of_records: bool
    acknowledgement_of_information: bool
