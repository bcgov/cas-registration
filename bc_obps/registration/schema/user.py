from typing import Optional
from uuid import UUID

from ninja import ModelSchema
from pydantic import Field, field_validator

from registration.models import User, AppRole
from ninja import Schema


class UserExternalDashboardUsersTileData(ModelSchema):
    """
    Schema for fields from the User model that are needed in ExternalDashboardUsersTileData
    """

    class Meta:
        model = User
        fields = ["first_name", "last_name", "email", "user_guid"]


class UserIn(ModelSchema):
    identity_provider: str

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "position_title",
            "email",
            "phone_number",
            "bceid_business_name",
            "business_guid",
        ]


class UserUpdateRoleIn(Schema):
    archive: bool
    app_role: str

    @field_validator("app_role")
    @classmethod
    def validate_app_role(cls, value: str) -> AppRole:
        return AppRole.objects.get(role_name=value)


class UserUpdateIn(ModelSchema):
    class Meta:
        model = User
        fields = ["first_name", "last_name", "position_title", "phone_number"]


class UserAppRoleOut(ModelSchema):
    class Meta:
        model = AppRole
        fields = ['role_name']


class ChangeUserRoleOut(ModelSchema):
    class Meta:
        model = User
        fields = ["first_name", "last_name", "archived_at", "app_role"]


class UserOut(ModelSchema):
    app_role: UserAppRoleOut = Field(..., alias="app_role")

    @staticmethod
    def resolve_phone_number(obj: User) -> Optional[str]:
        # PhoneNumberField returns a PhoneNumber object and we need a string
        if not obj.phone_number:
            return None
        return str(obj.phone_number)

    class Meta:
        model = User
        fields = ["first_name", "last_name", "position_title", "email", "phone_number", "bceid_business_name"]


class InternalUserListOut(ModelSchema):
    role: str = Field(..., alias="app_role.role_name")
    id: UUID = Field(..., alias="user_guid")
    name: str

    @staticmethod
    def resolve_name(obj: User) -> str:
        return obj.first_name + ' ' + obj.last_name

    class Meta:
        model = User
        fields = ["email", "archived_at"]
