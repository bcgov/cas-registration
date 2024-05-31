from django.contrib import admin
from registration.models import (
    Address,
    Facility,
    FacilityOwnershipTimeline,
    FacilityType,
    OperationType,
    RegulatedProduct,
    NaicsCode,
    Document,
    User,
    Contact,
    Operator,
    UserOperator,
    Operation,
    ParentOperator,
    AppRole,
    ReportingActivity,
    MultipleOperator,
    BcObpsRegulatedOperation,
)

admin.site.register(AppRole)
admin.site.register(NaicsCode)
admin.site.register(Document)
admin.site.register(User)
admin.site.register(Contact)
admin.site.register(Operator)
admin.site.register(UserOperator)
admin.site.register(ParentOperator)
admin.site.register(RegulatedProduct)
admin.site.register(ReportingActivity)
admin.site.register(MultipleOperator)
admin.site.register(Address)
admin.site.register(BcObpsRegulatedOperation)


@admin.register(Operation)
class OperationAdmin(admin.ModelAdmin):
    list_display = ('id', 'operator', 'name', 'type', 'status', 'created_at', 'updated_at', 'archived_at')
    search_fields = ('id', 'operator', 'name', 'operation_type', 'status', 'created_at', 'updated_at', 'archived_at')
    ordering = ('id',)


@admin.register(OperationType)
class OperationTypeAdmin(admin.ModelAdmin):
    list_display = ('name',)


@admin.register(FacilityType)
class FacilityTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'operation_type')


@admin.register(Facility)
class FacilityAdmin(admin.ModelAdmin):
    list_display = ('id', 'address', 'swrs_facility_id', 'bcghg_id', 'created_at', 'updated_at', 'archived_at')


@admin.register(FacilityOwnershipTimeline)
class FacilityOwnershipTimelineAdmin(admin.ModelAdmin):
    list_display = ('id', 'facility', 'operation', 'name', 'facility_type', 'start_date', 'end_date')
