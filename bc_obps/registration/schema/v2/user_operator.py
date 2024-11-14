from typing import Optional
from django.db.models import Q
from ninja import Schema, FilterSchema, Field, ModelSchema
from uuid import UUID
from registration.models import UserOperator


class UserOperatorOperatorOut(Schema):
    operator_id: UUID
    user_operator_id: UUID


class UserOperatorFilterSchema(FilterSchema):
    user_friendly_id: Optional[str] = Field(None, json_schema_extra={'q': 'user_friendly_id__icontains'})
    status: Optional[str] = None
    user__first_name: Optional[str] = Field(None, json_schema_extra={'q': 'user__first_name__icontains'})
    user__last_name: Optional[str] = Field(None, json_schema_extra={'q': 'user__last_name__icontains'})
    user__email: Optional[str] = Field(None, json_schema_extra={'q': 'user__email__icontains'})
    user__bceid_business_name: Optional[str] = Field(
        None, json_schema_extra={'q': 'user__bceid_business_name__icontains'}
    )
    operator__legal_name: Optional[str] = Field(None, json_schema_extra={'q': 'operator__legal_name__icontains'})

    @staticmethod
    def filter_status(value: Optional[str]) -> Q:
        # Override the default filter_status method to handle the special case of 'admin' and 'access'
        # The value in the frontend is 'admin access' but the value in the database is 'approved'
        if value:
            if value.lower() in "admin access":
                value = "approved"
            return Q(status__icontains=value)
        return Q()


class UserOperatorListOut(ModelSchema):
    user__first_name: str = Field(..., alias="user.first_name")
    user__last_name: str = Field(..., alias="user.last_name")
    user__email: str = Field(..., alias="user.email")
    user__bceid_business_name: str = Field(..., alias="user.bceid_business_name")
    operator__legal_name: str = Field(..., alias="operator.legal_name")

    class Meta:
        model = UserOperator
        fields = ['id', 'user_friendly_id', 'status']
