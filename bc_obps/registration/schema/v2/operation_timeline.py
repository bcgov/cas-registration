from uuid import UUID
from registration.models.operation_designated_operator_timeline import OperationDesignatedOperatorTimeline
from typing import Optional
from ninja import Field, FilterSchema, ModelSchema


class OperationTimelineListOut(ModelSchema):
    bloop: Optional[str] = None
    name: str = Field(..., alias="operation.name")
    type: str = Field(..., alias="operation.type")
    sfo_facility_id: Optional[UUID] = Field(None, alias="sfo_facility_id")  # this is an annotated field in the query
    sfo_facility_name: Optional[str] = Field(None, alias="sfo_facility_name")  # this is an annotated field in the query
    bcghg_id: Optional[str] = Field(None, alias="operation.bcghg_id.id")
    id: UUID = Field(..., alias="operation.id")

    @staticmethod
    def resolve_bloop(obj) -> Optional[str]:
        breakpoint()
        return obj

    class Meta:
        model = OperationDesignatedOperatorTimeline
        fields = [
            'status',
        ]


class OperationTimelineFilterSchema(FilterSchema):
    # NOTE: we could simply use the `q` parameter to filter by related fields but,
    # due to this issue: https://github.com/vitalik/django-ninja/issues/1037 mypy is unhappy so I'm using the `json_schema_extra` parameter
    # If we want to achieve more by using the `q` parameter, we should use it and ignore the mypy error
    bcghg_id: Optional[str] = Field(None, json_schema_extra={'q': 'operation__bcghg_id__id__icontains'})
    name: Optional[str] = Field(None, json_schema_extra={'q': 'operation__name__icontains'})
    type: Optional[str] = Field(None, json_schema_extra={'q': 'operation__type__icontains'})
    status: Optional[str] = Field(None, json_schema_extra={'q': 'status__icontains'})
    bc_obps_regulated_operation: Optional[str] = Field(
        None, json_schema_extra={'q': 'operation__bc_obps_regulated_operation__id__icontains'}
    )
    # operator_id: Optional[UUID] = Field(None, json_schema_extra={'q': 'operator__id__exact'})
