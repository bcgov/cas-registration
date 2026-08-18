from typing import Optional
from django import forms
from django.contrib import admin, messages
from django.contrib.admin.helpers import ACTION_CHECKBOX_NAME
from django.db import transaction
from django.db.models import QuerySet
from django.http import HttpRequest, HttpResponse
from django.shortcuts import render
from registration.models import User
from registration.models import Operation
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
    _selected_action = forms.CharField(widget=forms.MultipleHiddenInput)
    new_operation_name = forms.CharField(
        max_length=1000,
        label="New operation name",
        help_text="Must be unique",
    )


@admin.register(Operation)
class OperationAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'status', 'bc_obps_regulated_operation_id', 'operator_id', 'registration_purpose')
    search_fields = ('name', 'type', 'status', 'registration_purpose', 'operator_id')
    actions = ['duplicate_operation']

    @admin.action(description='Duplicate operation (SFO only) with a new name')
    def duplicate_operation(self, request: HttpRequest, queryset: QuerySet[Operation]) -> Optional[HttpResponse]:
        """
        For testing purposes: Duplicates an SFO, so testers don't have to manually
        register a new operation each time one is needed.
        Copies: operation information, operation representative, facility, and operator and facility designation timelines under a new name provided by the tester. BCGHG/BORO IDs,
        documents, and opted-in details are intentionally not duplicated since they're unique-per-operation
        or file-based.
        """
        if queryset.count() != 1:
            self.message_user(request, "Select exactly one operation to duplicate.", level=messages.ERROR)
            return None

        operation = queryset.first()
        if operation is None:
            self.message_user(request, "Select exactly one operation to duplicate.", level=messages.ERROR)
            return None
        if operation.type != Operation.Types.SFO:
            self.message_user(
                request,
                "Only Single Facility Operations (SFO) can be duplicated with this action.",
                level=messages.ERROR,
            )
            return None

        if 'apply' in request.POST:
            form = DuplicateOperationForm(request.POST)
            if form.is_valid():
                new_name = form.cleaned_data['new_operation_name'].strip()
                if Operation.objects.filter(name=new_name).exists():
                    form.add_error('new_operation_name', f"An operation named '{new_name}' already exists.")
                elif Facility.objects.filter(name=new_name).exists():
                    form.add_error('new_operation_name', f"A facility named '{new_name}' already exists.")
                else:
                    try:
                        new_operation = self._duplicate_sfo_operation(operation, new_name)
                    except Exception as e:
                        self.message_user(request, f"Failed to duplicate operation: {e}", level=messages.ERROR)
                    else:
                        self.message_user(
                            request,
                            f"Duplicated '{operation.name}' as '{new_operation.name}' (id: {new_operation.id}).",
                        )
                        return None
        else:
            form = DuplicateOperationForm(
                initial={
                    ACTION_CHECKBOX_NAME: request.POST.getlist(ACTION_CHECKBOX_NAME),
                    'new_operation_name': f"{operation.name} (Copy)",
                }
            )

        return render(
            request,
            'admin/registration/operation/duplicate_operation.html',
            context={
                **self.admin_site.each_context(request),
                'operation': operation,
                'form': form,
                'action_checkbox_name': ACTION_CHECKBOX_NAME,
                'opts': self.model._meta,
                'title': 'Duplicate operation',
            },
        )

    @staticmethod
    @transaction.atomic()
    def _duplicate_sfo_operation(operation: Operation, new_name: str) -> Operation:
        facility = operation.facilities.first()
        original_creator_guid = operation.created_by_id
        if original_creator_guid is None:
            raise ValueError(f"Operation '{operation.name}' has no recorded creator; cannot duplicate.")

        # --- FACILITY
        new_address = None
        if facility and facility.address:
            new_address = AddressDataAccessService.create_address(
                {
                    'street_address': facility.address.street_address,
                    'municipality': facility.address.municipality,
                    'province': facility.address.province,
                    'postal_code': facility.address.postal_code,
                }
            )

        # --- OPERATION
        new_operation = OperationDataAccessService.create_operation(
            original_creator_guid,
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

        # --- OPERATION REPRESENTATIVE
        new_operation.contacts.set(operation.contacts.all())
        new_operation.created_by_id = original_creator_guid
        new_operation.save(update_fields=['created_by'])

        # --- OPERATION DESIGNATED OPERATOR TIMELINE
        original_operator_timeline = operation.designated_operators.get(end_date__isnull=True)
        new_operator_timeline = (
            OperationDesignatedOperatorTimelineDataAccessService.create_operation_designated_operator_timeline(
                original_creator_guid,
                {
                    'operation': new_operation,
                    'operator': operation.operator,
                    'start_date': original_operator_timeline.start_date,
                },
            )
        )
        new_operator_timeline.created_by_id = original_creator_guid
        new_operator_timeline.save(update_fields=['created_by'])

        # --- FACILITY DESIGNATED OPERATION TIMELINE
        if facility:
            new_facility = FacilityDataAccessService.create_facility(
                original_creator_guid,
                {
                    'operation': new_operation,
                    'name': new_name,
                    'type': facility.type,
                    'is_current_year': facility.is_current_year,
                    'starting_date': facility.starting_date,
                    'address': new_address,
                    'latitude_of_largest_emissions': facility.latitude_of_largest_emissions,
                    'longitude_of_largest_emissions': facility.longitude_of_largest_emissions,
                },
            )
            new_facility.well_authorization_numbers.set(facility.well_authorization_numbers.all())
            new_facility.created_by_id = original_creator_guid
            new_facility.save(update_fields=['created_by'])

            original_facility_timeline = facility.designated_operations.get(end_date__isnull=True)
            new_facility_timeline = (
                FacilityDesignatedOperationTimelineDataAccessService.create_facility_designated_operation_timeline(
                    original_creator_guid,
                    {
                        'facility': new_facility,
                        'operation': new_operation,
                        'start_date': original_facility_timeline.start_date,
                    },
                )
            )
            new_facility_timeline.created_by_id = original_creator_guid
            new_facility_timeline.save(update_fields=['created_by'])

        return new_operation
