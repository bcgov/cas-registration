from django.contrib import admin
from registration.models import (
    RegulatedProduct,
    NaicsCode,
    Document,
    User,
    Contact,
    Operator,
    UserOperator,
    Operation,
    ParentChildOperator,
    AppRole,
    ReportingActivity,
)

admin.site.register(AppRole)
admin.site.register(NaicsCode)
admin.site.register(Document)
admin.site.register(User)
admin.site.register(Contact)
admin.site.register(Operator)
admin.site.register(UserOperator)
admin.site.register(Operation)
admin.site.register(ParentChildOperator)
admin.site.register(RegulatedProduct)
admin.site.register(ReportingActivity)
