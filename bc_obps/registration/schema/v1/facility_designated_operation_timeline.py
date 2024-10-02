from registration.models.facility_designated_operation_timeline import FacilityDesignatedOperationTimeline
from ninja import FilterSchema, ModelSchema, Field
from typing import Optional


class FacilityDesignatedOperationTimelineOut(ModelSchema):
    facility_name: str = Field(..., alias="facility.name")
    facility_type: str = Field(..., alias="facility.type")
    facility_bcghg_id: Optional[str] = Field(None, alias="facility.bcghg_id")

    class Meta:
        model = FacilityDesignatedOperationTimeline
        fields = ['id', 'status']


class FacilityDesignatedOperationTimelineFilterSchema(FilterSchema):
    # NOTE: we could simply use the `q` parameter to filter by name and ... but,
    # due to this issue: https://github.com/vitalik/django-ninja/issues/1037 mypy is unhappy so I'm using the `json_schema_extra` parameter
    # If we want to achieve more by using the `q` parameter, we should use it and ignore the mypy error
    facility__bcghg_id: Optional[str] = Field(None, json_schema_extra={'q': 'facility__bcghg_id__icontains'})
    facility__name: Optional[str] = Field(None, json_schema_extra={'q': 'facility__name__icontains'})
    facility__type: Optional[str] = Field(None, json_schema_extra={'q': 'facility__type__icontains'})
    status: Optional[str] = Field(None, json_schema_extra={'q': 'status__icontains'})
