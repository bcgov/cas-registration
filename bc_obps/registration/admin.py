from django.contrib import admin
from registration.models import (
    Address,
    RestartEvent,
    ClosureEvent,
    TemporaryShutdownEvent,
    TransferEvent,
    Facility,
    FacilityDesignatedOperationTimeline,
    OperationDesignatedOperatorTimeline,
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
admin.site.register(User)
admin.site.register(Operator)
admin.site.register(UserOperator)
admin.site.register(ParentOperator)
admin.site.register(RegulatedProduct)
admin.site.register(Activity)
admin.site.register(MultipleOperator)
admin.site.register(Address)
admin.site.register(BcObpsRegulatedOperation)
admin.site.register(ClosureEvent)
admin.site.register(TemporaryShutdownEvent)
admin.site.register(TransferEvent)
admin.site.register(RestartEvent)


@admin.register(Operation)
class OperationAdmin(admin.ModelAdmin):
    list_display = ('id', 'operator', 'name', 'type', 'status', 'created_at', 'updated_at', 'archived_at')
    search_fields = ('id', 'operator', 'name', 'operation_type', 'status', 'created_at', 'updated_at', 'archived_at')
    ordering = ('id',)


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'first_name',
        'last_name',
        'email',
        'phone_number',
        'business_role',
        'phone_number',
        'position_title',
    )
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


@admin.register(FacilityDesignatedOperationTimeline)
class FacilityDesignatedOperationTimelineAdmin(admin.ModelAdmin):
    list_display = ('id', 'facility', 'operation', 'start_date', 'end_date')


@admin.register(OperationDesignatedOperatorTimeline)
class OperationDesignatedOperatorTimelineAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'operation',
        'operator',
        'start_date',
        'end_date',
    )


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('id', 'type_name', 'file', 'description')

    @staticmethod
    def type_name(obj: Document) -> str:
        return obj.type.name
