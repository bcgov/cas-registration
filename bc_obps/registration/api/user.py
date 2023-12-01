import uuid
from registration.models import AppRole, User
from registration.schema import UserOperatorUserOut, UserAppRoleOut, UserOut, UserIn, Message
from .api_base import router
from django.shortcuts import get_object_or_404
from .api_base import router
from django.forms import model_to_dict
from ninja.responses import codes_4xx

from django.db import IntegrityError, DataError

##### GET #####


@router.get("/user", response=UserOperatorUserOut)
def get_user(request):
    user: User = request.current_user
    return user


# endpoint to return user data if user exists in user table
@router.get("/user-profile/{user_guid}", response=UserOut)
def get_user_profile(request, user_guid: str):
    user = get_object_or_404(User, user_guid=user_guid)
    user_fields_dict = model_to_dict(user)

    return {
        **user_fields_dict,
        "phone_number": str(user.phone_number),
    }


# endpoint to return user's role_name if user exists in user table
@router.get("/user-app-role/{user_guid}", response=UserAppRoleOut)
def get_user_role(request, user_guid: str):
    user: User = get_object_or_404(User, user_guid=user_guid)
    return user.app_role


##### POST #####

# Endpoint to create a new user
@router.post("/user/{user_guid}/{identity_provider}", response={200: UserOut, codes_4xx: Message})
def create_user(request, user_guid: str, identity_provider: str, payload: UserIn):
    try:
        # Determine the role based on the identity provider
        if identity_provider == "idir":
            role = "cas_pending"
        else:
            role = "industry_user"

        new_user = User.objects.create(
            user_guid=user_guid,
            business_guid=uuid.uuid4(),
            first_name=payload.first_name,
            last_name=payload.last_name,
            email=payload.email,
            position_title=payload.position_title,
            phone_number=payload.phone_number,
            app_role=AppRole.objects.get(role_name=role),
        )
    except Exception as e:
        return 400, {"message": str(e)}

    return 200, new_user


##### PUT #####

# Endpoint to update a user
@router.put("/user", response={200: UserOut, codes_4xx: Message})
def update_user(request, payload: UserIn):
    user: User = request.current_user
    try:
        payload_dict = payload.dict()
        print(f"payload_dict: {payload_dict}")
        for attr, value in payload.dict().items():
            setattr(user, attr, value)
        user.save()
    except Exception as e:
        return 400, {"message": str(e)}

    return 200, User


##### DELETE #####
