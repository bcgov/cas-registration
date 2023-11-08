from .api_base import router
from registration.models import User
from typing import List
from registration.schema import UserOut


##### GET #####

@router.get("/users", response=List[UserOut])
def list_operations(request):
    qs = User.objects.all()
    return qs


##### POST #####


##### PUT #####


##### POST #####


##### PUT #####


##### DELETE #####
