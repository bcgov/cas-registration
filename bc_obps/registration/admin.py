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
    MultipleOperator,
)

admin.site.register(AppRole)
admin.site.register(NaicsCode)
admin.site.register(Document)
admin.site.register(User)
admin.site.register(Contact)
admin.site.register(Operator)
admin.site.register(UserOperator)
admin.site.register(ParentChildOperator)
admin.site.register(RegulatedProduct)
admin.site.register(ReportingActivity)
admin.site.register(MultipleOperator)


@admin.register(Operation)
class OperationAdmin(admin.ModelAdmin):
    list_display = ('id', 'operator', 'name', 'type', 'status', 'created_at', 'updated_at', 'archived_at')
    search_fields = ('id', 'operator', 'name', 'operation_type', 'status', 'created_at', 'updated_at', 'archived_at')
    ordering = ('id',)
