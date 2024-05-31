from typing import Optional, Union
from ninja import FilterSchema

#### Operation schemas


class OperationFilterSchema(FilterSchema):
    bcghg_id: Optional[str] = None
    name: Optional[str] = None
    operator: Optional[str] = None
    type: Optional[str] = None
    page: Union[int, float, str] = 1
    sort_field: Optional[str] = "created_at"
    sort_order: Optional[str] = "desc"
