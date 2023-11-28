from registration.models import User
from registration.schema import UserOperatorUserOut
from .api_base import router
from django.shortcuts import get_object_or_404
from registration.models import User
from registration.schema import AppRoleOut


##### GET #####
@router.get("/user", response=UserOperatorUserOut)
def get_user(request):
    # FIXME: for now we just return the first user in the database
    return User.objects.first()


@router.get("/get-user-role/{user_guid}", response=AppRoleOut)
def get_user_role(request, user_guid: str):
    user: User = get_object_or_404(User, user_guid=user_guid)
    return user.app_role


##### POST #####


##### PUT #####


##### POST #####


##### PUT #####


##### DELETE #####
