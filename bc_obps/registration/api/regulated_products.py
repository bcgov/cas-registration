from .api_base import router
from typing import List
from registration.models import RegulatedProduct
from registration.schema import (
    RegulatedProductSchema,
)

##### GET #####


@router.get("/regulated_products", response=List[RegulatedProductSchema])
def list_regulated_products(request):
    qs = RegulatedProduct.objects.all()
    return qs


##### POST #####


##### PUT #####


##### DELETE #####
