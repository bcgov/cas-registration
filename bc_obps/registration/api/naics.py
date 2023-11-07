from .api_base import router
from typing import List, Optional
from registration.models import Operation, Operator, NaicsCode, NaicsCategory
from registration.schema import (
    NaicsCategorySchema,
    NaicsCodeSchema,
)

##### GET #####

@router.get("/naics_codes", response=List[NaicsCodeSchema])
def list_naics_codes(request):
    qs = NaicsCode.objects.all()
    return qs


@router.get("/naics_categories", response=List[NaicsCategorySchema])
def list_naics_codes(request):
    qs = NaicsCategory.objects.all()
    return qs




##### POST #####




##### PUT #####




##### DELETE #####
