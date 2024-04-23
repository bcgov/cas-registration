from django.http import JsonResponse
from registration.decorators import authorize
from registration.models import AppRole, User
from registration.schema import UserOut, UserOperator
from registration.api.api_base import router

##### GET #####


@router.get("/user", response=UserOut, url_name="get_by_guid")
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles(), False)
def get_by_guid(request):
    user: User = request.current_user
    return 200, user


##### DELETE #####
