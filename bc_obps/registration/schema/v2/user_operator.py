from typing import Optional
from django.db.models import Q
from ninja import Schema, FilterSchema, Field, ModelSchema
from uuid import UUID
from registration.models import UserOperator
from registration.constants import BC_CORPORATE_REGISTRY_REGEX
from typing import List
from registration.models.partner_operator import PartnerOperator
from registration.schema.v2.partner_operator import PartnerOperatorOut
from registration.models.parent_operator import ParentOperator
from registration.schema.v2.parent_operator import ParentOperatorOut


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


class UserOperatorOutV2(ModelSchema):
    """
    Custom schema for the user operator form
    """

    legal_name: str = Field(..., alias="operator.legal_name")
    trade_name: Optional[str] = Field("", alias="operator.trade_name")
    cra_business_number: Optional[int] = Field(None, alias="operator.cra_business_number")
    bc_corporate_registry_number: Optional[str] = Field(
        None, pattern=BC_CORPORATE_REGISTRY_REGEX, alias="operator.bc_corporate_registry_number"
    )
    business_structure: Optional[str] = Field(None, alias="operator.business_structure.name")
    street_address: str = Field('', alias="operator.mailing_address.street_address")
    municipality: str = Field('', alias="operator.mailing_address.municipality")
    province: str = Field('', alias="operator.mailing_address.province")
    postal_code: str = Field('', alias="operator.mailing_address.postal_code")

    operator_has_parent_operators: bool
    parent_operators_array: Optional[List[ParentOperatorOut]] = Field(None, alias="operator.parent_operators")

    operator_has_partner_operators: bool
    partner_operators_array: Optional[List[PartnerOperatorOut]] = Field(None, alias="operator.partner_operators")

    first_name: str = Field(..., alias="user.first_name")
    last_name: str = Field(..., alias="user.last_name")
    email: str = Field(..., alias="user.email")
    phone_number: str = str(Field(None, alias="user.phone_number"))
    position_title: str = Field(..., alias="user.position_title")
    bceid_business_name: Optional[str] = Field(None, alias="user.bceid_business_name")

    @staticmethod
    def resolve_phone_number(obj: UserOperator) -> str:
        return str(obj.user.phone_number)

    @staticmethod
    def resolve_operator_has_parent_operators(obj: UserOperator) -> bool:
        return obj.operator.parent_operators.exists()

    @staticmethod
    def resolve_parent_operators_array(obj: UserOperator) -> Optional[List[ParentOperator]]:
        if obj.operator.parent_operators.exists():
            return [
                parent_operator for parent_operator in obj.operator.parent_operators.select_related("mailing_address")
            ]
        return None

    @staticmethod
    def resolve_operator_has_partner_operators(obj: UserOperator) -> bool:
        return obj.operator.partner_operators.exists()

    @staticmethod
    def resolve_partner_operators_array(obj: UserOperator) -> Optional[List[PartnerOperator]]:
        if obj.operator.partner_operators.exists():
            return [
                partner_operator
                for partner_operator in obj.operator.partner_operators.select_related("business_structure")
            ]
        return None

    class Meta:
        model = UserOperator
        fields = ["role", "status"]
