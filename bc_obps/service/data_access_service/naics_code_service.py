from registration.models import NaicsCode
from registration.schema import NaicsCodeSchema
from django.core.cache import cache

##### GET #####


class NaicsCodeDataAccessService:
    def get_naics_codes():
        cached_data = cache.get("naics_codes")
        if cached_data:
            return cached_data
        else:
            naics_codes = NaicsCode.objects.only(*NaicsCodeSchema.Meta.fields).order_by('naics_code')
            cache.set("naics_codes", naics_codes, 60 * 60 * 24 * 1)  # 1 day
            return naics_codes
