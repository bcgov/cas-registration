from typing import Any, Optional, cast
from uuid import UUID
from django import forms
from django.contrib import admin, messages
from django.core.exceptions import PermissionDenied
from django.db import transaction
from django.http import HttpRequest, HttpResponse
from django.shortcuts import redirect, render
from django.urls import path
from registration.models import User
from registration.models import Operation
from registration.models.address import Address
from registration.models.facility import Facility
from service.data_access_service.address_service import AddressDataAccessService
from service.data_access_service.facility_service import FacilityDataAccessService
from service.data_access_service.facility_designated_operation_timeline_service import (
    FacilityDesignatedOperationTimelineDataAccessService,
)
from service.data_access_service.operation_service import OperationDataAccessService
from service.data_access_service.operation_designated_operator_timeline_service import (
    OperationDesignatedOperatorTimelineDataAccessService,
)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('user_guid', 'first_name', 'last_name', 'email', 'position_title', 'role')
    search_fields = ('user_guid', 'first_name', 'last_name')

    @staticmethod
    def role(obj: User) -> str:
        return obj.app_role.role_name


class DuplicateOperationForm(forms.Form):
    new_operation_name = forms.CharField(
        max_length=1000,
        label="New operation name",
        help_text="Must be unique across operations.",
        widget=forms.TextInput(attrs={'class': 'vLargeTextField'}),
    )

    def clean_new_operation_name(self) -> str:
        name: str = self.cleaned_data['new_operation_name'].strip()
        if Operation.objects.filter(name=name).exists():
            raise forms.ValidationError(f"An operation named '{name}' already exists.")
        if Facility.objects.filter(name=name).exists():
            raise forms.ValidationError(f"A facility named '{name}' already exists.")
        return name


@admin.register(Operation)
class OperationAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'status', 'bc_obps_regulated_operation_id', 'operator_id', 'registration_purpose')
    search_fields = ('name', 'type', 'status', 'registration_purpose', 'operator_id')
    change_form_template = 'admin/registration/operation/change_form.html'

    def get_urls(self) -> list[Any]:
        custom_urls = [
            path(
                '<uuid:operation_id>/duplicate/',
                self.admin_site.admin_view(self.duplicate_operation_view),
                name='registration_operation_duplicate',
            ),
        ]
        return custom_urls + super().get_urls()

    def change_view(
        self, request: HttpRequest, object_id: str, form_url: str = '', extra_context: Optional[dict] = None
    ) -> HttpResponse:
        operation = self.get_object(request, object_id)
        return super().change_view(
            request,
            object_id,
            form_url,
            {**(extra_context or {}), 'show_duplicate_button': self._can_duplicate(request, operation)},
        )

    def _can_duplicate(self, request: HttpRequest, operation: Optional[Operation]) -> bool:
        return operation is not None and operation.type == Operation.Types.SFO and self.has_add_permission(request)

    def duplicate_operation_view(self, request: HttpRequest, operation_id: UUID) -> HttpResponse:
        """
        For testing purposes: duplicates an SFO under a new name, so testers don't have to manually
        register a new operation each time one is needed.
        """
        operation = self.get_object(request, str(operation_id))
        if operation is None or not self._can_duplicate(request, operation):
            raise PermissionDenied

        form = DuplicateOperationForm(request.POST or None, initial={'new_operation_name': f"{operation.name} (Copy)"})
        if form.is_valid():
            try:
                new_operation = duplicate_sfo_operation(operation, form.cleaned_data['new_operation_name'])
            except Exception as e:
                self.message_user(request, f"Failed to duplicate operation: {e}", level=messages.ERROR)
            else:
                self.message_user(request, f"Duplicated '{operation.name}' as '{new_operation.name}'.")
                return redirect('admin:registration_operation_change', new_operation.id)

        return render(
            request,
            'admin/registration/operation/duplicate_operation.html',
            context={
                **self.admin_site.each_context(request),
                'operation': operation,
                'form': form,
                'opts': self.model._meta,
                'title': 'Duplicate operation',
            },
        )


@transaction.atomic()
def duplicate_sfo_operation(operation: Operation, new_name: str) -> Operation:
    """
    Copies an SFO's operation information, operation representative, facility, and operator and facility
    designation timelines under `new_name`
    """
    creator_guid = cast(UUID, operation.created_by_id)
    new_operation = OperationDataAccessService.create_operation(
        creator_guid,
        {
            'name': new_name,
            'type': operation.type,
            'operator': operation.operator,
            'naics_code': operation.naics_code,
            'secondary_naics_code': operation.secondary_naics_code,
            'tertiary_naics_code': operation.tertiary_naics_code,
            'status': operation.status,
            'registration_purpose': operation.registration_purpose,
            'date_of_first_shipment': operation.date_of_first_shipment,
            'submission_date': operation.submission_date,
        },
        list(operation.activities.all()),
        list(operation.regulated_products.all()),
    )
    new_operation.contacts.set(operation.contacts.all())

    OperationDesignatedOperatorTimelineDataAccessService.create_operation_designated_operator_timeline(
        creator_guid,
        {
            'operation': new_operation,
            'operator': operation.operator,
            'start_date': operation.designated_operators.get(end_date__isnull=True).start_date,
        },
    )

    facility = operation.facilities.first()
    if facility:
        _duplicate_facility(facility, new_operation, new_name, creator_guid)

    return new_operation


def _duplicate_facility(facility: Facility, new_operation: Operation, new_name: str, creator_guid: UUID) -> None:
    new_facility = FacilityDataAccessService.create_facility(
        creator_guid,
        {
            'operation': new_operation,
            'name': new_name,
            'type': facility.type,
            'is_current_year': facility.is_current_year,
            'starting_date': facility.starting_date,
            'address': _duplicate_address(facility.address),
            'latitude_of_largest_emissions': facility.latitude_of_largest_emissions,
            'longitude_of_largest_emissions': facility.longitude_of_largest_emissions,
        },
    )
    new_facility.well_authorization_numbers.set(facility.well_authorization_numbers.all())

    FacilityDesignatedOperationTimelineDataAccessService.create_facility_designated_operation_timeline(
        creator_guid,
        {
            'facility': new_facility,
            'operation': new_operation,
            'start_date': facility.designated_operations.get(end_date__isnull=True).start_date,
        },
    )


def _duplicate_address(address: Optional[Address]) -> Optional[Address]:
    if address is None:
        return None
    return AddressDataAccessService.create_address(
        {
            'street_address': address.street_address,
            'municipality': address.municipality,
            'province': address.province,
            'postal_code': address.postal_code,
        }
    )
