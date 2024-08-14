from typing import List, Optional, Union
from ninja import Field, FilterSchema, ModelSchema, Schema
from registration.models import Operation

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

    class Config:
        model = Operation
        model_fields = [
            'id',
            'name',
            'bcghg_id',
            'type',
        ]
        from_attributes = True


class OperationPaginatedOut(Schema):
    data: List[OperationListOut]
    row_count: int


class OperationCurrentOut(ModelSchema):
    class Meta:
        model = Operation
        fields = ["id", "name"]
