from ninja import FilterSchema, ModelSchema, Field
from registration.models import FacilityDesignatedOperationTimeline
from typing import Optional


class FacilityDesignatedOperationTimelineListOut(ModelSchema):
    class Meta:
        model = FacilityDesignatedOperationTimeline
        fields = ['id', 'facility', 'operation', 'status']


class FacilityOperationTimelineFilterSchema(FilterSchema):
    #     # NOTE: we could simply use the `q` parameter to filter by name and ... but,
    #     # due to this issue: https://github.com/vitalik/django-ninja/issues/1037 mypy is unhappy so I'm using the `json_schema_extra` parameter
    #     # If we want to achieve more by using the `q` parameter, we should use it and ignore the mypy error
    bcghg_id: Optional[str] = Field(None, json_schema_extra={'q': 'facility__bcghg_id__icontains'})
    name: Optional[str] = Field(None, json_schema_extra={'q': 'facility__name__icontains'})
    type: Optional[str] = Field(None, json_schema_extra={'q': 'facility__type__icontains'})


class FacilityDesignatedOperationTimelineOut(ModelSchema):
    class Meta:
        model = FacilityDesignatedOperationTimeline
        fields = ["id", "facility", "operation", "status", "start_date", "end_date"]
        populate_by_name = True
