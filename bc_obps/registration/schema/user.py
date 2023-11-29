from ninja import ModelSchema
from registration.models import AppRole, User


# AppRole schemas
class AppRoleOut(ModelSchema):
    class Config:
        model = AppRole
        model_fields = '__all__'


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
