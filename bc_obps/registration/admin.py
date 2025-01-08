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
admin.site.register(Operator)
admin.site.register(ParentOperator)
admin.site.register(RegulatedProduct)
admin.site.register(Activity)
admin.site.register(MultipleOperator)
admin.site.register(Address)
admin.site.register(BcObpsRegulatedOperation)
admin.site.register(ClosureEvent)
admin.site.register(TemporaryShutdownEvent)
admin.site.register(RestartEvent)


@admin.register(Operation)
class OperationAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'operator',
        'name',
        'type',
        'status',
        'registration_purpose',
        'created_at',
        'updated_at',
        'archived_at',
    )
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
        'status',
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


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('user_guid', 'first_name', 'last_name', 'email', 'position_title', 'role')
    search_fields = ('user_guid', 'first_name', 'last_name')

    @staticmethod
    def role(obj: User) -> str:
        return obj.app_role.role_name


@admin.register(UserOperator)
class UserOperatorAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_full_name', 'operator_legal_name', 'role', 'status')
    ordering = ('-created_at',)

    @staticmethod
    def user_full_name(obj: UserOperator) -> str:
        return obj.user.first_name + ' ' + obj.user.last_name

    @staticmethod
    def operator_legal_name(obj: UserOperator) -> str:
        return obj.operator.legal_name


@admin.register(TransferEvent)
class TransferEventAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'status',
        'from_operator_name',
        'to_operation_name',
        'operation_name',
        'from_operation_name',
        'to_operator_name',
        'effective_date',
    )

    @staticmethod
    def to_operator_name(obj: TransferEvent) -> str:
        return obj.to_operator.legal_name

    @staticmethod
    def from_operator_name(obj: TransferEvent) -> str:
        return obj.from_operator.legal_name

    @staticmethod
    def operation_name(obj: TransferEvent) -> str:
        return obj.operation.name if obj.operation else 'N/A'

    @staticmethod
    def from_operation_name(obj: TransferEvent) -> str:
        return obj.from_operation.name if obj.from_operation else 'N/A'

    @staticmethod
    def to_operation_name(obj: TransferEvent) -> str:
        return obj.to_operation.name if obj.to_operation else 'N/A'
