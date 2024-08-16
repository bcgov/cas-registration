from django.contrib import admin
from registration.models import (
    Address,
    Event,
    Facility,
    FacilityOwnershipTimeline,
    OperationOwnershipTimeline,
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
    Activity,
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
admin.site.register(Activity)
admin.site.register(MultipleOperator)
admin.site.register(Address)
admin.site.register(BcObpsRegulatedOperation)


@admin.register(Operation)
class OperationAdmin(admin.ModelAdmin):
    list_display = ('id', 'operator', 'name', 'type', 'status', 'created_at', 'updated_at', 'archived_at')
    search_fields = ('id', 'operator', 'name', 'operation_type', 'status', 'created_at', 'updated_at', 'archived_at')
    ordering = ('id',)


@admin.register(Facility)
class FacilityAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'name',
        'swrs_facility_id',
        'bcghg_id',
        'type',
        'latitude_of_largest_emissions',
        'longitude_of_largest_emissions',
        'address',
        'created_at',
        'updated_at',
        'archived_at',
        'starting_date',
    )


@admin.register(FacilityOwnershipTimeline)
class FacilityOwnershipTimelineAdmin(admin.ModelAdmin):
    list_display = ('id', 'facility', 'operation', 'start_date', 'end_date')


@admin.register(OperationOwnershipTimeline)
class OperationOwnershipTimelineAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'operation',
        'operator',
        'start_date',
        'end_date',
    )


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('id', 'facility', 'operation', 'effective_date', 'type', 'additional_data')
