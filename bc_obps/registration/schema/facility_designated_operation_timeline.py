from typing import Annotated, Optional
from uuid import UUID

from ninja import Field, FilterSchema, ModelSchema
from registration.models.facility_designated_operation_timeline import FacilityDesignatedOperationTimeline


class FacilityDesignatedOperationTimelineOut(ModelSchema):
    facility__name: str = Field(..., alias="facility.name")
    facility__type: str = Field(..., alias="facility.type")
    facility__bcghg_id__id: Optional[str] = Field(None, alias="facility.bcghg_id.id")
    facility__id: UUID = Field(..., alias="facility.id")
    # Using two below fields for rendering a list of facilities along with their locations for transfer event
    facility__latitude_of_largest_emissions: Optional[float] = Field(
        None, alias="facility.latitude_of_largest_emissions"
    )
    facility__longitude_of_largest_emissions: Optional[float] = Field(
        None, alias="facility.longitude_of_largest_emissions"
    )

    class Meta:
        model = FacilityDesignatedOperationTimeline
        fields = ['id']


class FacilityDesignatedOperationTimelineFilterSchema(FilterSchema):
    facility__bcghg_id__id: Annotated[str | None, Field(q='facility__bcghg_id__id__icontains')] = None
    facility__name: Annotated[str | None, Field(q='facility__name__icontains')] = None
    facility__type: Annotated[str | None, Field(q='facility__type__icontains')] = None
    end_date: Annotated[bool | None, Field(q='end_date__isnull')] = None
