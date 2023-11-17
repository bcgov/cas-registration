from registration.models import User
from registration.schema import UserOut
from .api_base import router
from ninja import Schema
from django.shortcuts import get_object_or_404
from registration.models import User
from registration.schema import AppRoleOut


##### GET #####
@router.get("/user", response=UserOut)
def get_user(request):
    # FIXME: for now we just return the first user in the database
    return User.objects.first()


@router.get("/get-user-role/{user_guid}", response=AppRoleOut)
def get_user_role(request, user_guid: str):
    user = get_object_or_404(User, user_guid=user_guid)

    # Access the user's role
    user_role = user.app_role

    # Serialize the role data
    serialized_role = {
        "role_name": user_role.role_name,
        "role_description": user_role.role_description,
    }

    return serialized_role


##### POST #####


##### PUT #####


##### POST #####


##### PUT #####


##### DELETE #####
