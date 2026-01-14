from typing import Annotated, Optional
from uuid import UUID

from common.constants import AUDIT_FIELDS
from ninja import Field, FilterSchema, ModelSchema
from registration.models.operation_designated_operator_timeline import OperationDesignatedOperatorTimeline


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
    operation__contact_ids: Optional[list[int | None]] = Field(
        None, alias="operation__contact_ids"
    )  # this is an annotated field in the query

    class Meta:
        model = OperationDesignatedOperatorTimeline
        exclude = ["start_date", "end_date", "operation", "operator", *AUDIT_FIELDS]


class OperationTimelineFilterSchema(FilterSchema):
    operation__bcghg_id: Annotated[str | None, Field(q='operation__bcghg_id__id__icontains')] = None
    operation__name: Annotated[str | None, Field(q='operation__name__icontains')] = None
    operation__type: Annotated[str | None, Field(q='operation__type__icontains')] = None
    operation__status: Annotated[str | None, Field(q='operation__status__icontains')] = None
    operation__bc_obps_regulated_operation: Annotated[
        str | None, Field(q='operation__bc_obps_regulated_operation__id__icontains')
    ] = None
    operator__legal_name: Annotated[str | None, Field(q='operator__legal_name__icontains')] = None
    operator_id: Annotated[UUID | None, Field(q='operator__id__exact')] = None
    end_date: Annotated[bool | None, Field(q='end_date__isnull')] = None
