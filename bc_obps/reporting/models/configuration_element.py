from common.models import BaseModel
from django.db import models
from registration.models import ReportingActivity
from reporting.models import ReportingSourceType, ReportingGasType, ReportingMethodology


class ReportingGasType(BaseModel):
    """Configuration element for reporting"""

    # No history needed, these elements are immutable
    reporting_activity = models.ForeignKey(ReportingActivity)
    reporting_source_type = models.ForeignKey(ReportingSourceType)
    reporting_gas_type = models.ForeignKey(ReportingGasType)
    reporting_methodology = models.ForeignKey(ReportingMethodology)



    class Meta:
        db_table_comment = "Element of a configuration, representing a single relationship between multiple entities"
        db_table = 'erc"."configuration_element'
