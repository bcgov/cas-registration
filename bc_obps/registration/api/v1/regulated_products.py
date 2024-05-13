from service.data_access_service.regulated_product_service import RegulatedProductDataAccessService
from registration.decorators import authorize
from ..router import router
from typing import List
from registration.models import AppRole, UserOperator
from registration.schema import (
    RegulatedProductSchema,
)

##### GET #####


@router.get("/regulated_products", response=List[RegulatedProductSchema], url_name="list_regulated_products")
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles(), False)
def list_regulated_products(request):
    return 200, RegulatedProductDataAccessService.get_regulated_products()


##### POST #####


##### PUT #####


##### DELETE #####
