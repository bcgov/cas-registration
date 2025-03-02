from typing import Optional

from ninja import ModelSchema
from pydantic import Field

from registration.models import User, AppRole


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


class UserUpdateIn(ModelSchema):
    class Meta:
        model = User
        fields = ["first_name", "last_name", "position_title", "phone_number"]


class UserAppRoleOut(ModelSchema):
    class Meta:
        model = AppRole
        fields = ['role_name']


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
