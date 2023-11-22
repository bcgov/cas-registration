from .api_base import router
from typing import List
from registration.models import NaicsCode
from registration.schema import (
    NaicsCodeSchema,
)

##### GET #####


@router.get("/naics_codes", response=List[NaicsCodeSchema])
def list_naics_codes(request):
    qs = NaicsCode.objects.all()
    return qs


@router.get("/naics_categories", response=List[NaicsCategorySchema])
def list_naics_categories(request):
    qs = NaicsCategory.objects.all()
    return qs


##### POST #####


##### PUT #####


##### DELETE #####
