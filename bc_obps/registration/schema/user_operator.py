from typing import Optional, List
from ninja import Schema, FilterSchema, Field, ModelSchema
from uuid import UUID
from registration.models import UserOperator
from registration.constants import BC_CORPORATE_REGISTRY_REGEX
from registration.models.partner_operator import PartnerOperator
from registration.schema import (
    OperatorExternalDashboardUsersTileData,
    PartnerOperatorOut,
    ParentOperator,
    ParentOperatorOut,
    UserExternalDashboardUsersTileData,
)


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
    role: Optional[str] = Field(None, json_schema_extra={'q': 'role__icontains'})


class UserOperatorListOut(ModelSchema):
    user__first_name: str = Field(..., alias="user.first_name")
    user__last_name: str = Field(..., alias="user.last_name")
    user__email: str = Field(..., alias="user.email")
    user__bceid_business_name: str = Field(..., alias="user.bceid_business_name")
    operator__legal_name: str = Field(..., alias="operator.legal_name")

    class Meta:
        model = UserOperator
        fields = ['id', 'user_friendly_id', 'role']


class UserOperatorOut(ModelSchema):
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

    @staticmethod
    def resolve_role(obj: UserOperator) -> str:
        role = obj.role
        if role == UserOperator.Roles.ADMIN:
            return 'Administrator'
        return obj.role.capitalize()

    class Meta:
        model = UserOperator
        fields = ["role", "status"]


class CurrentUserOperatorOut(ModelSchema):
    is_new: bool = Field(..., alias="operator.is_new")
    operatorId: UUID = Field(..., alias="operator.id")
    operatorStatus: str = Field(..., alias="operator.status")
    operatorLegalName: str = Field(..., alias="operator.legal_name")

    class Meta:
        model = UserOperator
        fields = ["id", "status"]


class UserOperatorStatusUpdate(ModelSchema):
    role: Optional[str] = None

    class Meta:
        model = UserOperator
        fields = ["status"]


class IsApprovedUserOperator(Schema):
    approved: bool


class RequestAccessOut(Schema):
    user_operator_id: UUID
    operator_id: UUID


class UserOperatorStatusUpdateOut(ModelSchema):
    """
    Custom schema for the user operator form
    """

    first_name: str = Field(..., alias="user.first_name")
    last_name: str = Field(..., alias="user.last_name")

    class Meta:
        model = UserOperator
        fields = ["status"]


class ExternalDashboardUsersTileData(ModelSchema):
    """
    Schema for the data that will be shown in an industry_user's User Access Management tile.
    """

    user: UserExternalDashboardUsersTileData
    operator: OperatorExternalDashboardUsersTileData

    class Meta:
        model = UserOperator
        fields = ["role", "status", "id", "user_friendly_id"]


class UserOperatorUsersOut(Schema):
    id: UUID = Field(..., alias="user.pk")
    full_name: str

    @staticmethod
    def resolve_full_name(obj: UserOperator) -> str:
        return f"{obj.user.first_name} {obj.user.last_name}"
