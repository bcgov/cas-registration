from django.contrib import admin
from reporting.models import ReportingGasType, ReportingMethodology, ReportingSourceType

admin.site.register(ReportingGasType)
admin.site.register(ReportingMethodology)
admin.site.register(ReportingSourceType)
