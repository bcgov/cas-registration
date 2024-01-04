import json
from registration.decorators import authorize
from registration.models import AppRole, User
from registration.schema import UserAppRoleOut, UserOut, UserIn, Message
from .api_base import router
from django.shortcuts import get_object_or_404
from ninja.responses import codes_4xx
from registration.enums.enums import IdPs

##### GET #####


@router.get("/user", response=UserOut)
@authorize(AppRole.get_all_authorized_roles())
def get_user(request):
    user: User = request.current_user
    return user


# endpoint to return user data if user exists in user table
@router.get("/user-profile", response=UserOut)
def get_user_profile(request):
    user = get_object_or_404(User, user_guid=json.loads(request.headers.get('Authorization')).get('user_guid'))
    return UserOut.from_orm(user)


# endpoint to return user's role_name if user exists in user table
@router.get("/user-app-role/{user_guid}", response=UserAppRoleOut)
def get_user_role(request, user_guid: str):
    user: User = get_object_or_404(User, user_guid=user_guid)
    return user.app_role


##### POST #####


# Endpoint to create a new user
@router.post("/user-profile/{identity_provider}", response={200: UserOut, codes_4xx: Message})
def create_user_profile(request, identity_provider: str, payload: UserIn):
    try:
        # Determine the role based on the identity provider
        role_mapping = {
            IdPs.IDIR.value: AppRole.objects.get(role_name="cas_pending"),
            IdPs.BCEIDBUSINESS.value: AppRole.objects.get(role_name="industry_user"),
        }
        role: AppRole = role_mapping.get(identity_provider, None)
        new_user = User.objects.create(
            user_guid=json.loads(request.headers.get('Authorization')).get('user_guid'),
            app_role=role,
            first_name=payload.first_name,
            last_name=payload.last_name,
            email=payload.email,
            position_title=payload.position_title,
            phone_number=payload.phone_number,
        )

    except Exception as e:
        return 400, {"message": str(e)}

    return 200, new_user


##### PUT #####


# Endpoint to update a user
@router.put("/user-profile", response={200: UserOut, codes_4xx: Message})
@authorize(AppRole.get_all_roles())
def update_user_profile(request, payload: UserIn):
    user: User = request.current_user
    try:
        for attr, value in payload.dict().items():
            setattr(user, attr, value)
        user.save()
    except Exception as e:
        return 400, {"message": str(e)}
    return 200, user


##### DELETE #####
