from registration.decorators import authorize
from .api_base import router
from typing import List
from registration.models import AppRole, RegulatedProduct
from registration.schema import (
    RegulatedProductSchema,
)

##### GET #####


@router.get("/regulated_products", response=List[RegulatedProductSchema])
@authorize(AppRole.get_all_authorized_app_roles())
def list_regulated_products(request):
    qs = RegulatedProduct.objects.all()
    return qs


##### POST #####


##### PUT #####


##### DELETE #####
