from registration.constants import USER_TAGS
from registration.decorators import authorize
from registration.models import AppRole, User
from registration.schema.v1 import UserOut, UserOperator
from registration.api.router import router

##### GET #####


@router.get("/user", response=UserOut, url_name="get_by_guid", tags=USER_TAGS)
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles(), False)
def get_by_guid(request):
    user: User = request.current_user
    return 200, user


##### DELETE #####
