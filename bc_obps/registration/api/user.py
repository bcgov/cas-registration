from registration.models import User
from registration.schema import UserOperatorUserOut
from .api_base import router
from django.shortcuts import get_object_or_404
from registration.models import User
from registration.schema import AppRoleOut
import json


##### GET #####
@router.get("/user", response=UserOperatorUserOut)
def get_user(request):
    current_user_guid = json.loads(request.headers.get('Authorization'))["user_guid"]
    user: User = get_object_or_404(User, user_guid=current_user_guid)
    return user


@router.get("/get-user-role/{user_guid}", response=AppRoleOut)
def get_user_role(request, user_guid: str):
    user: User = get_object_or_404(User, user_guid=user_guid)
    return user.app_role


##### POST #####


##### PUT #####


##### POST #####


##### PUT #####


##### DELETE #####
