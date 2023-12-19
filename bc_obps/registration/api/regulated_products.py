from registration.utils import raise_401_if_role_not_authorized
from .api_base import router
from typing import List
from registration.models import RegulatedProduct
from registration.schema import (
    RegulatedProductSchema,
)

##### GET #####


@router.get("/regulated_products", response=List[RegulatedProductSchema])
def list_regulated_products(request):
    raise_401_if_role_not_authorized(request, ["industry_user", "industry_user_admin", 'cas_admin', 'cas_analyst'])
    qs = RegulatedProduct.objects.all()
    return qs


##### POST #####


##### PUT #####


##### DELETE #####
