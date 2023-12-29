import json
from registration.decorators import authorize
from registration.models import AppRole, User
from registration.schema import UserAppRoleOut, UserOut, UserIn, Message
from registration.models import User
from .api_base import router
from django.shortcuts import get_object_or_404
from .api_base import router
from django.forms import model_to_dict
from ninja.responses import codes_4xx
from registration.enums.enums import IdPs
from registration.enums.enums import Roles

##### GET #####


@router.get("/user", response=UserOut)
@authorize(AppRole.get_all_eligible_roles())
def get_user(request):
    user: User = request.current_user
    return user


# endpoint to return user data if user exists in user table
@router.get("/user-profile", response=UserOut)
def get_user_profile(request):
    user = get_object_or_404(User, user_guid=json.loads(request.headers.get('Authorization')).get('user_guid'))
    user_fields_dict = model_to_dict(user)
    return {
        **user_fields_dict,
        "phone_number": str(user.phone_number),
        "app_role": user.app_role,
    }


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
        role_mapping = {IdPs.IDIR.value: Roles.CAS_PENDING.value, IdPs.BCEIDBUSINESS.value: Roles.INDUSTRY_USER.value}
        role = role_mapping.get(identity_provider, None)
        new_user = User.objects.create(
            user_guid=json.loads(request.headers.get('Authorization')).get('user_guid'),
            app_role=AppRole.objects.get(role_name=role),
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
