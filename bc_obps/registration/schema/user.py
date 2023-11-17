from ninja import ModelSchema, Schema
from registration.models import User


# AppRole schemas
class AppRoleOut(Schema):
    role_name: str
    role_description: str


class UserOut(ModelSchema):
    @staticmethod
    def resolve_phone_number(obj):
        # PhoneNumberField returns a PhoneNumber object and we need a string
        if not obj.phone_number:
            return
        return obj.phone_number.as_e164

    class Config:
        model = User
        model_fields = [
            "first_name",
            "last_name",
            "position_title",
            "street_address",
            "municipality",
            "province",
            "postal_code",
            "email",
            "phone_number",
        ]
