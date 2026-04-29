from django.contrib import admin
from registration.models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('user_guid', 'first_name', 'last_name', 'email', 'position_title', 'role')
    search_fields = ('user_guid', 'first_name', 'last_name')

    @staticmethod
    def role(obj: User) -> str:
        return obj.app_role.role_name
