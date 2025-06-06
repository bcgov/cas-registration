from uuid import UUID
from registration.models.operation_designated_operator_timeline import OperationDesignatedOperatorTimeline
from typing import Optional
from ninja import Field, FilterSchema, ModelSchema
from common.constants import AUDIT_FIELDS


class OperationTimelineListOut(ModelSchema):
    id: int  # this is to have a unique id in each record (useful in the grids)
    operation__name: str = Field(..., alias="operation.name")
    operation__type: str = Field(..., alias="operation.type")
    sfo_facility_id: Optional[UUID] = Field(None, alias="sfo_facility_id")  # this is an annotated field in the query
    sfo_facility_name: Optional[str] = Field(None, alias="sfo_facility_name")  # this is an annotated field in the query
    operation__bcghg_id: Optional[str] = Field(None, alias="operation.bcghg_id.id")
    operation__bc_obps_regulated_operation: Optional[str] = Field(
        None, alias="operation.bc_obps_regulated_operation.id"
    )
    operator__legal_name: str = Field(..., alias="operator.legal_name")
    operation__status: str = Field(..., alias="operation.status")
    operation__id: UUID = Field(..., alias="operation.id")
    operation__registration_purpose: Optional[str] = Field(None, alias="operation.registration_purpose")

    class Meta:
        model = OperationDesignatedOperatorTimeline
        exclude = ["start_date", "end_date", "operation", "operator", *AUDIT_FIELDS]


class OperationTimelineFilterSchema(FilterSchema):
    # NOTE: we could simply use the `q` parameter to filter by related fields but,
    # due to this issue: https://github.com/vitalik/django-ninja/issues/1037 mypy is unhappy, so I'm using the `json_schema_extra` parameter
    # If we want to achieve more by using the `q` parameter, we should use it and ignore the mypy error
    operation__bcghg_id: Optional[str] = Field(None, json_schema_extra={'q': 'operation__bcghg_id__id__icontains'})
    operation__name: Optional[str] = Field(None, json_schema_extra={'q': 'operation__name__icontains'})
    operation__type: Optional[str] = Field(None, json_schema_extra={'q': 'operation__type__icontains'})
    operation__status: Optional[str] = Field(None, json_schema_extra={'q': 'operation__status__icontains'})
    operation__bc_obps_regulated_operation: Optional[str] = Field(
        None, json_schema_extra={'q': 'operation__bc_obps_regulated_operation__id__icontains'}
    )
    operator__legal_name: Optional[str] = Field(None, json_schema_extra={'q': 'operator__legal_name__icontains'})
    operator_id: Optional[UUID] = Field(None, json_schema_extra={'q': 'operator__id__exact'})
    end_date: Optional[bool] = Field(None, json_schema_extra={'q': 'end_date__isnull'})
