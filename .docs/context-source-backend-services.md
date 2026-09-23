This file is a merged representation of a subset of the codebase, containing specifically included files, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: bc_obps/bc_obps/**, bc_obps/service/**, bc_obps/manage.py
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
bc_obps/
  bc_obps/
    __init__.py
    api.py
    asgi.py
    error_tracking.py
    settings.py
    storage_backends.py
    urls.py
    wsgi.py
  service/
    data_access_service/
      activity_service.py
      address_service.py
      business_structure_service.py
      contact_service.py
      dashboard_service.py
      document_service.py
      email_template_service.py
      facility_designated_operation_timeline_service.py
      facility_service.py
      fuel_service.py
      multiple_operator_service.py
      naics_code_service.py
      operation_designated_operator_timeline_service.py
      operation_service.py
      operator_service.py
      opted_in_operation_detail_service.py
      parent_operator_service.py
      partner_operator_service.py
      regulated_product_service.py
      report_service.py
      reporting_year.py
      transfer_event_service.py
      user_operator_service.py
      user_service.py
      well_authorization_number_service.py
    data_types/
      operation_service.py
    email/
      email_service.py
      utils.py
    error_service/
      custom_codes_4xx.py
      handle_exception.py
    pdf/
      pdf_generator_service.py
    tests/
      data_access_service/
        test_data_access_contact_service.py
        test_data_access_fuel_service.py
        test_data_access_operation_designated_operator_timeline.py
        test_data_access_opted_in_operation_detail_service.py
        test_data_access_report_service.py
        test_data_access_user_operator_service.py
        test_data_access_user_service.py
      error_service/
        test_handle_exception.py
      operation_service/
        test_operation_service_bcghgid.py
        test_operation_service_reportable.py
        test_operation_service.py
      test_activity_service.py
      test_application_access_service.py
      test_contact_service.py
      test_document_service.py
      test_facility_designated_operation_timeline_service.py
      test_facility_report_service.py
      test_facility_service.py
      test_facility_snapshot_service.py
      test_form_builder_service.py
      test_operation_designated_operator_timeline_service.py
      test_operator_service.py
      test_pdf_generator_service.py
      test_report_service_past_report.py
      test_report_service.py
      test_report_version_service.py
      test_service_utils.py
      test_transfer_event_service.py
      test_user_operator_service.py
      test_user_service.py
    utils/
      constants.py
      get_report_valid_date_from_version_id.py
    activity_service.py
    application_access_service.py
    contact_service.py
    document_service.py
    facility_designated_operation_timeline_service.py
    facility_report_service.py
    facility_service.py
    facility_snapshot_service.py
    form_builder_service.py
    operation_designated_operator_timeline_service.py
    operation_service.py
    operator_service.py
    report_service.py
    report_version_service.py
    reporting_year_service.py
    transfer_event_service.py
    user_operator_service.py
    user_profile_service.py
    user_service.py
  manage.py
```

# Files

## File: bc_obps/bc_obps/__init__.py
```python

```

## File: bc_obps/bc_obps/api.py
```python
from django.http import HttpRequest, HttpResponse
from ninja import NinjaAPI, Swagger
from ninja.errors import ValidationError
from common.api import router as common_router
from registration.api import router as registration_router
from reporting.api import router as reporting_router
from reporting.api_v2 import router as reporting_router_v2
from compliance.api import router as compliance_router
from service.error_service.handle_exception import handle_exception
from registration.utils import generate_useful_error

# Docs: https://swagger.io/docs/open-source-tools/swagger-ui/usage/configuration/
# Filtering is case sensitive matching the filter expression anywhere inside the tag.
api = NinjaAPI(
    title="BCIERS API", docs=Swagger(settings={"filter": True, "operationsSorter": "method", "tagsSorter": "alpha"})
)


# This is a custom exception handler for Ninja ValidationError, This helps to return a more detailed error message for Unprocessable Entity (422) responses
@api.exception_handler(ValidationError)
def custom_validation_errors(request: HttpRequest, exc: ValidationError) -> HttpResponse:
    print(exc.errors)
    return api.create_response(request, {"message": generate_useful_error(exc)}, status=422)


api.add_exception_handler(Exception, handle_exception)  # Global exception handler

api.add_router("/common/", common_router, tags=["V1"])
api.add_router("/registration/", registration_router, tags=["V1"])
api.add_router("/reporting/v2/", reporting_router_v2, tags=["V2"])
api.add_router("/reporting/", reporting_router, tags=["V1"])
api.add_router("/compliance/", compliance_router, tags=["V1"])
```

## File: bc_obps/bc_obps/asgi.py
```python
"""
ASGI config for bc_obps project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bc_obps.settings')

application = get_asgi_application()
```

## File: bc_obps/bc_obps/error_tracking.py
```python
import os
from typing import Literal
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration


def configure_error_tracking(
    environment: Literal['local', 'CI', 'dev', 'test', 'prod'] | str | None,
) -> bool:
    """
    Configure Sentry error tracking for prod and test environments.

    Args:
        environment: The ENVIRONMENT variable value (e.g., 'local', 'dev', 'test', 'prod')

    Returns:
        ENABLE_SENTRY flag
    """
    sentry_environment = os.environ.get('SENTRY_ENVIRONMENT')
    sentry_trace_sample_rate = os.environ.get('SENTRY_TRACE_SAMPLE_RATE')
    enable_sentry = sentry_environment in ['prod', 'test']

    if enable_sentry:
        # Map environment values to maintain backward compatibility with existing Sentry issues
        environment_mapping = {'prod': 'production', 'test': 'test'}
        mapped_environment = environment_mapping.get(sentry_environment, sentry_environment)  # type: ignore[arg-type]

        sentry_dsn = "https://cf402cd8318aab5c911728a16cbf8fcc@o646776.ingest.sentry.io/4506624068026368"

        sentry_sdk.init(
            dsn=sentry_dsn,
            integrations=[DjangoIntegration()],
            traces_sample_rate=float(sentry_trace_sample_rate) if sentry_trace_sample_rate is not None else 0,
            environment=mapped_environment,
        )

    return enable_sentry
```

## File: bc_obps/bc_obps/urls.py
```python
"""
URL configuration for bc_obps project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.conf import settings
from django.contrib import admin
from django.urls import path, include
from .api import api


urlpatterns = [path("api/", api.urls)]
if settings.NON_PROD_ENVIRONMENT:
    urlpatterns += [path("admin/", admin.site.urls)]
if settings.DEBUG:
    urlpatterns += [path('silk/', include('silk.urls', namespace='silk'))]
```

## File: bc_obps/bc_obps/wsgi.py
```python
"""
WSGI config for bc_obps project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bc_obps.settings')

application = get_wsgi_application()
```

## File: bc_obps/service/data_access_service/activity_service.py
```python
from typing import Optional
from registration.models import Activity
from registration.schema import ActivitySchemaOut
from django.core.cache import cache
from django.db.models import QuerySet


class ActivityDataAccessService:
    @classmethod
    def get_activities(cls) -> QuerySet[Activity]:
        cached_data: Optional[QuerySet[Activity]] = cache.get("activities")
        if cached_data:
            return cached_data
        else:
            activities = Activity.objects.only(*ActivitySchemaOut.Meta.fields).order_by('weight', 'name')
            cache.set("activities", activities, 60 * 60 * 24 * 1)
            return activities
```

## File: bc_obps/service/data_access_service/address_service.py
```python
from registration.models import Address
from ninja.types import DictStrAny
from typing import Optional


class AddressDataAccessService:
    @classmethod
    def create_address(
        cls,
        address_data: DictStrAny,
    ) -> Address:
        address = Address.objects.create(
            **address_data,
        )
        return address

    @classmethod
    def upsert_address_from_data(
        cls,
        address_data: DictStrAny,
        address_id: Optional[int],
    ) -> Address:
        address, _ = Address.objects.update_or_create(
            # A None id is the intentional "create" path; django-stubs 6.0 rejects None in lookups.
            id=address_id,  # type: ignore[misc]
            defaults={**address_data},
        )
        return address
```

## File: bc_obps/service/data_access_service/business_structure_service.py
```python
from typing import Optional
from registration.models import BusinessStructure
from registration.schema import BusinessStructureOut
from django.core.cache import cache
from django.db.models import QuerySet


class BusinessStructureDataAccessService:
    @classmethod
    def get_business_structures(cls) -> QuerySet[BusinessStructure]:
        cached_data: Optional[QuerySet[BusinessStructure]] = cache.get("business_structures")
        if cached_data:
            return cached_data
        else:
            business_structures = BusinessStructure.objects.only(*BusinessStructureOut.Meta.fields)
            cache.set("business_structures", business_structures, 60 * 60 * 24 * 1)  # 1 day
            return business_structures
```

## File: bc_obps/service/data_access_service/contact_service.py
```python
from uuid import UUID
from typing import Dict, Optional, Any
from registration.models import BusinessRole, Contact
from django.db.models import QuerySet
from registration.models.user import User
from service.user_operator_service import UserOperatorService
from service.data_access_service.user_service import UserDataAccessService


class ContactDataAccessService:
    @classmethod
    def get_by_id(cls, contact_id: int) -> Contact:
        return Contact.objects.get(id=contact_id)

    @classmethod
    def user_has_access(cls, user_guid: UUID, contact_id: int) -> bool:
        user = UserDataAccessService.get_by_guid(user_guid)
        user_operator = UserOperatorService.get_current_user_approved_user_operator_or_raise(user)
        return user_operator.operator.contacts.filter(id=contact_id).exists()

    @classmethod
    def update_or_create(cls, existing_contact_id: Optional[int], updated_data: Dict[str, Optional[str]]) -> Contact:
        data: Dict[str, Any] = {
            "pk": existing_contact_id,
            "first_name": updated_data["first_name"],
            "last_name": updated_data["last_name"],
            "position_title": updated_data["position_title"],
            "email": updated_data["email"],
            "phone_number": updated_data["phone_number"],
            "business_role": updated_data.get(
                "business_role", BusinessRole.objects.get(role_name="Operation Representative")
            ),
        }
        if updated_data.get("operator_id"):
            data["operator_id"] = updated_data["operator_id"]
        contact: Contact
        contact, _ = Contact.custom_update_or_create(
            self=Contact,
            **data,
        )
        return contact

    @classmethod
    def get_all_contacts_for_user(cls, user: User) -> QuerySet[Contact]:
        if user.is_irc_user():
            return Contact.objects.all()
        else:
            # fetching all contacts associated with the user's operator
            user_operator = UserOperatorService.get_current_user_approved_user_operator_or_raise(user)
            return Contact.objects.filter(operator=user_operator.operator)

    @classmethod
    def get_contact_for_user(cls, user: User) -> Contact | None:
        if user.is_industry_user():
            user_operator = UserOperatorService.get_current_user_approved_user_operator_or_raise(user)
            # first try querying by email address - return result if there is one
            query_by_email = Contact.objects.filter(operator=user_operator.operator, email=user.email)
            if query_by_email.count() == 1:
                return query_by_email.first()
            # if we can't get the contact by the user's email, query by name
            query_by_name = Contact.objects.filter(
                operator=user_operator.operator, first_name=user.first_name, last_name=user.last_name
            )
            if query_by_name.count() == 1:
                return query_by_name.first()
            # if neither of these are successful, return None
            return None
        # if the user isn't an industry user, there won't be a Contact record for them
        else:
            return None
```

## File: bc_obps/service/data_access_service/dashboard_service.py
```python
import logging
from typing import Optional
from uuid import UUID
from django.db.models import QuerySet, Q
from common.models import DashboardData
from common.schema import DashboardDataSchemaOut
from service.data_access_service.user_service import UserDataAccessService

logger = logging.getLogger(__name__)


class DashboardDataService:
    @classmethod
    def get_dashboard_data_by_name_for_role(
        cls, dashboard: str, user_guid: UUID, role: Optional[str] = None
    ) -> QuerySet[DashboardData]:
        """
        Fetches dashboard data filtered by dashboard name and user role.

        Args:
            dashboard (str): The name of the dashboard to filter by. Use "all" to fetch all dashboards.
            user_guid (UUID): The user guid to filter by.
            role (Optional[str]): The user role to filter by. The role should be contained within the access_roles.

        Returns:
            QuerySet[DashboardData]: A queryset of filtered DashboardData objects.
        """
        try:
            fields = DashboardDataSchemaOut.Meta.fields
            query = DashboardData.objects.only(*fields)
            if dashboard == "all":
                return query
            else:
                # Check if the user is an approved admin user operator
                if role == "industry_user":
                    approved_admin: bool = UserDataAccessService.is_user_an_approved_admin_user_operator(user_guid)[
                        "approved"
                    ]
                    role = "industry_user_admin" if approved_admin else "industry_user"
                query = query.filter(Q(data__dashboard=dashboard) & Q(data__access_roles__contains=role))

            return query

        except Exception as exc:
            # Log the exception if needed
            logger.error(f'Logger: Exception in get_dashboard_data_by_name_for_role {str(exc)}')
            return DashboardData.objects.none()
```

## File: bc_obps/service/data_access_service/document_service.py
```python
from typing import Optional
from uuid import UUID
from django.core.files import File
from registration.models import Document, DocumentType


class DocumentDataAccessService:
    @classmethod
    def get_operation_document_by_type(cls, operation_id: UUID, document_type: str) -> Document | None:
        try:
            document = Document.objects.get(
                operation_id=operation_id,
                type=DocumentType.objects.get(name=document_type),
            )
        except Document.DoesNotExist:
            return None
        return document

    @classmethod
    def create_document(
        cls,
        user_guid: UUID,
        file_data: Optional[File],
        document_type_name: str,
        operation_id: UUID,
    ) -> Document:
        document = Document.objects.create(
            file=file_data,
            type=DocumentType.objects.get(name=document_type_name),
            created_by_id=user_guid,
            operation_id=operation_id,
            status=Document.FileStatus.UNSCANNED,
        )

        return document
```

## File: bc_obps/service/data_access_service/email_template_service.py
```python
from common.models import EmailNotificationTemplate
from enum import Enum


class EmailNotificationTemplateService:
    @classmethod
    def get_template_by_name(cls, template_name: str | Enum) -> EmailNotificationTemplate:
        """
        Get an email notification template by its name.

        Args:
            template_name: The name of the template to get.

        Returns:
            EmailNotificationTemplate or None
        """
        if isinstance(template_name, str):
            template_name_str = template_name
        elif isinstance(template_name, Enum):
            template_name_str = template_name.value
        else:
            raise TypeError("template_name must be a string or Enum")
        try:
            return EmailNotificationTemplate.objects.get(name=template_name_str)
        except EmailNotificationTemplate.DoesNotExist:
            raise ValueError("Email template not found")
```

## File: bc_obps/service/data_access_service/facility_designated_operation_timeline_service.py
```python
from uuid import UUID
from registration.models.facility_designated_operation_timeline import FacilityDesignatedOperationTimeline
from ninja.types import DictStrAny


class FacilityDesignatedOperationTimelineDataAccessService:
    @classmethod
    def create_facility_designated_operation_timeline(
        cls,
        user_guid: UUID,
        facility_designated_operation_timeline_data: DictStrAny,
    ) -> FacilityDesignatedOperationTimeline:
        facility_designated_operation_timeline = FacilityDesignatedOperationTimeline.objects.create(
            **facility_designated_operation_timeline_data,
            created_by_id=user_guid,
        )
        return facility_designated_operation_timeline
```

## File: bc_obps/service/data_access_service/facility_service.py
```python
from registration.models.operation import Operation
from registration.models import Facility
from django.db.models import QuerySet
from uuid import UUID
from ninja.types import DictStrAny


class FacilityDataAccessService:
    @classmethod
    def get_current_facilities_by_operation(cls, operation: Operation) -> QuerySet[Facility]:
        return Facility.objects.filter(
            designated_operations__end_date__isnull=True, designated_operations__operation=operation
        ).all()

    @classmethod
    def get_by_id(cls, facility_id: UUID) -> Facility:
        return Facility.objects.prefetch_related("well_authorization_numbers").get(id=facility_id)

    @classmethod
    def create_facility(
        cls,
        user_guid: UUID,
        facility_data: DictStrAny,
    ) -> Facility:
        facility = Facility.objects.create(
            **facility_data,
            created_by_id=user_guid,
        )

        return facility

    @classmethod
    def update_facility(
        cls,
        facility_id: UUID,
        facility_data: DictStrAny,
    ) -> Facility:
        facility = cls.get_by_id(facility_id)
        for key, value in facility_data.items():
            setattr(facility, key, value)

        facility.save()
        return facility
```

## File: bc_obps/service/data_access_service/fuel_service.py
```python
from typing import Optional
from django.db.models import QuerySet
from reporting.models import FuelType
from reporting.schema.fuel import FuelTypeSchema
from django.core.cache import cache

##### GET #####


class FuelTypeDataAccessService:
    @classmethod
    def get_fuels(cls) -> QuerySet[FuelType]:
        cached_data: Optional[QuerySet[FuelType]] = cache.get("fuels")
        if cached_data:
            return cached_data
        else:
            fuels = FuelType.objects.only(*FuelTypeSchema.Meta.fields).order_by('id')
            cache.set("fuels", fuels, 60 * 60 * 24 * 1)  # 1 day
            return fuels

    @classmethod
    def get_fuel(cls, fuel_name: str) -> FuelType:
        fuel = FuelType.objects.get(name=fuel_name)
        return fuel
```

## File: bc_obps/service/data_access_service/multiple_operator_service.py
```python
from registration.models.operation import Operation
from registration.models.multiple_operator import MultipleOperator
from uuid import UUID
from ninja.types import DictStrAny


class MultipleOperatorService:
    @classmethod
    def create_or_update(
        cls, multiple_operator_id: int | None, operation: Operation, user_guid: UUID, data: DictStrAny
    ) -> MultipleOperator:
        mo_operator_instance, _ = MultipleOperator.objects.update_or_create(
            # A None pk is the intentional "create" path; django-stubs 6.0 rejects None in lookups.
            pk=multiple_operator_id,  # type: ignore[misc]
            defaults={**data, 'operation': operation},
        )

        return mo_operator_instance
```

## File: bc_obps/service/data_access_service/naics_code_service.py
```python
from typing import Optional
from django.db.models import QuerySet
from registration.models import NaicsCode
from registration.schema import NaicsCodeSchema
from django.core.cache import cache

##### GET #####


class NaicsCodeDataAccessService:
    @classmethod
    def get_naics_codes(cls) -> QuerySet[NaicsCode]:
        cached_data: Optional[QuerySet[NaicsCode]] = cache.get("naics_codes")
        if cached_data:
            return cached_data
        else:
            naics_codes = NaicsCode.objects.only(*NaicsCodeSchema.Meta.fields).order_by('naics_code')
            cache.set("naics_codes", naics_codes, 60 * 60 * 24 * 1)  # 1 day
            return naics_codes
```

## File: bc_obps/service/data_access_service/operation_designated_operator_timeline_service.py
```python
from uuid import UUID
from ninja.types import DictStrAny
from typing import List
from registration.models.operation import Operation
from registration.models.facility_designated_operation_timeline import FacilityDesignatedOperationTimeline
from registration.models.operation_designated_operator_timeline import OperationDesignatedOperatorTimeline
from registration.models import User
from django.db.models import QuerySet, Subquery, OuterRef, UUIDField, CharField
from service.user_operator_service import UserOperatorService
from django.contrib.postgres.aggregates import ArrayAgg


class OperationDesignatedOperatorTimelineDataAccessService:
    @classmethod
    def create_operation_designated_operator_timeline(
        cls,
        user_guid: UUID,
        operation_designated_operator_timeline_data: DictStrAny,
    ) -> OperationDesignatedOperatorTimeline:
        operation_designated_operator_timeline = OperationDesignatedOperatorTimeline.objects.create(
            **operation_designated_operator_timeline_data,
            created_by_id=user_guid,
        )

        return operation_designated_operator_timeline

    @classmethod
    def get_operation_timeline_for_user(
        cls, user: User, exclude_previously_owned: bool = True
    ) -> QuerySet[OperationDesignatedOperatorTimeline]:
        """
        Retrieve all operation timeline records accessible by the given user, optionally including previously owned operations, with optional annotations for SFO facility ID and name.

        Depending on the user's role, this function returns a queryset of `Operation` objects:
        - IRC users can access all registered operations.
        - Industry users can only access operations associated with their own operator.

        The queryset is annotated with the `sfo_facility_id` and `facility_name` if the
        operation type is SFO and the operation is actively designated for a facility.

        Args:
            user (User): The user for whom operations are being fetched.
            exclude_previously_owned (bool): Whether or not to include operations that the user previously owned (ie, that were transferred). Defaults to exclusion.
        """

        facilities_subquery = (
            FacilityDesignatedOperationTimeline.objects.filter(
                operation_id=OuterRef('operation'),
                operation_id__type=Operation.Types.SFO,
            )
            .only('facility__id', 'facility__name')
            .order_by('start_date')
        )
        if exclude_previously_owned:
            facilities_subquery.filter(
                end_date__isnull=True,
            )

        # Subquery for sfo_facility_id (UUID) and facility_name (string)
        sfo_facility_id_subquery = facilities_subquery.values('facility__pk')[:1]
        sfo_facility_name_subquery = facilities_subquery.values('facility__name')[:1]

        only_fields: List[str] = [
            "operation__name",
            "operation__type",
            "operation__bc_obps_regulated_operation__id",
            "operation__bcghg_id__id",
            "operation__id",
            "operation__status",
            "operation__registration_purpose",
            "operator__legal_name",
        ]
        queryset = (
            OperationDesignatedOperatorTimeline.objects.select_related(
                'operator',
                'operation',
                'operation__bcghg_id',
                'operation__bc_obps_regulated_operation',
            )
            .annotate(
                sfo_facility_id=Subquery(sfo_facility_id_subquery, output_field=UUIDField()),
                sfo_facility_name=Subquery(sfo_facility_name_subquery, output_field=CharField()),
                operation__contact_ids=ArrayAgg('operation__contacts__id', distinct=True),
            )
            .only(*only_fields)
        )
        if exclude_previously_owned:
            queryset = queryset.filter(end_date__isnull=True)

        if user.is_irc_user():
            # IRC users see all operations (subject to filtering that's done on the endpoint)
            return queryset
        else:
            # Industry users can only see operations associated with their own operator
            user_operator = UserOperatorService.get_current_user_approved_user_operator_or_raise(user)
            return queryset.filter(operator_id=user_operator.operator_id)

    @classmethod
    def get_previously_owned_operations_by_operator(
        cls, operator_id: UUID
    ) -> QuerySet[OperationDesignatedOperatorTimeline]:
        """
        Gets a list of operations & the dates that they were previously owned by an operator.
        """

        return OperationDesignatedOperatorTimeline.objects.filter(operator_id=operator_id, end_date__isnull=False)
```

## File: bc_obps/service/data_access_service/operation_service.py
```python
from typing import List, Optional
from uuid import UUID
from registration.models import Operation, User, RegulatedProduct, Activity
from ninja.types import DictStrAny
from django.db.models import QuerySet
from service.user_operator_service import UserOperatorService


class OperationDataAccessService:
    @classmethod
    def get_by_id(cls, operation_id: UUID, only_fields: Optional[List[str]] = None) -> Operation:
        if only_fields:
            operation: Operation = Operation.objects.only(*only_fields).get(id=operation_id)
        else:
            operation = (
                Operation.objects.select_related(
                    'created_by',
                    'updated_by',
                    'archived_by',
                    'operator',
                    'naics_code',
                    'secondary_naics_code',
                    'tertiary_naics_code',
                    'bcghg_id',
                    'bc_obps_regulated_operation',
                    'opted_in_operation',
                )
                .prefetch_related("activities", "regulated_products", "contacts", "multiple_operators", "documents")
                .get(id=operation_id)
            )

        return operation

    @classmethod
    def check_current_users_registered_operation(cls, operator_id: UUID) -> bool:
        """
        Returns True if the userOperator's operator has at least one operation with status 'Registered', False otherwise.
        """
        return Operation.objects.filter(operator_id=operator_id, status=Operation.Statuses.REGISTERED).exists()

    @classmethod
    def check_current_users_reporting_registered_operation(cls, operator_id: UUID) -> bool:
        """
        Returns True if the userOperator's operator has at least one operation with status 'Registered'
        and registration_purpose not equal to POTENTIAL_REPORTING_OPERATION, False otherwise.
        """
        return (
            Operation.objects.filter(operator_id=operator_id, status=Operation.Statuses.REGISTERED)
            .exclude(registration_purpose=Operation.Purposes.POTENTIAL_REPORTING_OPERATION)
            .exists()
        )

    @classmethod
    def create_operation(
        cls,
        user_guid: UUID,
        operation_data: DictStrAny,
        activities: list[int] | list[Activity],
        regulated_products: list[int] | list[RegulatedProduct],
    ) -> Operation:
        operation = Operation.objects.create(
            **operation_data,
            created_by_id=user_guid,
        )

        operation.activities.set(activities)
        operation.regulated_products.set(regulated_products)

        return operation

    @classmethod
    def get_all_current_operations_for_user(cls, user: User) -> QuerySet[Operation]:
        if user.is_irc_user():
            # IRC users can see all operations except ones with status of "Not Started" or "Draft"
            return (
                Operation.objects.select_related("operator", "bc_obps_regulated_operation")
                .exclude(status=Operation.Statuses.NOT_STARTED)
                .exclude(status=Operation.Statuses.DRAFT)
                .only(
                    "id", "name", "submission_date", "status", "operator__legal_name", "bc_obps_regulated_operation__id"
                )
            )
        else:
            # Industry users can only see operations associated with their own operator
            user_operator = UserOperatorService.get_current_user_approved_user_operator_or_raise(user)
        return (
            Operation.objects.select_related("operator", "bc_obps_regulated_operation")
            .filter(operator_id=user_operator.operator_id)
            .only("id", "name", "submission_date", "status", "operator__legal_name", "bc_obps_regulated_operation__id")
        )
```

## File: bc_obps/service/data_access_service/operator_service.py
```python
from django.db.models import QuerySet
from common.exceptions import UserError
from registration.utils import update_model_instance
from registration.models import Operator, User, UserOperator
from uuid import UUID
from ninja.types import DictStrAny
from compliance.models import ComplianceReportVersion


class OperatorDataAccessService:
    @classmethod
    def get_operator_by_id(cls, operator_id: UUID) -> Operator:
        return Operator.objects.get(id=operator_id)

    @classmethod
    def get_all_operators(cls) -> QuerySet[Operator]:
        return Operator.objects.exclude(status=Operator.Statuses.DECLINED)

    @classmethod
    def get_operators_business_guid(cls, operator_id: UUID) -> UUID:
        from service.data_access_service.user_operator_service import UserOperatorDataAccessService

        approved_admin_users = UserOperatorDataAccessService.get_admin_users(
            operator_id, UserOperator.Statuses.APPROVED
        )
        if not approved_admin_users:
            raise UserError('This operator does not have a business guid yet.')
        # all approved admins will have the same business_guid so we can use first one
        first_approved_admin: User = approved_admin_users.first()  # type: ignore[assignment] # we know this will not be None
        return first_approved_admin.business_guid

    @classmethod
    def get_operators_by_cra_number(cls, cra_business_number: str) -> Operator:
        return Operator.objects.exclude(status=Operator.Statuses.DECLINED).get(cra_business_number=cra_business_number)

    @classmethod
    def get_operators_by_legal_name(cls, legal_name: str) -> QuerySet[Operator]:
        return (
            Operator.objects.exclude(status=Operator.Statuses.DECLINED)
            .filter(legal_name__icontains=legal_name)
            .order_by("legal_name")
        )

    @classmethod
    def update_operator(
        cls,
        operator_id: UUID,
        operator_data: DictStrAny,
    ) -> Operator:
        operator = Operator.objects.get(pk=operator_id)
        update_model_instance(
            operator,
            operator_data.keys(),
            operator_data,
        )
        operator.save()
        return operator

    @classmethod
    def check_operator_has_compliance_reports(cls, operator_id: UUID) -> bool:
        return ComplianceReportVersion.objects.filter(compliance_report__report__operator_id=operator_id).exists()
```

## File: bc_obps/service/data_access_service/opted_in_operation_detail_service.py
```python
from common.lib.dataclasses import asdict
from registration.models.opted_in_operation_detail import OptedInOperationDetail
from registration.utils import update_model_instance
from service.data_types.operation_service import OptedInOperationDetailData


class OptedInOperationDataAccessService:
    @classmethod
    def update_opted_in_operation_detail(
        cls,
        opted_in_operation_detail_id: int,
        opted_in_operation_detail_data: OptedInOperationDetailData,
    ) -> OptedInOperationDetail:
        """
        Updates an existing OptedInOperationDetail instance.
        """
        opted_in_operation_detail = OptedInOperationDetail.objects.get(id=opted_in_operation_detail_id)
        update_dict = asdict(opted_in_operation_detail_data)

        updated_opted_in_operation_detail_instance = update_model_instance(
            opted_in_operation_detail,
            update_dict.keys(),
            update_dict,
        )
        updated_opted_in_operation_detail_instance.save()
        return updated_opted_in_operation_detail_instance

    @classmethod
    def update_opted_in_final_reporting_year(
        cls, opted_in_operation_detail_id: int, final_reporting_year: int | None
    ) -> OptedInOperationDetail:
        """
        Updates the final reporting year of an OptedInOperationDetail instance (for opted-in operations that are opting out).
        If final_reporting_year is None, clears the field.
        """
        opted_in_operation_detail = OptedInOperationDetail.objects.get(id=opted_in_operation_detail_id)
        opted_in_operation_detail.final_reporting_year_id = final_reporting_year
        opted_in_operation_detail.save()
        return opted_in_operation_detail
```

## File: bc_obps/service/data_access_service/parent_operator_service.py
```python
from registration.models.parent_operator import ParentOperator
from registration.models.operator import Operator
from ninja.types import DictStrAny


class ParentOperatorService:
    @classmethod
    def create_or_update(cls, parent_operator_id: int | None, operator: Operator, data: DictStrAny) -> ParentOperator:
        po_operator_instance, _ = ParentOperator.objects.update_or_create(
            # A None pk is the intentional "create" path; django-stubs 6.0 rejects None in lookups.
            pk=parent_operator_id,  # type: ignore[misc]
            defaults={**data, 'child_operator': operator},
        )

        return po_operator_instance
```

## File: bc_obps/service/data_access_service/partner_operator_service.py
```python
from registration.models.operator import Operator
from registration.models.partner_operator import PartnerOperator
from ninja.types import DictStrAny


class PartnerOperatorService:
    @classmethod
    def create_or_update(
        cls, partner_operator_id: int, bc_obps_operator: Operator, data: DictStrAny
    ) -> PartnerOperator:
        partner_operator_instance, _ = PartnerOperator.objects.update_or_create(
            pk=partner_operator_id, defaults={**data, 'bc_obps_operator': bc_obps_operator}
        )

        return partner_operator_instance
```

## File: bc_obps/service/data_access_service/regulated_product_service.py
```python
from typing import Optional
from registration.models import RegulatedProduct
from registration.schema import RegulatedProductSchema
from django.core.cache import cache
from django.db.models import QuerySet
from datetime import date


class RegulatedProductDataAccessService:
    @classmethod
    def get_valid_regulated_products(cls, request_date: date = date.today()) -> QuerySet[RegulatedProduct]:
        cached_data: Optional[QuerySet[RegulatedProduct]] = cache.get("regulated_products")
        if cached_data:
            return cached_data
        else:
            regulated_products = RegulatedProduct.objects.filter(
                valid_from__lte=request_date, valid_to__gte=request_date
            ).only(*RegulatedProductSchema.Meta.fields)
            cache.set("regulated_products", regulated_products, 60 * 60 * 24 * 1)  # 1 day
            return regulated_products
```

## File: bc_obps/service/data_access_service/report_service.py
```python
from uuid import UUID
from reporting.models.report import Report


class ReportDataAccessService:
    @classmethod
    def report_exists(cls, operation_id: UUID, reporting_year: int) -> Report | None:
        return (
            Report.objects.prefetch_related("operation")
            .filter(operation__id=operation_id, reporting_year=reporting_year)
            .first()
        )
```

## File: bc_obps/service/data_access_service/reporting_year.py
```python
from reporting.models.reporting_year import ReportingYear


class ReportingYearDataAccessService:
    @classmethod
    def get_by_year(cls, year: int) -> ReportingYear:
        return ReportingYear.objects.get(reporting_year=year)
```

## File: bc_obps/service/data_access_service/transfer_event_service.py
```python
from uuid import UUID
from registration.models import TransferEvent
from ninja.types import DictStrAny


class TransferEventDataAccessService:
    @classmethod
    def create_transfer_event(
        cls,
        user_guid: UUID,
        transfer_event_data: DictStrAny,
    ) -> TransferEvent:
        return TransferEvent.objects.create(**transfer_event_data, created_by_id=user_guid)

    @classmethod
    def get_by_id(cls, transfer_id: UUID) -> TransferEvent:
        return TransferEvent.objects.get(id=transfer_id)

    @classmethod
    def update_transfer_event(
        cls,
        user_guid: UUID,
        transfer_id: UUID,
        transfer_event_data: DictStrAny,
    ) -> TransferEvent:
        transfer_event = cls.get_by_id(transfer_id)
        for key, value in transfer_event_data.items():
            setattr(transfer_event, key, value)
        transfer_event.save(update_fields=transfer_event_data.keys())
        return transfer_event
```

## File: bc_obps/service/data_access_service/user_operator_service.py
```python
from typing import Optional, Tuple
from uuid import UUID
from service.data_access_service.user_service import UserDataAccessService
from registration.models import Operator, User, UserOperator
from django.db import transaction
from django.db.models import QuerySet


class UserOperatorDataAccessService:
    @classmethod
    def get_user_operator_by_id(cls, user_operator_id: UUID) -> UserOperator:
        return UserOperator.objects.get(id=user_operator_id)

    @classmethod
    def get_admin_users(cls, operator_id: UUID, desired_status: UserOperator.Statuses) -> QuerySet[User]:
        operator = Operator.objects.get(id=operator_id)
        user_operators = UserOperator.objects.filter(
            operator=operator, role=UserOperator.Roles.ADMIN, status=desired_status
        )
        admin_users = User.objects.filter(user_guid__in=user_operators.values('user_id'))

        return admin_users

    @classmethod
    def get_an_operators_user_operators_by_user_guid(cls, user_guid: UUID) -> QuerySet[UserOperator]:
        user_business_guid = UserDataAccessService.get_user_business_guid(user_guid)
        operator = (
            UserOperator.objects.select_related("operator")
            .exclude(status=UserOperator.Statuses.DECLINED)
            .get(user=user_guid)
            .operator
        )
        user_operator_list = UserOperator.objects.select_related("user").filter(
            operator_id=operator.id, user__business_guid=user_business_guid
        )
        return user_operator_list

    @classmethod
    @transaction.atomic()
    def get_or_create_user_operator(cls, user_guid: UUID, operator_id: UUID) -> Tuple[UserOperator, bool]:
        """Function to get or create a user_operator. (Used when an operator already exists. If you need to create a user_operator and operator at the same time, see the user_operator_service.)"""
        user_operator, created = UserOperator.objects.get_or_create(
            user_id=user_guid,
            operator_id=operator_id,
            status=UserOperator.Statuses.PENDING,
            role=UserOperator.Roles.PENDING,
        )

        return user_operator, created

    @classmethod
    def get_approved_user_operator(cls, user: User) -> Optional[UserOperator]:
        """
        Return the approved UserOperator record associated with the user.
        Based on the Constraint, there should only be one UserOperator associated with a user and operator.
        """
        return user.user_operators.only("operator_id").filter(status=UserOperator.Statuses.APPROVED).first()

    @classmethod
    def get_user_operator_requests_for_irc_users(cls) -> QuerySet[UserOperator]:
        # Base query excluding operators with status 'Declined'
        qs = UserOperator.objects.select_related("user", "operator").exclude(status=UserOperator.Statuses.DECLINED)
        return qs
```

## File: bc_obps/service/data_access_service/user_service.py
```python
from typing import Dict
from uuid import UUID
from registration.schema import UserIn, UserUpdateIn
from registration.models import AppRole, Operator, UserOperator, User
from django.db.models import QuerySet
from registration.schema.user import UserUpdateRoleIn


class UserDataAccessService:
    @classmethod
    def get_by_guid(cls, user_guid: UUID, include_archived: bool = False) -> User:
        if include_archived:
            # we need to use _base_manager when we want to retrieve archived records because TimeStampedModelManager's get_queryset only returns non-archived records
            return User._base_manager.get(user_guid=user_guid)
        else:
            return User.objects.get(user_guid=user_guid)

    @classmethod
    def get_user_business_guid(cls, user_guid: UUID) -> UUID:
        return User.objects.get(user_guid=user_guid).business_guid

    @classmethod
    def get_operator_by_user(cls, user_guid: UUID) -> Operator:
        user_operator = UserDataAccessService.get_user_operator_by_user(user_guid)
        return user_operator.operator

    @classmethod
    def get_user_operator_by_user(cls, user_guid: UUID) -> UserOperator:
        user_operator = (
            UserOperator.objects.only("id", "status", "operator__id", "operator__status")
            .exclude(
                status=UserOperator.Statuses.DECLINED
            )  # We exclude declined user_operators because the user may have previously requested access and been declined and therefore have multiple records in the user_operator table
            .select_related("operator")
            .get(user_id=user_guid)
        )
        return user_operator

    @classmethod
    def is_user_an_approved_admin_user_operator(cls, user_guid: UUID) -> Dict[str, bool]:
        approved_user_operator: bool = UserOperator.objects.filter(
            user_id=user_guid, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.APPROVED
        ).exists()
        return {"approved": approved_user_operator}

    @classmethod
    def is_users_user_operator_declined(cls, user_guid: UUID, operator_id: UUID) -> bool:
        is_declined = UserOperator.objects.filter(
            operator_id=operator_id, user_id=user_guid, status=UserOperator.Statuses.DECLINED
        ).exists()
        return is_declined

    @classmethod
    def get_app_role(cls, user_guid: UUID) -> AppRole:
        return User.objects.only('app_role').select_related('app_role').get(user_guid=user_guid).app_role

    @classmethod
    def create_user(cls, user_guid: UUID, role: AppRole, user_data: UserIn) -> User:
        return User.objects.create(
            user_guid=user_guid,
            business_guid=user_data.business_guid,  # type: ignore[attr-defined]
            bceid_business_name=user_data.bceid_business_name,  # type: ignore[attr-defined]
            app_role=role,
            first_name=user_data.first_name,  # type: ignore[attr-defined]
            last_name=user_data.last_name,  # type: ignore[attr-defined]
            email=user_data.email,  # type: ignore[attr-defined]
            position_title=user_data.position_title,  # type: ignore[attr-defined]
            phone_number=user_data.phone_number,  # type: ignore[attr-defined]
        )

    @classmethod
    def update_user(
        cls, user_guid: UUID, updated_data: UserUpdateIn | UserUpdateRoleIn, include_archived: bool = False
    ) -> User:
        user: User = UserDataAccessService.get_by_guid(user_guid, include_archived)
        for attr, value in updated_data.dict().items():
            setattr(user, attr, value)
        user.save()
        return user

    @classmethod
    def user_has_access_to_operator(cls, user_guid: UUID, operator_id: UUID) -> bool:
        user = UserDataAccessService.get_by_guid(user_guid)
        return user.user_operators.filter(operator_id=operator_id, status=UserOperator.Statuses.APPROVED).exists()

    @classmethod
    def get_internal_users_including_archived(cls) -> QuerySet[User]:
        # we need to use _base_manager when we want to retrieve archived records because TimeStampedModelManager's get_queryset only returns non-archived records
        return User._base_manager.all().filter(app_role__role_name__icontains="cas")
```

## File: bc_obps/service/data_access_service/well_authorization_number_service.py
```python
from uuid import UUID
from registration.models import WellAuthorizationNumber


class WellAuthorizationNumberDataAccessService:
    @classmethod
    def create_well_authorization_number(cls, user_guid: UUID, number: int) -> WellAuthorizationNumber:
        well_authorization_number = WellAuthorizationNumber.objects.create(
            well_authorization_number=number,
            created_by_id=user_guid,
        )

        return well_authorization_number
```

## File: bc_obps/service/data_types/operation_service.py
```python
from dataclasses import dataclass
from typing import List, Optional

from django.core.files.uploadedfile import UploadedFile
from registration.models.operation import Operation


@dataclass
class MultipleOperatorData:
    legal_name: str
    trade_name: str
    business_structure_id: str
    cra_business_number: str

    id: Optional[int] = None
    bc_corporate_registry_number: Optional[str] = None
    street_address: Optional[str] = None
    municipality: Optional[str] = None
    province: Optional[str] = None
    postal_code: Optional[str] = None


@dataclass(kw_only=True)  # Allowing for extension with required fields
class OperationData:
    name: str
    type: str
    registration_purpose: Optional[Operation.Purposes] = None
    regulated_products: Optional[List[int]] = None
    activities: Optional[List[int]] = None
    naics_code_id: Optional[int] = None
    secondary_naics_code_id: Optional[int] = None
    tertiary_naics_code_id: Optional[int] = None
    multiple_operators_array: Optional[List[MultipleOperatorData]] = None
    date_of_first_shipment: Optional[str] = None

    # Attachments
    boundary_map: Optional[UploadedFile] = None
    process_flow_diagram: Optional[UploadedFile] = None
    new_entrant_application: Optional[UploadedFile] = None

    def operation_fields(self) -> dict:
        return {
            "name": self.name,
            "type": self.type,
            "naics_code_id": self.naics_code_id,
            "secondary_naics_code_id": self.secondary_naics_code_id,
            "tertiary_naics_code_id": self.tertiary_naics_code_id,
            "date_of_first_shipment": self.date_of_first_shipment,
            "registration_purpose": self.registration_purpose,
        }


@dataclass
class UpdateOperationData(OperationData):
    operation_representatives: List[int]


@dataclass
class OptedInOperationDetailData:
    meets_section_3_emissions_requirements: bool
    meets_electricity_import_operation_criteria: bool
    meets_entire_operation_requirements: bool
    meets_section_6_emissions_requirements: bool
    meets_naics_code_11_22_562_classification_requirements: bool
    meets_producing_gger_schedule_a1_regulated_product: bool
    meets_reporting_and_regulated_obligations: bool
    meets_notification_to_director_on_criteria_change: bool
    final_reporting_year: Optional[int] = None
```

## File: bc_obps/service/email/email_service.py
```python
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, TypedDict, Union
import typing
from uuid import UUID
import logging
import requests
from django.utils import timezone
from common.models import EmailNotification, EmailNotificationTemplate
from django.conf import settings

logger = logging.getLogger(__name__)

SENDER_EMAIL = 'no-reply.cas@gov.bc.ca'
GHG_REGULATOR_EMAIL = 'GHGRegulator@gov.bc.ca'


class Message(TypedDict):
    msgId: str
    tag: str
    to: List[str]


class EmailResponseType(TypedDict):
    messages: List[Message]
    txId: str


class EmailService(object):
    """
    EmailService uses Common Hosted Email Service (CHES) API to enqueue emails for delivery. Uses BC Government-hosted SMTP server to send emails.
    NOTE: Use `email_service = EmailService()` to access the EmailService singleton object in other .py files
    """

    _instance = None
    token: Optional[str]  # Define type for token
    token_expiry: datetime  # Define type for token_expiry
    token_endpoint: str
    api_url: str
    client_id: str
    client_secret: str

    # Singleton pattern to ensure only one instance of EmailService is created
    @typing.no_type_check
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmailService, cls).__new__(cls)
            cls._instance.api_url = settings.CHES_API_URL
            cls._instance.client_id = settings.CHES_CLIENT_ID
            cls._instance.client_secret = settings.CHES_CLIENT_SECRET
            cls._instance.token_endpoint = settings.CHES_TOKEN_ENDPOINT
            cls._instance.token = None
            cls._instance.token_expiry = timezone.now()
            logger.info(
                f'Logger: Initializing EmailService for clientID {cls._instance.client_id} to connect to {cls._instance.api_url}'
            )
        return cls._instance

    def _get_token(self) -> None:
        """
        Every other function within EmailService should begin by calling this function.

        If EmailService() object already has a valid token, no action is taken. Otherwise, will make call
        to {self.token_endpoint} to renew CHES API access_token using credentials
        {self.client_id} and {self.client_secret}. Then updates stored values
        {self.token} and {self.token_expiry}.
        """
        try:
            if not self.token or self.token_expiry < timezone.now():
                response = requests.post(
                    self.token_endpoint,
                    auth=(self.client_id, self.client_secret),
                    data={"grant_type": "client_credentials"},
                    timeout=10,
                )
                if response.status_code == 200:
                    self.token = response.json()["access_token"]
                    self.token_expiry = timezone.now() + timedelta(seconds=response.json()["expires_in"])
                else:
                    logger.error("Logger: Failed to retrieve CHES access token")
        except Exception as exc:
            logger.error(f'Logger: Exception in _get_token {str(exc)}')

    def _make_request(
        self, endpoint: str, method: Optional[str] = 'GET', data: Optional[Any] = None
    ) -> requests.Response:
        """
        Helper function to build and send either GET or POST request to CHES API with appropriate headers.
        """
        headers = {"Authorization": f'Bearer {self.token}'} if self.token else {}
        if method == 'GET':
            response = requests.get(self.api_url + endpoint, headers=headers, timeout=10)
        elif method == 'POST':
            response = requests.post(self.api_url + endpoint, headers=headers, json=data, timeout=10)
        else:
            raise ValueError("Invalid HTTP method")

        return response

    def health_check(self) -> Optional[Any]:
        """
        Retrieves health check data from CHES API.
        Response is a dict with key "dependencies", containing a list of 3 dicts (one for each component).
        For each key name ("database", "queue", and "smtp"), there is a corresponding key "healthy" with True/False.
        """
        self._get_token()
        try:
            response = self._make_request("/health")
            return response.json()
        except Exception as exc:
            logger.error(f'Logger: Exception in /email/health_check {str(exc)}')
            raise

    def get_message_status(self, message_id: UUID) -> Optional[Any]:
        """
        Given a message_id (which is different from a transaction_id), returns the status of the message.

        The CHES API uses these status enums:
        - accepted: email request is valid and has been added to the CHES database
        - pending: the message request is queued in CHES. Queue is usually processed within a few seconds, unless the scheduling feature has been used for the message
        - cancelled: an email that was still in the queue has been cancelled at the client's request
        - completed: the CHES API has dispatched the message to the STMP service. Cannot assert that the email was actually delivered to the recipient(s).
        - failed: the CHES API attempted to dispatch the message to the STMP service but the attempt failed.

        CHES API also provides option to query status by transaction ID rather than message ID. Querying by transaction ID has not been implemented in EmailService.
        """
        self._get_token()
        try:
            response = self._make_request(f'/status/{message_id}')
            return response.json()
        except Exception as exc:
            logger.error(f'Logger: Exception retrieving message status for {message_id} - {str(exc)}')
            raise

    def merge_template_and_send(self, email_template_data: Dict) -> Optional[Any]:
        """
        Given an email template with variables for customized content, CHES API merges the template with the given
        "contexts" (values of variables) and sends each message to the CHES API queue for email delivery. Each "context"
        will be sent out as a separate email.

        Required input data:
            {
                'bodyType': 'text' | 'html',
                'body': str,
                'contexts': [
                    {
                        'context': dict,
                        'to': List[str],
                        'cc': List[str],
                    }
                ],
                'from': str,
                'subject': str,
            }
        See {self.api_url}/docs or email_template fixture in test_email_service.py for examples of how to use contexts.

        Response contains 'txId' (transaction ID) and list of 'msgId's (message IDs), to be used as identifiers when querying message or transaction status.
        """
        self._get_token()
        try:
            response = self._make_request("/emailMerge", method='POST', data=email_template_data)
            return response.json()
        except Exception as exc:
            logger.error(f'Logger: Exception in merging template and sending! - {str(exc)}')
            raise

    def send_email_by_template(
        self,
        template_instance: EmailNotificationTemplate,
        email_context: dict,
        recipients_email: List[str],
        cc_ghg_regulator: bool = True,
    ) -> Optional[EmailResponseType]:
        """
        Sends an email using the provided email template, email context, and recipient email addresses.

        Args:
            template_instance: An instance of the EmailNotificationTemplate class representing the email template.
            email_context: A dictionary containing the context variables to be used in the email template.
            recipients_email: A list of recipient email addresses.
            cc_ghg_regulator: Whether to CC the GHG regulator. Only applies in production environment.

        Returns:
            Optional[dict]: A dictionary containing the response from the email service provider, or None if the email sending fails.
        """
        # Only CC GHG regulator in prod if cc_ghg_regulator is True and not already a recipient
        should_cc_ghg_regulator = all(
            [cc_ghg_regulator, settings.ENVIRONMENT == 'prod', GHG_REGULATOR_EMAIL not in recipients_email]
        )
        cc_emails = [GHG_REGULATOR_EMAIL] if should_cc_ghg_regulator else []

        email_data = {
            'bodyType': 'html',
            'body': template_instance.body,
            'contexts': [
                {
                    'context': email_context,
                    'to': recipients_email,
                    'cc': cc_emails,
                }
            ],
            'from': SENDER_EMAIL,
            'subject': template_instance.subject,
        }
        return self.merge_template_and_send(email_data)

    def create_email_notification_record(
        self,
        transaction_id: Union[UUID, str],
        message_id: Union[UUID, str],
        recipients_email: List[str],
        template_id: int,
    ) -> None:
        """
        Creates a new email notification record in the database.

        Args:
            transaction_id: The ID of the transaction associated with the email notification.
            message_id: The ID of the email message.
            recipients_email: A list of email addresses of the recipients.
            template_id: The ID of the email template.

        Returns:
            None
        """
        EmailNotification.objects.create(
            transaction_id=transaction_id,
            message_id=message_id,
            recipients_email=recipients_email,
            template_id=template_id,
        )
```

## File: bc_obps/service/email/utils.py
```python
class Recipient:
    """
    Represents an email recipient with a full name and email address.
    """

    def __init__(self, full_name: str, email_address: str):
        self.full_name = full_name
        self.email_address = email_address

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Recipient):
            return NotImplemented
        return self.full_name == other.full_name and self.email_address == other.email_address

    def __repr__(self) -> str:
        return f"Recipient(full_name={self.full_name}, email_address={self.email_address})"
```

## File: bc_obps/service/error_service/custom_codes_4xx.py
```python
from ninja.responses import codes_4xx

custom_codes_4xx = codes_4xx | frozenset({422})
```

## File: bc_obps/service/error_service/handle_exception.py
```python
import logging
import os
import traceback
from typing import Union, Optional, Any, Callable
from dataclasses import dataclass
from django.conf import settings
from django.http import HttpRequest
from django.db.utils import InternalError, ProgrammingError, DatabaseError
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from ninja.responses import Response
from sentry_sdk import set_tag, capture_exception, set_user
from compliance.service.bc_carbon_registry.exceptions import BCCarbonRegistryError
from registration.utils import generate_useful_error
from registration.constants import UNAUTHORIZED_MESSAGE
from common.exceptions import UserError
from compliance.service.exceptions import ComplianceInvoiceError
from reporting.service.exceptions import ReportValidationException
from reporting.service.report_validation.report_validation_error import ReportValidationErrorKey, Severity

logger = logging.getLogger(__name__)


@dataclass
class ExceptionResponse:
    message: Optional[Union[str, Callable[[Any], Optional[str]]]]
    status: int
    sentry_tag: Optional[str] = None
    payload_builder: Optional[Callable[[Any], dict[str, Any]]] = None
    key: str = "generic_error"


class ExceptionHandler:
    EXCEPTION_MAP: dict[tuple[type[BaseException], ...], ExceptionResponse] = {
        (BCCarbonRegistryError,): ExceptionResponse(
            "The system cannot connect to the external application. Please try again later. If the problem persists, contact GHGRegulator@gov.bc.ca for help.",
            400,
            "bccr_error",
        ),
        (ComplianceInvoiceError,): ExceptionResponse(
            "An unexpected error occurred while generating your compliance invoice. Please try again, or contact support if the problem persists.",
            400,
            "compliance_invoice_error",
        ),
        # `user_error` is listed in the frontend's NON_REPORTABLE_ERROR_KEYS, so these
        # are shown to the user without being reported to Sentry
        (UserError,): ExceptionResponse(lambda exc: str(exc), 400, key="user_error"),
        (ObjectDoesNotExist,): ExceptionResponse("Not Found", 404),
        (ValidationError,): ExceptionResponse(lambda exc: generate_useful_error(exc), 422),
        (PermissionError,): ExceptionResponse(
            "Permission denied.",
            403,
            key="permission_denied",
        ),
        (InternalError, ProgrammingError, DatabaseError): ExceptionResponse(
            "Internal Server Error.",
            500,
            "internal_server_error",
            key="internal_server_error",
        ),
        (ReportValidationException,): ExceptionResponse(
            None,
            422,
            payload_builder=lambda exc: {
                "errors": [
                    {
                        "key": (
                            e.key.value if isinstance(e.key, ReportValidationErrorKey) else e.key
                        ),  # This could be the actual error key, supporting static or dynamic keys
                        "error": {  # and then there could be a 'type' field, which would be consumed by the frontend to determine how to display the error
                            "severity": e.severity.value if hasattr(e, "severity") else "error",
                            "message": e.message,
                            **(
                                {"context": e.context.model_dump(by_alias=True, exclude_none=True)} if e.context else {}
                            ),
                        },
                    }
                    for k, e in exc.errors.items()
                ]
            },
        ),
    }

    @staticmethod
    def debug_log_exception() -> None:
        """Log exception traceback in debug mode."""
        if not settings.DEBUG and os.environ.get("PYTEST_VERSION") is None:
            return
        print("-" * 48 + "ERROR START" + "-" * 48)
        print(traceback.format_exc())
        print("-" * 48 + "ERROR END" + "-" * 48)

    @staticmethod
    def set_user_context(request: HttpRequest) -> None:
        """Set user context in Sentry from the request."""
        if not settings.ENABLE_SENTRY:
            return

        # Check if current_user is set by middleware
        if hasattr(request, "current_user") and request.current_user:
            user = request.current_user
            set_user(
                {
                    "id": str(user.user_guid),
                }
            )
        else:
            # Clear user context if no user is available
            set_user(None)

    @staticmethod
    def capture_sentry_exception(
        exc: Any, tag: Optional[str] = None, request: Optional[HttpRequest] = None
    ) -> Optional[str]:
        """Capture exception in Sentry."""
        if not settings.ENABLE_SENTRY:
            return None

        # Set user context if request is available
        if request:
            ExceptionHandler.set_user_context(request)

        if tag:
            set_tag(tag, True)

        event_id = capture_exception(exc)

        return event_id

    @classmethod
    def get_response_body(cls, exc: BaseException, response_config: ExceptionResponse) -> dict[str, Any]:
        """Generate response body based on exception and config."""
        if response_config.payload_builder:
            return response_config.payload_builder(exc)

        message = response_config.message
        if callable(message):
            message = message(exc)
        return {"message": message}

    @staticmethod
    def build_error_response_body(message: str, key: str = "generic_error") -> dict[str, Any]:
        return {
            "message": message,
            "errors": [
                {
                    "key": key,
                    "error": {
                        "severity": Severity.ERROR.value,
                        "message": message,
                    },
                }
            ],
        }

    @classmethod
    def handle_mapped_exception(
        cls,
        request: HttpRequest,
        exc: BaseException,
        response_config: ExceptionResponse,
    ) -> Response:
        body = cls.get_response_body(exc, response_config)
        # Handle Sentry for specific cases
        if response_config.sentry_tag:
            event_id = cls.capture_sentry_exception(exc, response_config.sentry_tag, request)
            if event_id:
                body["message"] += f" Reference ID: {event_id}"
                logger.critical(body["message"], exc_info=True)

        if response_config.payload_builder:
            return Response(body, status=response_config.status)

        return Response(
            cls.build_error_response_body(
                body["message"],
                key=response_config.key,
            ),
            status=response_config.status,
        )

    @classmethod
    def handle(cls, request: HttpRequest, exc: Union[BaseException, type[BaseException]]) -> Response:
        """Handle exceptions and return appropriate API response."""
        cls.debug_log_exception()

        # Handle unauthorized access
        if exc.args and exc.args[0] == UNAUTHORIZED_MESSAGE:
            return Response(
                cls.build_error_response_body(UNAUTHORIZED_MESSAGE),
                status=401,
            )

        # Check mapped exceptions
        for exc_types, response_config in cls.EXCEPTION_MAP.items():
            if isinstance(exc, exc_types):
                return cls.handle_mapped_exception(request, exc, response_config)

        # Default: unexpected error
        event_id = cls.capture_sentry_exception(exc, "unexpected_error", request)
        if event_id:
            logger.critical(f"Unexpected error. Sentry Reference ID: {event_id}", exc_info=True)

        message = "An internal server error has occurred. Please contact ghgregulator@gov.bc.ca for help" + (
            f" and include the reference code: {event_id}" if event_id else "."
        )

        return Response(
            cls.build_error_response_body(message),
            status=500,
        )


def handle_exception(request: HttpRequest, exc: Union[BaseException, type[BaseException]]) -> Response:
    """Global exception handler for Django Ninja API."""
    return ExceptionHandler.handle(request, exc)
```

## File: bc_obps/service/pdf/pdf_generator_service.py
```python
import base64
import logging
from pathlib import Path
from typing import Dict, Any, Optional, Tuple, Generator
from django.contrib.staticfiles.storage import staticfiles_storage
from django.template.loader import get_template
from django.template.exceptions import TemplateDoesNotExist
from weasyprint import HTML  # type: ignore

logger = logging.getLogger(__name__)


class PDFGeneratorService:
    """Service for generating PDF documents from HTML templates"""

    CHUNK_SIZE = 64 * 1024

    @classmethod
    def generate_pdf(
        cls,
        template_name: str,
        context: Dict[str, Any],
        filename: str,
        logo_file_name: Optional[str] = None,
    ) -> Tuple[Generator[bytes, None, None], str, int]:
        """
        Generate a PDF document from an HTML template and return a generator that yields chunks of the PDF data.

        Args:
            template_name: Name of the HTML template to use (e.g., 'invoice.html')
            context: Dictionary of context data for the template
            filename: Name of the output PDF file
            logo_file_name: Optional name of a logo file to include as base64 in the context

        Returns:
            Tuple of (PDF data generator, filename, total_size_in_bytes)

        Raises:
            ValueError: If template is not found or PDF generation fails
        """
        if logo_file_name:
            context['logo_base64'] = cls._get_logo_base64(logo_file_name)

        try:
            template = get_template(template_name)
        except TemplateDoesNotExist:
            logger.error(f"Template '{template_name}' not found")
            raise ValueError(f"Failed to generate PDF: template '{template_name}' not found")

        html_string = template.render(context)

        try:
            pdf_file = HTML(string=html_string).write_pdf()
        except Exception as e:
            logger.error(f"Failed to generate PDF: {str(e)}")
            raise ValueError("Failed to generate PDF document")

        total_size = len(pdf_file) if pdf_file else 0

        def pdf_generator() -> Generator[bytes, None, None]:
            for i in range(0, total_size, cls.CHUNK_SIZE):
                yield pdf_file[i : i + cls.CHUNK_SIZE] if pdf_file else b""

        return pdf_generator(), filename, total_size

    @staticmethod
    def _get_logo_base64(static_file_name: str) -> str:
        """
        Convert a static file (e.g., logo) to a base64-encoded string.

        Args:
            static_file_name: Name of the static file (e.g., 'logo.png')

        Returns:
            Base64-encoded string of the file content, or empty string if file not found
        """
        try:
            logo_path = Path(staticfiles_storage.path(static_file_name))
            if not logo_path.exists():
                logger.warning(f"Static file '{static_file_name}' not found at {logo_path}")
                return ""
            with open(logo_path, 'rb') as f:
                return base64.b64encode(f.read()).decode('utf-8')
        except Exception as e:
            logger.error(f"Failed to load static file '{static_file_name}': {str(e)}")
            return ""
```

## File: bc_obps/service/tests/data_access_service/test_data_access_contact_service.py
```python
from typing import List
import pytest
from registration.models.app_role import AppRole
from registration.models.contact import Contact
from registration.tests.utils.bakers import (
    contact_baker,
    operator_baker,
    user_baker,
    user_operator_baker,
)
from registration.models.user_operator import UserOperator
from model_bakery import baker
from service.data_access_service.contact_service import ContactDataAccessService

pytestmark = pytest.mark.django_db


class TestDataAccessContactService:
    @staticmethod
    def test_list_contacts_for_irc_user():
        baker.make_recipe('registration.tests.utils.contact', _quantity=10)
        user = baker.make_recipe('registration.tests.utils.cas_admin')
        assert ContactDataAccessService.get_all_contacts_for_user(user).count() == 10

    @staticmethod
    def test_list_contacts_for_industry_user():
        industry_user = user_baker({'app_role': AppRole.objects.get(role_name='industry_user')})
        # Generating 10 operations for the industry user and assigning contacts to them
        users_operator = operator_baker()
        users_contacts: List[Contact] = contact_baker(_quantity=10)
        users_operator.contacts.set(users_contacts)
        # Approved user operator for industry user
        user_operator_baker(
            {"user": industry_user, "operator": users_operator, "status": UserOperator.Statuses.APPROVED}
        )

        # Generating 10 operations for a random user and assigning contacts to them
        random_contacts: List[Contact] = contact_baker(_quantity=10)
        random_operator = operator_baker()
        random_operator.contacts.set(random_contacts)

        industry_user_contacts = ContactDataAccessService.get_all_contacts_for_user(industry_user)
        assert Contact.objects.count() == 20
        assert industry_user_contacts.count() == 10
        # make sure user's contacts are only from their operations
        assert all(contact in users_contacts for contact in industry_user_contacts)

    @staticmethod
    def test_user_has_access():
        user = user_baker()
        contact = contact_baker()
        operator = operator_baker()
        operator.contacts.set([contact])
        user_operator_baker({"user": user, "operator": operator, "status": UserOperator.Statuses.APPROVED})
        assert ContactDataAccessService.user_has_access(user.user_guid, contact.id)

    @staticmethod
    def test_get_contact_for_internal_user_returns_none():
        internal_user = user_baker({'app_role': AppRole.objects.get(role_name='cas_analyst')})
        assert ContactDataAccessService.get_contact_for_user(internal_user) is None

    @staticmethod
    def test_get_contact_for_industry_user_by_unique_email_returns_contact():
        industry_user = user_baker(
            {
                'app_role': AppRole.objects.get(role_name='industry_user'),
                'first_name': 'Mickey',
                'last_name': 'Mouse',
                'email': 'mickey.mouse@email.com',
            }
        )
        users_operator = operator_baker()
        random_contacts: List[Contact] = contact_baker(_quantity=10)
        # make a contact with the same name & email address as the user
        user_contact: Contact = contact_baker(first_name='Mickey', last_name='Mouse', email='mickey.mouse@email.com')
        users_operator.contacts.set([*random_contacts, user_contact])
        user_operator_baker(
            {"user": industry_user, "operator": users_operator, "status": UserOperator.Statuses.APPROVED}
        )
        contact = ContactDataAccessService.get_contact_for_user(industry_user)
        assert contact.email == 'mickey.mouse@email.com'
        assert contact.first_name == 'Mickey'
        assert contact.last_name == 'Mouse'

    @staticmethod
    def test_get_contact_for_industry_user_by_name_returns_contact():
        industry_user = user_baker(
            {
                'app_role': AppRole.objects.get(role_name='industry_user'),
                'first_name': 'Mickey',
                'last_name': 'Mouse',
                'email': 'mickey.mouse@email.com',
            }
        )
        users_operator = operator_baker()
        random_contacts: List[Contact] = contact_baker(_quantity=10)
        # make a contact with the same name as the user but a different email address
        # (mimics possible scenario where user changes their contact email address to be different
        # from the email address they've used for their BCeID account)
        user_contact: Contact = contact_baker(
            first_name='Mickey', last_name='Mouse', email='some.other.address@email.com'
        )
        users_operator.contacts.set([*random_contacts, user_contact])
        user_operator_baker(
            {"user": industry_user, "operator": users_operator, "status": UserOperator.Statuses.APPROVED}
        )
        contact = ContactDataAccessService.get_contact_for_user(industry_user)
        assert contact.first_name == 'Mickey'
        assert contact.last_name == 'Mouse'

    @staticmethod
    def test_get_contact_for_industry_user_returns_none_when_multiple_contacts_match():
        industry_user = user_baker(
            {
                'app_role': AppRole.objects.get(role_name='industry_user'),
                'first_name': 'Donald',
                'last_name': 'Duck',
                'email': 'donald@email.com',
            }
        )
        users_operator = operator_baker()
        multiple_duplicate_contacts: List[Contact] = contact_baker(_quantity=10, first_name='Donald', last_name='Duck')
        users_operator.contacts.set(multiple_duplicate_contacts)
        user_operator_baker(
            {"user": industry_user, "operator": users_operator, "status": UserOperator.Statuses.APPROVED}
        )
        retrieve_donald_contact = ContactDataAccessService.get_contact_for_user(industry_user)
        # there are no user_operator contacts with the same email address as the user, and
        # multiple user_operator contacts with the same name as the industry_user,
        # so the service shouldn't return any of them
        assert retrieve_donald_contact is None
```

## File: bc_obps/service/tests/data_access_service/test_data_access_fuel_service.py
```python
import pytest
from reporting.models import FuelType
from service.data_access_service.fuel_service import FuelTypeDataAccessService

pytestmark = pytest.mark.django_db


class TestDataAccessFacilityService:
    @staticmethod
    def test_get_fuels():
        assert FuelTypeDataAccessService.get_fuels().count() == FuelType.objects.all().count()

    @staticmethod
    def test_get_fuel():
        returned_fuel = FuelTypeDataAccessService.get_fuel('Acetylene')
        assert returned_fuel.name == 'Acetylene'
        assert returned_fuel.unit == 'Sm^3'
        assert returned_fuel.classification == 'Exempted Non-biomass'
```

## File: bc_obps/service/tests/data_access_service/test_data_access_operation_designated_operator_timeline.py
```python
from registration.models.operation import Operation
from service.data_access_service.operation_designated_operator_timeline_service import (
    OperationDesignatedOperatorTimelineDataAccessService,
)
import pytest
from model_bakery import baker
from registration.constants import UNAUTHORIZED_MESSAGE

pytestmark = pytest.mark.django_db


class TestDataAccessOperationDesignatedOperatorTimelineService:
    @staticmethod
    def test_unapproved_user_exception():
        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            OperationDesignatedOperatorTimelineDataAccessService.get_operation_timeline_for_user(
                baker.make_recipe('registration.tests.utils.industry_operator_user')
            )

    @staticmethod
    def test_get_current_operations_for_industry_user():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')

        # simulating a transferred operation - should not be returned
        baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            end_date="2024-12-25 01:00:00-08",
            operator=approved_user_operator.operator,
        )

        # active, registered operations
        registered_operations = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            status=Operation.Statuses.REGISTERED,
            _quantity=20,
        )
        for operation in registered_operations:
            baker.make_recipe(
                'registration.tests.utils.operation_designated_operator_timeline',
                operation=operation,
                operator=approved_user_operator.operator,
                end_date=None,
            )

        # someone else's operations - should not be returned
        baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            _quantity=5,
        )

        timeline = OperationDesignatedOperatorTimelineDataAccessService.get_operation_timeline_for_user(
            approved_user_operator.user
        )

        assert timeline.count() == 20

    @staticmethod
    def test_get_current_and_previous_operations_for_industry_user():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')

        # simulating a transferred operation - should be returned
        baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            end_date="2024-12-25 01:00:00-08",
            operator=approved_user_operator.operator,
        )

        # active, registered operations
        registered_operations = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            status=Operation.Statuses.REGISTERED,
            _quantity=20,
        )
        for operation in registered_operations:
            baker.make_recipe(
                'registration.tests.utils.operation_designated_operator_timeline',
                operation=operation,
                operator=approved_user_operator.operator,
                end_date=None,
            )

        # someone else's operations - should not be returned
        baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            _quantity=5,
        )

        timeline = OperationDesignatedOperatorTimelineDataAccessService.get_operation_timeline_for_user(
            approved_user_operator.user, False
        )

        assert timeline.count() == 21

    @staticmethod
    def test_get_current_operations_for_internal_user():
        # non-registered operation - should be returned
        baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operation=baker.make_recipe(
                'registration.tests.utils.operation',
                status=Operation.Statuses.DRAFT,
            ),
            end_date=None,
        )

        # transferred operation - should not be returned, has an end date
        baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operation=baker.make_recipe(
                'registration.tests.utils.operation',
                status=Operation.Statuses.REGISTERED,
            ),
            end_date="2024-02-27 01:46:20.789146+00:00",
        )

        # active operations
        registered_operations = baker.make_recipe(
            'registration.tests.utils.operation', status=Operation.Statuses.REGISTERED, _quantity=20
        )
        for operation in registered_operations:
            baker.make_recipe(
                'registration.tests.utils.operation_designated_operator_timeline',
                operation=operation,
                end_date=None,
            )

        timeline = OperationDesignatedOperatorTimelineDataAccessService.get_operation_timeline_for_user(
            baker.make_recipe('registration.tests.utils.cas_admin')
        )

        assert timeline.count() == 21

    @staticmethod
    def test_get_previously_owned_operations_by_operator():

        operator = baker.make_recipe('registration.tests.utils.operator')

        # transferred operation
        xferred_operation = baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operation=baker.make_recipe('registration.tests.utils.operation', status=Operation.Statuses.REGISTERED),
            end_date="2024-02-27 01:46:20.789146+00:00",
            operator=operator,
        )

        # active operation - should not be returned
        baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operation=baker.make_recipe(
                'registration.tests.utils.operation', status=Operation.Statuses.REGISTERED, operator=operator
            ),
            end_date=None,
        )

        result = OperationDesignatedOperatorTimelineDataAccessService.get_previously_owned_operations_by_operator(
            operator_id=operator.id
        )
        assert result.count() == 1
        assert result.first().operation == xferred_operation.operation
```

## File: bc_obps/service/tests/data_access_service/test_data_access_opted_in_operation_detail_service.py
```python
import pytest
from service.data_access_service.opted_in_operation_detail_service import OptedInOperationDataAccessService
from registration.models.operation import Operation
from registration.models.opted_in_operation_detail import OptedInOperationDetail
from model_bakery import baker
from service.data_types.operation_service import OptedInOperationDetailData

pytestmark = pytest.mark.django_db


class TestDataAccessOptedInOperationService:
    @staticmethod
    def test_update_opted_in_operation_detail():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        users_operation = baker.make_recipe(
            'registration.tests.utils.operation',
            registration_purpose=Operation.Purposes.OPTED_IN_OPERATION,
            opted_in_operation=baker.make_recipe('registration.tests.utils.opted_in_operation_detail'),
            operator=approved_user_operator.operator,
        )

        opted_in_operation_detail_payload = OptedInOperationDetailData(
            meets_section_3_emissions_requirements=False,
            meets_electricity_import_operation_criteria=True,
            meets_entire_operation_requirements=True,
            # changing section_6 value from True in opted_in_operation_detail baker recipe
            meets_section_6_emissions_requirements=False,
            meets_naics_code_11_22_562_classification_requirements=True,
            meets_producing_gger_schedule_a1_regulated_product=False,
            meets_reporting_and_regulated_obligations=False,
            meets_notification_to_director_on_criteria_change=False,
        )
        opted_in_operation_detail = OptedInOperationDataAccessService.update_opted_in_operation_detail(
            users_operation.opted_in_operation.id,
            opted_in_operation_detail_payload,
        )
        users_operation.refresh_from_db()
        assert opted_in_operation_detail.id == users_operation.opted_in_operation.id
        assert OptedInOperationDetail.objects.count() == 1
        assert users_operation.opted_in_operation is not None
        assert users_operation.opted_in_operation.meets_section_3_emissions_requirements is False
        assert users_operation.opted_in_operation.meets_electricity_import_operation_criteria is True
        assert users_operation.opted_in_operation.meets_entire_operation_requirements is True
        assert users_operation.opted_in_operation.meets_section_6_emissions_requirements is False
        assert users_operation.opted_in_operation.meets_naics_code_11_22_562_classification_requirements is True
        assert users_operation.opted_in_operation.meets_producing_gger_schedule_a1_regulated_product is False
        assert users_operation.opted_in_operation.meets_reporting_and_regulated_obligations is False
        assert users_operation.opted_in_operation.meets_notification_to_director_on_criteria_change is False
        assert users_operation.opted_in_operation.updated_at is not None
```

## File: bc_obps/service/tests/data_access_service/test_data_access_report_service.py
```python
from django.test import TestCase
from registration.tests.utils.bakers import operation_baker
from reporting.tests.utils.bakers import report_baker, reporting_year_baker


class TestDataAccessReportService(TestCase):
    def test_report_exists(self):
        from service.data_access_service.report_service import ReportDataAccessService

        operation = operation_baker()
        reporting_year = reporting_year_baker(reporting_year=1998)

        self.assertIsNone(
            ReportDataAccessService.report_exists(operation_id=operation.id, reporting_year=1998),
            "Returns None if there is no report for that operation and year",
        )
        report = report_baker(operation=operation, reporting_year=reporting_year)

        self.assertIsNone(
            ReportDataAccessService.report_exists(
                operation_id="00000000-00000000-00000000-00000000", reporting_year=1998
            ),
            "Returns None if the uuid doesn't point to the existing report",
        )
        self.assertIsNone(
            ReportDataAccessService.report_exists(operation_id=operation.id, reporting_year=1999),
            "Returns None if there is no report for the year that was passed in",
        )
        self.assertTrue(
            ReportDataAccessService.report_exists(operation_id=operation.id, reporting_year=1998),
            "Returns a truthy value if the report exists",
        )
        self.assertEqual(
            ReportDataAccessService.report_exists(operation_id=operation.id, reporting_year=1998),
            report,
            "Returns the existing report that was found for that operation and year",
        )
```

## File: bc_obps/service/tests/data_access_service/test_data_access_user_operator_service.py
```python
from itertools import cycle

import pytest
from model_bakery import baker
from registration.models.user_operator import UserOperator
from service.data_access_service.user_operator_service import UserOperatorDataAccessService

pytestmark = pytest.mark.django_db


class TestDataAccessUserOperatorService:
    @staticmethod
    def test_get_user_operator_requests_for_irc_users():

        # Declined user_operator (should not be included in results)
        baker.make_recipe(
            'registration.tests.utils.user_operator',
            user=cycle(baker.make_recipe('registration.tests.utils.industry_operator_user', _quantity=5)),
            role=UserOperator.Roles.PENDING,
            status=UserOperator.Statuses.DECLINED,
            _quantity=5,
        )

        # Approved admin user operators (should be included in final result)
        baker.make_recipe(
            'registration.tests.utils.user_operator',
            user=cycle(baker.make_recipe('registration.tests.utils.industry_operator_user', _quantity=5)),
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
            _quantity=5,
        )

        # Approved reporter user operators (should be included in final result)
        baker.make_recipe(
            'registration.tests.utils.user_operator',
            user=cycle(baker.make_recipe('registration.tests.utils.industry_operator_user', _quantity=5)),
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
            _quantity=5,
        )

        # Pending user operators (should be included in final result)

        baker.make_recipe(
            'registration.tests.utils.user_operator',
            user=cycle(baker.make_recipe('registration.tests.utils.industry_operator_user', _quantity=5)),
            role=UserOperator.Roles.PENDING,
            status=UserOperator.Statuses.PENDING,
            _quantity=5,
        )

        # Run the service method under test
        user_operator_requests = UserOperatorDataAccessService.get_user_operator_requests_for_irc_users()

        # Assertions
        expected_valid_count = 15
        assert (
            len(user_operator_requests) == expected_valid_count
        ), f"Expected {expected_valid_count} user operators, but got {len(user_operator_requests)}."
```

## File: bc_obps/service/tests/data_access_service/test_data_access_user_service.py
```python
import pytest
from model_bakery import baker
from django.utils import timezone
from service.data_access_service.user_service import UserDataAccessService

pytestmark = pytest.mark.django_db


class TestDataAccessUserService:
    @staticmethod
    def test_get_by_guid():
        cas_admin = baker.make_recipe('registration.tests.utils.cas_admin')

        assert UserDataAccessService.get_by_guid(cas_admin.user_guid).email == cas_admin.email

    @staticmethod
    def test_get_by_guid_skip_archived():
        # archiving user
        cas_admin = baker.make_recipe('registration.tests.utils.cas_admin')
        # archived internal user
        archived_user = baker.make_recipe(
            'registration.tests.utils.cas_director', archived_at=timezone.now(), archived_by=cas_admin
        )

        with pytest.raises(BaseException, match='User matching query does not exist.'):
            UserDataAccessService.get_by_guid(archived_user.user_guid)

    @staticmethod
    def test_get_by_guid_include_archived():
        # archiving user
        cas_admin = baker.make_recipe('registration.tests.utils.cas_admin')
        # archived internal user
        archived_user = baker.make_recipe(
            'registration.tests.utils.cas_director', archived_at=timezone.now(), archived_by=cas_admin
        )
        assert UserDataAccessService.get_by_guid(archived_user.user_guid, True).email == archived_user.email

    @staticmethod
    def test_get_internal_users_including_archived():

        # internal user
        cas_admin = baker.make_recipe('registration.tests.utils.cas_admin')
        # archived internal user
        baker.make_recipe('registration.tests.utils.cas_director', archived_at=timezone.now(), archived_by=cas_admin)
        # external user - should not be included in results
        baker.make_recipe('registration.tests.utils.industry_operator_user')
        # archived external user - should not be included in results
        baker.make_recipe(
            'registration.tests.utils.industry_operator_user', archived_at=timezone.now(), archived_by=cas_admin
        )

        assert UserDataAccessService.get_internal_users_including_archived().count() == 2
```

## File: bc_obps/service/tests/error_service/test_handle_exception.py
```python
import json
from unittest.mock import patch

import pytest
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db.utils import DatabaseError, InternalError, ProgrammingError
from django.http import HttpRequest
from ninja.responses import Response

from common.exceptions import UserError
from compliance.service.bc_carbon_registry.exceptions import BCCarbonRegistryError
from compliance.service.exceptions import ComplianceInvoiceError
from registration.constants import UNAUTHORIZED_MESSAGE
from reporting.service.exceptions import ReportValidationException
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
    Severity,
)
from service.error_service.handle_exception import (
    ExceptionHandler,
    ExceptionResponse,
    handle_exception,
)


@pytest.fixture
def mock_request():
    return HttpRequest()


@pytest.fixture
def mock_settings():
    with patch("service.error_service.handle_exception.settings") as mock:
        mock.DEBUG = True
        mock.ENABLE_SENTRY = True
        mock.ENABLE_BETTERSTACK = False
        yield mock


def response_body(response):
    return json.loads(response.content)


class TestExceptionHandler:
    def test_build_error_response_body(self):
        body = ExceptionHandler.build_error_response_body("Test error")

        assert body == {
            "message": "Test error",
            "errors": [
                {
                    "key": "generic_error",
                    "error": {
                        "severity": "Error",
                        "message": "Test error",
                    },
                }
            ],
        }

    def test_debug_log_exception_debug_true(self, mock_settings, capsys):
        ExceptionHandler.debug_log_exception()
        captured = capsys.readouterr()
        assert "ERROR START" in captured.out
        assert "ERROR END" in captured.out

    @patch("service.error_service.handle_exception.os")
    def test_debug_log_exception_debug_false(self, mock_os, mock_settings, capsys):
        mock_settings.DEBUG = False
        mock_os.environ = {"PYTEST_VERSION": None}

        ExceptionHandler.debug_log_exception()

        captured = capsys.readouterr()
        assert captured.out == ""

    @patch("service.error_service.handle_exception.capture_exception", return_value="12345")
    @patch("service.error_service.handle_exception.set_tag")
    def test_capture_sentry_exception_prod(self, mock_set_tag, mock_capture, mock_settings):
        exc = Exception("Test")

        event_id = ExceptionHandler.capture_sentry_exception(exc, "test_tag")

        mock_set_tag.assert_called_once_with("test_tag", True)
        mock_capture.assert_called_once_with(exc)
        assert event_id == "12345"

    def test_capture_sentry_exception_disabled(self, mock_settings):
        mock_settings.ENABLE_SENTRY = False
        mock_settings.ENABLE_BETTERSTACK = False

        result = ExceptionHandler.capture_sentry_exception(Exception("Test"), "test_tag")

        assert result is None

    def test_get_response_body_string_message(self):
        exc = Exception("Test")
        config = ExceptionResponse("Static message", 400)

        body = ExceptionHandler.get_response_body(exc, config)

        assert body == {"message": "Static message"}

    def test_get_response_body_callable_message(self):
        exc = Exception("Test")
        config = ExceptionResponse(lambda e: str(e), 400)

        body = ExceptionHandler.get_response_body(exc, config)

        assert body == {"message": "Test"}

    def test_handle_unauthorized(self, mock_request):
        exc = Exception(UNAUTHORIZED_MESSAGE)

        response = ExceptionHandler.handle(mock_request, exc)
        body = response_body(response)

        assert response.status_code == 401
        assert body["message"] == UNAUTHORIZED_MESSAGE

    @patch(
        "service.error_service.handle_exception.generate_useful_error",
        return_value="Validation error",
    )
    def test_handle_validation_error(self, mock_generate_error, mock_request):
        exc = ValidationError("Invalid")

        response = ExceptionHandler.handle(mock_request, exc)
        body = response_body(response)

        assert response.status_code == 422
        assert body["message"] == "Validation error"

    @patch(
        "service.error_service.handle_exception.ExceptionHandler.capture_sentry_exception",
        return_value="12345",
    )
    @patch("service.error_service.handle_exception.logger.critical")
    @pytest.mark.parametrize(
        "exception_type,exception_message",
        [
            (InternalError, "DB error"),
            (ProgrammingError, "Programming error"),
            (DatabaseError, "Database error"),
        ],
    )
    def test_handle_database_errors(
        self,
        mock_logger,
        mock_capture,
        mock_request,
        exception_type,
        exception_message,
    ):
        exc = exception_type(exception_message)

        response = ExceptionHandler.handle(mock_request, exc)
        body = response_body(response)

        assert response.status_code == 500
        assert body["message"].startswith("Internal Server Error.")
        assert "Reference ID: 12345" in body["message"]
        mock_logger.assert_called()

    @patch(
        "service.error_service.handle_exception.ExceptionHandler.capture_sentry_exception",
        return_value="67890",
    )
    @patch("service.error_service.handle_exception.logger.critical")
    def test_handle_unexpected_error(self, mock_logger, mock_capture, mock_request):
        exc = Exception("Unexpected")

        response = ExceptionHandler.handle(mock_request, exc)
        body = response_body(response)

        assert response.status_code == 500
        assert body["message"] == (
            "An internal server error has occurred. "
            "Please contact ghgregulator@gov.bc.ca for help "
            "and include the reference code: 67890"
        )
        mock_logger.assert_called_with(
            "Unexpected error. Sentry Reference ID: 67890",
            exc_info=True,
        )

    def test_handle_object_does_not_exist(self, mock_request):
        exc = ObjectDoesNotExist("Not found")

        response = ExceptionHandler.handle(mock_request, exc)
        body = response_body(response)

        assert response.status_code == 404
        assert body["message"] == "Not Found"

    def test_handle_user_error(self, mock_request):
        exc = UserError("User error")

        response = ExceptionHandler.handle(mock_request, exc)
        body = response_body(response)

        assert response.status_code == 400
        assert body["message"] == "User error"
        assert body["errors"][0]["key"] == "user_error"

    def test_handle_permission_error(self, mock_request):
        exc = PermissionError("No permission")

        response = ExceptionHandler.handle(mock_request, exc)
        body = response_body(response)

        assert response.status_code == 403
        assert body["message"] == "Permission denied."

    def test_handle_bc_carbon_registry_error(self, mock_request):
        exc = BCCarbonRegistryError("BC Carbon Registry error")

        response = ExceptionHandler.handle(mock_request, exc)
        body = response_body(response)

        expected_message = (
            "The system cannot connect to the external application. "
            "Please try again later. If the problem persists, "
            "contact GHGRegulator@gov.bc.ca for help."
        )

        assert response.status_code == 400
        assert body["message"] == expected_message

    def test_handle_compliance_invoice_error(self, mock_request):
        exc = ComplianceInvoiceError("missing_data", "Required invoice data is missing")

        response = ExceptionHandler.handle(mock_request, exc)
        body = response_body(response)

        expected_message = (
            "An unexpected error occurred while generating your compliance invoice. "
            "Please try again, or contact support if the problem persists."
        )

        assert response.status_code == 400
        assert body["message"] == expected_message

    def test_handle_report_validation_exception(self, mock_request):
        errors = {
            "emission_summary": ReportValidationError(
                severity=Severity.ERROR,
                message="Emission summary is incomplete",
                key="emission_summary",
            ),
            "facility_report": ReportValidationError(
                severity=Severity.WARNING,
                message="Facility report has warnings",
                key="facility_report",
            ),
        }
        exc = ReportValidationException(errors)

        response = ExceptionHandler.handle(mock_request, exc)
        body = response_body(response)

        assert response.status_code == 422
        assert body == {
            "errors": [
                {
                    "key": "emission_summary",
                    "error": {
                        "severity": "Error",
                        "message": "Emission summary is incomplete",
                    },
                },
                {
                    "key": "facility_report",
                    "error": {
                        "severity": "Warning",
                        "message": "Facility report has warnings",
                    },
                },
            ]
        }


def test_global_handle_exception(mock_request):
    exc = Exception("Test")

    with patch.object(
        ExceptionHandler,
        "handle",
        return_value=Response({"message": "Test"}, status=400),
    ) as mock_handle:
        response = handle_exception(mock_request, exc)

    mock_handle.assert_called_once_with(mock_request, exc)
    assert response.status_code == 400
    assert response_body(response) == {"message": "Test"}
```

## File: bc_obps/service/tests/operation_service/test_operation_service_bcghgid.py
```python
from model_bakery import baker
import pytest
from registration.constants import UNAUTHORIZED_MESSAGE
from registration.models.bc_greenhouse_gas_id import BcGreenhouseGasId
from registration.models.operation import Operation
from service.operation_service import OperationService

pytestmark = pytest.mark.django_db


class TestManageBCGHGId:
    @staticmethod
    def test_raise_exception_if_user_not_cas_director():
        cas_analyst = baker.make_recipe('registration.tests.utils.cas_analyst')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            status=Operation.Statuses.REGISTERED,
        )
        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            OperationService.generate_bcghg_id(cas_analyst.user_guid, operation.id)

    @staticmethod
    def test_generate_bcghg_id_for_sfo():
        operator = baker.make_recipe('registration.tests.utils.operator')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=operator,
            status=Operation.Statuses.REGISTERED,
            type=Operation.Types.SFO,
        )
        facility = baker.make_recipe(
            'registration.tests.utils.facility',
            operation=operation,
        )
        cas_director = baker.make_recipe('registration.tests.utils.cas_director')

        OperationService.generate_bcghg_id(cas_director.user_guid, operation.id)
        operation.refresh_from_db()
        facility.refresh_from_db()

        assert operation.bcghg_id is not None
        assert operation.bcghg_id.issued_by == cas_director
        assert facility.bcghg_id == operation.bcghg_id
        assert facility.bcghg_id.issued_by == cas_director

    @staticmethod
    def test_generate_bcghg_id_for_lfo():
        operator = baker.make_recipe('registration.tests.utils.operator')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=operator,
            status=Operation.Statuses.REGISTERED,
            type=Operation.Types.LFO,
        )
        facility = baker.make_recipe(
            'registration.tests.utils.facility',
            operation=operation,
        )
        cas_director = baker.make_recipe('registration.tests.utils.cas_director')

        OperationService.generate_bcghg_id(cas_director.user_guid, operation.id)
        operation.refresh_from_db()
        facility.refresh_from_db()

        assert operation.bcghg_id is not None
        assert operation.bcghg_id.issued_by == cas_director
        assert facility.bcghg_id is None

    def test_generate_bcghg_id_with_manual_id_success(self):
        """Test generating BCGHG ID with manually provided ID"""
        cas_director = baker.make_recipe('registration.tests.utils.cas_director')
        operation = baker.make_recipe('registration.tests.utils.operation', status=Operation.Statuses.REGISTERED)
        baker.make_recipe('registration.tests.utils.facility', operation=operation)

        manual_bcghg_id = "11234567890"

        result = OperationService.generate_bcghg_id(cas_director.user_guid, operation.id, manual_bcghg_id)

        assert result.id == manual_bcghg_id
        assert result.issued_by_id == cas_director.user_guid
        assert result.comments == 'bcghg id manually set to operation'

        operation.refresh_from_db()
        assert operation.bcghg_id.id == manual_bcghg_id

    def test_generate_bcghg_id_with_existing_manual_id(self):
        """Test using an existing manually set BCGHG ID"""
        cas_director = baker.make_recipe('registration.tests.utils.cas_director')
        operation = baker.make_recipe('registration.tests.utils.operation', status=Operation.Statuses.REGISTERED)
        baker.make_recipe('registration.tests.utils.facility', operation=operation)

        existing_bcghg_id = "11234560000"

        # Create existing BCGHG ID
        BcGreenhouseGasId.objects.create(id=existing_bcghg_id, issued_by_id=cas_director.user_guid, comments='test')

        result = OperationService.generate_bcghg_id(cas_director.user_guid, operation.id, existing_bcghg_id)

        assert result.id == existing_bcghg_id

        operation.refresh_from_db()
        assert operation.bcghg_id.id == existing_bcghg_id

    def test_generate_bcghg_id_sfo_with_manual_id_updates_facility(self):
        """Test that SFO facilities get the manually set BCGHG ID"""
        cas_director = baker.make_recipe('registration.tests.utils.cas_director')
        operation = baker.make_recipe(
            'registration.tests.utils.operation', status=Operation.Statuses.REGISTERED, type=Operation.Types.SFO
        )
        facility = baker.make_recipe('registration.tests.utils.facility', operation=operation)
        manual_bcghg_id = "11234567890"

        result = OperationService.generate_bcghg_id(cas_director.user_guid, operation.id, manual_bcghg_id)

        facility.refresh_from_db()
        operation.refresh_from_db()

        assert operation.bcghg_id.id == manual_bcghg_id
        assert facility.bcghg_id.id == manual_bcghg_id
        assert result.id == manual_bcghg_id

    def test_generate_bcghg_id_lfo_with_manual_id_does_not_update_facility(self):
        """Test that LFO facilities get the manually set BCGHG ID"""
        cas_director = baker.make_recipe('registration.tests.utils.cas_director')
        operation = baker.make_recipe(
            'registration.tests.utils.operation', status=Operation.Statuses.REGISTERED, type=Operation.Types.LFO
        )
        facility = baker.make_recipe('registration.tests.utils.facility', operation=operation)
        manual_bcghg_id = "11234567890"

        result = OperationService.generate_bcghg_id(cas_director.user_guid, operation.id, manual_bcghg_id)

        facility.refresh_from_db()
        operation.refresh_from_db()

        assert operation.bcghg_id.id == manual_bcghg_id
        assert facility.bcghg_id is None
        assert result.id == manual_bcghg_id

    def test_generate_bcghg_id_manual_id_unauthorized_user_raises_exception(self):
        """Test that non-CAS director cannot manually set BCGHG ID"""
        industry_user = baker.make_recipe('registration.tests.utils.industry_operator_user')
        operation = baker.make_recipe('registration.tests.utils.operation', status=Operation.Statuses.REGISTERED)

        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            OperationService.generate_bcghg_id(industry_user.user_guid, operation.id, "11111111111")

    def test_clear_bcghg_id(self):
        """Test clearing BCGHG ID for an operation"""
        cas_director = baker.make_recipe('registration.tests.utils.cas_director')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            status=Operation.Statuses.REGISTERED,
            bcghg_id=baker.make_recipe(
                'registration.tests.utils.bcghg_id',
                issued_by=cas_director,
            ),
        )

        OperationService.clear_bcghg_id(cas_director.user_guid, operation.id)
        operation.refresh_from_db()

        assert operation.bcghg_id is None
```

## File: bc_obps/service/tests/operation_service/test_operation_service.py
```python
from datetime import timedelta
import os
from unittest.mock import patch, MagicMock
from django.test import override_settings
import pytest
from common.lib import pgtrigger
from uuid import uuid4
from django.utils import timezone
from registration.models.facility import Facility
from registration.models.contact import Contact
from registration.models.bc_greenhouse_gas_id import BcGreenhouseGasId
from registration.models.facility_designated_operation_timeline import FacilityDesignatedOperationTimeline
from registration.models.document_type import DocumentType
from registration.models.document import Document
from registration.models.activity import Activity
from registration.models.business_role import BusinessRole
from registration.models.opted_in_operation_detail import OptedInOperationDetail
from registration.constants import UNAUTHORIZED_MESSAGE
from registration.models.address import Address
from registration.models.bc_obps_regulated_operation import BcObpsRegulatedOperation
from registration.schema import (
    FacilityIn,
    OperationRepresentativeIn,
    OperationTimelineFilterSchema,
)
from registration.enums.enums import EmailTemplateNames
from service.data_access_service.operation_service import OperationDataAccessService
from service.data_access_service.operator_service import OperatorDataAccessService
from service.data_types.operation_service import MultipleOperatorData, OperationData, UpdateOperationData
from service.operation_service import OperationService
from service.email.email_service import EmailService
from registration.models.multiple_operator import MultipleOperator
from registration.models.operation import Operation
from model_bakery import baker
from registration.models.operation_designated_operator_timeline import OperationDesignatedOperatorTimeline
from common.tests.utils.test_files import create_test_file

pytestmark = pytest.mark.django_db
email_service = EmailService()


def set_up_valid_mock_operation(purpose: Operation.Purposes, document_scan_status: Document.FileStatus = "Clean"):
    # create operation and purpose
    operation = baker.make_recipe(
        'registration.tests.utils.operation', status=Operation.Statuses.DRAFT, registration_purpose=purpose
    )

    # create mock valid operation rep
    address = baker.make_recipe('registration.tests.utils.address')
    operation_representative = baker.make_recipe(
        'registration.tests.utils.contact',
        business_role=BusinessRole.objects.get(role_name='Operation Representative'),
        address=address,
    )
    operation.contacts.set([operation_representative])

    # create facility for operation
    baker.make_recipe('registration.tests.utils.facility_designated_operation_timeline', operation=operation)

    # activity
    operation.activities.set([baker.make(Activity)])

    # docs
    boundary_map = baker.make_recipe(
        "registration.tests.utils.document",
        type=DocumentType.objects.get(name="boundary_map"),
        status=document_scan_status,
    )
    process_flow_diagram = baker.make_recipe(
        "registration.tests.utils.document",
        type=DocumentType.objects.get(name="process_flow_diagram"),
        status=document_scan_status,
    )

    operation.documents.set([boundary_map, process_flow_diagram])

    if purpose == Operation.Purposes.NEW_ENTRANT_OPERATION:
        # statutory dec if new entrant
        new_entrant_application = baker.make_recipe(
            'registration.tests.utils.document',
            type=DocumentType.objects.get(name='new_entrant_application'),
            status=document_scan_status,
        )
        operation.documents.add(new_entrant_application)
        operation.date_of_first_shipment = "On or after April 1, 2024"

    if purpose == Operation.Purposes.OPTED_IN_OPERATION:
        # opt in record
        opted_in_operation_detail = baker.make_recipe('registration.tests.utils.opted_in_operation_detail')
        operation.opted_in_operation = opted_in_operation_detail

    operation.save()
    return operation


class TestOperationService:
    @staticmethod
    def test_assigns_single_selected_purpose():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            registration_purpose='Potential Reporting Operation',
        )
        payload = OperationData(
            registration_purpose='Reporting Operation',
            name="string",
            type=Operation.Types.SFO,
            naics_code_id=1,
            activities=[1],
            process_flow_diagram=create_test_file("process.pdf"),
            boundary_map=create_test_file("boundary.pdf"),
        )
        OperationService.register_operation_information(approved_user_operator.user.user_guid, operation.id, payload)

        operation.refresh_from_db()  # refresh the operation object to get the updated audit columns
        assert operation.updated_at is not None
        assert operation.registration_purpose == Operation.Purposes.REPORTING_OPERATION

    @staticmethod
    def test_list_current_users_unregistered_operations():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        users_unregistered_operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            status=Operation.Statuses.DRAFT,
        )
        # operation with a registered status
        baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            status=Operation.Statuses.REGISTERED,
        )
        # operation for a different user_operator
        baker.make_recipe('registration.tests.utils.operation', status=Operation.Statuses.DRAFT)

        result = OperationService.list_current_users_unregistered_operations(approved_user_operator.user.user_guid)
        assert Operation.objects.count() == 3
        assert len(result) == 1
        assert result[0] == users_unregistered_operation

    @staticmethod
    @patch('service.operation_service.send_registration_and_boro_id_email')
    def test_submit_registration_success(mock_email_service):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        users_operation = set_up_valid_mock_operation(Operation.Purposes.OPTED_IN_OPERATION)
        users_operation.operator = approved_user_operator.operator
        users_operation.save()

        updated_operation = OperationService.update_status(
            approved_user_operator.user.user_guid, users_operation.id, Operation.Statuses.REGISTERED
        )
        updated_operation.refresh_from_db()
        assert updated_operation.status == Operation.Statuses.REGISTERED
        assert updated_operation.updated_at is not None
        # make sure the submission_date is set - using 2 seconds as a buffer for the test
        assert timezone.now().replace(microsecond=0) - updated_operation.submission_date.replace(
            microsecond=0
        ) < timedelta(seconds=2)
        assert updated_operation.registration_purpose == Operation.Purposes.OPTED_IN_OPERATION

        mock_email_service.assert_called_once_with(
            EmailTemplateNames.REGISTRATION_CONFIRMATION,
            users_operation.operator.legal_name,
            users_operation,
            approved_user_operator.user,
        )

    @staticmethod
    @patch('service.operation_service.send_registration_and_boro_id_email')
    def test_submit_registration_fail(mock_email_service):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        users_operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
        )
        users_operation.contacts.set([])

        with pytest.raises(Exception, match="Operation must have an operation representative with an address."):
            OperationService.update_status(
                approved_user_operator.user.user_guid, users_operation.id, Operation.Statuses.REGISTERED
            )

        # assert the email does not get sent if the registration failed to submit
        mock_email_service.assert_not_called()

    @staticmethod
    @patch('service.operation_service.send_registration_and_boro_id_email')
    def test_raises_error_if_operation_does_not_belong_to_user_when_submitting_registration(mock_email_service):
        user = baker.make_recipe(
            'registration.tests.utils.industry_operator_user',
        )
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator', user=user)

        random_operator = baker.make_recipe(
            'registration.tests.utils.operator',
            cra_business_number='123456789',
            bc_corporate_registry_number='abc1234567',
        )
        operation = baker.make_recipe('registration.tests.utils.operation', operator=random_operator)
        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            OperationService.update_status(
                approved_user_operator.user.user_guid, operation.id, Operation.Statuses.REGISTERED
            )

        # assert the email does not get sent if the registration failed to submit
        mock_email_service.assert_not_called()

    @staticmethod
    def test_register_operation_with_preexisting_boro_id():
        # If an operation already has a BORO ID (i.e., it was issued in 2024),
        # we should not expect a pgtrigger error raised when we register the operation
        # and the BORO ID should remain the same.
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        boro_id = baker.make(BcObpsRegulatedOperation, id='24-0999')
        op_rep = baker.make_recipe(
            'registration.tests.utils.contact',
            business_role=BusinessRole.objects.get(role_name="Operation Representative"),
        )

        # need to temporarily disable the pgtrigger in order to be able to insert an operation with boro_id and status=Draft into the test DB
        with pgtrigger.ignore("registration.Operation:restrict_boro_id_unless_registered"):
            users_operation = Operation.objects.create(
                name="Old Operation that already has a BORO ID",
                status="Draft",
                bc_obps_regulated_operation_id=boro_id.id,
                registration_purpose=Operation.Purposes.OBPS_REGULATED_OPERATION,
                operator=approved_user_operator.operator,
                type='Single Facility Operation',
            )
        users_operation.contacts.set([op_rep])
        facility = baker.make_recipe('registration.tests.utils.facility', operation=users_operation)
        baker.make_recipe(
            'registration.tests.utils.facility_designated_operation_timeline',
            facility=facility,
            operation=users_operation,
            end_date=None,
        )
        activity = baker.make_recipe('registration.tests.utils.activity')
        users_operation.activities.set([activity])
        product = baker.make_recipe('registration.tests.utils.regulated_product')
        users_operation.regulated_products.set([product])
        pfd = baker.make_recipe(
            'registration.tests.utils.document',
            status=Document.FileStatus.CLEAN,
            type=DocumentType.objects.get(name='process_flow_diagram'),
        )
        b_map = baker.make_recipe(
            'registration.tests.utils.document',
            status=Document.FileStatus.CLEAN,
            type=DocumentType.objects.get(name='boundary_map'),
        )
        users_operation.documents.set([pfd, b_map])

        users_operation.save()
        users_operation.refresh_from_db()

        updated_operation = OperationService.update_status(
            approved_user_operator.user.user_guid, users_operation.id, Operation.Statuses.REGISTERED
        )
        updated_operation.refresh_from_db()

        assert updated_operation.status == Operation.Statuses.REGISTERED
        assert updated_operation.registration_purpose == Operation.Purposes.OBPS_REGULATED_OPERATION
        assert updated_operation.bc_obps_regulated_operation == users_operation.bc_obps_regulated_operation
        assert updated_operation.bc_obps_regulated_operation.id == '24-0999'

    @staticmethod
    def test_register_operation_with_preexisting_bcghg_id():
        # If an operation already has a BCGHG ID,
        # we should not expect a pgtrigger error raised when we register the operation
        # and the BCGHG ID should remain the same.
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        bcghg_id = baker.make_recipe('registration.tests.utils.bcghg_id')
        op_rep = baker.make_recipe(
            'registration.tests.utils.contact',
            business_role=BusinessRole.objects.get(role_name="Operation Representative"),
        )

        # need to temporarily disable the pgtrigger in order to be able to insert an operation with bcghg_id and status=Draft into the test DB
        with pgtrigger.ignore("registration.Operation:restrict_bcghg_id_unless_registered"):
            users_operation = Operation.objects.create(
                name="Old Operation that already has a BCGHG ID",
                status="Draft",
                bcghg_id=bcghg_id,
                registration_purpose=Operation.Purposes.REPORTING_OPERATION,
                operator=approved_user_operator.operator,
                type='Single Facility Operation',
            )
        users_operation.contacts.set([op_rep])
        facility = baker.make_recipe('registration.tests.utils.facility', operation=users_operation)
        baker.make_recipe(
            'registration.tests.utils.facility_designated_operation_timeline',
            facility=facility,
            operation=users_operation,
            end_date=None,
        )
        activity = baker.make_recipe('registration.tests.utils.activity')
        users_operation.activities.set([activity])
        pfd = baker.make_recipe(
            'registration.tests.utils.document',
            status=Document.FileStatus.CLEAN,
            type=DocumentType.objects.get(name='process_flow_diagram'),
        )
        b_map = baker.make_recipe(
            'registration.tests.utils.document',
            status=Document.FileStatus.CLEAN,
            type=DocumentType.objects.get(name='boundary_map'),
        )
        users_operation.documents.set([pfd, b_map])

        users_operation.save()
        users_operation.refresh_from_db()

        updated_operation = OperationService.update_status(
            approved_user_operator.user.user_guid, users_operation.id, Operation.Statuses.REGISTERED
        )
        updated_operation.refresh_from_db()

        assert updated_operation.status == Operation.Statuses.REGISTERED
        assert updated_operation.registration_purpose == Operation.Purposes.REPORTING_OPERATION
        assert updated_operation.bcghg_id == users_operation.bcghg_id
        assert updated_operation.bcghg_id == bcghg_id

    @staticmethod
    def test_register_operation_with_facility_with_preexisting_bcghg_id():
        # If an operation has a facility that already has a BCGHG ID,
        # we should not expect a pgtrigger error raised when we register the operation
        # and the BCGHG ID should remain the same.
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        bcghg_id = baker.make_recipe('registration.tests.utils.bcghg_id')
        op_rep = baker.make_recipe(
            'registration.tests.utils.contact',
            business_role=BusinessRole.objects.get(role_name="Operation Representative"),
        )

        users_operation = Operation.objects.create(
            name="Old Operation",
            status="Draft",
            registration_purpose=Operation.Purposes.REPORTING_OPERATION,
            operator=approved_user_operator.operator,
            type='Single Facility Operation',
        )
        users_operation.contacts.set([op_rep])

        # need to temporarily disable the pgtrigger in order to be able to insert a facility with bcghg_id
        with pgtrigger.ignore("registration.Facility:restrict_bcghg_id_unless_operation_registered"):
            facility = baker.make_recipe(
                'registration.tests.utils.facility', operation=users_operation, bcghg_id=bcghg_id
            )
        baker.make_recipe(
            'registration.tests.utils.facility_designated_operation_timeline',
            facility=facility,
            operation=users_operation,
            end_date=None,
        )
        activity = baker.make_recipe('registration.tests.utils.activity')
        users_operation.activities.set([activity])
        pfd = baker.make_recipe(
            'registration.tests.utils.document',
            status=Document.FileStatus.CLEAN,
            type=DocumentType.objects.get(name='process_flow_diagram'),
        )
        b_map = baker.make_recipe(
            'registration.tests.utils.document',
            status=Document.FileStatus.CLEAN,
            type=DocumentType.objects.get(name='boundary_map'),
        )
        users_operation.documents.set([pfd, b_map])

        users_operation.save()
        users_operation.refresh_from_db()

        updated_operation = OperationService.update_status(
            approved_user_operator.user.user_guid, users_operation.id, Operation.Statuses.REGISTERED
        )
        updated_operation.refresh_from_db()

        assert updated_operation.status == Operation.Statuses.REGISTERED
        assert updated_operation.registration_purpose == Operation.Purposes.REPORTING_OPERATION
        assert updated_operation.facilities.count() == 1
        operations_facility = updated_operation.facilities.first()
        assert operations_facility.bcghg_id == bcghg_id

    @staticmethod
    def test_assign_new_contacts_to_operation_and_operator():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe('registration.tests.utils.operation', operator=approved_user_operator.operator)
        payload = OperationRepresentativeIn(
            first_name="John",
            last_name="Doe",
            email="john.doe@example.com",
            phone_number="+16044011234",
            position_title="Mr.Tester",
            street_address='13 Street',
            municipality='municipality',
            province='AB',
            postal_code='H0H0H0',
        )

        OperationService.create_operation_representative(approved_user_operator.user.user_guid, operation.id, payload)
        operation.refresh_from_db()

        assert approved_user_operator.operator.contacts.count() == 1
        assert operation.contacts.count() == 1
        assert Address.objects.count() == 2  # 1 is the contact's, 1 is from the operation baker recipe
        operation_contact = operation.contacts.first()
        operation_contact.refresh_from_db()
        assert operation_contact.first_name == 'John'
        assert operation_contact.address.street_address == '13 Street'
        assert operation_contact.created_at is not None

    @staticmethod
    def test_assign_existing_contacts_to_operation():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        contacts = baker.make_recipe(
            'registration.tests.utils.contact', operator=approved_user_operator.operator, _quantity=5
        )
        operation = baker.make_recipe('registration.tests.utils.operation', operator=approved_user_operator.operator)

        contact_to_update = contacts[0]

        # bad payload, should not update first_name, last_name and email when existing_contact_id is provided
        bad_payload = OperationRepresentativeIn(
            existing_contact_id=contact_to_update.id,
            first_name="John",
            last_name="Doe",
            email="john.doe@example.com",
            phone_number="+16044011234",
            position_title="Mr.Tester",
            street_address='13 Street',
            municipality='municipality',
            province='AB',
            postal_code='H0H0H0',
        )

        with pytest.raises(Exception):
            OperationService.create_operation_representative(
                approved_user_operator.user.user_guid, operation.id, bad_payload
            )
        # good payload, using the same first_name, last_name and email when existing_contact_id is provided
        good_payload = OperationRepresentativeIn(
            existing_contact_id=contact_to_update.id,
            first_name=contact_to_update.first_name,
            last_name=contact_to_update.last_name,
            email=contact_to_update.email,
            phone_number="+16044011234",
            position_title="Mr.Tester",
            street_address='13 Street',
            municipality='municipality',
            province='AB',
            postal_code='H0H0H0',
        )

        OperationService.create_operation_representative(
            approved_user_operator.user.user_guid, operation.id, good_payload
        )
        operation.refresh_from_db()
        assert operation.contacts.count() == 1

    @staticmethod
    def test_raises_error_if_operation_does_not_belong_to_user_when_updating_opted_in_operation_detail():
        user = baker.make_recipe(
            'registration.tests.utils.industry_operator_user',
        )
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator', user=user)

        random_operator = baker.make_recipe(
            'registration.tests.utils.operator',
            cra_business_number='123456789',
            bc_corporate_registry_number='abc1234567',
        )
        operation = baker.make_recipe('registration.tests.utils.operation', operator=random_operator)
        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            OperationService.update_opted_in_operation_detail(
                approved_user_operator.user.user_guid, operation.id, MagicMock()
            )

    @staticmethod
    def test_create_or_replace_new_entrant_application():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        users_operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
        )
        payload = create_test_file("new_entrant_application.pdf")
        operation = OperationService.create_or_replace_new_entrant_application(
            approved_user_operator.user.user_guid, users_operation.id, payload
        )
        operation.refresh_from_db()
        assert operation.id == users_operation.id
        assert operation.documents.filter(type=DocumentType.objects.get(name='new_entrant_application')).count() == 1

    @staticmethod
    def test_get_valid_regulated_products_for_operation():
        """
        Test that the get_valid_operation_regulated_products method returns only the regulated products that are valid for the operation's reporting year.
        """

        report_year = 2024
        valid_products = baker.make_recipe(
            "reporting.tests.utils.regulated_product",
            valid_from=f'{report_year - 1}-01-01',
            valid_to='2099-12-31',
            _quantity=2,
        )
        invalid_products = baker.make_recipe(
            "reporting.tests.utils.regulated_product", valid_from='2099-01-01', valid_to='2099-12-31', _quantity=2
        )
        # Create an operation with both valid and invalid products
        operation = baker.make_recipe(
            "registration.tests.utils.operation",
            regulated_products=valid_products + invalid_products,
        )
        # Call the service method to get valid regulated products for the operation
        regulated_products = OperationService.get_valid_operation_regulated_products(operation, report_year)

        # Assert that all valid products are included and all invalid products are excluded from the report
        assert all(product in regulated_products for product in valid_products)
        assert all(product not in regulated_products for product in invalid_products)


class TestRegisterOperationInformation:
    @staticmethod
    def test_register_operation_information_new_eio():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        payload = OperationData(
            registration_purpose='Electricity Import Operation',
            name="TestEIO",
            type=Operation.Types.EIO,
        )
        # check operation
        operation = OperationService.register_operation_information(
            approved_user_operator.user.user_guid, None, payload
        )
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        # check purpose and status
        assert operation.registration_purpose == Operation.Purposes.ELECTRICITY_IMPORT_OPERATION
        assert operation.status == Operation.Statuses.DRAFT
        # check facility
        facilities = operation.facilities.all()
        assert facilities.count() == 1
        assert facilities[0].name == "TestEIO"
        assert facilities[0].type == Facility.Types.ELECTRICITY_IMPORT

    @staticmethod
    def test_register_operation_information_existing_eio():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        users_operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
            type=Operation.Types.EIO,
            registration_purpose='Electricity Import Operation',
        )
        payload = OperationData(
            registration_purpose='Electricity Import Operation',
            name="UpdatedEIO",
            type=Operation.Types.EIO,
        )
        # check operation updates
        operation = OperationService.register_operation_information(
            approved_user_operator.user.user_guid, users_operation.id, payload
        )
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        # check purpose and status
        assert operation.registration_purpose == Operation.Purposes.ELECTRICITY_IMPORT_OPERATION
        assert operation.status == Operation.Statuses.DRAFT
        # check facility
        facilities = operation.facilities.all()
        assert facilities.count() == 1
        assert facilities[0].name == "UpdatedEIO"
        assert facilities[0].type == Facility.Types.ELECTRICITY_IMPORT

    @staticmethod
    def test_register_operation_information_new_operation():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')

        payload = OperationData(
            registration_purpose='Reporting Operation',
            name="string",
            type=Operation.Types.SFO,
            naics_code_id=1,
            activities=[1],
            process_flow_diagram=create_test_file("test.pdf"),
            boundary_map=create_test_file("test1.pdf"),
        )
        operation = OperationService.register_operation_information(
            approved_user_operator.user.user_guid, None, payload
        )
        operation.refresh_from_db()
        # check operation creation
        assert Operation.objects.count() == 1
        # check purpose
        assert operation.registration_purpose == Operation.Purposes.REPORTING_OPERATION
        assert operation.status == Operation.Statuses.DRAFT
        facilities = operation.facilities.all()
        assert facilities.count() == 0

    @staticmethod
    def test_register_operation_information_existing_operation():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        users_operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
        )
        payload = OperationData(
            registration_purpose='Potential Reporting Operation',
            name="string",
            type=Operation.Types.SFO,
            naics_code_id=1,
            secondary_naics_code_id=2,
            tertiary_naics_code_id=3,
            activities=[1],
            process_flow_diagram=create_test_file("test.pdf"),
            boundary_map=create_test_file("test1.pdf"),
        )
        # check operation updates
        operation = OperationService.register_operation_information(
            approved_user_operator.user.user_guid, users_operation.id, payload
        )
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        assert operation.updated_at is not None
        # check purpose
        assert operation.registration_purpose == Operation.Purposes.POTENTIAL_REPORTING_OPERATION
        assert operation.status == Operation.Statuses.DRAFT
        facilities = operation.facilities.all()
        assert facilities.count() == 0

    @staticmethod
    def test_is_operation_new_entrant_information_complete_true():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        users_operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            registration_purpose=Operation.Purposes.NEW_ENTRANT_OPERATION,
            date_of_first_shipment=Operation.DateOfFirstShipmentChoices.ON_OR_AFTER_APRIL_1_2024,
        )
        new_entrant_application = baker.make_recipe(
            'registration.tests.utils.document', type=DocumentType.objects.get(name='new_entrant_application')
        )
        users_operation.documents.add(new_entrant_application)

        assert OperationService.is_operation_new_entrant_information_complete(users_operation)

    @staticmethod
    def test_is_operation_new_entrant_information_complete_no_date():
        # Date of first shipment is no longer required for 2025+ registrations
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        users_operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            registration_purpose=Operation.Purposes.NEW_ENTRANT_OPERATION,
        )
        new_entrant_application = baker.make_recipe(
            'registration.tests.utils.document', type=DocumentType.objects.get(name='new_entrant_application')
        )
        users_operation.documents.add(new_entrant_application)

        # Should now return True since date_of_first_shipment is no longer required
        assert OperationService.is_operation_new_entrant_information_complete(users_operation)

    @staticmethod
    def test_is_operation_new_entrant_information_complete_no_application():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        users_operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            registration_purpose=Operation.Purposes.NEW_ENTRANT_OPERATION,
            date_of_first_shipment=Operation.DateOfFirstShipmentChoices.ON_OR_BEFORE_MARCH_31_2024,
        )

        assert not OperationService.is_operation_new_entrant_information_complete(users_operation)


class TestOperationServiceV2CreateOperation:
    @staticmethod
    def test_create_operation_without_multiple_operators():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        payload = OperationData(
            registration_purpose='Reporting Operation',
            regulated_products=[1, 2],
            name="string",
            type=Operation.Types.SFO,
            naics_code_id=1,
            secondary_naics_code_id=2,
            tertiary_naics_code_id=3,
            activities=[1],
            process_flow_diagram=create_test_file("test.pdf"),
            boundary_map=create_test_file("test1.pdf"),
        )
        operation = OperationService._create_operation(approved_user_operator.user.user_guid, payload)
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        assert operation.regulated_products.count() == 2
        assert operation.activities.count() == 1
        assert operation.documents.count() == 2
        assert operation.registration_purpose == Operation.Purposes.REPORTING_OPERATION

        # check timeline model
        assert OperationDesignatedOperatorTimeline.objects.count() == 1
        timeline_record = OperationDesignatedOperatorTimeline.objects.first()
        assert timeline_record.operation == operation
        assert timeline_record.operator == approved_user_operator.operator
        assert timeline_record.start_date == OperationService.OPERATION_DEFAULT_START_DATE

    @staticmethod
    def test_create_operation_with_multiple_operators():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        payload = OperationData(
            registration_purpose='Reporting Operation',
            name="string",
            type=Operation.Types.SFO,
            naics_code_id=1,
            secondary_naics_code_id=2,
            tertiary_naics_code_id=3,
            activities=[1],
            process_flow_diagram=create_test_file("test.pdf"),
            boundary_map=create_test_file("test1.pdf"),
        )
        payload.multiple_operators_array = [
            MultipleOperatorData(
                legal_name='i am new',
                trade_name='new',
                cra_business_number='111111111',
                business_structure_id='General Partnership',
                bc_corporate_registry_number='ghj1234567',
                street_address='Seahorses St',
                municipality='Ocean Town',
                province='BC',
                postal_code='H0H0H0',
            ),
            MultipleOperatorData(
                legal_name='i am new 2',
                trade_name='new 2',
                cra_business_number='111111111',
                business_structure_id='General Partnership',
                street_address='Lion St',
                municipality='Zebra Town',
                province='MB',
                postal_code='H0H0H0',
            ),
        ]
        operation = OperationService._create_operation(approved_user_operator.user.user_guid, payload)
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        assert MultipleOperator.objects.count() == 2
        assert MultipleOperator.objects.first().bc_corporate_registry_number == 'ghj1234567'
        assert MultipleOperator.objects.last().bc_corporate_registry_number is None
        assert operation.registration_purpose == Operation.Purposes.REPORTING_OPERATION

    @staticmethod
    def test_assigning_opted_in_operation_will_create_and_opted_in_operation_detail():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        payload = OperationData(
            registration_purpose=Operation.Purposes.OPTED_IN_OPERATION,
            name="string",
            type=Operation.Types.SFO,
            naics_code_id=1,
            activities=[1],
            process_flow_diagram=create_test_file("test.pdf"),
            boundary_map=create_test_file("test1.pdf"),
        )
        operation = OperationService._create_operation(approved_user_operator.user.user_guid, payload)

        operation.refresh_from_db()
        assert operation.opted_in_operation is not None
        assert OptedInOperationDetail.objects.count() == 1

    @staticmethod
    def test_create_makes_eio_facility():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        payload = OperationData(
            registration_purpose='Electricity Import Operation',
            name="TestEIO",
            type=Operation.Types.EIO,
        )
        # check operation
        operation = OperationService._create_operation(approved_user_operator.user.user_guid, payload)
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        assert operation.registration_purpose == Operation.Purposes.ELECTRICITY_IMPORT_OPERATION
        # check facility
        facilities = operation.facilities.all()
        assert facilities.count() == 1
        assert facilities[0].name == "TestEIO"
        assert facilities[0].type == Facility.Types.ELECTRICITY_IMPORT


class TestOperationServiceV2UpdateOperation:
    @staticmethod
    def test_raises_error_if_operation_does_not_belong_to_user():
        user = baker.make_recipe('registration.tests.utils.industry_operator_user')
        baker.make_recipe('registration.tests.utils.approved_user_operator', user=user)

        random_operator = baker.make_recipe(
            'registration.tests.utils.operator',
            cra_business_number='123456789',
            bc_corporate_registry_number='abc1234567',
        )
        # random operator's operation
        baker.make_recipe(
            'registration.tests.utils.operation',
            operator=random_operator,
            registration_purpose='Potential Reporting Operation',
        )

        payload = OperationData(
            registration_purpose='Reporting Operation',
            name="string",
            type=Operation.Types.SFO,
            naics_code_id=1,
            activities=[1],
            process_flow_diagram=create_test_file("test.pdf"),
            boundary_map=create_test_file("test1.pdf"),
        )
        with pytest.raises(Exception):
            OperationService.update_operation(user.user_guid, payload)

    @staticmethod
    def test_update_operation():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        existing_operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
            status=Operation.Statuses.REGISTERED,
        )
        payload = UpdateOperationData(
            registration_purpose='Potential Reporting Operation',
            name="Test Update Operation Name",
            type=Operation.Types.SFO,
            naics_code_id=1,
            secondary_naics_code_id=1,
            tertiary_naics_code_id=2,
            activities=[2],
            process_flow_diagram=create_test_file("test.pdf"),
            boundary_map=create_test_file("test1.pdf"),
            operation_representatives=[baker.make_recipe('registration.tests.utils.contact').id],
        )
        operation = OperationService.update_operation(
            approved_user_operator.user.user_guid, payload, existing_operation.id
        )
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        assert operation.activities.count() == 1
        assert operation.documents.count() == 2
        assert operation.registration_purpose == Operation.Purposes.POTENTIAL_REPORTING_OPERATION

    @staticmethod
    def test_update_operation_with_no_regulated_products():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        existing_operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
            status=Operation.Statuses.REGISTERED,
        )
        payload = UpdateOperationData(
            registration_purpose='OBPS Regulated Operation',
            name="Test Update Operation Name",
            type=Operation.Types.SFO,
            naics_code_id=2,
            secondary_naics_code_id=3,
            tertiary_naics_code_id=4,
            activities=[3],
            process_flow_diagram=create_test_file("test.pdf"),
            boundary_map=create_test_file("test1.pdf"),
            operation_representatives=[baker.make_recipe('registration.tests.utils.contact').id],
        )
        operation = OperationService.update_operation(
            approved_user_operator.user.user_guid, payload, existing_operation.id
        )
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        assert operation.activities.count() == 1
        assert operation.documents.count() == 2
        assert operation.regulated_products.count() == 0
        assert operation.registration_purpose == Operation.Purposes.OBPS_REGULATED_OPERATION

    @staticmethod
    def test_update_operation_with_new_entrant_application_data():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        existing_operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
            status=Operation.Statuses.REGISTERED,
        )
        payload = UpdateOperationData(
            registration_purpose='New Entrant Operation',
            name="Test Update Operation Name",
            type=Operation.Types.SFO,
            naics_code_id=2,
            secondary_naics_code_id=3,
            tertiary_naics_code_id=4,
            activities=[3],
            process_flow_diagram=create_test_file("test.pdf"),
            boundary_map=create_test_file("test1.pdf"),
            new_entrant_application=create_test_file("new_entrant.pdf"),
            operation_representatives=[baker.make_recipe('registration.tests.utils.contact').id],
        )
        operation = OperationService.update_operation(
            approved_user_operator.user.user_guid, payload, existing_operation.id
        )
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        assert operation.activities.count() == 1
        assert operation.documents.count() == 3
        assert operation.documents.filter(type=DocumentType.objects.get(name='new_entrant_application')).count() == 1
        assert operation.registration_purpose == Operation.Purposes.NEW_ENTRANT_OPERATION

    @staticmethod
    def test_update_operation_with_multiple_operators():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        existing_operation = baker.make_recipe(
            'registration.tests.utils.operation', operator=approved_user_operator.operator
        )
        multiple_operators = baker.make_recipe(
            'registration.tests.utils.multiple_operator', operation=existing_operation, _quantity=3
        )
        existing_operation.multiple_operators.set(multiple_operators)

        payload = UpdateOperationData(
            registration_purpose='Reporting Operation',
            regulated_products=[1],
            name="I am updated",
            type=Operation.Types.SFO,
            naics_code_id=1,
            secondary_naics_code_id=2,
            tertiary_naics_code_id=3,
            activities=[1],
            process_flow_diagram=create_test_file("test.pdf"),
            boundary_map=create_test_file("test1.pdf"),
            operation_representatives=[baker.make_recipe('registration.tests.utils.contact').id],
        )
        payload.multiple_operators_array = [
            MultipleOperatorData(
                legal_name='i am new',
                trade_name='new',
                cra_business_number='111111111',
                business_structure_id='General Partnership',
                bc_corporate_registry_number='ghj1234567',
                street_address='Seahorses St',
                municipality='Ocean Town',
                province='BC',
                postal_code='H0H0H0',
            ),
            MultipleOperatorData(
                legal_name='i am new 2',
                trade_name='new 2',
                cra_business_number='111111111',
                business_structure_id='General Partnership',
                street_address='Lion St',
                municipality='Zebra Town',
                province='MB',
                postal_code='H0H0H0',
            ),
        ]
        operation = OperationService.update_operation(
            approved_user_operator.user.user_guid,
            payload,
            existing_operation.id,
        )
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        assert operation.activities.count() == 1
        assert operation.documents.count() == 2
        assert operation.multiple_operators.count() == 2
        assert operation.multiple_operators.first().legal_name == 'i am new'
        assert operation.multiple_operators.last().legal_name == 'i am new 2'
        assert operation.name == "I am updated"
        assert operation.updated_at is not None
        assert operation.registration_purpose == Operation.Purposes.REPORTING_OPERATION

    @staticmethod
    def test_update_operation_archive_multiple_operators():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        existing_operation = baker.make_recipe(
            'registration.tests.utils.operation', operator=approved_user_operator.operator
        )
        multiple_operators = baker.make_recipe(
            'registration.tests.utils.multiple_operator', operation=existing_operation, _quantity=3
        )
        existing_operation.multiple_operators.set(multiple_operators)

        payload = UpdateOperationData(
            registration_purpose='Reporting Operation',
            regulated_products=[1],
            name="I am updated",
            type=Operation.Types.SFO,
            naics_code_id=1,
            secondary_naics_code_id=2,
            tertiary_naics_code_id=3,
            activities=[1],
            process_flow_diagram=create_test_file("test.pdf"),
            boundary_map=create_test_file("test1.pdf"),
            operation_representatives=[baker.make_recipe('registration.tests.utils.contact').id],
        )

        operation = OperationService.update_operation(
            approved_user_operator.user.user_guid,
            payload,
            existing_operation.id,
        )
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        assert operation.multiple_operators.count() == 0
        assert operation.updated_at is not None

    @staticmethod
    def test_update_operation_with_operation_representatives_with_address():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        existing_operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            status=Operation.Statuses.REGISTERED,
        )
        contacts = baker.make_recipe(
            'registration.tests.utils.contact',
            business_role=BusinessRole.objects.get(role_name='Operation Representative'),
            _quantity=3,
        )

        payload = UpdateOperationData(
            registration_purpose='Reporting Operation',
            regulated_products=[1],
            name="I am updated",
            type=Operation.Types.SFO,
            naics_code_id=1,
            secondary_naics_code_id=2,
            tertiary_naics_code_id=3,
            activities=[1],
            process_flow_diagram=create_test_file("test.pdf"),
            boundary_map=create_test_file("test1.pdf"),
            operation_representatives=[contact.id for contact in contacts],
        )

        operation = OperationService.update_operation(
            approved_user_operator.user.user_guid,
            payload,
            existing_operation.id,
        )
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        assert operation.contacts.count() == 3

    @classmethod
    def test_update_operation_with_eio(cls):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        existing_operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            type=Operation.Types.SFO,
            status=Operation.Statuses.DRAFT,
        )
        facility = baker.make_recipe(
            'registration.tests.utils.facility', operation=existing_operation, type=Facility.Types.SINGLE_FACILITY
        )
        baker.make_recipe(
            'registration.tests.utils.facility_designated_operation_timeline',
            facility=facility,
            operation=existing_operation,
            end_date=None,
        )

        contacts = baker.make_recipe(
            'registration.tests.utils.contact',
            business_role=BusinessRole.objects.get(role_name='Operation Representative'),
            _quantity=3,
        )

        payload = UpdateOperationData(
            registration_purpose='Electricity Import Operation',
            regulated_products=[1],
            name="I am updated",
            type=Operation.Types.EIO,
            naics_code_id=1,
            secondary_naics_code_id=2,
            tertiary_naics_code_id=3,
            activities=[1],
            process_flow_diagram=create_test_file("test.pdf"),
            boundary_map=create_test_file("test1.pdf"),
            operation_representatives=[contact.id for contact in contacts],
        )
        operation = OperationService.update_operation(
            approved_user_operator.user.user_guid,
            payload,
            existing_operation.id,
        )

        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        # 1 facility because the EIO creation service will create a facility
        assert Facility.objects.count() == 1

    @staticmethod
    def test_update_opt_in_operation():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        existing_operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            registration_purpose='Opted-in Operation',
            status=Operation.Statuses.DRAFT,
        )
        opted_in_operation_detail = baker.make_recipe('registration.tests.utils.opted_in_operation_detail')
        existing_operation.opted_in_operation = opted_in_operation_detail
        existing_operation.save()

        contacts = baker.make_recipe(
            'registration.tests.utils.contact',
            business_role=BusinessRole.objects.get(role_name='Operation Representative'),
            _quantity=3,
        )

        payload = UpdateOperationData(
            registration_purpose='Opted-in Operation',
            regulated_products=[1],
            name="I am updated",
            type=Operation.Types.SFO,
            naics_code_id=1,
            secondary_naics_code_id=2,
            tertiary_naics_code_id=3,
            activities=[1],
            process_flow_diagram=create_test_file("test.pdf"),
            boundary_map=create_test_file("test1.pdf"),
            operation_representatives=[contact.id for contact in contacts],
        )

        operation = OperationService.update_operation(
            approved_user_operator.user.user_guid,
            payload,
            existing_operation.id,
        )
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        assert (
            OptedInOperationDetail.objects.count() == 1
        )  # only 1 record (to make sure we didn't create duplicate new ones)
        assert OptedInOperationDetail._base_manager.count() == 1  # 1 operation total including archived records

    @classmethod
    @patch(
        "service.facility_designated_operation_timeline_service.FacilityDesignatedOperationTimelineService.delete_facilities_by_operation_id",
    )
    def test_unregistered_update_operation_with_new_type(cls, mock_delete_facilities_by_operation_id: MagicMock):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        existing_operation = baker.make_recipe(
            'registration.tests.utils.operation',
            type=Operation.Types.SFO,
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
            status=Operation.Statuses.DRAFT,
        )
        payload = UpdateOperationData(
            registration_purpose='Potential Reporting Operation',
            name="Test Update Operation Name",
            type=Operation.Types.LFO,
            naics_code_id=1,
            secondary_naics_code_id=1,
            tertiary_naics_code_id=2,
            activities=[2],
            process_flow_diagram=create_test_file("test.pdf"),
            boundary_map=create_test_file("test1.pdf"),
            operation_representatives=[baker.make_recipe('registration.tests.utils.contact').id],
        )
        operation = OperationService.update_operation(
            approved_user_operator.user.user_guid, payload, existing_operation.id
        )
        mock_delete_facilities_by_operation_id.assert_called_once_with(
            approved_user_operator.user.user_guid,
            existing_operation.id,
        )
        operation.refresh_from_db()
        assert Operation.objects.count() == 1
        assert operation.type == Operation.Types.LFO

    @classmethod
    @patch(
        "service.facility_designated_operation_timeline_service.FacilityDesignatedOperationTimelineService.delete_facilities_by_operation_id",
    )
    def test_cannot_update_type_of_registered_operation(cls, mock_delete_facilities_by_operation_id: MagicMock):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        existing_operation = baker.make_recipe(
            'registration.tests.utils.operation',
            type=Operation.Types.SFO,
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
            status=Operation.Statuses.REGISTERED,
        )
        payload = UpdateOperationData(
            registration_purpose='Potential Reporting Operation',
            name="Test Update Operation Name",
            type=Operation.Types.LFO,
            naics_code_id=1,
            secondary_naics_code_id=1,
            tertiary_naics_code_id=2,
            activities=[2],
            process_flow_diagram=create_test_file("test.pdf"),
            boundary_map=create_test_file("test1.pdf"),
            operation_representatives=[baker.make_recipe('registration.tests.utils.contact').id],
        )
        with pytest.raises(Exception, match="Cannot change the type of an operation that has already been registered."):
            OperationService.update_operation(approved_user_operator.user.user_guid, payload, existing_operation.id)
        mock_delete_facilities_by_operation_id.assert_not_called()

    @staticmethod
    @patch("service.operation_service.operation_registration_purpose_changed.send")
    def test_signal_emitted_on_registration_purpose_change(mock_signal_send):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            registration_purpose='OBPS Regulated Operation',
            created_by=approved_user_operator.user,
            status=Operation.Statuses.REGISTERED,
        )
        payload = UpdateOperationData(
            registration_purpose='Potential Reporting Operation',
            name="Test Update Operation Name",
            type=Operation.Types.SFO,
            naics_code_id=1,
            secondary_naics_code_id=1,
            tertiary_naics_code_id=2,
            activities=[2],
            process_flow_diagram=create_test_file("test.pdf"),
            boundary_map=create_test_file("test1.pdf"),
            operation_representatives=[baker.make_recipe('registration.tests.utils.contact').id],
        )

        OperationService.update_operation(approved_user_operator.user.user_guid, payload, operation.id)

        mock_signal_send.assert_called_once_with(
            sender=OperationService,
            operation_id=operation.id,
        )


class TestCreateOrUpdateEio:
    @staticmethod
    @patch("service.facility_service.FacilityService.create_facilities_with_designated_operations")
    def test_create_eio(mock_create_facilities_with_designated_operations):
        user_guid = uuid4()

        registration_purpose = 'Electricity Import Operation'
        name = "TestEIO"

        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            registration_purpose=registration_purpose,
            name=name,
            type=Operation.Types.EIO,
        )
        payload = FacilityIn(
            registration_purpose=registration_purpose,
            name=name,
            type=Facility.Types.ELECTRICITY_IMPORT,
            operation_id=operation.id,
        )

        OperationService._create_or_update_eio(user_guid, operation, payload)
        mock_create_facilities_with_designated_operations.assert_called_with(user_guid, [payload])

    @staticmethod
    @patch("service.facility_service.FacilityService.update_facility")
    def test_update_eio(mock_update_facility):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')

        registration_purpose = 'Electricity Import Operation'

        name = "TestEIO"

        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            registration_purpose=registration_purpose,
            name=name,
            type=Operation.Types.EIO,
            operator=approved_user_operator.operator,
        )
        facility = baker.make_recipe('registration.tests.utils.facility', operation=operation)
        # create timeline record
        baker.make_recipe(
            'registration.tests.utils.facility_designated_operation_timeline', operation=operation, facility=facility
        )

        payload = FacilityIn(
            operation_id=operation.id,
            registration_purpose=registration_purpose,
            name=name,
            type=Facility.Types.ELECTRICITY_IMPORT,
        )
        OperationService._create_or_update_eio(approved_user_operator.user.user_guid, operation, payload)

        mock_update_facility.assert_called_once_with(approved_user_operator.user.user_guid, facility.id, payload)


class TestOperationServiceV2CheckCurrentUsersRegisteredOperation:
    def test_check_current_users_registered_operation_returns_true(self):
        # Create a user operator and a registered operation
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')

        # Create an operation with status 'Registered'
        baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
            status="Registered",
        )

        # Check that the method returns True when there is a registered operation
        assert Operation.objects.count() == 1
        assert (
            OperationDataAccessService.check_current_users_registered_operation(approved_user_operator.operator.id)
            is True
        )

        # Create an operation with a different status
        baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
            status="Draft",
        )

        # Ensure the method still returns True with mixed statuses
        assert Operation.objects.count() == 2
        assert (
            OperationDataAccessService.check_current_users_registered_operation(approved_user_operator.operator.id)
            is True
        )

    def test_check_current_users_registered_operation_returns_false(self):
        # Create a user operator and an operation with a non-registered status
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')

        # Create an operation with a non-registered status
        baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
            status="Draft",
        )

        # Check that the method returns False when there is no registered operation
        assert Operation.objects.count() == 1
        assert (
            OperationDataAccessService.check_current_users_registered_operation(approved_user_operator.operator.id)
            is False
        )

    def test_check_operator_has_compliance_reports_returns_true(self):
        # Create a user operator
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')

        # Create an operation
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
        )

        # Create a compliance report version associated with the operator
        report = baker.make_recipe(
            'reporting.tests.utils.report', operator=approved_user_operator.operator, operation=operation
        )
        compliance_report = baker.make_recipe('compliance.tests.utils.compliance_report', report=report)
        baker.make_recipe('compliance.tests.utils.compliance_report_version', compliance_report=compliance_report)

        # Check that the method returns True when there is a compliance report
        assert (
            OperatorDataAccessService.check_operator_has_compliance_reports(approved_user_operator.operator.id) is True
        )

    def test_check_operator_has_compliance_reports_returns_false(self):
        # Create a user operator with no compliance reports
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')

        # Check that the method returns False when there are no compliance reports
        assert (
            OperatorDataAccessService.check_operator_has_compliance_reports(approved_user_operator.operator.id) is False
        )

    def test_check_operator_has_compliance_reports_returns_true_with_multiple_reports(self):
        # Create a user operator
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')

        # Create multiple operations
        operation1 = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
        )
        operation2 = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
        )

        # Create multiple compliance report versions
        report1 = baker.make_recipe(
            'reporting.tests.utils.report', operator=approved_user_operator.operator, operation=operation1
        )
        compliance_report1 = baker.make_recipe('compliance.tests.utils.compliance_report', report=report1)
        baker.make_recipe('compliance.tests.utils.compliance_report_version', compliance_report=compliance_report1)

        report2 = baker.make_recipe(
            'reporting.tests.utils.report', operator=approved_user_operator.operator, operation=operation2
        )
        compliance_report2 = baker.make_recipe('compliance.tests.utils.compliance_report', report=report2)
        baker.make_recipe('compliance.tests.utils.compliance_report_version', compliance_report=compliance_report2)

        # Check that the method returns True when there is at least one compliance report
        assert (
            OperatorDataAccessService.check_operator_has_compliance_reports(approved_user_operator.operator.id) is True
        )

    def test_returns_true_when_operation_is_registered_and_not_potential_reporting(self):
        # Create a user operator and a valid registered operation
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')

        # Create an operation with status "Registered" and a reporting registration purpose
        baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
            status=Operation.Statuses.REGISTERED,
            registration_purpose=Operation.Purposes.REPORTING_OPERATION,  # valid reporting purpose
        )

        # Ensure one operation exists
        assert Operation.objects.count() == 1

        # Should return True because there is at least one valid registered operation.
        result = OperationDataAccessService.check_current_users_reporting_registered_operation(
            approved_user_operator.operator.id
        )
        assert result is True

    def test_returns_false_when_no_registered_operation_exists(self):
        # Create a user operator with only a non-registered operation (e.g., Draft)
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')

        baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
            status=Operation.Statuses.DRAFT,
            registration_purpose=Operation.Purposes.REPORTING_OPERATION,
        )

        # Only one operation exists, but with a non-registered status.
        assert Operation.objects.count() == 1

        # Should return False because there are no operations with status "Registered"
        result = OperationDataAccessService.check_current_users_reporting_registered_operation(
            approved_user_operator.operator.id
        )
        assert result is False

    def test_returns_false_when_registered_operation_is_potential_reporting(self):
        # Create a user operator with an operation that is registered but has a potential reporting purpose.
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')

        baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
            status=Operation.Statuses.REGISTERED,
            registration_purpose=Operation.Purposes.POTENTIAL_REPORTING_OPERATION,  # should be excluded
        )

        # Should be one operation, but it must be excluded because it's potential reporting.
        assert Operation.objects.count() == 1

        result = OperationDataAccessService.check_current_users_reporting_registered_operation(
            approved_user_operator.operator.id
        )
        assert result is False

    def test_returns_true_when_mixed_operations_exist(self):
        # Create a user operator that has two registered operations: one valid and one potential reporting.
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')

        # This operation should be excluded.
        baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
            status=Operation.Statuses.REGISTERED,
            registration_purpose=Operation.Purposes.POTENTIAL_REPORTING_OPERATION,
        )

        # This operation should count.
        baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            created_by=approved_user_operator.user,
            status=Operation.Statuses.REGISTERED,
            registration_purpose=Operation.Purposes.REPORTING_OPERATION,
        )

        # Two operations exist in total.
        assert Operation.objects.count() == 2

        # Should return True because one valid operation is present.
        result = OperationDataAccessService.check_current_users_reporting_registered_operation(
            approved_user_operator.operator.id
        )
        assert result is True


class TestRaiseExceptionIfOperationRegistrationDataIncomplete:
    @staticmethod
    def test_raises_exception_if_no_purpose():
        operation = baker.make_recipe('registration.tests.utils.operation', status=Operation.Statuses.DRAFT)
        # the only way to not have a registration purpose on an operation is to first set one when creating the operation,
        # then manually remove it
        operation.registration_purpose = None

        with pytest.raises(Exception, match="Operation must have a registration purpose."):
            OperationService.raise_exception_if_operation_missing_registration_information(operation)

    @staticmethod
    def test_raises_exception_if_no_operation_rep():
        operation = set_up_valid_mock_operation(Operation.Purposes.OPTED_IN_OPERATION)
        operation.contacts.all().delete()

        with pytest.raises(Exception, match="Operation must have an operation representative with an address."):
            OperationService.raise_exception_if_operation_missing_registration_information(operation)

    @staticmethod
    def test_raises_exception_if_no_facilities():
        operation = set_up_valid_mock_operation(Operation.Purposes.OPTED_IN_OPERATION)
        FacilityDesignatedOperationTimeline.objects.filter(operation=operation).delete()

        with pytest.raises(Exception, match="Operation must have at least one facility."):
            OperationService.raise_exception_if_operation_missing_registration_information(operation)

    @staticmethod
    def test_raises_exception_if_no_activities():
        operation = set_up_valid_mock_operation(Operation.Purposes.OPTED_IN_OPERATION)
        operation.activities.all().delete()

        with pytest.raises(Exception, match="Operation must have at least one reporting activity."):
            OperationService.raise_exception_if_operation_missing_registration_information(operation)

    @staticmethod
    def test_raises_exception_if_no_documents():
        operation = set_up_valid_mock_operation(Operation.Purposes.OPTED_IN_OPERATION)
        operation.documents.all().delete()

        with pytest.raises(Exception, match="Operation must have a process flow diagram and a boundary map."):
            OperationService.raise_exception_if_operation_missing_registration_information(operation)

    @staticmethod
    def test_raises_exception_if_documents_are_quarantined(monkeypatch):
        # This test doesn't actually hit GCS, so we want to change the env variables to hit the check for document scans
        monkeypatch.setattr(os, "environ", {"ENVIRONMENT": "develop", "CI": "false"})

        operation = set_up_valid_mock_operation(
            Operation.Purposes.OPTED_IN_OPERATION, document_scan_status="Quarantined"
        )

        with pytest.raises(
            Exception,
            match="Potential threat detected in test.pdf, test.pdf. Please go back and replace these attachments before submitting.",
        ):
            OperationService.raise_exception_if_operation_missing_registration_information(operation)

    @staticmethod
    @override_settings(ENVIRONMENT="develop", CI="false")
    def test_raises_exception_if_documents_are_still_unscanned():
        # This test doesn't actually hit GCS, so we want to change the env variables to hit the check for document scans
        operation = set_up_valid_mock_operation(Operation.Purposes.OPTED_IN_OPERATION, document_scan_status="Unscanned")

        with pytest.raises(
            Exception,
            match="Please wait. Your attachments are being scanned for malware, this may take a few minutes.",
        ):
            OperationService.raise_exception_if_operation_missing_registration_information(operation)

    @staticmethod
    def test_raises_exception_if_one_of_the_documents_is_missing():
        operation = set_up_valid_mock_operation(Operation.Purposes.OPTED_IN_OPERATION)
        operation.documents.filter(type=DocumentType.objects.get(name='boundary_map')).delete()

        with pytest.raises(Exception, match="Operation must have a process flow diagram and a boundary map."):
            OperationService.raise_exception_if_operation_missing_registration_information(operation)

    @staticmethod
    def test_do_not_raise_exception_if_data_complete_new_entrant():
        operation = set_up_valid_mock_operation(Operation.Purposes.NEW_ENTRANT_OPERATION)
        OperationService.raise_exception_if_operation_missing_registration_information(operation)

    @staticmethod
    def test_raises_exception_if_no_new_entrant_info():
        operation = set_up_valid_mock_operation(Operation.Purposes.NEW_ENTRANT_OPERATION)
        # remove statutory declaration
        operation.documents.filter(type=DocumentType.objects.get(name='new_entrant_application')).delete()

        with pytest.raises(
            Exception,
            match="Operation must have a signed statutory declaration and date of first shipment if it is a new entrant.",
        ):
            OperationService.raise_exception_if_operation_missing_registration_information(operation)

    @staticmethod
    def test_raises_exception_if_no_opt_in_info():
        operation = set_up_valid_mock_operation(Operation.Purposes.OPTED_IN_OPERATION)
        # remove opted in information
        operation.opted_in_operation = None
        operation.save()

        with pytest.raises(Exception, match="Operation must have completed opt-in information if it is opted in."):
            OperationService.raise_exception_if_operation_missing_registration_information(operation)

    @staticmethod
    def test_raises_exception_if_incomplete_opt_in_info():
        operation = set_up_valid_mock_operation(Operation.Purposes.OPTED_IN_OPERATION)
        # make the opt-in record blank
        operation.opted_in_operation = baker.make(OptedInOperationDetail)
        operation.save()

        with pytest.raises(Exception, match="Operation must have completed opt-in information if it is opted in."):
            OperationService.raise_exception_if_operation_missing_registration_information(operation)

    @staticmethod
    def test_do_not_raise_exception_if_data_complete_opt_in():
        operation = set_up_valid_mock_operation(Operation.Purposes.OPTED_IN_OPERATION)
        # test will pass if no exception raised
        OperationService.raise_exception_if_operation_missing_registration_information(operation)


class TestHandleChangeOfRegistrationPurpose:
    """
    Note that these tests are different from the integration tests for handling change of
    registration purpose as these unit tests only go as far as confirming that the
    OperationInformationIn payload is generated correctly.
    """

    @staticmethod
    def test_old_purpose_opted_in():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            registration_purpose=Operation.Purposes.OPTED_IN_OPERATION,
        )
        opted_in_operation_detail = baker.make_recipe('registration.tests.utils.opted_in_operation_detail')
        operation.opted_in_operation = opted_in_operation_detail
        operation.save()

        assert OptedInOperationDetail.objects.count() == 1

        submitted_payload = OperationData(
            registration_purpose=Operation.Purposes.REPORTING_OPERATION,
            name='Updated Operation',
            type=Operation.Types.SFO,
            activities=[1, 2, 3],
        )
        returned_payload = OperationService.handle_change_of_registration_purpose(
            approved_user_operator.user.user_guid, operation, submitted_payload
        )

        assert returned_payload.registration_purpose == Operation.Purposes.REPORTING_OPERATION
        assert OptedInOperationDetail.objects.count() == 0

        # assert handle_change_of_registration_purpose isn't modifying parts of the payload that should be untouched
        assert returned_payload.name == "Updated Operation"

    @staticmethod
    def test_old_purpose_new_entrant():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            registration_purpose=Operation.Purposes.NEW_ENTRANT_OPERATION,
        )
        boundary_map = baker.make_recipe(
            'registration.tests.utils.document', type=DocumentType.objects.get(name='boundary_map')
        )
        process_flow_diagram = baker.make_recipe(
            'registration.tests.utils.document', type=DocumentType.objects.get(name='process_flow_diagram')
        )
        new_entrant_application = baker.make_recipe(
            'registration.tests.utils.document', type=DocumentType.objects.get(name='new_entrant_application')
        )
        operation.documents.set([new_entrant_application, boundary_map, process_flow_diagram])

        assert Document.objects.count() == 3
        assert operation.documents.count() == 3

        submitted_payload = OperationData(
            registration_purpose=Operation.Purposes.OBPS_REGULATED_OPERATION,
            name="Updated Operation",
            type=Operation.Types.SFO,
            activities=[1, 2, 3],
        )
        returned_payload = OperationService.handle_change_of_registration_purpose(
            approved_user_operator.user.user_guid, operation, submitted_payload
        )

        assert Document.objects.count() == 2
        assert operation.documents.count() == 2

        # assert handle_change_of_registration_purpose isn't modifying parts of the payload that should be untouched
        assert returned_payload.activities == [1, 2, 3]
        assert returned_payload.registration_purpose == Operation.Purposes.OBPS_REGULATED_OPERATION

    @staticmethod
    def test_new_purpose_eio():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            registration_purpose=Operation.Purposes.REPORTING_OPERATION,
        )

        submitted_payload = OperationData(
            registration_purpose=Operation.Purposes.ELECTRICITY_IMPORT_OPERATION,
            name="Updated Operation",
            type=Operation.Types.EIO,
            # submitting a bunch of irrelevant data just to confirm it gets removed
            activities=operation.activities,
            regulated_products=[1, 2, 3],
            secondary_naics_code_id=2,
            tertiary_naics_code_id=3,
            boundary_map=create_test_file("test.pdf"),
            process_flow_diagram=create_test_file("test1.pdf"),
        )
        returned_payload = OperationService.handle_change_of_registration_purpose(
            approved_user_operator.user.user_guid, operation, submitted_payload
        )

        assert returned_payload.activities == []
        assert returned_payload.regulated_products == []
        assert returned_payload.naics_code_id is None
        assert returned_payload.secondary_naics_code_id is None
        assert returned_payload.tertiary_naics_code_id is None
        assert returned_payload.boundary_map is None
        assert returned_payload.process_flow_diagram is None
        assert FacilityDesignatedOperationTimeline.objects.filter(operation=operation).count() == 0
        assert operation.facilities.count() == 0

    @staticmethod
    def test_new_purpose_reporting():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        products = baker.make_recipe('registration.tests.utils.regulated_product', _quantity=3)
        activities = baker.make(Activity, _quantity=3)
        activity_pks = [activity.id for activity in activities]
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            regulated_products=products,
        )

        submitted_payload = OperationData(
            registration_purpose=Operation.Purposes.REPORTING_OPERATION,
            name="Updated Operation",
            type=Operation.Types.SFO,
            activities=activity_pks,
            naics_code_id=operation.naics_code_id,
        )
        returned_payload = OperationService.handle_change_of_registration_purpose(
            approved_user_operator.user.user_guid, operation, submitted_payload
        )

        assert returned_payload.regulated_products == []
        assert returned_payload.activities == activity_pks
        assert returned_payload.naics_code_id is not None
        assert returned_payload.registration_purpose == Operation.Purposes.REPORTING_OPERATION


class TestGenerateBoroId:
    @staticmethod
    @patch('service.operation_service.send_registration_and_boro_id_email')
    def test_generates_boro_id(mock_send_email):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            status=Operation.Statuses.REGISTERED,
        )
        cas_director = baker.make_recipe('registration.tests.utils.cas_director')

        OperationService.generate_boro_id(cas_director.user_guid, operation.id)
        operation.refresh_from_db()

        assert operation.bc_obps_regulated_operation is not None
        assert operation.bc_obps_regulated_operation.issued_by == cas_director

        mock_send_email.assert_called_once_with(
            EmailTemplateNames.BORO_ID_ISSUANCE,
            operation.operator.legal_name,
            operation,
        )

    @staticmethod
    def test_raises_exception_if_operation_is_non_regulated():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            status=Operation.Statuses.REGISTERED,
            registration_purpose=Operation.Purposes.ELECTRICITY_IMPORT_OPERATION,
        )
        cas_director = baker.make_recipe('registration.tests.utils.cas_director')

        with pytest.raises(Exception, match="Non-regulated operations cannot be issued BORO ID."):
            OperationService.generate_boro_id(cas_director.user_guid, operation.id)

    @staticmethod
    def test_raises_exception_if_operation_is_not_registered():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            status=Operation.Statuses.DRAFT,
            registration_purpose=Operation.Purposes.NEW_ENTRANT_OPERATION,
        )
        cas_director = baker.make_recipe('registration.tests.utils.cas_director')

        with pytest.raises(Exception, match="Operations must be registered before they can be issued a BORO ID."):
            OperationService.generate_boro_id(cas_director.user_guid, operation.id)

    @staticmethod
    def test_raises_exception_if_user_unauthorized():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            status=Operation.Statuses.REGISTERED,
        )
        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            OperationService.generate_boro_id(approved_user_operator.user.user_guid, operation.id)


class TestRemoveOperationRepresentative:
    @staticmethod
    def test_cannot_remove_anything_from_other_users_operations():
        user = baker.make_recipe('registration.tests.utils.industry_operator_user')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
        )
        contact1 = baker.make_recipe('registration.tests.utils.contact', id=1)
        contact2 = baker.make_recipe('registration.tests.utils.contact', id=2)
        operation.contacts.add(contact1, contact2)
        operation.save()
        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            OperationService.remove_operation_representative(user.user_guid, operation.id, contact1.id)

    @staticmethod
    def test_removes_operation_representative():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe('registration.tests.utils.operation', operator=approved_user_operator.operator)
        contact1 = baker.make_recipe('registration.tests.utils.contact', id=1)
        contact2 = baker.make_recipe('registration.tests.utils.contact', id=2)
        operation.contacts.add(contact1, contact2)
        operation.save()

        OperationService.remove_operation_representative(
            approved_user_operator.user.user_guid, operation.id, contact2.id
        )
        operation.refresh_from_db()

        assert operation.contacts.count() == 1
        assert operation.contacts.first().id == 1
        # confirm the contact was only removed from the operation, not removed from the db
        assert Contact.objects.filter(id=2).exists()


class TestUpdateOperationsOperator:
    @staticmethod
    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    def test_unauthorized_user_cannot_update_operations_operator(mock_get_by_guid):
        cas_admin = baker.make_recipe('registration.tests.utils.cas_admin')
        mock_get_by_guid.return_value = cas_admin
        operation = MagicMock()
        operator_id = uuid4()
        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            OperationService.update_operator(cas_admin.user_guid, operation, operator_id)

    @staticmethod
    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    def test_update_operations_operator_success(mock_get_by_guid):
        cas_analyst = baker.make_recipe('registration.tests.utils.cas_analyst')
        mock_get_by_guid.return_value = cas_analyst
        operation = baker.make_recipe('registration.tests.utils.operation')
        operator = baker.make_recipe('registration.tests.utils.operator')
        OperationService.update_operator(cas_analyst.user_guid, operation, operator.id)
        assert operation.operator == operator


class TestListOperationTimeline:
    @staticmethod
    def test_raise_exception_if_user_unapproved():
        user = baker.make_recipe('registration.tests.utils.industry_operator_user')
        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            OperationService.list_operations_timeline(
                user.user_guid,
                sort_field="created_at",
                sort_order="desc",
            )

    @staticmethod
    def test_gets_unfiltered_sorted_list_for_industry_user():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')

        baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operator=approved_user_operator.operator,
            end_date=None,
        )
        baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operator=approved_user_operator.operator,
            end_date=None,
        )
        baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operator=approved_user_operator.operator,
            end_date=None,
        )

        timeline = OperationService.list_operations_timeline(
            approved_user_operator.user.user_guid,
            sort_field="created_at",
            sort_order="desc",
            filters=OperationTimelineFilterSchema(),
        )

        assert timeline.count() == 3

    @staticmethod
    def test_gets_filtered_sorted_list_for_industry_user():
        filters = OperationTimelineFilterSchema(
            operation__bcghg_id='1',
        )
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')

        baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operator=approved_user_operator.operator,
            end_date=None,
            operation=baker.make_recipe(
                'registration.tests.utils.operation',
                bcghg_id=(baker.make(BcGreenhouseGasId, id='11111111111')),
                status=Operation.Statuses.REGISTERED,
            ),
        )
        baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operator=approved_user_operator.operator,
            end_date=None,
            operation=baker.make_recipe(
                'registration.tests.utils.operation',
                bcghg_id=(baker.make(BcGreenhouseGasId, id='15555555555')),
                status=Operation.Statuses.REGISTERED,
            ),
        )
        baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operator=approved_user_operator.operator,
            end_date=None,
            operation=baker.make_recipe(
                'registration.tests.utils.operation',
                bcghg_id=(baker.make(BcGreenhouseGasId, id='29999999999')),
                status=Operation.Statuses.REGISTERED,
            ),
        )

        timeline = OperationService.list_operations_timeline(
            approved_user_operator.user.user_guid, sort_field="created_at", sort_order="desc", filters=filters
        )
        assert timeline.count() == 2


class TestChangeOperationType:
    """
    Note that these tests are different from the integration tests for handling change of
    registration purpose as these unit tests only go as far as confirming that the
    OperationInformationIn payload is generated correctly.
    """

    @classmethod
    @patch(
        "service.facility_designated_operation_timeline_service.FacilityDesignatedOperationTimelineService.delete_facilities_by_operation_id",
    )
    def test_delete_service_called_if_type_changes(cls, mock_delete_facilities_by_operation_id: MagicMock):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            type=Operation.Types.SFO,
        )

        submitted_payload = OperationData(
            registration_purpose=Operation.Purposes.REPORTING_OPERATION,
            name='Updated Operation',
            type=Operation.Types.LFO,
            activities=[1, 2, 3],
        )
        returned_payload = OperationService.update_operation(
            approved_user_operator.user.user_guid, submitted_payload, operation.id
        )
        mock_delete_facilities_by_operation_id.assert_called_once_with(
            approved_user_operator.user.user_guid,
            operation.id,
        )

        assert returned_payload.registration_purpose == Operation.Purposes.REPORTING_OPERATION

        # assert handle_change_of_registration_purpose isn't modifying parts of the payload that should be untouched
        assert returned_payload.name == "Updated Operation"
```

## File: bc_obps/service/tests/test_activity_service.py
```python
import pytest
from registration.models import Activity
from service.activity_service import ActivityService

pytestmark = pytest.mark.django_db


class TestAddressService:
    @staticmethod
    def test_get_all_activities():
        all_activities_sorted = Activity.objects.all().order_by('weight', 'name')
        from_service = ActivityService.get_all_activities()
        for i in range(len(all_activities_sorted)):
            assert all_activities_sorted[i].name == from_service[i]['name']
            assert all_activities_sorted[i].applicable_to == from_service[i]['applicable_to']
            assert all_activities_sorted[i].regulated_name == from_service[i]['regulated_name']
```

## File: bc_obps/service/tests/test_application_access_service.py
```python
from common.exceptions import UserError
from service.application_access_service import ApplicationAccessService
import pytest
from model_bakery import baker
from registration.models import User, UserOperator
from registration.enums.enums import AccessRequestStates, AccessRequestTypes
from registration.tests.utils.bakers import operator_baker
from registration.tests.utils.helpers import CommonTestSetup

pytestmark = pytest.mark.django_db


class TestCheckUserAdminRequestEligibility:
    @staticmethod
    def test_user_eligible_for_admin_request():
        user = baker.make(User)
        operator = operator_baker()
        assert (
            ApplicationAccessService.is_user_eligible_to_request_admin_access(
                operator.id,
                user.user_guid,
            )
            is True
        )

    @staticmethod
    def test_user_already_admin_for_operator():
        user = baker.make(User)
        operator = operator_baker()
        baker.make(
            UserOperator,
            user=user,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
        )

        with pytest.raises(UserError, match="You are already an admin for this Operator."):
            ApplicationAccessService.is_user_eligible_to_request_admin_access(
                operator.id,
                user.user_guid,
            )

    @staticmethod
    def test_operator_already_has_admin():
        user = baker.make(User)
        admin_user = baker.make(User)
        operator = operator_baker()
        baker.make(
            UserOperator,
            user=admin_user,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
        )

        with pytest.raises(UserError, match="This Operator already has an admin user."):
            ApplicationAccessService.is_user_eligible_to_request_admin_access(
                operator.id,
                user.user_guid,
            )

    @staticmethod
    def test_user_already_has_pending_request():
        user = baker.make(User)
        operator = operator_baker()
        baker.make(
            UserOperator,
            user=user,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.PENDING,
        )

        with pytest.raises(UserError, match="You already have a pending request for this Operator."):
            ApplicationAccessService.is_user_eligible_to_request_admin_access(
                operator.id,
                user.user_guid,
            )

    @staticmethod
    def test_user_business_guid_matches_admin():
        admin_user = baker.make(User)
        user = baker.make(
            User,
            business_guid=admin_user.business_guid,
        )
        operator = operator_baker()

        baker.make(
            UserOperator,
            user=admin_user,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
        )

        assert (
            ApplicationAccessService.is_user_eligible_to_request_access(
                operator.id,
                user.user_guid,
            )
            is True
        )

    @staticmethod
    def test_user_business_guid_not_match_admin():
        admin_user = baker.make(User)
        user = baker.make(User)
        operator = operator_baker()

        baker.make(
            UserOperator,
            user=admin_user,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
        )
        with pytest.raises(
            Exception,
            match="Your business BCeID does not have access to this operator. Please contact your operator's administrator to request the correct business BCeID. If this issue persists, please contact",
        ):
            ApplicationAccessService.is_user_eligible_to_request_access(operator.id, user.user_guid)


class TestRequestAccess(CommonTestSetup):
    def test_request_admin_access(self, mocker):
        operator = operator_baker()
        user_requesting_admin = baker.make_recipe('registration.tests.utils.industry_operator_user')

        mock_email_service = mocker.patch('service.application_access_service.send_operator_access_request_email')

        response = ApplicationAccessService.request_admin_access(operator.id, user_requesting_admin.user_guid)

        assert response.get('user_operator_id') is not None
        assert response.get('operator_id') == operator.id

        mock_email_service.assert_called_once_with(
            AccessRequestStates.CONFIRMATION,
            AccessRequestTypes.ADMIN,
            operator.legal_name,
            user_requesting_admin.get_full_name(),
            user_requesting_admin.email,
        )

    def test_request_access(self, mocker):
        approved_admin_user_operator = baker.make_recipe(
            'registration.tests.utils.approved_user_operator',
            role=UserOperator.Roles.ADMIN,
            user=self.user,
            status=UserOperator.Statuses.APPROVED,
        )
        user = baker.make_recipe(
            'registration.tests.utils.industry_operator_user',
            business_guid=approved_admin_user_operator.user.business_guid,
        )

        mock_email_service = mocker.patch('service.application_access_service.send_operator_access_request_email')

        response = ApplicationAccessService.request_access(approved_admin_user_operator.operator.id, user.user_guid)

        assert response.get('user_operator_id') is not None
        assert response.get('operator_id') == approved_admin_user_operator.operator.id

        mock_email_service.assert_called_once_with(
            AccessRequestStates.CONFIRMATION,
            AccessRequestTypes.OPERATOR_WITH_ADMIN,
            approved_admin_user_operator.operator.legal_name,
            user.get_full_name(),
            user.email,
        )
```

## File: bc_obps/service/tests/test_contact_service.py
```python
import pytest
from unittest.mock import patch
from registration.schema import ContactFilterSchema, ContactIn
from service.contact_service import ContactService, PlacesAssigned
from model_bakery import baker
from registration.models.business_role import BusinessRole

pytestmark = pytest.mark.django_db


class TestListContactService:
    @staticmethod
    def test_list_contacts():
        user = baker.make_recipe('registration.tests.utils.cas_admin')

        operators = baker.make_recipe('registration.tests.utils.operator', _quantity=2)

        baker.make_recipe('registration.tests.utils.contact', operator=operators[0])
        baker.make_recipe(
            'registration.tests.utils.contact', operator=operators[1], _quantity=2
        )  # one operator has two contacts

        assert (
            ContactService.list_contacts(
                user_guid=user.user_guid, sort_field="created_at", sort_order="desc", filters=ContactFilterSchema()
            ).count()
            == 3
        )


class TestContactService:
    @staticmethod
    def test_get_with_places_assigned_with_contacts():
        contact = baker.make_recipe(
            'registration.tests.utils.contact',
            business_role=BusinessRole.objects.get(role_name='Operation Representative'),
        )
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        # add contact to operator (they have to be associated with the operator or will throw unauthorized)
        approved_user_operator.operator.contacts.set([contact])
        # add contact to operation
        operation = baker.make_recipe('registration.tests.utils.operation', operator=approved_user_operator.operator)
        operation.contacts.set([contact])

        result = ContactService.get_with_places_assigned(approved_user_operator.user.pk, contact.id)
        assert result.places_assigned == [
            PlacesAssigned(
                role_name=contact.business_role.role_name, operation_name=operation.name, operation_id=operation.id
            )
        ]

    @staticmethod
    def test_get_with_places_assigned_with_no_contacts():
        contact = baker.make_recipe(
            'registration.tests.utils.contact',
            business_role=BusinessRole.objects.get(role_name='Operation Representative'),
        )
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        # add contact to operator (they have to be associated with the operator or will throw unauthorized)
        approved_user_operator.operator.contacts.set([contact])

        result = ContactService.get_with_places_assigned(approved_user_operator.user.pk, contact.id)
        assert not hasattr(result, 'places_assigned')

    @staticmethod
    def test_raises_exception_if_contact_missing_address():
        contact = baker.make_recipe('registration.tests.utils.contact', address=None)

        with pytest.raises(
            Exception,
            match=f'The contact {contact.first_name} {contact.last_name} is missing address information. Please return to Contacts and fill in their address information before assigning them as an Operation Representative here.',
        ):
            ContactService.raise_exception_if_contact_missing_address_information(contact.id)

    @staticmethod
    def test_raises_exception_if_operation_rep_missing_required_fields():
        contact_with_no_address = baker.make_recipe(
            'registration.tests.utils.contact',
            business_role=BusinessRole.objects.get(role_name='Operation Representative'),
            address=None,
        )

        with pytest.raises(
            Exception,
            match=f'The contact {contact_with_no_address.first_name} {contact_with_no_address.last_name} is missing address information. Please return to Contacts and fill in their address information before assigning them as an Operation Representative here.',
        ):
            ContactService.raise_exception_if_contact_missing_address_information(contact_with_no_address.id)

        address_with_no_municipality = baker.make_recipe('registration.tests.utils.address', municipality=None)
        contact_with_address_no_municipality = baker.make_recipe(
            'registration.tests.utils.contact', address=address_with_no_municipality
        )

        with pytest.raises(
            Exception,
            match=f'The contact {contact_with_address_no_municipality.first_name} {contact_with_address_no_municipality.last_name} is missing address information. Please return to Contacts and fill in their address information before assigning them as an Operation Representative here.',
        ):
            ContactService.raise_exception_if_contact_missing_address_information(
                contact_with_address_no_municipality.id
            )

    @staticmethod
    @patch("service.contact_service.ContactDataAccessService.get_by_id")
    def test_validate_operation_representative_address_scenarios(mock_get_by_id):
        # Setup: Create contacts with different roles
        op_rep_contact = baker.make_recipe(
            'registration.tests.utils.contact',
            business_role=BusinessRole.objects.get(role_name='Operation Representative'),
        )
        non_op_rep_contact = baker.make_recipe(
            'registration.tests.utils.contact',
            business_role=BusinessRole.objects.get(role_name='Senior Officer'),  # Not Operation Representative
        )

        # Scenario 1: Operation Representative with missing address fields
        incomplete_address_data = {
            "street_address": "123 Main St",
            "municipality": "",  # Missing municipality
            "province": "BC",
            "postal_code": "V8V 1V1",
        }
        mock_get_by_id.return_value = op_rep_contact
        with pytest.raises(
            Exception, match="This contact is an 'Operation Representative' and must have all address-related fields."
        ):
            ContactService._validate_operation_representative_address(op_rep_contact.id, incomplete_address_data)

        # Scenario 2: Operation Representative with complete address
        complete_address_data = {
            "street_address": "123 Main St",
            "municipality": "Victoria",
            "province": "BC",
            "postal_code": "V8V 1V1",
        }
        mock_get_by_id.return_value = op_rep_contact
        # No exception should be raised
        ContactService._validate_operation_representative_address(op_rep_contact.id, complete_address_data)

        # Scenario 3: Non-Operation Representative with missing address fields
        empty_address_data = {"street_address": "", "municipality": "", "province": "", "postal_code": ""}
        mock_get_by_id.return_value = non_op_rep_contact
        # No exception should be raised
        ContactService._validate_operation_representative_address(non_op_rep_contact.id, empty_address_data)

    @staticmethod
    def test_validate_new_contact_email():
        # Setup: Create a contact
        email = "test1@email.ca"
        contact = baker.make_recipe('registration.tests.utils.contact', email=email)

        with pytest.raises(
            Exception,
            match=f"A contact with the email '{email}' already exists. Please add a different contact or edit the existing contact.",
        ):
            # Attempt to validate the same email for a different contact
            ContactService._validate_contact_email(contact_id=None, operator_id=contact.operator.id, email=email)

        # Validating a different email should not raise an exception
        new_email = "test2@email.ca"
        ContactService._validate_contact_email(contact_id=None, operator_id=contact.operator.id, email=new_email)

        # Validating the same email but with a different operator should not raise an exception
        new_operator = baker.make_recipe('registration.tests.utils.operator')
        ContactService._validate_contact_email(contact_id=None, operator_id=new_operator.id, email=email)


class TestUpdateContactService:
    @staticmethod
    @patch("service.contact_service.ContactService._validate_operation_representative_address")
    @patch("service.contact_service.ContactDataAccessService.user_has_access")
    def test_update_contact_successfully(mock_user_has_access, mock_validate_operation_representative_address):
        # Setup
        mock_user_has_access.return_value = True
        mock_validate_operation_representative_address.return_value = None
        user = baker.make_recipe('registration.tests.utils.cas_admin')
        contact = baker.make_recipe(
            'registration.tests.utils.contact',
            business_role=BusinessRole.objects.get(role_name='Operation Representative'),
        )
        baker.make_recipe('registration.tests.utils.user_operator', user=user, operator=contact.operator)
        payload = ContactIn(
            first_name="Updated",
            last_name="Contact",
            email="updated@example.com",
            phone_number="+16043334444",
            position_title="Manager",
            street_address="123 Updated St",
            municipality="Updated City",
            province="BC",
            postal_code="V8V 1V1",
        )

        # Execute
        updated_contact = ContactService.update_contact(user.user_guid, contact.id, payload)

        # Assert
        mock_user_has_access.assert_called_once_with(user.user_guid, contact.id)
        mock_validate_operation_representative_address.assert_called_once_with(
            contact.id,
            {
                'street_address': '123 Updated St',
                'municipality': 'Updated City',
                'province': 'BC',
                'postal_code': 'V8V 1V1',
            },
        )
        assert updated_contact.first_name == "Updated"
        assert updated_contact.last_name == "Contact"
        assert updated_contact.email == "updated@example.com"
        assert updated_contact.address.street_address == "123 Updated St"
        assert updated_contact.address.municipality == "Updated City"

    @staticmethod
    @patch("service.contact_service.ContactService._validate_operation_representative_address")
    @patch("service.contact_service.ContactDataAccessService.user_has_access")
    def test_update_contact_remove_address(mock_user_has_access, mock_validate_operation_representative_address):
        # Setup
        mock_user_has_access.return_value = True
        mock_validate_operation_representative_address.return_value = None
        user = baker.make_recipe('registration.tests.utils.cas_admin')
        senior_officer_role = BusinessRole.objects.get(role_name='Senior Officer')
        contact = baker.make_recipe('registration.tests.utils.contact', business_role=senior_officer_role)
        baker.make_recipe('registration.tests.utils.user_operator', user=user, operator=contact.operator)
        payload = ContactIn(
            first_name="Updated",
            last_name="Contact",
            email="updated@example.com",
            phone_number="+16043334444",
            position_title="Manager",
            # No address data
        )

        # Execute
        # override the get method to return the senior officer role(otherwise it will return the operation representative role and the test will fail)
        with patch('registration.models.BusinessRole.objects.get', return_value=senior_officer_role) as mock_get:
            updated_contact = ContactService.update_contact(user.user_guid, contact.id, payload)

        # Assert
        assert updated_contact.first_name == "Updated"
        assert updated_contact.address is None
        mock_get.assert_called_once()

    @staticmethod
    def test_validate_contact_email_update():
        # Setup: Create two contact
        email = "test1@email.ca"
        contact = baker.make_recipe('registration.tests.utils.contact', email=email)

        updating_contact = baker.make_recipe('registration.tests.utils.contact')

        # Attempt to validate the same email for a different contact
        with pytest.raises(
            Exception,
            match=f"The email '{email}' is in use by another contact. Please use a different email address.",
        ):
            ContactService._validate_contact_email(
                contact_id=updating_contact.id, operator_id=contact.operator.id, email=email
            )

        # Validating a different email should not raise an exception
        new_email = "test2@email.ca"
        ContactService._validate_contact_email(
            contact_id=updating_contact.id, operator_id=contact.operator.id, email=new_email
        )

        # Validating the same email as a contact with a different operator should not raise an exception
        email2 = "test2@email.con"
        different_operator = baker.make_recipe('registration.tests.utils.operator')
        baker.make_recipe('registration.tests.utils.contact', email=email2, operator=different_operator)
        ContactService._validate_contact_email(
            contact_id=updating_contact.id, operator_id=contact.operator.id, email=email2
        )

    @staticmethod
    def test_validate_contact_email_case_insensitive():
        # Setup: Create a contact with a specific email
        email = "TestEmail1@email.ca"
        contact = baker.make_recipe('registration.tests.utils.contact', email=email)

        # Attempt to validate the same email with different case for the same operator
        with pytest.raises(
            Exception,
            match=f"A contact with the email '{email.lower()}' already exists. Please add a different contact or edit the existing contact.",
        ):
            ContactService._validate_contact_email(
                contact_id=None, operator_id=contact.operator.id, email=email.lower()
            )

        other_operator = baker.make_recipe('registration.tests.utils.operator')
        # Validating the same email with different case for a different operator should not raise an exception
        ContactService._validate_contact_email(contact_id=None, operator_id=other_operator.id, email=email.lower())
```

## File: bc_obps/service/tests/test_document_service.py
```python
from unittest.mock import MagicMock, patch

from service.data_access_service.document_service import DocumentDataAccessService
from registration.models.document import Document
from registration.models.operation import Operation
from service.document_service import DocumentService
import pytest

from model_bakery import baker
from common.tests.utils.test_files import create_test_file

pytestmark = pytest.mark.django_db


class TestDocumentService:
    @staticmethod
    def test_get_operation_document_by_type_if_authorized():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe('registration.tests.utils.operation', operator=approved_user_operator.operator)
        document = baker.make_recipe('registration.tests.utils.document', operation=operation)
        retrieved_document = DocumentService.get_operation_document_by_type_if_authorized(
            approved_user_operator.user.user_guid, operation.id, 'boundary_map'
        )
        assert document.id == retrieved_document.id

    @staticmethod
    def test_cannot_get_operation_document_by_type_if_unauthorized():
        user = baker.make_recipe('registration.tests.utils.industry_operator_user')
        operation = baker.make_recipe('registration.tests.utils.operation')
        baker.make_recipe('registration.tests.utils.document')
        with pytest.raises(Exception, match='Unauthorized.'):
            DocumentService.get_operation_document_by_type_if_authorized(user.user_guid, operation.id, 'boundary_map')

    @staticmethod
    def test_create_operation_document():
        # the value received by the service is a File (transformed into this in the django ninja schema)
        file = create_test_file("test.pdf")
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe('registration.tests.utils.operation', operator=approved_user_operator.operator)
        document, created = DocumentService.create_or_replace_operation_document(
            approved_user_operator.user_id, operation.id, file, 'boundary_map'
        )

        assert Document.objects.count() == 1
        assert document.type.name == 'boundary_map'
        assert created is True

    @staticmethod
    def test_update_operation_document():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe('registration.tests.utils.operation', operator=approved_user_operator.operator)
        DocumentDataAccessService.create_document(
            approved_user_operator.user_id, create_test_file("test.pdf"), 'boundary_map', operation.id
        )

        updated_file = create_test_file("updated.pdf")
        document, created = DocumentService.create_or_replace_operation_document(
            approved_user_operator.user_id, operation.id, updated_file, 'boundary_map'
        )

        assert Document.objects.count() == 1
        assert document.type.name == 'boundary_map'

        assert document.file.name.find("test") == -1
        assert document.file.name.find("updated") != -1
        assert created is True

    @pytest.mark.parametrize("registration_status", [Operation.Statuses.REGISTERED, Operation.Statuses.DRAFT])
    def test_archive_or_delete_operation_document(self, registration_status):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe(
            'registration.tests.utils.operation', operator=approved_user_operator.operator, status=registration_status
        )
        # boundary map
        b_map = DocumentDataAccessService.create_document(
            approved_user_operator.user_id, create_test_file("test.pdf"), 'boundary_map', operation.id
        )
        # process flow diagram
        DocumentDataAccessService.create_document(
            approved_user_operator.user_id, create_test_file("test.pdf"), 'process_flow_diagram', operation.id
        )

        assert Document.objects.count() == 2
        assert operation.documents.count() == 2

        DocumentService.archive_or_delete_operation_document(
            approved_user_operator.user_id, operation.id, 'boundary_map'
        )

        assert Document.objects.count() == 1
        assert operation.documents.count() == 1

        if registration_status == Operation.Statuses.REGISTERED:
            """if the registration has been completed, the document should have been archived"""
            b_map.refresh_from_db()
            assert b_map.archived_at is not None
            assert b_map.archived_by is not None
        elif registration_status == Operation.Statuses.DRAFT:
            """if the registration wasn't completed, the document should have been deleted"""
            with pytest.raises(Document.DoesNotExist):
                b_map.refresh_from_db()  # this should raise an exception because it no longer exists in the db

    @patch("service.document_service.Document.get_file_url")
    def test_get_document_url_returns_the_url_if_authorized(self, mock_get_file_url: MagicMock):
        mock_get_file_url.return_value = "expected_url"

        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe('registration.tests.utils.operation', operator=approved_user_operator.operator)

        document = baker.make_recipe('registration.tests.utils.document', operation=operation)

        assert (
            DocumentService.get_document_url_if_authorized(approved_user_operator.user_id, document.id)
            == "expected_url"
        )

    def test_get_document_url_raises_if_not_authorized(self):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe('registration.tests.utils.operation')

        document = baker.make_recipe('registration.tests.utils.document', operation=operation)

        with pytest.raises(Exception, match='Unauthorized.'):
            DocumentService.get_document_url_if_authorized(approved_user_operator.user_id, document.id)

    def test_get_document_url_raises_if_document_not_associated_with_operation(self):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        document = baker.make_recipe('registration.tests.utils.document', operation=None)

        with pytest.raises(ValueError) as exc:
            DocumentService.get_document_url_if_authorized(approved_user_operator.user_id, document.id)

        assert str(exc.value) == f"Document id {document.id} is not associated with any operation"
```

## File: bc_obps/service/tests/test_facility_designated_operation_timeline_service.py
```python
from django.utils import timezone
from registration.constants import UNAUTHORIZED_MESSAGE
from registration.models.facility import Facility
from registration.models.facility_designated_operation_timeline import FacilityDesignatedOperationTimeline
from registration.schema import (
    FacilityDesignatedOperationTimelineFilterSchema,
)
from service.facility_designated_operation_timeline_service import FacilityDesignatedOperationTimelineService
import pytest
from model_bakery import baker

pytestmark = pytest.mark.django_db


class TestGetTimeline:
    @staticmethod
    def test_get_timeline_by_operation_id_for_irc_user():
        cas_admin = baker.make_recipe('registration.tests.utils.cas_admin')

        # 10 active facilities for selected operation
        facilities = baker.make_recipe('registration.tests.utils.facility', _quantity=10)
        selected_operation = baker.make_recipe('registration.tests.utils.operation')
        for facility in facilities:
            baker.make_recipe(
                'registration.tests.utils.facility_designated_operation_timeline',
                facility=facility,
                end_date=None,
                operation=selected_operation,
            )

        # timelines for 10 active facilities for other random operation
        for _ in range(10):
            baker.make_recipe(
                'registration.tests.utils.facility_designated_operation_timeline',
                facility=baker.make_recipe('registration.tests.utils.facility'),
                end_date=None,
            )

        expected_facilities = FacilityDesignatedOperationTimelineService.get_timeline_by_operation_id(
            cas_admin, selected_operation.id
        )

        assert expected_facilities.count() == 10

    @staticmethod
    def test_get_timeline_by_operation_id_for_unapproved_user_industry_user():
        industry_user = baker.make_recipe('registration.tests.utils.industry_operator_user')
        facility_designated_operation_timeline = baker.make_recipe(
            'registration.tests.utils.facility_designated_operation_timeline'
        )
        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            FacilityDesignatedOperationTimelineService.get_timeline_by_operation_id(
                industry_user, facility_designated_operation_timeline.operation.id
            )

    @staticmethod
    def test_get_timeline_by_operation_id_industry_user():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        users_operation = baker.make_recipe(
            'registration.tests.utils.operation', operator=approved_user_operator.operator
        )
        # user's timeline
        for _ in range(10):
            baker.make_recipe(
                'registration.tests.utils.facility_designated_operation_timeline',
                operation=users_operation,
                facility=baker.make_recipe('registration.tests.utils.facility', operation=users_operation),
                end_date=None,
            )
        # mimic transferred facilities
        # end_date will be not None, so system infers that these facilities have been transferred
        baker.make_recipe(
            'registration.tests.utils.facility_designated_operation_timeline', operation=users_operation, _quantity=5
        )

        # random timeline
        baker.make_recipe('registration.tests.utils.facility_designated_operation_timeline')

        facilities = FacilityDesignatedOperationTimelineService.get_timeline_by_operation_id(
            approved_user_operator.user, users_operation.id
        )
        # the industry user should only be able to see their one
        assert facilities.count() == 10


class TestListTimeline:
    @staticmethod
    def test_list_timeline_sort():
        cas_admin = baker.make_recipe('registration.tests.utils.cas_admin')
        facilities = baker.make_recipe('registration.tests.utils.facility', _quantity=10)
        operation = baker.make_recipe('registration.tests.utils.operation')

        for facility in facilities:
            baker.make_recipe(
                'registration.tests.utils.facility_designated_operation_timeline',
                facility=facility,
                operation=operation,
                end_date=None,
            )

        facilities_list = FacilityDesignatedOperationTimelineService.list_timeline_by_operation_id(
            cas_admin.user_guid,
            operation.id,
            'facility__name',
            'asc',
            FacilityDesignatedOperationTimelineFilterSchema(
                facility_bcghg_id=None, facility__name=None, facility__type=None, status=None
            ),
        )
        assert facilities_list.first().facility.name == 'Facility 01'
        assert facilities_list.last().facility.name == 'Facility 09'

    @staticmethod
    def test_list_timeline_filter():
        cas_admin = baker.make_recipe('registration.tests.utils.cas_admin')
        facilities = baker.make_recipe('registration.tests.utils.facility', _quantity=10)
        operation = baker.make_recipe('registration.tests.utils.operation')

        for facility in facilities:
            baker.make_recipe(
                'registration.tests.utils.facility_designated_operation_timeline',
                facility=facility,
                operation=operation,
                end_date=None,
            )

        facilities_list = FacilityDesignatedOperationTimelineService.list_timeline_by_operation_id(
            cas_admin.user_guid,
            operation.id,
            "facility__created_at",  # default value
            "desc",  # default value
            FacilityDesignatedOperationTimelineFilterSchema(
                facility_bcghg_id=None, facility__name='8', facility__type=None, status=None
            ),
        )
        assert facilities_list.count() == 1
        assert facilities_list.first().facility.name == 'Facility 08'


class TestFacilityDesignatedOperationTimelineService:
    @staticmethod
    def test_get_current_timeline():
        timeline_with_no_end_date = baker.make_recipe(
            'registration.tests.utils.facility_designated_operation_timeline', end_date=None
        )
        # another timeline for the same facility to make sure it is not returned
        baker.make_recipe(
            'registration.tests.utils.facility_designated_operation_timeline',
            facility=timeline_with_no_end_date.facility,
        )
        result_found = FacilityDesignatedOperationTimelineService.get_current_timeline(
            timeline_with_no_end_date.operation_id, timeline_with_no_end_date.facility_id
        )
        assert result_found == timeline_with_no_end_date
        timeline_with_end_date = baker.make_recipe(
            'registration.tests.utils.facility_designated_operation_timeline', end_date=timezone.now()
        )
        result_not_found = FacilityDesignatedOperationTimelineService.get_current_timeline(
            timeline_with_end_date.operation_id, timeline_with_end_date.facility_id
        )
        assert result_not_found is None

    @staticmethod
    def test_set_timeline_end_date():
        timeline = baker.make_recipe(
            'registration.tests.utils.facility_designated_operation_timeline',
        )
        end_date = timezone.now()

        updated_timeline = FacilityDesignatedOperationTimelineService.set_timeline_end_date(timeline, end_date)

        assert updated_timeline.end_date == end_date
        assert updated_timeline.facility_id == timeline.facility_id
        assert updated_timeline.operation_id == timeline.operation_id

        # Verify the changes are saved in the database
        timeline.refresh_from_db()
        assert timeline.end_date == end_date


class TestDeleteFacilitiesByOperationId:
    @staticmethod
    def test_delete_facilities_by_operation_id_for_unapproved_user():
        industry_user = baker.make_recipe('registration.tests.utils.industry_operator_user')
        operation = baker.make_recipe('registration.tests.utils.operation')

        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            FacilityDesignatedOperationTimelineService.delete_facilities_by_operation_id(
                industry_user.user_guid, operation.id
            )

    @staticmethod
    def test_delete_facilities_by_operation_id():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        operation = baker.make_recipe('registration.tests.utils.operation', operator=approved_user_operator.operator)
        random_operation = baker.make_recipe('registration.tests.utils.operation')
        # 10 facilities for operation
        facilities = baker.make_recipe('registration.tests.utils.facility', operation=operation, _quantity=10)
        for facility in facilities:
            baker.make_recipe(
                'registration.tests.utils.facility_designated_operation_timeline',
                facility=facility,
                end_date=None,
                operation=operation,
            )

        # timelines for 5 active facilities for other random operation
        for _ in range(5):
            baker.make_recipe(
                'registration.tests.utils.facility_designated_operation_timeline',
                facility=baker.make_recipe('registration.tests.utils.facility', operation=random_operation),
                end_date=None,
                operation=random_operation,
            )

        FacilityDesignatedOperationTimelineService.delete_facilities_by_operation_id(
            approved_user_operator.user.user_guid, operation.id
        )

        # Verify that the facilities have been deleted
        assert FacilityDesignatedOperationTimeline.objects.filter(operation_id=operation.id).count() == 0
        assert Facility.objects.filter(operation_id=operation.id).count() == 0
        # Verify that the other facilities are still present and attached to  random operation
        assert FacilityDesignatedOperationTimeline.objects.count() == 5
        assert Facility.objects.count() == 5
        assert Facility.objects.filter(operation_id=random_operation.id).count() == 5
```

## File: bc_obps/service/tests/test_facility_report_service.py
```python
from django.test import TestCase
from django.core.exceptions import ObjectDoesNotExist
from registration.models.activity import Activity
from reporting.models.report_emission_allocation import ReportEmissionAllocation
from reporting.models.report_raw_activity_data import ReportRawActivityData
from reporting.tests.utils.bakers import activity_baker
from service.facility_report_service import FacilityReportService, SaveFacilityReportData
from model_bakery import baker
from common.tests.utils.model_inspection import get_cascading_models
from reporting.models import (
    ReportActivity,
    ReportSourceType,
    ReportFuel,
    ReportUnit,
    ReportEmission,
    ReportMethodology,
    ReportProductEmissionAllocation,
)


class TestFacilityReportService(TestCase):
    def test_get_facility_throws_if_facility_report_does_not_exist(self):
        with self.assertRaises(ObjectDoesNotExist) as exception_context:
            FacilityReportService.get_facility_report_by_version_and_id(
                report_version_id=999, facility_id="00000000-00000000-00000000-00000000"
            )

        self.assertEqual(str(exception_context.exception), "FacilityReport matching query does not exist.")

    @staticmethod
    def test_returns_facility_report():
        facility_report = baker.make_recipe('reporting.tests.utils.facility_report')
        assert facility_report == FacilityReportService.get_facility_report_by_version_and_id(
            report_version_id=facility_report.report_version_id, facility_id=facility_report.facility_id
        )

    @staticmethod
    def test_returns_facility_report_with_split_activity_lists():
        """The facility report response splits activities into those selected on the
        related ReportOperation and the remaining "other" activities."""
        facility_report = baker.make_recipe('reporting.tests.utils.facility_report')
        a1 = activity_baker()
        a2 = activity_baker()
        report_operation = baker.make_recipe(
            'reporting.tests.utils.report_operation',
            report_version=facility_report.report_version,
        )
        report_operation.activities.add(a1, a2)

        result = FacilityReportService.get_facility_report_by_version_and_id(
            report_version_id=facility_report.report_version_id,
            facility_id=facility_report.facility_id,
        )

        facility_activity_ids = {a['id'] for a in result.facility_activities}
        other_activity_ids = {a['id'] for a in result.other_activities}

        assert facility_activity_ids == {a1.id, a2.id}
        assert other_activity_ids == {a.id for a in Activity.objects.exclude(id__in=[a1.id, a2.id])}

    def test_get_activities_throws_if_facility_report_does_not_exist(self):
        with self.assertRaises(ObjectDoesNotExist) as exception_context:
            FacilityReportService.get_activity_ids_for_facility(
                version_id=999, facility_id="00000000-00000000-00000000-00000000"
            )

        self.assertEqual(str(exception_context.exception), "FacilityReport matching query does not exist.")

    @staticmethod
    def test_returns_activity_id_list():
        facility_report = baker.make_recipe('reporting.tests.utils.facility_report')
        a1 = activity_baker()
        a2 = activity_baker()
        assert (
            len(
                FacilityReportService.get_activity_ids_for_facility(
                    version_id=facility_report.report_version_id, facility_id=facility_report.facility_id
                )
            )
            == 0
        )
        facility_report.activities.add(a1)
        facility_report.activities.add(a2)
        assert (
            len(
                FacilityReportService.get_activity_ids_for_facility(
                    version_id=facility_report.report_version_id, facility_id=facility_report.facility_id
                )
            )
            == 2
        )

    @staticmethod
    def test_saves_facility_report_form_data():
        facility_report = baker.make_recipe('reporting.tests.utils.facility_report', facility_bcghgid='abc')

        data = SaveFacilityReportData(
            facility_name="CHANGED",
            facility_type=facility_report.facility_type,
            facility_bcghgid=facility_report.facility_bcghgid,
            activities=[],
            regulated_products=[],
        )
        returned_data = FacilityReportService.save_facility_report(
            report_version_id=facility_report.report_version_id,
            facility_id=facility_report.facility_id,
            data=data,
        )
        assert returned_data.facility_name == "CHANGED"
        assert returned_data.facility_type == facility_report.facility_type
        assert returned_data.facility_bcghgid == facility_report.facility_bcghgid

    @staticmethod
    def test_update_facility_report():

        facility = baker.make_recipe('registration.tests.utils.facility')
        report_version = baker.make_recipe("reporting.tests.utils.report_version")
        facility_report = baker.make_recipe(
            'reporting.tests.utils.facility_report', report_version_id=report_version.id, facility_id=facility.id
        )

        facility.name = 'New Name'
        facility.type = 'Medium Facility'
        facility.save()

        updated_facility_report = FacilityReportService.update_facility_report(
            version_id=report_version.id, facility_id=facility.id
        )

        assert updated_facility_report.facility_name == 'New Name'
        assert updated_facility_report.facility_type == 'Medium Facility'
        assert updated_facility_report.facility_bcghgid == facility_report.facility_bcghgid

    @staticmethod
    def test_saves_facility_report_form_data_deletes_removed_activity_report_data():
        facility_report = baker.make_recipe('reporting.tests.utils.facility_report', facility_bcghgid='abc')
        activity_1 = baker.make_recipe(
            'reporting.tests.utils.report_activity', activity_id=1, facility_report_id=facility_report.id
        )
        activity_2 = baker.make_recipe(
            'reporting.tests.utils.report_activity', activity_id=2, facility_report_id=facility_report.id
        )
        source_type_1 = baker.make_recipe('reporting.tests.utils.report_source_type', report_activity_id=activity_1.id)
        source_type_2 = baker.make_recipe('reporting.tests.utils.report_source_type', report_activity_id=activity_2.id)
        unit_1 = baker.make_recipe('reporting.tests.utils.report_unit', report_source_type_id=source_type_1.id)
        unit_2 = baker.make_recipe('reporting.tests.utils.report_unit', report_source_type_id=source_type_2.id)
        fuel_1 = baker.make_recipe('reporting.tests.utils.report_fuel', report_unit_id=unit_1.id)
        fuel_2 = baker.make_recipe('reporting.tests.utils.report_fuel', report_unit_id=unit_2.id)
        emission_1 = baker.make_recipe('reporting.tests.utils.report_emission', report_fuel_id=fuel_1.id)
        emission_2 = baker.make_recipe('reporting.tests.utils.report_emission', report_fuel_id=fuel_2.id)
        baker.make_recipe('reporting.tests.utils.report_methodology', report_emission_id=emission_1.id)
        baker.make_recipe('reporting.tests.utils.report_methodology', report_emission_id=emission_2.id)
        report_emission_allocation = baker.make_recipe(
            'reporting.tests.utils.report_emission_allocation', facility_report_id=facility_report.id
        )
        baker.make_recipe(
            'reporting.tests.utils.report_product_emission_allocation',
            report_emission_allocation=report_emission_allocation,
        )

        data = SaveFacilityReportData(
            facility_name="CHANGED",
            facility_type=facility_report.facility_type,
            facility_bcghgid=facility_report.facility_bcghgid,
            activities=['1'],
            regulated_products=[],
        )
        FacilityReportService.save_facility_report(
            report_version_id=facility_report.report_version_id,
            facility_id=facility_report.facility_id,
            data=data,
        )
        assert ReportActivity.objects.filter(facility_report=facility_report.id).count() == 1
        assert ReportActivity.objects.filter(activity_id=2).count() == 0
        assert ReportSourceType.objects.filter(report_activity_id=activity_2.id).count() == 0
        assert ReportUnit.objects.filter(report_source_type_id=source_type_2.id).count() == 0
        assert ReportFuel.objects.filter(report_unit_id=unit_2.id).count() == 0
        assert ReportEmission.objects.filter(report_fuel_id=fuel_2.id).count() == 0
        assert ReportMethodology.objects.filter(report_emission_id=emission_2.id).count() == 0
        # ReportProductEmissionAllocation objects are not cascaded by the ReportActivity delete, but should also be cleared & re-entered if an activity is removed from the set
        report_emission_allocation_obj = ReportEmissionAllocation.objects.filter(
            facility_report_id=facility_report.id
        ).first()
        assert (
            ReportProductEmissionAllocation.objects.filter(
                report_emission_allocation=report_emission_allocation_obj
            ).count()
            == 0
        )

    @staticmethod
    def test_deleting_report_activity_data_cascades_correctly():
        cascading_models_names = {m.__name__ for m in get_cascading_models(ReportActivity)}

        assert cascading_models_names == {
            "ReportEmission",
            "ReportFuel",
            "ReportMethodology",
            "ReportSourceType",
            "ReportUnit",
        }

    def test_add_activities_to_facility_report_doesnt_duplicate_entries(self):

        facility_report = baker.make_recipe('reporting.tests.utils.facility_report')
        activity_1 = activity_baker()
        activity_2 = activity_baker()
        activity_3 = activity_baker()
        activity_4 = activity_baker()

        # Add activities to the facility report
        facility_report.activities.set([activity_1, activity_2])

        self.assertQuerySetEqual(
            facility_report.activities.all(),
            [activity_1, activity_2],
            ordered=False,
        )

        FacilityReportService.add_activities_to_facility_report(
            facility_report=facility_report, activities=[activity_2.id, activity_3.id, activity_4.id]
        )

        self.assertQuerySetEqual(
            facility_report.activities.all(),
            [activity_1, activity_2, activity_3, activity_4],
            ordered=False,
        )

    @staticmethod
    def test_set_activities_for_facility_report_deletes_raw_activity_data():
        """Test that removing activities from a facility report also deletes related ReportRawActivityData."""
        facility_report = baker.make_recipe('reporting.tests.utils.facility_report')
        activity_1 = activity_baker()
        activity_2 = activity_baker()

        # Add activities to the facility report
        facility_report.activities.set([activity_1, activity_2])

        # Create ReportActivity records (needed for the deletion logic to trigger)
        baker.make_recipe(
            'reporting.tests.utils.report_activity', activity_id=activity_1.id, facility_report_id=facility_report.id
        )
        baker.make_recipe(
            'reporting.tests.utils.report_activity', activity_id=activity_2.id, facility_report_id=facility_report.id
        )

        # Create raw activity data for both activities
        baker.make_recipe(
            'reporting.tests.utils.report_raw_activity_data',
            report_version=facility_report.report_version,
            facility_report=facility_report,
            activity=activity_1,
            json_data={"test": "data1"},
        )
        baker.make_recipe(
            'reporting.tests.utils.report_raw_activity_data',
            report_version=facility_report.report_version,
            facility_report=facility_report,
            activity=activity_2,
            json_data={"test": "data2"},
        )

        # Verify both raw data records exist
        assert ReportRawActivityData.objects.filter(facility_report=facility_report).count() == 2

        # Remove activity_2 from the facility report
        FacilityReportService.set_activities_for_facility_report(facility_report, [activity_1.id])

        # Verify that raw data for activity_2 is deleted but activity_1 remains
        remaining_raw_data = ReportRawActivityData.objects.filter(facility_report=facility_report)
        assert remaining_raw_data.count() == 1
        assert remaining_raw_data.first().activity == activity_1
        assert not ReportRawActivityData.objects.filter(facility_report=facility_report, activity=activity_2).exists()
```

## File: bc_obps/service/tests/test_facility_service.py
```python
import re
import pytest
from model_bakery import baker
from registration.models.bc_greenhouse_gas_id import BcGreenhouseGasId
from registration.schema import FacilityIn
from registration.models import (
    Address,
    Facility,
    Operation,
    User,
    AppRole,
    FacilityDesignatedOperationTimeline,
    UserOperator,
    WellAuthorizationNumber,
)
from registration.tests.utils.helpers import TestUtils
from registration.constants import UNAUTHORIZED_MESSAGE
from registration.tests.utils.bakers import (
    address_baker,
    operation_baker,
    operator_baker,
)
from service.facility_service import FacilityService
from unittest.mock import patch, MagicMock
from uuid import uuid4


pytestmark = pytest.mark.django_db


class TestGetIfAuthorized:
    @staticmethod
    def test_get_if_authorized_cas_user_success():
        user = baker.make(User, app_role=AppRole.objects.get(role_name="cas_analyst"))

        facility = baker.make_recipe('registration.tests.utils.facility')
        baker.make(FacilityDesignatedOperationTimeline, operation=operation_baker(), facility=facility)

        result = FacilityService.get_if_authorized(user.user_guid, facility.id)
        assert result == facility

    @staticmethod
    def test_get_if_authorized_industry_user_success():
        user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        operator = operator_baker()
        baker.make(
            UserOperator,
            user_id=user.user_guid,
            status=UserOperator.Statuses.APPROVED,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
        )
        owning_operation: Operation = baker.make_recipe('registration.tests.utils.operation', operator=operator)
        facility = baker.make_recipe('registration.tests.utils.facility', operation=owning_operation)

        result = FacilityService.get_if_authorized(user.user_guid, facility.id)
        assert result == facility

    @staticmethod
    def test_get_if_authorized_industry_user_fail():
        user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        timeline = baker.make_recipe('registration.tests.utils.facility_designated_operation_timeline')
        timeline.end_date = None
        timeline.save()
        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            FacilityService.get_if_authorized(user.user_guid, timeline.facility.id)

    @staticmethod
    def test_create_facilities_with_designated_operations_create_single_facility():
        user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        operator = operator_baker()
        baker.make(
            UserOperator,
            user_id=user.user_guid,
            status=UserOperator.Statuses.APPROVED,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
        )
        owning_operation: Operation = operation_baker(operator.id)
        payload = [
            FacilityIn(
                name='Test Facility 1',
                type=Facility.Types.SINGLE_FACILITY,
                latitude_of_largest_emissions=5,
                longitude_of_largest_emissions=5,
                operation_id=owning_operation.id,
            )
        ]

        FacilityService.create_facilities_with_designated_operations(user.user_guid, payload)

        assert len(Facility.objects.all()) == 1

    @staticmethod
    def test_create_facilities_with_designated_operations_create_multiple_facilities():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        owning_operation: Operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            type=Operation.Types.LFO,
        )
        payload = [
            FacilityIn(
                name='Test Facility 1',
                type=Facility.Types.MEDIUM_FACILITY,
                latitude_of_largest_emissions=5,
                longitude_of_largest_emissions=5,
                operation_id=owning_operation.id,
            ),
            FacilityIn(
                street_address='123 street',
                municipality='city',
                province='AB',
                postal_code='H0H0H0',
                name='Test Facility 2',
                type=Facility.Types.MEDIUM_FACILITY,
                latitude_of_largest_emissions=5,
                longitude_of_largest_emissions=5,
                operation_id=owning_operation.id,
                well_authorization_numbers=["12345", "654321"],
            ),
            FacilityIn(
                name='Test Facility 3',
                type=Facility.Types.SMALL_AGGREGATE,
                latitude_of_largest_emissions=5,
                longitude_of_largest_emissions=5,
                operation_id=owning_operation.id,
            ),
        ]

        FacilityService.create_facilities_with_designated_operations(approved_user_operator.user.user_guid, payload)

        assert len(Facility.objects.all()) == 3


class TestCreateFacilityWithDesignatedOperation:
    @staticmethod
    def test_create_sfo_facility_with_designated_operation_without_address():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')

        owning_operation = baker.make_recipe(
            'registration.tests.utils.operation', operator=approved_user_operator.operator
        )

        payload = FacilityIn(
            name='zip',
            type=Facility.Types.SINGLE_FACILITY,
            latitude_of_largest_emissions=5,
            longitude_of_largest_emissions=5,
            operation_id=owning_operation.id,
        )

        FacilityService.create_facility_with_designated_operation(approved_user_operator.user.user_guid, payload)
        assert Facility.objects.count() == 1
        assert Address.objects.count() == 1  # operation_baker() creates an address (mandatory for the operator)
        assert len(FacilityDesignatedOperationTimeline.objects.all()) == 1
        assert Facility.objects.get(name="zip") is not None

    @staticmethod
    def test_create_second_sfo_facility_error():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')

        owning_operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            type=Operation.Types.SFO,
        )

        payload = FacilityIn(
            name='doraemon',
            type=Facility.Types.SINGLE_FACILITY,
            latitude_of_largest_emissions=5,
            longitude_of_largest_emissions=5,
            operation_id=owning_operation.id,
        )
        payload2 = FacilityIn(
            name='shinchan',
            type=Facility.Types.SINGLE_FACILITY,
            latitude_of_largest_emissions=5,
            longitude_of_largest_emissions=5,
            operation_id=owning_operation.id,
        )

        FacilityService.create_facility_with_designated_operation(approved_user_operator.user.user_guid, payload)
        assert Facility.objects.count() == 1
        assert Facility.objects.get(name="doraemon") is not None

        # test if second facility raises proper exception
        with pytest.raises(
            Exception,
            match=re.escape(
                "This type of operation (SFO or EIO) can only have one facility, this page should not be accessible"
            ),
        ):
            FacilityService.create_facility_with_designated_operation(approved_user_operator.user.user_guid, payload2)

    @staticmethod
    def test_create_lfo_facility_with_designated_operation_with_address():
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')

        owning_operation = baker.make_recipe(
            'registration.tests.utils.operation', operator=approved_user_operator.operator
        )

        payload = FacilityIn(
            street_address='123 street',
            municipality='city',
            province='AB',
            postal_code='H0H0H0',
            name='zip',
            type=Facility.Types.LARGE_FACILITY,
            latitude_of_largest_emissions=5,
            longitude_of_largest_emissions=5,
            operation_id=owning_operation.id,
            well_authorization_numbers=["12345", "654321"],
        )

        FacilityService.create_facility_with_designated_operation(approved_user_operator.user.user_guid, payload)
        assert len(Facility.objects.all()) == 1
        assert (
            Address.objects.count() == 2
        )  # 2 because operation_baker() created an address (mandatory) for the operator
        assert WellAuthorizationNumber.objects.count() == 2
        assert len(FacilityDesignatedOperationTimeline.objects.all()) == 1
        assert Facility.objects.get(name="zip") is not None


class TestUpdateFacility:
    @staticmethod
    def _setup_facility(user_role="industry_user", with_address=False, facility_well_authorization_numbers=None):
        """
        Helper function to set up a test environment with a User, Operator, Operation, and Facility.

        This function creates and returns instances of a User, Owning Operation, and Facility.
        It allows optional inclusion of a facility address and well authorization numbers.

        Args:
            user_role (str): The role assigned to the User. Defaults to "industry_user".
                            If set to "unauthorized_user", the user will not be authorized for the operator.
            with_address (bool): If True, a Facility with an associated address will be created. Defaults to False.
            facility_well_authorization_numbers (list, optional): A list of well authorization numbers to associate with the Facility.
                                                                If None, no well authorization numbers will be created. Defaults to None.

        Returns:
            tuple: A tuple containing the User instance, Owning Operation instance, and Facility instance.
                (user, owning_operation, facility)
        """
        # Create a new instance of User model
        user = baker.make(User, app_role=AppRole.objects.get(role_name=user_role))

        # Create a new instance of the Operator model
        operator = baker.make_recipe('registration.tests.utils.operator')

        # Authorize the Operator User if required
        if user_role == "industry_user":
            baker.make_recipe('registration.tests.utils.approved_user_operator', user=user, operator=operator)

        # Create an Owning Operation
        owning_operation = baker.make_recipe('registration.tests.utils.operation', operator=operator)

        # Create Well Authorization Numbers if provided
        well_auth_objs = []
        if facility_well_authorization_numbers:
            well_auth_objs = [
                WellAuthorizationNumber.objects.create(well_authorization_number=num)
                for num in facility_well_authorization_numbers
            ]

        # Create a new instance of the Facility model
        address = address_baker() if with_address else None
        facility = baker.make_recipe('registration.tests.utils.facility', address=address, operation=owning_operation)

        # Set Well Authorization Numbers if they were created
        if well_auth_objs:
            facility.well_authorization_numbers.set(well_auth_objs)

        # Link the created facility with an operation
        baker.make(FacilityDesignatedOperationTimeline, operation=owning_operation, facility=facility)

        return user, owning_operation, facility

    @staticmethod
    def _assert_updated_mandatory_fields(facility, payload):
        """
        Asserts that the fields in the response data match the expected values from the payload.

        Args:
            response_data (dict): The data returned from the response, typically a JSON object.
            payload (dict): The expected data values to compare against.

        Asserts:
            - The 'name' field in response_data matches the 'name' field in payload.
            - The 'type' field in response_data matches the 'type' field in payload.
            - The 'latitude_of_largest_emissions' field in response_data is close to the corresponding value in payload.
            - The 'longitude_of_largest_emissions' field in response_data is close to the corresponding value in payload.

        Raises:
            AssertionError: If any of the assertions fail.
        """
        assert facility.name == payload.name
        assert facility.type == payload.type
        assert facility.latitude_of_largest_emissions == payload.latitude_of_largest_emissions
        assert facility.longitude_of_largest_emissions == payload.longitude_of_largest_emissions

    @staticmethod
    def test_update_facility_unauthorized():
        user, owning_operation, facility = TestUpdateFacility._setup_facility(user_role="cas_pending")
        payload = FacilityIn(
            name='zip',
            type=Facility.Types.SINGLE_FACILITY,
            latitude_of_largest_emissions=5,
            longitude_of_largest_emissions=5,
            operation_id=owning_operation.id,
        )
        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            FacilityService.update_facility(user.user_guid, facility.id, payload)

    @staticmethod
    def test_update_facility_with_mandatory_data():
        user, owning_operation, facility = TestUpdateFacility._setup_facility()

        # Assert Initial State
        TestUtils.assert_facility_db_state(facility)

        payload = FacilityIn(
            name='zip',
            type=Facility.Types.SINGLE_FACILITY,
            latitude_of_largest_emissions=5,
            longitude_of_largest_emissions=5,
            operation_id=owning_operation.id,
        )
        FacilityService.update_facility(user.user_guid, facility.id, payload)
        facility.refresh_from_db()

        # Assert Updated mandatory Fields
        TestUpdateFacility._assert_updated_mandatory_fields(facility, payload)

        # Assert Non-Updated Optional Fields
        assert facility.is_current_year is None
        assert facility.starting_date is None
        assert facility.well_authorization_numbers.count() == 0
        assert facility.address is None

        # Assert Updated State
        TestUtils.assert_facility_db_state(facility)

    @staticmethod
    def test_update_facility_with_all_data():
        user, owning_operation, facility = TestUpdateFacility._setup_facility()

        # Assert Initial State
        TestUtils.assert_facility_db_state(facility)

        payload = FacilityIn(
            name='zip',
            type=Facility.Types.LARGE_FACILITY,
            well_authorization_numbers=["1", "2", "3"],
            is_current_year=True,
            starting_date="2024-07-07T09:00:00.000Z",
            street_address="1234 Test St",
            municipality="Test City",
            province="ON",
            postal_code="T3S T1N",
            latitude_of_largest_emissions=5,
            longitude_of_largest_emissions=5,
            operation_id=owning_operation.id,
        )
        FacilityService.update_facility(user.user_guid, facility.id, payload)
        facility.refresh_from_db()

        # Assert Updated mandatory Fields
        TestUpdateFacility._assert_updated_mandatory_fields(facility, payload)

        # Assert Updated Optional Fields
        assert facility.is_current_year == payload.is_current_year
        assert facility.starting_date == payload.starting_date
        # need to convert payload.well_authorization_numbers to int for comparison
        # because well_authorization_number is an IntegerField in the model but a str in FacilityIn schema
        assert sorted(
            list(facility.well_authorization_numbers.values_list('well_authorization_number', flat=True))
        ) == sorted(list([int(number) for number in payload.well_authorization_numbers]))
        assert facility.address.street_address == payload.street_address
        assert facility.address.municipality == payload.municipality
        assert facility.address.province == payload.province
        assert facility.address.postal_code == payload.postal_code

        # Assert Updated State
        TestUtils.assert_facility_db_state(
            facility,
            expect_address=facility.address,
            expect_well_authorization_numbers=len(payload.well_authorization_numbers),
        )

    @staticmethod
    def test_update_facility_update_address():
        user, owning_operation, facility = TestUpdateFacility._setup_facility(with_address=True)

        # Assert Initial State
        TestUtils.assert_facility_db_state(facility, expect_address=facility.address)

        payload = FacilityIn(
            name='zip',
            type=Facility.Types.SINGLE_FACILITY,
            latitude_of_largest_emissions=5,
            longitude_of_largest_emissions=5,
            operation_id=owning_operation.id,
            street_address="1234 Test St",
        )
        FacilityService.update_facility(user.user_guid, facility.id, payload)
        facility.refresh_from_db()

        # Assert Updated mandatory Fields
        TestUpdateFacility._assert_updated_mandatory_fields(facility, payload)

        # Assert Updated Optional Fields
        assert facility.address.street_address == payload.street_address
        assert facility.address.municipality is None
        assert facility.address.province is None
        assert facility.address.postal_code is None

        # Assert Updated State
        TestUtils.assert_facility_db_state(facility, expect_address=facility.address)

    @staticmethod
    def test_update_facility_remove_address():
        user, owning_operation, facility = TestUpdateFacility._setup_facility(with_address=True)

        # Assert Initial State
        TestUtils.assert_facility_db_state(facility, expect_address=facility.address)

        payload = FacilityIn(
            name='zip',
            type=Facility.Types.SINGLE_FACILITY,
            latitude_of_largest_emissions=5,
            longitude_of_largest_emissions=5,
            operation_id=owning_operation.id,
        )
        FacilityService.update_facility(user.user_guid, facility.id, payload)
        facility.refresh_from_db()

        # Assert Updated mandatory Fields
        TestUpdateFacility._assert_updated_mandatory_fields(facility, payload)

        # Assert Updated State
        TestUtils.assert_facility_db_state(facility, expect_address=None)

    @staticmethod
    def test_update_facility_update_well_authorization_numbers():
        well_auth_numbers = ["123", "9876"]
        user, owning_operation, facility = TestUpdateFacility._setup_facility(
            facility_well_authorization_numbers=well_auth_numbers
        )

        # Assert Initial State
        TestUtils.assert_facility_db_state(facility, expect_well_authorization_numbers=len(well_auth_numbers))

        payload = FacilityIn(
            name='zip',
            type=Facility.Types.SINGLE_FACILITY,
            latitude_of_largest_emissions=5,
            longitude_of_largest_emissions=5,
            operation_id=owning_operation.id,
            well_authorization_numbers=["1", "2", "3"],
        )
        FacilityService.update_facility(user.user_guid, facility.id, payload)
        facility.refresh_from_db()

        # Assert Updated mandatory Fields
        TestUpdateFacility._assert_updated_mandatory_fields(facility, payload)

        # Assert Updated Optional Fields
        assert len(facility.well_authorization_numbers.all()) == len(payload.well_authorization_numbers)

        # Assert Updated State
        TestUtils.assert_facility_db_state(
            facility, expect_well_authorization_numbers=len(payload.well_authorization_numbers)
        )

    @staticmethod
    def test_update_facility_remove_well_authorization_numbers():
        well_auth_numbers = ["123", "9876"]
        user, owning_operation, facility = TestUpdateFacility._setup_facility(
            facility_well_authorization_numbers=well_auth_numbers
        )

        # Assert Initial State
        TestUtils.assert_facility_db_state(facility, expect_well_authorization_numbers=len(well_auth_numbers))

        payload = FacilityIn(
            name='zip',
            type=Facility.Types.SINGLE_FACILITY,
            latitude_of_largest_emissions=5,
            longitude_of_largest_emissions=5,
            operation_id=owning_operation.id,
        )
        FacilityService.update_facility(user.user_guid, facility.id, payload)
        facility.refresh_from_db()

        # Assert Updated mandatory Fields
        TestUpdateFacility._assert_updated_mandatory_fields(facility, payload)

        # Assert Updated Optional Fields
        assert len(facility.well_authorization_numbers.all()) == 0

        # Assert Updated State
        TestUtils.assert_facility_db_state(facility, expect_well_authorization_numbers=0)


class TestManageBcghgId:
    @staticmethod
    def test_generates_bcghg_id():
        director = baker.make_recipe('registration.tests.utils.cas_director')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            status=Operation.Statuses.REGISTERED,
        )
        facility = baker.make_recipe('registration.tests.utils.facility', operation=operation)
        FacilityService.generate_bcghg_id(director.user_guid, facility.id)
        facility.refresh_from_db()
        assert facility.bcghg_id is not None
        assert facility.bcghg_id.issued_by == director

    @staticmethod
    def test_test_generate_bcghg_id_with_manual_id_success():
        director = baker.make_recipe('registration.tests.utils.cas_director')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            status=Operation.Statuses.REGISTERED,
        )
        facility = baker.make_recipe('registration.tests.utils.facility', operation=operation)
        FacilityService.generate_bcghg_id(director.user_guid, facility.id, "11234567899")
        facility.refresh_from_db()
        assert facility.bcghg_id.id == "11234567899"
        assert facility.bcghg_id.issued_by == director
        assert facility.bcghg_id.comments == 'bcghg id manually set to facility'

    @staticmethod
    def test_generate_bcghg_id_with_existing_manual_id():
        director = baker.make_recipe('registration.tests.utils.cas_director')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            status=Operation.Statuses.REGISTERED,
        )
        facility = baker.make_recipe('registration.tests.utils.facility', operation=operation)
        BcGreenhouseGasId.objects.create(
            id="11234567890",
            issued_by_id=director.user_guid,
            comments='test',
        )

        FacilityService.generate_bcghg_id(director.user_guid, facility.id, "11234567890")
        facility.refresh_from_db()
        assert facility.bcghg_id.id == "11234567890"
        assert facility.bcghg_id.issued_by == director
        assert facility.bcghg_id.comments == 'test'

    @staticmethod
    def test_clear_bcghg_id():
        director = baker.make_recipe('registration.tests.utils.cas_director')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            status=Operation.Statuses.REGISTERED,
        )
        facility = baker.make_recipe(
            'registration.tests.utils.facility',
            operation=operation,
            bcghg_id=baker.make_recipe('registration.tests.utils.bcghg_id'),
        )

        FacilityService.clear_bcghg_id(director.user_guid, facility.id)
        facility.refresh_from_db()
        assert facility.bcghg_id is None


class TestUpdateFacilitysOperation:
    @staticmethod
    @pytest.mark.parametrize("role", [('cas_admin'), ('cas_pending'), ('industry_operator_user')])
    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    def test_unauthorized_user_cannot_update(mock_get_by_guid, role):
        user = baker.make_recipe(f'registration.tests.utils.{role}')
        mock_get_by_guid.return_value = user
        operation = MagicMock()
        operation_id = uuid4()
        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            FacilityService.update_operation_for_facility(user.user_guid, operation, operation_id)

    @staticmethod
    @pytest.mark.parametrize("role", [('cas_analyst'), ('cas_director')])
    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    def test_update_operation_for_facility_success(mock_get_by_guid, role):
        user = baker.make_recipe(f'registration.tests.utils.{role}')
        mock_get_by_guid.return_value = user
        operation = baker.make_recipe('registration.tests.utils.operation')
        facility = baker.make_recipe('registration.tests.utils.facility')
        FacilityService.update_operation_for_facility(user.user_guid, facility, operation.id)
        assert facility.operation == operation
```

## File: bc_obps/service/tests/test_facility_snapshot_service.py
```python
import pytest
from model_bakery import baker
from registration.models import (
    WellAuthorizationNumber,
    BcGreenhouseGasId,
    Operation,
)
from service.facility_snapshot_service import FacilitySnapshotService


pytestmark = pytest.mark.django_db


class TestCreateFacilitySnapshot:
    @staticmethod
    def test_create_facility_snapshot_copies_fields():
        """Ensure FacilitySnapshotService.create_facility_snapshot copies expected fields."""
        # Create director and operation with REGISTERED status
        director = baker.make_recipe('registration.tests.utils.cas_director')
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            status=Operation.Statuses.REGISTERED,
        )

        # Create BCGHG ID following test_facility_service pattern
        bcghg = BcGreenhouseGasId.objects.create(
            id='11234567890',
            issued_by_id=director.user_guid,
            comments='test',
        )

        # Create facility using recipe with all fields
        facility = baker.make_recipe(
            'registration.tests.utils.facility',
            operation=operation,
            bcghg_id=bcghg,
            name='Test Facility',
            is_current_year=True,
            type='Single Facility',
            swrs_facility_id=99,
            latitude_of_largest_emissions=48.123456,
            longitude_of_largest_emissions=-123.123456,
        )

        # Add well authorization numbers
        wan1 = WellAuthorizationNumber.objects.create(well_authorization_number=111111)
        wan2 = WellAuthorizationNumber.objects.create(well_authorization_number=222222)
        facility.well_authorization_numbers.set([wan1, wan2])

        # Create a user for audit fields
        user = baker.make_recipe('registration.tests.utils.industry_operator_user')

        # Call the service
        snapshot = FacilitySnapshotService.create_facility_snapshot(user.user_guid, facility, operation)

        # Refresh from DB and assert values copied
        snapshot.refresh_from_db()

        assert snapshot.facility_id == facility.id
        assert snapshot.operation_id == operation.id
        assert snapshot.name == facility.name
        assert snapshot.is_current_year == facility.is_current_year
        assert snapshot.starting_date == facility.starting_date
        assert snapshot.type == facility.type

        assert snapshot.street_address == facility.address.street_address
        assert snapshot.municipality == facility.address.municipality
        assert snapshot.province == facility.address.province
        assert snapshot.postal_code == facility.address.postal_code

        assert snapshot.swrs_facility_id == facility.swrs_facility_id
        assert snapshot.bcghg_id == str(bcghg.id)

        assert float(snapshot.latitude_of_largest_emissions) == float(facility.latitude_of_largest_emissions)
        assert float(snapshot.longitude_of_largest_emissions) == float(facility.longitude_of_largest_emissions)

        assert sorted(snapshot.well_authorization_numbers) == sorted(
            [
                wan1.well_authorization_number,
                wan2.well_authorization_number,
            ]
        )
```

## File: bc_obps/service/tests/test_form_builder_service.py
```python
import json
import uuid
from unittest.mock import MagicMock, patch
from django.core.cache import caches
from model_bakery.baker import prepare_recipe
import pytest
from registration.models.activity import Activity
from reporting.models import ActivityJsonSchema
from reporting.models.configuration import Configuration
from reporting.models.source_type import SourceType
from service.form_builder_service import (
    build_source_type_schema,
    handle_source_type_schema,
    build_schema,
    handle_gas_types,
)

pytestmark = pytest.mark.django_db


class TestHandleSourceTypeMethod:
    gas_type_enum = ["CAS", "GGIRCS"]
    gas_type_one_of = {"gas_type": "one_of"}

    def test_handle_source_type_schema_with_both_unit_and_fuel(self):
        json_schema = {
            "properties": {
                "units": {
                    "items": {
                        "properties": {
                            "fuels": {
                                "items": {
                                    "properties": {
                                        "fuelType": {"properties": {"fuelName": {"enum": []}}},
                                        "emissions": {
                                            "items": {
                                                "properties": {"gasType": {"enum": []}},
                                                "dependencies": {},
                                            },
                                        },
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        source_type_schema = prepare_recipe(
            "reporting.tests.utils.activity_source_type_json_schema",
            json_schema=json_schema,
            has_unit=True,
            has_fuel=True,
        )

        returned_schema = handle_source_type_schema(source_type_schema, self.gas_type_enum, self.gas_type_one_of)

        assert (
            len(
                returned_schema["properties"]["units"]["items"]["properties"]["fuels"]["items"]["properties"][
                    "fuelType"
                ]["properties"]["fuelName"]["enum"]
            )
            > 0
        )
        assert (
            returned_schema["properties"]["units"]["items"]["properties"]["fuels"]["items"]["properties"]["emissions"][
                "items"
            ]["properties"]["gasType"]["enum"]
            == self.gas_type_enum
        )
        assert (
            returned_schema["properties"]["units"]["items"]["properties"]["fuels"]["items"]["properties"]["emissions"][
                "items"
            ]["dependencies"]
            == self.gas_type_one_of
        )

    def test_handle_source_type_schema_with_unit_and_no_fuel(self):
        json_schema = {
            "properties": {
                "units": {
                    "items": {
                        "properties": {
                            "emissions": {
                                "items": {
                                    "properties": {"gasType": {"enum": []}},
                                    "dependencies": {},
                                },
                            },
                        },
                    }
                }
            }
        }

        source_type_schema = prepare_recipe(
            "reporting.tests.utils.activity_source_type_json_schema",
            json_schema=json_schema,
            has_unit=True,
            has_fuel=False,
        )

        returned_schema = handle_source_type_schema(source_type_schema, self.gas_type_enum, self.gas_type_one_of)

        assert (
            returned_schema["properties"]["units"]["items"]["properties"]["emissions"]["items"]["properties"][
                "gasType"
            ]["enum"]
            == self.gas_type_enum
        )
        assert (
            returned_schema["properties"]["units"]["items"]["properties"]["emissions"]["items"]["dependencies"]
            == self.gas_type_one_of
        )

    def test_handle_source_type_schema_with_fuel_and_no_unit(self):
        json_schema = {
            "properties": {
                "fuels": {
                    "items": {
                        "properties": {
                            "fuelType": {"properties": {"fuelName": {"enum": []}}},
                            "emissions": {
                                "items": {
                                    "properties": {"gasType": {"enum": []}},
                                    "dependencies": {},
                                },
                            },
                        }
                    }
                }
            }
        }
        source_type_schema = prepare_recipe(
            "reporting.tests.utils.activity_source_type_json_schema",
            json_schema=json_schema,
            has_unit=False,
            has_fuel=True,
        )

        returned_schema = handle_source_type_schema(source_type_schema, self.gas_type_enum, self.gas_type_one_of)

        assert (
            len(
                returned_schema["properties"]["fuels"]["items"]["properties"]["fuelType"]["properties"]["fuelName"][
                    "enum"
                ]
            )
            > 0
        )
        assert (
            returned_schema["properties"]["fuels"]["items"]["properties"]["emissions"]["items"]["properties"][
                "gasType"
            ]["enum"]
            == self.gas_type_enum
        )
        assert (
            returned_schema["properties"]["fuels"]["items"]["properties"]["emissions"]["items"]["dependencies"]
            == self.gas_type_one_of
        )

    def test_handle_source_type_schema_with_no_fuel_nor_unit(self):
        json_schema = {
            "properties": {
                "emissions": {
                    "items": {
                        "properties": {"gasType": {"enum": []}},
                        "dependencies": {},
                    }
                },
            }
        }
        source_type_schema = prepare_recipe(
            "reporting.tests.utils.activity_source_type_json_schema",
            json_schema=json_schema,
            has_unit=False,
            has_fuel=False,
        )

        returned_schema = handle_source_type_schema(source_type_schema, self.gas_type_enum, self.gas_type_one_of)

        assert (
            returned_schema["properties"]["emissions"]["items"]["properties"]["gasType"]["enum"] == self.gas_type_enum
        )
        assert returned_schema["properties"]["emissions"]["items"]["dependencies"] == self.gas_type_one_of

    def test_form_builder_uses_cache(self):
        mock_cache = MagicMock()
        caches["form_builder"] = mock_cache

        config_id = Configuration.objects.first().id
        activity_id = Activity.objects.first().id
        source_type_id = SourceType.objects.first().id

        # Nothing in cache, so the 'set' method is called
        mock_cache.get.return_value = None
        build_source_type_schema(config_id, activity_id, source_type_id, False)

        assert len(mock_cache.get.mock_calls) == 1
        mock_cache.get.assert_called_once_with(f"{config_id}-{activity_id}-{source_type_id}")
        assert len(mock_cache.set.mock_calls) == 1

        mock_cache.reset_mock()

        # Something in cache, so the 'set' method is not called
        # And we return the cached value
        mock_cache.get.return_value = "cached"
        return_value = build_source_type_schema(config_id, activity_id, source_type_id, False)
        assert return_value == "cached"
        assert len(mock_cache.get.mock_calls) == 1
        assert len(mock_cache.set.mock_calls) == 0

    def test_build_schema_fallback_no_activityjsonschema(self):
        mock_cache = MagicMock()
        caches["form_builder"] = mock_cache

        config_id = 1
        activity_id = 1
        source_types = []
        facility_id = str(uuid.uuid4())
        report_version_id = 1

        activity, _ = Activity.objects.update_or_create(id=activity_id, defaults={"name": "Test Activity"})

        ActivityJsonSchema.objects.filter(activity_id=activity_id).delete()

        mock_cache.get.return_value = None
        result = build_schema(config_id, activity_id, source_types, facility_id, report_version_id)
        result_schema = json.loads(result)

        # Assertions for fallback schema
        assert result_schema["schema"]["isFallbackSchema"] is True
        assert result_schema["schema"]["title"] == "Test Activity"
        assert "description" in result_schema["schema"]["properties"]
        assert result_schema["schema"]["properties"]["description"]["type"] == "string"
        assert result_schema["schema"]["properties"]["description"]["readOnly"] is True


class TestHandleGasTypes:
    """
    Tests for the handle_gas_types function, focused on the 'emission' property
    that is added to each gas type schema entry.
    """

    def _call_handle_gas_types(self, chemical_formula: str = "CO2") -> dict:
        """
        Helper that calls handle_gas_types with a single mocked gas type and
        returns the resulting gas_type_one_of dict.

        The internal ConfigurationElement DB query and handle_methodologies are
        both mocked so the tests focus purely on schema-building logic.
        """
        gas_type_id = 1

        # Represents the QuerySet item passed in as config_element_for_gas_types
        mock_config_elem = MagicMock()
        mock_config_elem.gas_type_id = gas_type_id
        mock_config_elem.gas_type.chemical_formula = chemical_formula

        # Represents a ConfigurationElement returned by the internal DB fetch;
        # gas_type_id must match so fetched_config_map is populated correctly.
        mock_fetched_elem = MagicMock()
        mock_fetched_elem.gas_type_id = gas_type_id

        gas_type_enum: list = []
        gas_type_one_of: dict = {"gasType": {"oneOf": []}}

        with (
            patch("service.form_builder_service.ConfigurationElement") as mock_ce,
            patch("service.form_builder_service.handle_methodologies"),
        ):
            mock_ce.objects.select_related.return_value.prefetch_related.return_value.filter.return_value = [
                mock_fetched_elem
            ]

            handle_gas_types(
                MagicMock(),  # source_type_schema (unused by the logic under test)
                gas_type_enum,
                gas_type_one_of,
                [mock_config_elem],
                activity_id=1,
                source_type_id=1,
                config_id=1,
                add_not_applicable_methodology=False,
            )

        return gas_type_one_of

    def test_handle_gas_types_adds_emission_property(self):
        """handle_gas_types should add an 'emission' key to the gas type schema."""
        gas_type_one_of = self._call_handle_gas_types()
        schema_properties = gas_type_one_of["gasType"]["oneOf"][0]["properties"]
        assert "emission" in schema_properties

    def test_handle_gas_types_emission_title_includes_chemical_formula(self):
        """The emission title should dynamically include the gas type chemical formula."""
        chemical_formula = "CO2"
        gas_type_one_of = self._call_handle_gas_types(chemical_formula)
        emission = gas_type_one_of["gasType"]["oneOf"][0]["properties"]["emission"]
        assert chemical_formula in emission["title"]

    def test_handle_gas_types_emission_type_is_number(self):
        """The emission property should declare type 'number'."""
        gas_type_one_of = self._call_handle_gas_types()
        emission = gas_type_one_of["gasType"]["oneOf"][0]["properties"]["emission"]
        assert emission["type"] == "number"

    def test_handle_gas_types_emission_minimum_is_zero(self):
        """The emission property should enforce a minimum value of 0."""
        gas_type_one_of = self._call_handle_gas_types()
        emission = gas_type_one_of["gasType"]["oneOf"][0]["properties"]["emission"]
        assert emission["minimum"] == 0
```

## File: bc_obps/service/tests/test_operator_service.py
```python
from registration.models.address import Address
from registration.models.partner_operator import PartnerOperator
from registration.models.parent_operator import ParentOperator
from registration.models.operator import Operator
from registration.schema import OperatorIn, ParentOperatorIn, PartnerOperatorIn
from service.operator_service import OperatorService
import pytest
from registration.models.app_role import AppRole
from registration.models.user import User
from registration.models.user_operator import UserOperator
from model_bakery import baker

pytestmark = pytest.mark.django_db


class TestUpdateOperator:
    @staticmethod
    def test_update_operator_no_address_change():
        user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        operator = baker.make_recipe(
            'registration.tests.utils.operator',
        )
        baker.make(
            UserOperator,
            user_id=user.user_guid,
            status=UserOperator.Statuses.APPROVED,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
        )
        payload = OperatorIn(
            business_structure='BC Corporation',
            cra_business_number='123456789',
            legal_name='Legal Name Example',
            trade_name='Trade Name Example',
            bc_corporate_registry_number='BCG1234567',
            mailing_address=operator.mailing_address.id,
            street_address=operator.mailing_address.street_address,
            municipality=operator.mailing_address.municipality,
            province=operator.mailing_address.province,
            postal_code=operator.mailing_address.postal_code,
        )
        OperatorService.update_operator(user.user_guid, payload)
        assert Operator.objects.count() == 1
        updated_operator = Operator.objects.first()
        assert updated_operator.legal_name == 'Legal Name Example'
        assert Address.objects.count() == 1
        assert updated_operator.mailing_address.id == operator.mailing_address.id
        assert updated_operator.mailing_address.street_address == operator.mailing_address.street_address

    @staticmethod
    def test_update_operator_address_change():
        user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        operator = baker.make_recipe(
            'registration.tests.utils.operator',
        )
        baker.make(
            UserOperator,
            user_id=user.user_guid,
            status=UserOperator.Statuses.APPROVED,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
        )

        payload = OperatorIn(
            business_structure='BC Corporation',
            cra_business_number='123456789',
            legal_name='Legal Name Example',
            trade_name='Trade Name Example',
            bc_corporate_registry_number='BCG1234567',
            mailing_address=operator.mailing_address.id,
            street_address='balloons',
            municipality='balloons',
            province='AB',
            postal_code='H0H0H0',
        )
        OperatorService.update_operator(user.user_guid, payload)
        assert Operator.objects.count() == 1
        updated_operator = Operator.objects.first()
        assert updated_operator.legal_name == 'Legal Name Example'
        assert Address.objects.count() == 1
        assert updated_operator.mailing_address.id == operator.mailing_address.id
        assert updated_operator.mailing_address.street_address == 'balloons'

    @staticmethod
    def test_update_operator_with_partner_operators():
        user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        operator = baker.make_recipe(
            'registration.tests.utils.operator',
        )
        baker.make_recipe('registration.tests.utils.partner_operator', bc_obps_operator=operator, _quantity=3)
        assert PartnerOperator.objects.count() == 3
        baker.make(
            UserOperator,
            user_id=user.user_guid,
            status=UserOperator.Statuses.APPROVED,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
        )

        payload = OperatorIn(
            business_structure='General Partnership',
            cra_business_number='123456789',
            legal_name='Legal Name Example',
            trade_name='Trade Name Example',
            bc_corporate_registry_number='BCG1234567',
            street_address='balloons',
            municipality='balloons',
            province='AB',
            postal_code='H0H0H0',
            mailing_address=operator.mailing_address.id,
        )
        payload.partner_operators_array = [
            PartnerOperatorIn(
                id=operator.partner_operators.first().id,
                partner_legal_name='balloons legally',
                partner_trade_name='balloons tradily',
                partner_cra_business_number='999999999',
                partner_bc_corporate_registry_number='abc1234567',
                partner_business_structure='General Partnership',
            ),
            PartnerOperatorIn(
                partner_legal_name='i am new',
                partner_trade_name='new',
                partner_cra_business_number='111111111',
                partner_business_structure='General Partnership',
                partner_bc_corporate_registry_number='ghj1234567',
            ),
        ]
        OperatorService.update_operator(user.user_guid, payload)
        assert Operator.objects.count() == 1
        updated_operator = Operator.objects.get(legal_name='Legal Name Example')
        assert updated_operator.partner_operators.count() == 2
        assert updated_operator.partner_operators.get(legal_name='balloons legally') is not None
        assert updated_operator.partner_operators.get(legal_name='i am new') is not None

    @staticmethod
    def test_update_operator_archive_all_partner_operators():
        user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        operator = baker.make_recipe(
            'registration.tests.utils.operator',
        )
        baker.make_recipe('registration.tests.utils.partner_operator', bc_obps_operator=operator, _quantity=3)
        baker.make(
            UserOperator,
            user_id=user.user_guid,
            status=UserOperator.Statuses.APPROVED,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
        )

        payload = OperatorIn(
            business_structure='General Partnership',
            cra_business_number='123456789',
            legal_name='Legal Name Example',
            trade_name='Trade Name Example',
            bc_corporate_registry_number='BCG1234567',
            street_address='balloons',
            municipality='balloons',
            province='AB',
            postal_code='H0H0H0',
            mailing_address=operator.mailing_address.id,
        )

        OperatorService.update_operator(user.user_guid, payload)
        assert Operator.objects.count() == 1
        updated_operator = Operator.objects.get(legal_name='Legal Name Example')
        assert updated_operator.partner_operators.count() == 0

    @staticmethod
    def test_update_operator_with_parent_operators():
        user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        operator = baker.make_recipe(
            'registration.tests.utils.operator',
        )
        baker.make_recipe('registration.tests.utils.canadian_parent_operator', child_operator=operator, _quantity=2)

        baker.make_recipe('registration.tests.utils.foreign_parent_operator', child_operator=operator, _quantity=2)

        assert ParentOperator.objects.count() == 4
        baker.make(
            UserOperator,
            user_id=user.user_guid,
            status=UserOperator.Statuses.APPROVED,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
        )

        payload = OperatorIn(
            business_structure='BC Corporation',
            cra_business_number='123456789',
            legal_name='Legal Name Example',
            trade_name='Trade Name Example',
            bc_corporate_registry_number='BCG1234567',
            mailing_address=operator.mailing_address.id,
            street_address='balloons',
            municipality='balloons',
            province='AB',
            postal_code='H0H0H0',
        )
        payload.parent_operators_array = [
            ParentOperatorIn(
                id=operator.parent_operators.first().id,
                po_legal_name='balloons legally',
                po_cra_business_number='999999999',
                po_mailing_address=operator.parent_operators.first().mailing_address.id,
                po_street_address='edited street address',
                po_municipality=operator.parent_operators.first().mailing_address.municipality,
                po_province=operator.parent_operators.first().mailing_address.province,
                po_postal_code=operator.parent_operators.first().mailing_address.postal_code,
            ),
            ParentOperatorIn(
                id=operator.parent_operators.last().id,
                po_legal_name='i used to be a foreign operator',
                po_cra_business_number='111111111',
                po_street_address='new',
                po_municipality='new',
                po_province='AB',
                po_postal_code='H0H0H0',
            ),
        ]
        OperatorService.update_operator(user.user_guid, payload)
        assert Operator.objects.count() == 1
        updated_operator = Operator.objects.get(legal_name='Legal Name Example')
        assert updated_operator.mailing_address.street_address == 'balloons'

        assert updated_operator.parent_operators.count() == 2
        parent_operator_1 = updated_operator.parent_operators.first()
        assert parent_operator_1.legal_name == 'balloons legally'
        assert parent_operator_1.mailing_address.street_address == 'edited street address'
        parent_operator_2 = updated_operator.parent_operators.last()
        assert parent_operator_2.legal_name == 'i used to be a foreign operator'
        assert parent_operator_2.mailing_address.street_address == 'new'

    @staticmethod
    def test_update_operator_delete_parent_operator_address():
        user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        operator = baker.make_recipe(
            'registration.tests.utils.operator',
        )
        baker.make_recipe(
            'registration.tests.utils.canadian_parent_operator',
            child_operator=operator,
        )

        baker.make(
            UserOperator,
            user_id=user.user_guid,
            status=UserOperator.Statuses.APPROVED,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
        )
        payload = OperatorIn(
            business_structure='BC Corporation',
            cra_business_number='123456789',
            legal_name=operator.legal_name,
            trade_name=operator.trade_name,
            bc_corporate_registry_number=operator.bc_corporate_registry_number,
            mailing_address=operator.mailing_address.id,
            street_address=operator.mailing_address.street_address,
            municipality=operator.mailing_address.municipality,
            province=operator.mailing_address.province,
            postal_code=operator.mailing_address.postal_code,
        )
        payload.parent_operators_array = [
            ParentOperatorIn(
                id=operator.parent_operators.first().id,
                po_mailing_address=operator.parent_operators.first().mailing_address.id,
                po_legal_name='balloons legally',
                foreign_address='foreign address',
                foreign_tax_id_number='5',
            ),
        ]
        OperatorService.update_operator(user.user_guid, payload)
        # the parent operator address record should have been archived, so only the operator address is left
        assert Address.objects.count() == 1

    @staticmethod
    def test_update_operator_archive_all_parent_operators():
        user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        operator = baker.make_recipe(
            'registration.tests.utils.operator',
        )
        baker.make_recipe('registration.tests.utils.canadian_parent_operator', child_operator=operator, _quantity=2)

        baker.make_recipe('registration.tests.utils.foreign_parent_operator', child_operator=operator, _quantity=2)

        baker.make(
            UserOperator,
            user_id=user.user_guid,
            status=UserOperator.Statuses.APPROVED,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
        )

        payload = OperatorIn(
            business_structure='BC Corporation',
            cra_business_number='123456789',
            legal_name='Legal Name Example',
            trade_name='Trade Name Example',
            bc_corporate_registry_number='BCG1234567',
            mailing_address=operator.mailing_address.id,
            street_address='balloons',
            municipality='balloons',
            province='AB',
            postal_code='H0H0H0',
        )

        OperatorService.update_operator(user.user_guid, payload)
        assert Operator.objects.count() == 1
        updated_operator = Operator.objects.get(legal_name='Legal Name Example')
        assert updated_operator.parent_operators.count() == 0


class TestOperatorHasRequiredFields:
    @staticmethod
    def test_operator_has_all_required_fields():
        operator = baker.make_recipe('registration.tests.utils.operator')
        assert OperatorService.has_required_fields(operator) is True

    @staticmethod
    def test_operator_does_not_have_all_required_fields():
        # Create an operator with the required fields, but set legal_name to an empty string
        operator = baker.make_recipe(
            'registration.tests.utils.operator', legal_name=' '
        )  # Set legal_name to an empty string
        assert OperatorService.has_required_fields(operator) is False
```

## File: bc_obps/service/tests/test_pdf_generator_service.py
```python
from unittest.mock import patch, MagicMock
import pytest
from django.template.exceptions import TemplateDoesNotExist
from service.pdf.pdf_generator_service import PDFGeneratorService


class TestPDFGeneratorService:
    @patch('service.pdf.pdf_generator_service.get_template')
    @patch('service.pdf.pdf_generator_service.HTML')
    def test_generate_pdf_success(self, mock_html, mock_get_template):
        # Arrange
        template_name = "test.html"
        context = {"key": "value"}
        filename = "test.pdf"
        mock_template = MagicMock()
        mock_template.render.return_value = "<html>test</html>"
        mock_get_template.return_value = mock_template
        mock_pdf = b"test pdf content"
        mock_html.return_value.write_pdf.return_value = mock_pdf

        # Act
        generator, output_filename, size = PDFGeneratorService.generate_pdf(
            template_name=template_name, context=context, filename=filename
        )

        # Assert
        mock_get_template.assert_called_once_with(template_name)
        mock_template.render.assert_called_once_with(context)
        mock_html.assert_called_once_with(string="<html>test</html>")
        mock_html.return_value.write_pdf.assert_called_once()
        assert output_filename == filename
        assert size == len(mock_pdf)
        assert b"".join(generator) == mock_pdf

    @patch('service.pdf.pdf_generator_service.get_template')
    def test_generate_pdf_template_not_found(self, mock_get_template):
        # Arrange
        mock_get_template.side_effect = TemplateDoesNotExist("test.html")

        # Act/Assert
        with pytest.raises(ValueError, match="Failed to generate PDF: template 'test.html' not found"):
            PDFGeneratorService.generate_pdf("test.html", {}, "test.pdf")

    @patch('service.pdf.pdf_generator_service.get_template')
    @patch('service.pdf.pdf_generator_service.HTML')
    def test_generate_pdf_with_logo(self, mock_html, mock_get_template):
        # Arrange
        template_name = "test.html"
        context = {"key": "value"}
        filename = "test.pdf"
        logo_file_name = "logo.png"
        mock_template = MagicMock()
        mock_template.render.return_value = "<html>test</html>"
        mock_get_template.return_value = mock_template
        mock_pdf = b"test pdf content"
        mock_html.return_value.write_pdf.return_value = mock_pdf

        # Act
        with patch.object(PDFGeneratorService, '_get_logo_base64', return_value="base64_logo") as mock_get_logo:
            generator, output_filename, size = PDFGeneratorService.generate_pdf(
                template_name=template_name, context=context, filename=filename, logo_file_name=logo_file_name
            )

        # Assert
        mock_get_logo.assert_called_once_with(logo_file_name)
        assert context["logo_base64"] == "base64_logo"
        mock_get_template.assert_called_once_with(template_name)
        mock_template.render.assert_called_once_with(context)
        mock_html.assert_called_once_with(string="<html>test</html>")
        mock_html.return_value.write_pdf.assert_called_once()
        assert output_filename == filename
        assert size == len(mock_pdf)
        assert b"".join(generator) == mock_pdf

    @patch('service.pdf.pdf_generator_service.get_template')
    @patch('service.pdf.pdf_generator_service.HTML')
    def test_generate_pdf_weasyprint_error(self, mock_html, mock_get_template):
        # Arrange
        mock_template = MagicMock()
        mock_template.render.return_value = "<html>test</html>"
        mock_get_template.return_value = mock_template
        mock_html.return_value.write_pdf.side_effect = Exception("PDF generation failed")

        # Act/Assert
        with pytest.raises(ValueError, match="Failed to generate PDF document"):
            PDFGeneratorService.generate_pdf("test.html", {}, "test.pdf")
```

## File: bc_obps/service/tests/test_report_service_past_report.py
```python
import pytest
from unittest import mock
from common.exceptions import UserError
from model_bakery.baker import make_recipe
from registration.models import Operation
from registration.tests.utils.bakers import (
    bc_obps_regulated_operation_baker,
    operation_baker,
    operator_baker,
)
from reporting.models import ReportVersion
from service.report_service import ReportService


USER_GUID = "00000000-0000-0000-0000-000000000000"
REPORTING_YEAR = 2024


def make_past_report_data(
    operation_id,
    registration_purpose=Operation.Purposes.REPORTING_OPERATION,
):
    data = mock.Mock()
    data.operation_id = operation_id
    data.reporting_year = REPORTING_YEAR
    data.registration_purpose = registration_purpose
    return data


def mock_user_operator(mock_get_user_operator, operator):
    mock_get_user_operator.return_value.operator_id = operator.id
    mock_get_user_operator.return_value.operator = operator


@pytest.mark.django_db
class TestReportServicePastReport:
    @pytest.mark.parametrize(
        "operation_type, selected_registration_purpose, has_boro",
        [
            (
                Operation.Types.LFO,
                Operation.Purposes.REPORTING_OPERATION,
                True,
            ),
            (
                Operation.Types.EIO,
                Operation.Purposes.ELECTRICITY_IMPORT_OPERATION,
                False,
            ),
        ],
    )
    def test_create_report_for_reporting_year_uses_selected_registration_purpose(
        self,
        operation_type,
        selected_registration_purpose,
        has_boro,
    ):
        operator = operator_baker()
        operation = operation_baker(
            operator_id=operator.id,
            type=operation_type,
            status=Operation.Statuses.REGISTERED,
            registration_purpose=Operation.Purposes.OBPS_REGULATED_OPERATION,
            bc_obps_regulated_operation=(bc_obps_regulated_operation_baker() if has_boro else None),
        )

        make_recipe(
            "registration.tests.utils.operation_designated_operator_timeline",
            operator=operator,
            operation=operation,
            start_date="2024-01-01",
            end_date=None,
        )

        data = make_past_report_data(
            operation.id,
            selected_registration_purpose,
        )

        with (
            mock.patch(
                "service.data_access_service.report_service.ReportDataAccessService.report_exists",
                return_value=False,
            ),
            mock.patch(
                "service.data_access_service.user_service.UserDataAccessService.get_user_operator_by_user",
            ) as mock_get_user_operator,
        ):
            mock_user_operator(mock_get_user_operator, operator)

            report_version_id = ReportService.create_report_for_reporting_year(
                user_guid=USER_GUID,
                data=data,
            )

        report_version = ReportVersion.objects.get(id=report_version_id)
        operation.refresh_from_db()

        assert operation.registration_purpose == Operation.Purposes.OBPS_REGULATED_OPERATION
        assert report_version.report_operation.registration_purpose == selected_registration_purpose

    def test_create_report_for_reporting_year_fallback_rejects_unregistered_operation(
        self,
    ):
        operator = operator_baker()
        operation = operation_baker(
            operator_id=operator.id,
            type=Operation.Types.LFO,
            status=Operation.Statuses.DRAFT,
            registration_purpose=Operation.Purposes.REPORTING_OPERATION,
            bc_obps_regulated_operation=None,
        )

        data = make_past_report_data(operation.id)

        with (
            mock.patch(
                "service.report_service.OperationDesignatedOperatorTimelineService.get_operation_designated_operator_for_reporting_year",
                return_value=None,
            ),
            mock.patch(
                "service.data_access_service.user_service.UserDataAccessService.get_user_operator_by_user",
            ) as mock_get_user_operator,
        ):
            mock_user_operator(mock_get_user_operator, operator)

            with pytest.raises(UserError) as exception_context:
                ReportService.create_report_for_reporting_year(
                    user_guid=USER_GUID,
                    data=data,
                )

        assert (
            str(exception_context.value)
            == "Only currently registered operations can be used to create a report for this reporting year."
        )

    def test_create_report_for_reporting_year_rejects_existing_report(self):
        operator = operator_baker()
        operation = operation_baker(
            operator_id=operator.id,
            type=Operation.Types.LFO,
            status=Operation.Statuses.REGISTERED,
            registration_purpose=Operation.Purposes.REPORTING_OPERATION,
            bc_obps_regulated_operation=bc_obps_regulated_operation_baker(),
        )

        data = make_past_report_data(operation.id)

        with (
            mock.patch(
                "service.data_access_service.report_service.ReportDataAccessService.report_exists",
                return_value=True,
            ),
            mock.patch(
                "service.report_service.OperationDesignatedOperatorTimelineService.get_operation_designated_operator_for_reporting_year",
                return_value=None,
            ),
            mock.patch(
                "service.data_access_service.user_service.UserDataAccessService.get_user_operator_by_user",
            ) as mock_get_user_operator,
        ):
            mock_user_operator(mock_get_user_operator, operator)

            with pytest.raises(UserError) as exception_context:
                ReportService.create_report_for_reporting_year(
                    user_guid=USER_GUID,
                    data=data,
                )

        assert (
            str(exception_context.value)
            == "A report already exists for this operation and year, unable to create a new one."
        )
```

## File: bc_obps/service/tests/test_report_service.py
```python
from unittest import mock
from django.test import TestCase
from django.core.exceptions import ObjectDoesNotExist
from model_bakery import baker
from model_bakery.baker import make_recipe

from registration.models import RegulatedProduct, Activity, Operation
from registration.tests.utils.bakers import (
    bc_obps_regulated_operation_baker,
    operation_baker,
    operator_baker,
)
from reporting.models import ReportingYear, ReportVersion, ReportOperation, FacilityReport, ReportProduct
from reporting.schema.report_operation import ReportOperationIn
from reporting.tests.utils.bakers import report_baker, reporting_year_baker
from service.report_service import ReportService


class TestReportService(TestCase):
    def test_throws_if_operation_doesnt_exist(self):
        baker.make(ReportingYear, reporting_year=2000)

        with self.assertRaises(ObjectDoesNotExist) as exception_context:
            ReportService.create_report(operation_id="00000000-00000000-00000000-00000000", reporting_year=2000)

        self.assertEqual(
            str(exception_context.exception),
            "Designated operator for reporting year 2000 not found for operation 00000000-00000000-00000000-00000000.",
        )

    def test_throws_if_year_doesnt_exist(self):
        operator = operator_baker({"trade_name": "test_trade_name"})
        operation = operation_baker(operator_id=operator.id, type=Operation.Types.SFO)
        make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operator=operator,
            operation=operation,
            start_date="2023-01-01T00:00:00Z",
            end_date=None,
        )

        with self.assertRaises(ObjectDoesNotExist) as exception_context:
            ReportService.create_report(operation.id, reporting_year=2000)

        self.assertEqual(
            str(exception_context.exception),
            f"Designated operator for reporting year 2000 not found for operation {operation.id}.",
        )

    def test_throws_if_report_already_exists(self):
        operation = operation_baker(type=Operation.Types.LFO)
        reporting_year = reporting_year_baker(reporting_year=2002)
        _ = report_baker(operation=operation, reporting_year=reporting_year)

        with self.assertRaises(Exception) as exception_context:
            ReportService.create_report(operation.id, 2002)

        self.assertEqual(
            str(exception_context.exception),
            "A report already exists for this operation and year, unable to create a new one.",
        )

    def test_creates_report_with_right_data(self):
        with (
            mock.patch(
                "service.data_access_service.report_service.ReportDataAccessService.report_exists"
            ) as mock_report_data_access_service_report_exists,
            mock.patch(
                "service.data_access_service.facility_service.FacilityDataAccessService.get_current_facilities_by_operation"
            ) as mock_facility_data_access_service_get_current_facilities_by_operation,
        ):
            mock_facilities = baker.make_recipe('registration.tests.utils.facility', _quantity=3)

            mock_report_data_access_service_report_exists.return_value = False
            mock_facility_data_access_service_get_current_facilities_by_operation.return_value = mock_facilities

            operation = operation_baker(
                type=Operation.Types.LFO,
                bc_obps_regulated_operation=bc_obps_regulated_operation_baker(),
                status=Operation.Statuses.REGISTERED,
            )
            operation.activities.add(
                Activity.objects.get(name="Magnesium production"),
                Activity.objects.get(name="Hydrogen production"),
            )
            operation.regulated_products.add(
                RegulatedProduct.objects.get(name="Cement equivalent"),
                RegulatedProduct.objects.get(name="Mining: gold-equivalent"),
                RegulatedProduct.objects.get(name="Liquefied natural gas"),
            )
            reporting_year = reporting_year_baker(reporting_year=2101)
            make_recipe(
                'registration.tests.utils.operation_designated_operator_timeline',
                operator=operation.operator,
                operation=operation,
                start_date="2023-01-01T00:00:00Z",
                end_date=None,
            )

            # Calling the method under test
            report_version_id = ReportService.create_report(operation.id, reporting_year=2101)
            report = ReportVersion.objects.get(pk=report_version_id).report

            # Testing the report data
            self.assertEqual(report.operation.id, operation.id)
            self.assertEqual(report.operator.id, operation.operator.id)
            self.assertEqual(report.reporting_year, reporting_year)

            self.assertEqual(report.report_versions.count(), 1)
            # Testing the report version
            report_version = report.report_versions.first()
            self.assertEqual(report_version.report, report)
            self.assertFalse(report_version.is_latest_submitted)
            self.assertEqual(report_version.status, 'Draft')

            # Testing the report_operation data
            self.assertSequenceEqual(
                (
                    report_version.report_operation.operator_legal_name,
                    report_version.report_operation.operator_trade_name,
                    report_version.report_operation.operation_name,
                    report_version.report_operation.operation_type,
                    report_version.report_operation.operation_bcghgid,
                    report_version.report_operation.bc_obps_regulated_operation_id,
                    report_version.report_operation.naics_code,
                    report_version.report_operation.activities.count(),
                ),
                (
                    operation.operator.legal_name,
                    operation.operator.trade_name,
                    operation.name,
                    operation.type,
                    operation.bcghg_id,
                    operation.bc_obps_regulated_operation.id,
                    operation.naics_code,
                    2,
                ),
            )

            # Testing the facilityreport data
            facility_reports = report_version.facility_reports.order_by("facility__id")
            self.assertEqual(facility_reports.count(), 3)

            mock_facilities.sort(key=lambda f: f.id)

            for index, facility in enumerate(mock_facilities):
                facility_report = facility_reports.all()[index]
                self.assertSequenceEqual(
                    (
                        facility_report.facility,
                        facility_report.facility_name,
                        facility_report.facility_type,
                        facility_report.facility_bcghgid,
                        facility_report.activities.count(),
                    ),
                    (
                        facility,
                        facility.name,
                        facility.type,
                        facility.bcghg_id,
                        2,
                    ),
                )

    def test_creates_report_with_right_data_with_transferred_operation(self):
        with (
            mock.patch(
                "service.data_access_service.report_service.ReportDataAccessService.report_exists"
            ) as mock_report_data_access_service_report_exists,
            mock.patch(
                "service.data_access_service.facility_service.FacilityDataAccessService.get_current_facilities_by_operation"
            ) as mock_facility_data_access_service_get_current_facilities_by_operation,
        ):
            mock_facilities = baker.make_recipe('registration.tests.utils.facility', _quantity=2)

            mock_report_data_access_service_report_exists.return_value = False
            mock_facility_data_access_service_get_current_facilities_by_operation.return_value = mock_facilities

            # Create two operators to simulate a transfer
            operator_old = operator_baker()
            operator_new = operator_baker()
            # Create Operation associated with the new operator
            operation = operation_baker(
                type=Operation.Types.SFO,
                bc_obps_regulated_operation=bc_obps_regulated_operation_baker(),
                status=Operation.Statuses.REGISTERED,
                operator_id=operator_new.id,
                name="Gimli's Mines of Moria",
            )
            operation.activities.add(
                Activity.objects.get(name="Magnesium production"),
                Activity.objects.get(name="Hydrogen production"),
            )
            operation.regulated_products.add(
                RegulatedProduct.objects.get(name="Cement equivalent"),
                RegulatedProduct.objects.get(name="Mining: gold-equivalent"),
                RegulatedProduct.objects.get(name="Liquefied natural gas"),
            )

            # Create timeline entries to simulate a transfer happened from operator_old to operator_new after the end of the reporting year
            make_recipe(
                'registration.tests.utils.operation_designated_operator_timeline',
                operator=operator_old,
                operation=operation,
                start_date="2020-01-01T00:00:00Z",
                end_date="2025-03-01T00:00:00Z",
            )
            make_recipe(
                'registration.tests.utils.operation_designated_operator_timeline',
                operator=operator_new,
                operation=operation,
                start_date="2025-03-02T00:00:00Z",
                end_date=None,
            )
            # Create contacts for the old operator because they will be used as operation representatives instead of the operation contacts
            contacts = baker.make_recipe(
                'registration.tests.utils.contact',
                operator=operator_old,
                business_role_id="Operation Representative",
                _quantity=3,
            )

            # Calling the method under test
            report_version_id = ReportService.create_report(operation.id, reporting_year=2024)
            report = ReportVersion.objects.get(pk=report_version_id).report

            # Testing the report data
            self.assertEqual(report.operation.id, operation.id)
            self.assertEqual(report.operator.id, operator_old.id)
            self.assertEqual(report.reporting_year.reporting_year, 2024)
            self.assertEqual(report.report_versions.count(), 1)
            # Testing the report version
            report_version = report.report_versions.first()
            self.assertEqual(report_version.report, report)
            self.assertFalse(report_version.is_latest_submitted)
            self.assertEqual(report_version.status, 'Draft')

            # Testing the report_operation data
            # NOTE: This test will need to be updated when we improve our handling for transferred operations
            self.assertSequenceEqual(
                (
                    report_version.report_operation.operator_legal_name,
                    report_version.report_operation.operator_trade_name,
                    report_version.report_operation.operation_name,
                    report_version.report_operation.operation_type,
                    report_version.report_operation.operation_bcghgid,
                    report_version.report_operation.bc_obps_regulated_operation_id,
                    report_version.report_operation.naics_code,
                    report_version.report_operation.activities.count(),
                ),
                (
                    operator_old.legal_name,
                    operator_old.trade_name,
                    operation.name,
                    operation.type,
                    operation.bcghg_id,
                    operation.bc_obps_regulated_operation.id,
                    operation.naics_code,
                    2,
                ),
            )
            # Testing the operation representatives come from the contacts of the original operator
            operation_representatives = report_version.report_operation_representatives.all().order_by(
                "representative_name"
            )

            self.assertEqual(operation_representatives.count(), 3)
            for index, contact in enumerate(contacts):
                self.assertEqual(operation_representatives.all()[index].representative_name, contact.get_full_name())

    def test_save_report_operation_updates_fields_and_relationships(self):
        operation = operation_baker(type=Operation.Types.LFO)
        reporting_year = reporting_year_baker(reporting_year=2101)
        report_version = report_baker(operation=operation, reporting_year=reporting_year)

        # Create input data for the ReportOperationIn object
        data = ReportOperationIn(
            operator_legal_name="Updated Legal Name",
            operator_trade_name="Updated Trade Name",
            operation_name="Updated Operation Name",
            operation_type="Updated Operation Type",
            operation_bcghgid="Updated BC GHID",
            bc_obps_regulated_operation_id="Updated Regulated Operation ID",
            activities=[18, 14],
            regulated_products=[2, 13],
            operation_representative_name=[1, 2],
            operation_report_type="New Report Type",
            registration_purpose="OBPS Regulated Operation",
        )

        with (
            mock.patch('service.report_service.ReportOperation.objects.get') as mock_get,
            mock.patch('service.report_service.ReportOperationRepresentative.objects.filter') as mock_filter,
            mock.patch('service.report_service.FacilityReport.objects.filter') as mock_facility_filter,
            mock.patch('service.report_service.FacilityReport.objects.get') as mock_facility_get,
            mock.patch('service.report_service.Activity.objects.filter') as mock_activity_filter,
            mock.patch('service.report_service.RegulatedProduct.objects.filter') as mock_regulated_product_filter,
        ):
            mock_report_operation = mock.MagicMock(spec=ReportOperation)
            mock_get.return_value = mock_report_operation

            mock_filter.return_value.update.return_value = None

            # Mock FacilityReport behavior
            mock_facility_report = mock.MagicMock(spec=FacilityReport, report_version_id=report_version.id, id=999)
            mock_facility_reports = [
                mock.MagicMock(spec=FacilityReport, report_version_id=report_version.id) for _ in range(3)
            ]
            mock_facility_get.return_value = mock_facility_report
            mock_facility_filter.return_value = mock_facility_reports

            # Mock Activity filtering
            mock_activity_1 = mock.MagicMock(spec=Activity, name="Hydrogen production")
            mock_activity_2 = mock.MagicMock(spec=Activity, name="Magnesium production")
            mock_activity_filter.return_value = [mock_activity_1, mock_activity_2]

            # Mock RegulatedProduct filtering
            mock_regulated_product_1 = mock.MagicMock(spec=RegulatedProduct, name="Cement equivalent")
            mock_regulated_product_2 = mock.MagicMock(spec=RegulatedProduct, name="Mining: gold-equivalent")
            mock_regulated_product_filter.return_value = [mock_regulated_product_1, mock_regulated_product_2]

            ReportService.save_report_operation(report_version.id, data)

            mock_report_operation.activities.set.assert_called_once_with([mock_activity_1, mock_activity_2])

            mock_report_operation.regulated_products.set.assert_called_once_with(
                [mock_regulated_product_1, mock_regulated_product_2]
            )

            # Verify that other fields were updated correctly
            mock_report_operation.operator_legal_name = data.operator_legal_name
            mock_report_operation.operator_trade_name = data.operator_trade_name
            mock_report_operation.operation_name = data.operation_name
            mock_report_operation.operation_type = data.operation_type
            mock_report_operation.operation_bcghgid = data.operation_bcghgid
            mock_report_operation.bc_obps_regulated_operation_id = data.bc_obps_regulated_operation_id
            mock_report_operation.operation_report_type = data.operation_report_type

    def test_get_registration_purpose_by_version_id_returns_correct_data(self):
        """
        Test that the service retrieves the correct registration purpose
        for a given report version ID.
        """
        self.report_version = baker.make_recipe("reporting.tests.utils.report_version")
        self.report_operation = make_recipe(
            'reporting.tests.utils.report_operation', report_version=self.report_version
        )
        retrieved_data = ReportService.get_registration_purpose_by_version_id(version_id=self.report_version.id)
        self.assertIsNotNone(retrieved_data)
        self.assertEqual(retrieved_data["registration_purpose"], self.report_operation.registration_purpose)

    def test_deletes_child_report_product_records_on_product_set_change(self):
        operator = baker.make_recipe('registration.tests.utils.operator')
        operation = operation_baker(type=Operation.Types.LFO, operator_id=operator.id)
        report = baker.make_recipe('reporting.tests.utils.report', operation=operation)
        report_version = baker.make_recipe('reporting.tests.utils.report_version', report=report)
        report_operation = baker.make_recipe('reporting.tests.utils.report_operation', report_version=report_version)
        report_operation.regulated_products.set([1, 2, 3])
        facility_report = baker.make_recipe('reporting.tests.utils.facility_report', report_version=report_version)
        report_product_1 = baker.make_recipe(
            'reporting.tests.utils.report_product',
            report_version=report_version,
            facility_report=facility_report,
            product_id=1,
        )
        report_product_2 = baker.make_recipe(
            'reporting.tests.utils.report_product',
            report_version=report_version,
            facility_report=facility_report,
            product_id=2,
        )
        report_product_3 = baker.make_recipe(
            'reporting.tests.utils.report_product',
            report_version=report_version,
            facility_report=facility_report,
            product_id=3,
        )

        data = ReportOperationIn(
            operator_legal_name="Updated Legal Name",
            operator_trade_name="Updated Trade Name",
            operation_name="Updated Operation Name",
            operation_type="Updated Operation Type",
            operation_bcghgid="Updated BC GHID",
            bc_obps_regulated_operation_id="Updated Regulated Operation ID",
            activities=[18, 14],
            regulated_products=[1],
            operation_representative_name=[1, 2],
            operation_report_type="New Report Type",
            registration_purpose="OBPS Regulated Operation",
        )

        ReportService.save_report_operation(report_version.id, data)

        report_operation.refresh_from_db()

        assert ReportProduct.objects.filter(id=report_product_1.id).exists()
        assert not ReportProduct.objects.filter(id=report_product_2.id).exists()
        assert not ReportProduct.objects.filter(id=report_product_3.id).exists()

    def test_lfo_adds_newly_selected_operation_activities_to_existing_facility(self):
        """
        For LFOs, when a facility already has activities and the user adds new
        activities at the operation level, those newly-selected operation activities
        are added to the facility report (so they appear pre-selected in the
        operation list on the Review Facility Information page). Activities removed
        from the operation are NOT removed from the facility, so any user-made
        facility-level selections are preserved.
        """
        operator = baker.make_recipe('registration.tests.utils.operator')
        operation = operation_baker(type=Operation.Types.LFO, operator_id=operator.id)
        report = baker.make_recipe('reporting.tests.utils.report', operation=operation)
        report_version = baker.make_recipe('reporting.tests.utils.report_version', report=report)
        report_operation = baker.make_recipe('reporting.tests.utils.report_operation', report_version=report_version)
        report_operation.activities.set([1, 2, 3])
        facility_report = baker.make_recipe('reporting.tests.utils.facility_report', report_version=report_version)
        facility_report.activities.set([1, 2, 3])
        report_activity = baker.make_recipe(
            'reporting.tests.utils.report_activity',
            facility_report=facility_report,
            activity_id=2,
        )

        data = ReportOperationIn(
            operator_legal_name="Updated Legal Name",
            operator_trade_name="Updated Trade Name",
            operation_name="Updated Operation Name",
            operation_type="Linear Facilities Operation",
            operation_bcghgid="Updated BC GHID",
            bc_obps_regulated_operation_id="Updated Regulated Operation ID",
            # Operation activities change: keep 1, drop 2 & 3, add 18 & 14
            activities=[1, 18, 14],
            regulated_products=[1],
            operation_representative_name=[1, 2],
            operation_report_type="New Report Type",
            registration_purpose="OBPS Regulated Operation",
        )

        ReportService.save_report_operation(report_version.id, data)

        facility_report.refresh_from_db()

        # Newly-selected operation activities (18, 14) are added.
        # Existing facility activities (1, 2, 3) are preserved -- including 2 & 3
        # which were deselected at the operation level (user choice is not lost).
        self.assertQuerySetEqual(
            facility_report.activities.all(),
            Activity.objects.filter(id__in=[1, 2, 3, 18, 14]),
            ordered=False,
        )
        # Existing report activity rows for kept activities are preserved.
        self.assertQuerySetEqual(
            facility_report.reportactivity_records.all(),
            [report_activity],
            ordered=False,
        )

    def test_lfo_sets_initial_activities_for_facility_without_activities(self):
        """
        Test that for LFOs, when a facility has no activities yet,
        updating operation-level activities DOES set the facility's activities.
        This allows initial setup of activities.
        """
        operator = baker.make_recipe('registration.tests.utils.operator')
        operation = operation_baker(type=Operation.Types.LFO, operator_id=operator.id)
        report = baker.make_recipe('reporting.tests.utils.report', operation=operation)
        report_version = baker.make_recipe('reporting.tests.utils.report_version', report=report)
        report_operation = baker.make_recipe('reporting.tests.utils.report_operation', report_version=report_version)
        report_operation.activities.set([1, 2, 3])
        facility_report = baker.make_recipe('reporting.tests.utils.facility_report', report_version=report_version)
        # Facility has NO activities initially

        data = ReportOperationIn(
            operator_legal_name="Updated Legal Name",
            operator_trade_name="Updated Trade Name",
            operation_name="Updated Operation Name",
            operation_type="Linear Facilities Operation",
            operation_bcghgid="Updated BC GHID",
            bc_obps_regulated_operation_id="Updated Regulated Operation ID",
            activities=[18, 14],
            regulated_products=[1],
            operation_representative_name=[1, 2],
            operation_report_type="New Report Type",
            registration_purpose="OBPS Regulated Operation",
        )

        ReportService.save_report_operation(report_version.id, data)

        facility_report.refresh_from_db()

        # Activities SHOULD be set since facility had no activities before
        assert facility_report.activities.count() == 2
        self.assertQuerySetEqual(
            facility_report.activities.all(),
            Activity.objects.filter(id__in=[18, 14]),
            ordered=False,
        )

    def test_lfo_does_not_update_activities_for_completed_facility_report(self):
        """
        Once a facility report is marked as completed, changes to operation-level
        activities must NOT propagate to that facility's activities.
        """
        operator = baker.make_recipe('registration.tests.utils.operator')
        operation = operation_baker(type=Operation.Types.LFO, operator_id=operator.id)
        report = baker.make_recipe('reporting.tests.utils.report', operation=operation)
        report_version = baker.make_recipe('reporting.tests.utils.report_version', report=report)
        report_operation = baker.make_recipe('reporting.tests.utils.report_operation', report_version=report_version)
        report_operation.activities.set([1, 2, 3])
        facility_report = baker.make_recipe(
            'reporting.tests.utils.facility_report',
            report_version=report_version,
            is_completed=True,
        )
        facility_report.activities.set([1, 2, 3])

        data = ReportOperationIn(
            operator_legal_name="Updated Legal Name",
            operator_trade_name="Updated Trade Name",
            operation_name="Updated Operation Name",
            operation_type="Linear Facilities Operation",
            operation_bcghgid="Updated BC GHID",
            bc_obps_regulated_operation_id="Updated Regulated Operation ID",
            activities=[1, 18, 14],
            regulated_products=[1],
            operation_representative_name=[1, 2],
            operation_report_type="New Report Type",
            registration_purpose="OBPS Regulated Operation",
        )

        ReportService.save_report_operation(report_version.id, data)

        facility_report.refresh_from_db()

        # The completed facility's activities are unchanged.
        self.assertQuerySetEqual(
            facility_report.activities.all(),
            Activity.objects.filter(id__in=[1, 2, 3]),
            ordered=False,
        )
```

## File: bc_obps/service/tests/test_report_version_service.py
```python
from django.test import TestCase
from common.tests.utils.model_inspection import get_cascading_models
from model_bakery import baker
import pytest
from registration.models import Operation
from reporting.models.report_version import ReportVersion
from service.report_version_service import ReportVersionService

pytestmark = pytest.mark.django_db


class TestReportVersionService(TestCase):
    def setUp(self):
        self.report_version_1 = baker.make_recipe(
            'reporting.tests.utils.report_version',
            status=ReportVersion.ReportVersionStatus.Submitted,
            is_latest_submitted=True,
        )
        self.report_version_2 = baker.make_recipe(
            'reporting.tests.utils.report_version',
            report=self.report_version_1.report,  # Ensure it belongs to the same report
            status=ReportVersion.ReportVersionStatus.Draft,
        )

    def test_create_report_version(self):
        # This functionality is tested as part of the report_service
        pass

    def test_delete_report_version(self):
        report = baker.make_recipe("reporting.tests.utils.report", reporting_year_id=2024)
        report_version = ReportVersionService.create_report_version(report)

        assert ReportVersion.objects.filter(id=report_version.id).count() == 1
        ReportVersionService.delete_report_version(report_version.id)
        assert ReportVersion.objects.filter(id=report_version.id).count() == 0

    def test_change_report_version_type_deletes_the_old_version_and_creates_a_new_one(
        self,
    ):
        report = baker.make_recipe("reporting.tests.utils.report", reporting_year_id=2024)
        report_version = ReportVersionService.create_report_version(report, "Annual Report")

        return_value = ReportVersionService.change_report_version_type(
            report_version_id=report_version.id, new_report_type="Simple Report"
        )

        assert ReportVersion.objects.filter(id=report_version.id).count() == 0
        assert ReportVersion.objects.filter(id=return_value.id).count() == 1
        assert return_value.report_type == "Simple Report"

    def test_change_report_version_type_to_the_same_does_nothing(self):
        report = baker.make_recipe("reporting.tests.utils.report", reporting_year_id=2024)
        report_version = ReportVersionService.create_report_version(report, "Annual Report")

        return_value = ReportVersionService.change_report_version_type(
            report_version_id=report_version.id, new_report_type="Annual Report"
        )

        assert ReportVersion.objects.filter(id=report_version.id).count() == 1
        assert return_value == report_version

    def test_report_version_cascading_models(self):
        cascading_models_names = {m.__name__ for m in get_cascading_models(ReportVersion)}

        assert cascading_models_names == {
            "FacilityReport",
            "ReportActivity",
            "ReportAttachment",
            "ReportAttachmentConfirmation",
            "ReportEmission",
            "ReportFuel",
            "ReportMethodology",
            "ReportNewEntrant",
            "ReportNewEntrantEmission",
            "ReportNewEntrantProduction",
            "ReportNonAttributableEmissions",
            "ReportOperation",
            "ReportPersonResponsible",
            "ReportProduct",
            "ReportProductEmissionAllocation",
            "ReportRawActivityData",
            "ReportSignOff",
            "ReportSourceType",
            "ReportUnit",
            "ReportOperationRepresentative",
            "ReportAdditionalData",
            "ReportVerification",
            "ReportEmissionAllocation",
            "ReportProductEmissionAllocation",
            "ReportElectricityImportData",
            'ComplianceReportVersion',
            'ComplianceObligation',
            'ReportComplianceSummary',
            'ReportComplianceSummaryProduct',
            'ComplianceEarnedCredit',
            'CompliancePenalty',
            'CompliancePenaltyAccrual',
            'ElicensingAdjustment',
            'ComplianceReportVersionManualHandling',
        }

    def test_is_initial_report_version_returns_true_for_first_version(self):
        """
        Test that is_initial_report_version returns True for the version with the lowest ID.
        """
        result = ReportVersionService.is_initial_report_version(self.report_version_1.id)
        self.assertTrue(result, "Expected the first report version to be considered initial.")

    def test_is_initial_report_version_returns_false_for_non_initial_version(self):
        """
        Test that is_initial_report_version returns False for a version that is not the first created.
        """
        result = ReportVersionService.is_initial_report_version(self.report_version_2.id)
        self.assertFalse(result, "Expected the second report version to not be considered initial.")

    def test_fetch_full_report_version(self):
        report_version = baker.make_recipe("reporting.tests.utils.report_version")
        baker.make_recipe(
            "reporting.tests.utils.report_operation",
            report_version=report_version,
            operation_type=Operation.Types.SFO,
        )
        result = ReportVersionService.fetch_full_report_version(report_version.id, prefetch_full_facility_report=False)
        self.assertEqual(result.id, report_version.id)
```

## File: bc_obps/service/tests/test_service_utils.py
```python
import datetime
from django.test import TestCase
from reporting.tests.utils.bakers import baker
from service.utils.get_report_valid_date_from_version_id import get_report_valid_date_from_version_id


class TestServiceUtils(TestCase):
    def test_get_report_valid_date_from_version_id(self):
        TEST_YEAR = 2024
        DEFAULT_MONTH = 5
        DEFAULT_DAY = 31
        TEST_DATE = datetime.date(TEST_YEAR, DEFAULT_MONTH, DEFAULT_DAY)
        report_version = baker.make_recipe("reporting.tests.utils.report_version", report__reporting_year_id=TEST_YEAR)
        assert get_report_valid_date_from_version_id(report_version.id) == TEST_DATE
```

## File: bc_obps/service/tests/test_transfer_event_service.py
```python
from datetime import timedelta
from unittest.mock import patch, MagicMock
from uuid import uuid4
from django.utils import timezone

from registration.constants import UNAUTHORIZED_MESSAGE
from registration.models import TransferEvent
from registration.models.contact import Contact
from registration.schema import TransferEventFilterSchema, TransferEventCreateIn
from service.transfer_event_service import TransferEventService
import pytest
from model_bakery import baker

pytestmark = pytest.mark.django_db

TRANSFER_ROLES = [('cas_analyst'), ('cas_director')]
NO_TRANSFER_ROLES = [('cas_admin'), ('cas_pending'), ('industry_operator_user')]


class TestTransferEventService:
    @staticmethod
    def test_list_transfer_events():
        # transfer of 3 operations
        baker.make_recipe(
            'registration.tests.utils.transfer_event',
            operation=baker.make_recipe('registration.tests.utils.operation'),
            _quantity=3,
        )
        # transfer of 4 facilities
        baker.make_recipe(
            'registration.tests.utils.transfer_event',
            facilities=baker.make_recipe('registration.tests.utils.facility', _quantity=4),
        )
        # sorting and filtering are tested in the endpoint test in conjunction with pagination
        result = TransferEventService.list_transfer_events(
            "status",
            "desc",
            TransferEventFilterSchema(effective_date=None, operation__name=None, facilities__name=None, status=None),
        )
        assert result.count() == 7

    @staticmethod
    def test_validate_no_overlapping_transfer_events():
        # Scenario 1: No overlapping operation or facility
        new_operation = baker.make_recipe('registration.tests.utils.operation')
        new_facilities = baker.make_recipe('registration.tests.utils.facility', _quantity=2)
        TransferEventService._validate_no_overlapping_transfer_events(
            operation_id=new_operation.id, facility_ids=[facility.id for facility in new_facilities]
        )

        # Scenario 2: Overlapping operation
        operation = baker.make_recipe('registration.tests.utils.operation')
        baker.make_recipe(
            'registration.tests.utils.transfer_event',
            operation=operation,
            status=TransferEvent.Statuses.TO_BE_TRANSFERRED,
        )
        with pytest.raises(Exception, match="An active transfer event already exists for the selected operation."):
            TransferEventService._validate_no_overlapping_transfer_events(operation_id=operation.id)

        # Scenario 3: Overlapping facilities
        facilities = baker.make_recipe('registration.tests.utils.facility', _quantity=2)
        baker.make_recipe(
            'registration.tests.utils.transfer_event',
            facilities=facilities,
            status=TransferEvent.Statuses.COMPLETE,
        )
        with pytest.raises(
            Exception,
            match="One or more facilities in this transfer event are already part of an active transfer event.",
        ):
            TransferEventService._validate_no_overlapping_transfer_events(
                facility_ids=[facility.id for facility in facilities]
            )

        # Scenario 4: Overlapping operation but excluded by current_transfer_id
        overlapping_operation = baker.make_recipe('registration.tests.utils.operation')
        existing_transfer = baker.make_recipe(
            'registration.tests.utils.transfer_event',
            operation=overlapping_operation,
            status=TransferEvent.Statuses.TO_BE_TRANSFERRED,
        )
        TransferEventService._validate_no_overlapping_transfer_events(
            operation_id=overlapping_operation.id,
            current_transfer_id=existing_transfer.id,
        )

        # Scenario 5: Overlapping facilities but excluded by current_transfer_id
        overlapping_facilities = baker.make_recipe('registration.tests.utils.facility', _quantity=2)
        existing_transfer = baker.make_recipe(
            'registration.tests.utils.transfer_event',
            facilities=overlapping_facilities,
            status=TransferEvent.Statuses.COMPLETE,
        )
        TransferEventService._validate_no_overlapping_transfer_events(
            facility_ids=[facility.id for facility in overlapping_facilities],
            current_transfer_id=existing_transfer.id,
        )

    @staticmethod
    @pytest.mark.parametrize("role", NO_TRANSFER_ROLES)
    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    def test_create_transfer_event_unauthorized_user(mock_get_by_guid, role):
        user = baker.make_recipe(f'registration.tests.utils.{role}')
        mock_get_by_guid.return_value = user
        # Mock user to not be a CAS analyst nor director
        mock_user = MagicMock()
        mock_user.is_cas_analyst.return_value = False
        mock_user.is_cas_director.return_value = False
        mock_get_by_guid.return_value = mock_user

        with pytest.raises(Exception, match="User is not authorized to create transfer events."):
            TransferEventService.create_transfer_event(user.user_guid, {})

    @classmethod
    def _get_transfer_event_payload_for_operation(cls):
        from_operator = baker.make_recipe('registration.tests.utils.operator')
        to_operator = baker.make_recipe('registration.tests.utils.operator')
        operation = baker.make_recipe('registration.tests.utils.operation')
        return TransferEventCreateIn.model_construct(
            transfer_entity="Operation",
            from_operator=from_operator.id,
            to_operator=to_operator.id,
            effective_date=timezone.now(),
            operation=operation.id,
        )

    @classmethod
    @pytest.mark.parametrize("role", TRANSFER_ROLES)
    @patch("service.transfer_event_service.TransferEventService._validate_no_overlapping_transfer_events")
    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    def test_create_transfer_event_operation_missing_operation(cls, mock_get_by_guid, mock_validate_no_overlap, role):
        user = baker.make_recipe(f"registration.tests.utils.{role}")
        payload = cls._get_transfer_event_payload_for_operation()
        payload.operation = None

        mock_user = MagicMock()
        mock_user.is_cas_analyst.return_value = True
        mock_get_by_guid.return_value = user
        mock_validate_no_overlap.return_value = None

        with pytest.raises(Exception, match="Operation is required for operation transfer events."):
            TransferEventService.create_transfer_event(user.user_guid, payload)

    @classmethod
    @pytest.mark.parametrize("role", TRANSFER_ROLES)
    @patch("service.transfer_event_service.TransferEventService._validate_no_overlapping_transfer_events")
    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    def test_create_transfer_event_operation_using_the_same_operator(
        cls, mock_get_by_guid, mock_validate_no_overlap, role
    ):
        user = baker.make_recipe(f"registration.tests.utils.{role}")
        payload_with_same_from_operator_and_to_operator = cls._get_transfer_event_payload_for_operation()
        payload_with_same_from_operator_and_to_operator.to_operator = (
            payload_with_same_from_operator_and_to_operator.from_operator
        )

        mock_user = MagicMock()
        mock_user.is_cas_analyst.return_value = True
        mock_get_by_guid.return_value = user
        mock_validate_no_overlap.return_value = None

        with pytest.raises(Exception, match="Operations cannot be transferred within the same operator."):
            TransferEventService.create_transfer_event(user.user_guid, payload_with_same_from_operator_and_to_operator)

    @classmethod
    @pytest.mark.parametrize("role", TRANSFER_ROLES)
    @patch("service.transfer_event_service.TransferEventService._process_event_if_effective")
    @patch("service.transfer_event_service.TransferEventService._validate_no_overlapping_transfer_events")
    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    @patch("service.data_access_service.transfer_event_service.TransferEventDataAccessService.create_transfer_event")
    def test_create_transfer_event_operation(
        cls,
        mock_create_transfer_event,
        mock_get_by_guid,
        mock_validate_no_overlap,
        mock_process_event_if_effective,
        role,
    ):
        user = baker.make_recipe(f'registration.tests.utils.{role}')
        payload = cls._get_transfer_event_payload_for_operation()

        mock_user = MagicMock()
        mock_user.is_cas_analyst.return_value = True
        mock_get_by_guid.return_value = user

        # Mock transfer event creation
        mock_transfer_event = MagicMock()
        mock_create_transfer_event.return_value = mock_transfer_event

        result = TransferEventService.create_transfer_event(user.user_guid, payload)

        mock_get_by_guid.assert_called_once_with(user.user_guid)
        mock_validate_no_overlap.assert_called_once_with(operation_id=payload.operation)
        mock_create_transfer_event.assert_called_once_with(
            user.user_guid,
            {
                "from_operator_id": payload.from_operator,
                "to_operator_id": payload.to_operator,
                "effective_date": payload.effective_date,
                "operation_id": payload.operation,
            },
        )
        mock_process_event_if_effective.assert_called_once_with(payload, mock_transfer_event, user.user_guid)
        assert result == mock_transfer_event

    @classmethod
    def _get_transfer_event_payload_for_facility(cls):
        from_operator = baker.make_recipe('registration.tests.utils.operator')
        to_operator = baker.make_recipe('registration.tests.utils.operator')
        from_operation = baker.make_recipe('registration.tests.utils.operation')
        to_operation = baker.make_recipe('registration.tests.utils.operation')
        facilities = baker.make_recipe('registration.tests.utils.facility', _quantity=2)
        return TransferEventCreateIn.model_construct(
            transfer_entity="Facility",
            from_operator=from_operator.id,
            to_operator=to_operator.id,
            effective_date=timezone.now(),
            from_operation=from_operation.id,
            to_operation=to_operation.id,
            facilities=[facility.id for facility in facilities],
        )

    @classmethod
    @pytest.mark.parametrize("role", TRANSFER_ROLES)
    @patch("service.transfer_event_service.TransferEventService._validate_no_overlapping_transfer_events")
    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    def test_create_transfer_event_facility_missing_required_fields(
        cls, mock_get_by_guid, mock_validate_no_overlap, role
    ):
        user = baker.make_recipe(f"registration.tests.utils.{role}")
        payload_without_facility = cls._get_transfer_event_payload_for_facility()
        payload_without_facility.facilities = None

        mock_user = MagicMock()
        mock_user.is_cas_analyst.return_value = True
        mock_get_by_guid.return_value = user
        mock_validate_no_overlap.return_value = None

        with pytest.raises(
            Exception, match="Facilities, from_operation, and to_operation are required for facility transfer events."
        ):
            TransferEventService.create_transfer_event(user.user_guid, payload_without_facility)

        payload_without_from_operation = cls._get_transfer_event_payload_for_facility()
        payload_without_from_operation.from_operation = None
        with pytest.raises(
            Exception, match="Facilities, from_operation, and to_operation are required for facility transfer events."
        ):
            TransferEventService.create_transfer_event(user.user_guid, payload_without_from_operation)

        payload_without_to_operation = cls._get_transfer_event_payload_for_facility()
        payload_without_to_operation.to_operation = None
        with pytest.raises(
            Exception, match="Facilities, from_operation, and to_operation are required for facility transfer events."
        ):
            TransferEventService.create_transfer_event(user.user_guid, payload_without_to_operation)

    @classmethod
    @pytest.mark.parametrize("role", TRANSFER_ROLES)
    @patch("service.transfer_event_service.TransferEventService._validate_no_overlapping_transfer_events")
    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    def test_create_transfer_event_facility_between_the_same_operation(
        cls, mock_get_by_guid, mock_validate_no_overlap, role
    ):
        user = baker.make_recipe(f"registration.tests.utils.{role}")
        payload_with_same_from_and_to_operation = cls._get_transfer_event_payload_for_facility()
        payload_with_same_from_and_to_operation.to_operation = payload_with_same_from_and_to_operation.from_operation

        mock_user = MagicMock()
        mock_user.is_cas_analyst.return_value = True
        mock_get_by_guid.return_value = user
        mock_validate_no_overlap.return_value = None

        with pytest.raises(Exception, match="Facilities cannot be transferred within the same operation."):
            TransferEventService.create_transfer_event(user.user_guid, payload_with_same_from_and_to_operation)

    @classmethod
    @pytest.mark.parametrize("role", TRANSFER_ROLES)
    @patch("service.transfer_event_service.TransferEventService._process_event_if_effective")
    @patch("service.transfer_event_service.TransferEventService._validate_no_overlapping_transfer_events")
    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    @patch("service.data_access_service.transfer_event_service.TransferEventDataAccessService.create_transfer_event")
    def test_create_transfer_event_facility(
        cls,
        mock_create_transfer_event,
        mock_get_by_guid,
        mock_validate_no_overlap,
        mock_process_event_if_effective,
        role,
    ):
        user = baker.make_recipe(f"registration.tests.utils.{role}")
        payload = cls._get_transfer_event_payload_for_facility()

        mock_user = MagicMock()
        mock_user.is_cas_analyst.return_value = True
        mock_get_by_guid.return_value = user

        mock_transfer_event = MagicMock()
        mock_create_transfer_event.return_value = mock_transfer_event

        result = TransferEventService.create_transfer_event(user.user_guid, payload)

        mock_get_by_guid.assert_called_once_with(user.user_guid)
        mock_validate_no_overlap.assert_called_once_with(facility_ids=payload.facilities)
        mock_create_transfer_event.assert_called_once_with(
            user.user_guid,
            {
                "from_operator_id": payload.from_operator,
                "to_operator_id": payload.to_operator,
                "effective_date": payload.effective_date,
                "from_operation_id": payload.from_operation,
                "to_operation_id": payload.to_operation,
            },
        )
        mock_transfer_event.facilities.set.assert_called_once_with(payload.facilities)
        mock_process_event_if_effective.assert_called_once_with(payload, mock_transfer_event, user.user_guid)
        assert result == mock_transfer_event

    @classmethod
    @pytest.mark.parametrize("role", TRANSFER_ROLES)
    @patch("service.transfer_event_service.TransferEventService._process_single_event")
    @patch("service.transfer_event_service.TransferEventService._validate_no_overlapping_transfer_events")
    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    @patch("service.data_access_service.transfer_event_service.TransferEventDataAccessService.create_transfer_event")
    def test_process_event_on_effective_date(
        cls, mock_create_transfer_event, mock_get_by_guid, mock_validate_no_overlap, mock_process_event, role
    ):
        user = baker.make_recipe(f"registration.tests.utils.{role}")

        # Use an effective date that is yesterday
        payload = cls._get_transfer_event_payload_for_operation()
        payload.effective_date = timezone.now() - timedelta(days=1)

        mock_user = MagicMock()
        mock_user.is_cas_analyst.return_value = True
        mock_get_by_guid.return_value = user
        mock_validate_no_overlap.return_value = None

        # Mock transfer event creation
        mock_transfer_event = MagicMock()
        mock_create_transfer_event.return_value = mock_transfer_event

        result = TransferEventService.create_transfer_event(user.user_guid, payload)

        mock_process_event.assert_called_once_with(mock_transfer_event, user.user_guid)
        assert result == mock_transfer_event

    @staticmethod
    @patch("service.transfer_event_service.TransferEventService._process_single_event")
    @patch("service.transfer_event_service.logger")
    def test_process_due_transfer_events(mock_logger: MagicMock, mock_process_single_event: MagicMock):
        # Setup test data: Three transfer events, two of which are due today and one is due in the future
        today = timezone.now()
        due_event_1 = baker.make_recipe(
            "registration.tests.utils.transfer_event",
            effective_date=today,
            status=TransferEvent.Statuses.TO_BE_TRANSFERRED,
        )
        due_event_2 = baker.make_recipe(
            "registration.tests.utils.transfer_event",
            effective_date=today - timedelta(days=1),
            status=TransferEvent.Statuses.TO_BE_TRANSFERRED,
        )
        # future_event to ensure it is not processed
        future_event = baker.make_recipe(
            "registration.tests.utils.transfer_event",
            effective_date=today + timedelta(days=1),
            status=TransferEvent.Statuses.TO_BE_TRANSFERRED,
        )

        # Simulate processing behavior
        mock_process_single_event.side_effect = [None, Exception("Processing failed")]

        # Call the function
        TransferEventService.process_due_transfer_events()

        # Verify that process_single_event is called for each due event
        mock_process_single_event.assert_any_call(due_event_1)
        mock_process_single_event.assert_any_call(due_event_2)
        assert mock_process_single_event.call_count == 2

        # Ensure the future event is not processed
        processed_events = [call[0][0] for call in mock_process_single_event.call_args_list]
        assert future_event not in processed_events

        # Verify logger calls
        mock_logger.info.assert_any_call("Successfully processed 1 transfer events.")
        mock_logger.info.assert_any_call(f"Event IDs: {[due_event_1.id]}")
        mock_logger.error.assert_called_once_with(f"Failed to process event {due_event_2.id}: Processing failed")

    @staticmethod
    @patch("service.transfer_event_service.TransferEventService._process_facilities_transfer")
    @patch("service.transfer_event_service.TransferEventService._process_operation_transfer")
    def test_process_single_event_success(
        mock_process_operation_transfer: MagicMock,
        mock_process_facilities_transfer: MagicMock,
    ):
        user_guid = uuid4()
        # Scenario 1: Transfer event with facilities
        transfer_event_facilities = baker.make_recipe(
            "registration.tests.utils.transfer_event",
            facilities=baker.make_recipe("registration.tests.utils.facility", _quantity=3),
            status=TransferEvent.Statuses.TO_BE_TRANSFERRED,
        )

        # Call the function for facilities
        TransferEventService._process_single_event(transfer_event_facilities, user_guid)

        # Verify facilities transfer processing
        mock_process_facilities_transfer.assert_called_once_with(transfer_event_facilities, user_guid)
        mock_process_operation_transfer.assert_not_called()

        # Verify transfer event is marked as transferred
        transfer_event_facilities.refresh_from_db()
        assert transfer_event_facilities.status == TransferEvent.Statuses.TRANSFERRED

        # Scenario 2: Transfer event with an operation
        transfer_event_operation = baker.make_recipe(
            "registration.tests.utils.transfer_event",
            operation=baker.make_recipe("registration.tests.utils.operation"),
            status=TransferEvent.Statuses.TO_BE_TRANSFERRED,
            created_by=baker.make_recipe("registration.tests.utils.cas_analyst"),
        )

        # Reset the mock for the next scenario(otherwise we will get a call count 1 from the previous scenario)
        mock_process_facilities_transfer.reset_mock()

        # Call the function for operations
        TransferEventService._process_single_event(transfer_event_operation, None)

        # Verify operation transfer processing
        mock_process_operation_transfer.assert_called_once_with(
            transfer_event_operation, transfer_event_operation.created_by.pk
        )
        mock_process_facilities_transfer.assert_not_called()

        # Verify transfer event is marked as transferred
        transfer_event_operation.refresh_from_db()
        assert transfer_event_operation.status == TransferEvent.Statuses.TRANSFERRED

    @staticmethod
    @patch("service.transfer_event_service.TransferEventService._process_facilities_transfer")
    @patch("service.transfer_event_service.TransferEventService._process_operation_transfer")
    def test_process_single_event_failure(mock_process_operation: MagicMock, mock_process_facilities: MagicMock):
        user_guid = uuid4()
        operation_event = baker.make_recipe(
            "registration.tests.utils.transfer_event",
            operation=baker.make_recipe("registration.tests.utils.operation"),
            status=TransferEvent.Statuses.TO_BE_TRANSFERRED,
        )
        facility_event = baker.make_recipe(
            "registration.tests.utils.transfer_event",
            facilities=[baker.make_recipe("registration.tests.utils.facility")],
            status=TransferEvent.Statuses.TO_BE_TRANSFERRED,
        )

        # Simulate failure in processing functions
        mock_process_operation.side_effect = Exception("Operation processing failed")
        mock_process_facilities.side_effect = Exception("Facilities processing failed")

        # Test operation transfer failure
        with pytest.raises(Exception, match="Operation processing failed"):
            TransferEventService._process_single_event(operation_event, user_guid)
        operation_event.refresh_from_db()
        # Make sure the status is still TO_BE_TRANSFERRED
        assert operation_event.status == TransferEvent.Statuses.TO_BE_TRANSFERRED

        # Test facilities transfer failure
        with pytest.raises(Exception, match="Facilities processing failed"):
            TransferEventService._process_single_event(facility_event, user_guid)
        facility_event.refresh_from_db()
        # Make sure the status is still TO_BE_TRANSFERRED
        assert facility_event.status == TransferEvent.Statuses.TO_BE_TRANSFERRED

    @staticmethod
    @patch("service.transfer_event_service.FacilitySnapshotService.create_facility_snapshot")
    @patch("service.transfer_event_service.FacilityDesignatedOperationTimelineService.get_current_timeline")
    @patch("service.transfer_event_service.FacilityDesignatedOperationTimelineService.set_timeline_end_date")
    @patch(
        "service.transfer_event_service.FacilityDesignatedOperationTimelineDataAccessService.create_facility_designated_operation_timeline"
    )
    @patch("service.facility_service.FacilityService.update_operation_for_facility")
    def test_process_facilities_transfer(
        mock_update_operation_for_facility: MagicMock,
        mock_create_timeline: MagicMock,
        mock_set_timeline: MagicMock,
        mock_get_current_timeline: MagicMock,
        mock_create_snapshot: MagicMock,
    ):
        facility_1 = baker.make_recipe("registration.tests.utils.facility")
        facility_2 = baker.make_recipe("registration.tests.utils.facility")
        from_operation = baker.make_recipe("registration.tests.utils.operation")
        to_operation = baker.make_recipe("registration.tests.utils.operation")
        transfer_event = baker.make_recipe(
            "registration.tests.utils.transfer_event",
            status=TransferEvent.Statuses.TO_BE_TRANSFERRED,
            facilities=[facility_1, facility_2],
            from_operation=from_operation,
            to_operation=to_operation,
        )

        user_guid = uuid4()

        # Mock the behavior of get_current_timeline for facility 1 and 2
        timeline_1 = MagicMock()  # Simulate an existing timeline for facility_1
        mock_get_current_timeline.side_effect = [timeline_1, None]  # First call returns timeline_1, second returns None

        # Simulate the behavior of setting the timeline status and creating a new timeline
        mock_set_timeline.return_value = None
        mock_create_timeline.return_value = None
        mock_create_snapshot.return_value = MagicMock()  # Mock the snapshot creation

        # Call the method under test
        TransferEventService._process_facilities_transfer(transfer_event, user_guid)

        # Verify that get_current_timeline was called for each facility
        mock_get_current_timeline.assert_any_call(transfer_event.from_operation.id, facility_1.id)
        mock_get_current_timeline.assert_any_call(transfer_event.from_operation.id, facility_2.id)

        # Verify that set_timeline_end_date was called for facility_1 (existing timeline)
        mock_set_timeline.assert_called_once_with(
            timeline_1,
            transfer_event.effective_date,
        )

        # Verify that create_facility_designated_operation_timeline was called twice, once for each facility
        mock_create_timeline.assert_any_call(
            user_guid=user_guid,
            facility_designated_operation_timeline_data={
                "facility": facility_2,
                "operation": transfer_event.to_operation,
                "start_date": transfer_event.effective_date,
            },
        )

        mock_create_timeline.assert_any_call(
            user_guid=user_guid,
            facility_designated_operation_timeline_data={
                "facility": facility_1,
                "operation": transfer_event.to_operation,
                "start_date": transfer_event.effective_date,
            },
        )
        # Verify that update_operation_for_facility was called twice, once for each facility
        mock_update_operation_for_facility.assert_any_call(
            user_guid=user_guid, facility=facility_1, operation_id=to_operation.id
        )
        mock_update_operation_for_facility.assert_any_call(
            user_guid=user_guid, facility=facility_2, operation_id=to_operation.id
        )

    @patch("service.transfer_event_service.OperationDesignatedOperatorTimelineService.get_current_timeline")
    @patch("service.transfer_event_service.OperationDesignatedOperatorTimelineService.set_timeline_end_date")
    @patch(
        "service.transfer_event_service.OperationDesignatedOperatorTimelineDataAccessService.create_operation_designated_operator_timeline"
    )
    @patch("service.operation_service.OperationService.update_operator")
    def test_process_operation_transfer(
        self,
        mock_update_operator,
        mock_create_timeline,
        mock_set_timeline,
        mock_get_current_timeline,
    ):
        transfer_event = baker.make_recipe(
            "registration.tests.utils.transfer_event",
            status=TransferEvent.Statuses.TO_BE_TRANSFERRED,
            operation=baker.make_recipe("registration.tests.utils.operation"),
        )

        # contacts associated with the from operator
        from_operator_contacts = baker.make_recipe(
            "registration.tests.utils.contact",
            operator=transfer_event.from_operator,
            _quantity=2,
        )

        # contacts assigned to the operation
        transfer_event.operation.contacts.set(from_operator_contacts)

        user_guid = uuid4()  # Simulating the user GUID

        # Scenario 1: Current timeline exists
        mock_get_current_timeline.return_value = MagicMock()

        # Call the method under test for the first scenario (with existing timeline)
        TransferEventService._process_operation_transfer(transfer_event, user_guid)

        # Verify that get_current_timeline was called for the operation and operator
        mock_get_current_timeline.assert_called_once_with(transfer_event.from_operator.id, transfer_event.operation.id)

        # Verify that set_timeline_end_date was called since the timeline exists
        mock_set_timeline.assert_called_once_with(
            mock_get_current_timeline.return_value,
            transfer_event.effective_date,
        )

        # Verify the from_operator contacts are removed but not deleted
        assert transfer_event.operation.contacts.count() == 0
        assert Contact.objects.filter(operator=transfer_event.from_operator).count() == 2

        # Scenario 2: No current timeline
        mock_get_current_timeline.return_value = None
        mock_set_timeline.reset_mock()  # Reset mock for the next call
        mock_create_timeline.reset_mock()  # Reset mock for the next call
        mock_update_operator.reset_mock()  # Reset mock for the next call

        # Call the method under test for the second scenario (no existing timeline)
        TransferEventService._process_operation_transfer(transfer_event, user_guid)

        # Verify that create_operation_designated_operator_timeline was called since the timeline does not exist
        mock_create_timeline.assert_called_once_with(
            user_guid=user_guid,
            operation_designated_operator_timeline_data={
                "operation": transfer_event.operation,
                "operator": transfer_event.to_operator,
                "start_date": transfer_event.effective_date,
            },
        )

        # Verify that set_timeline_end_date was not called, since the timeline did not exist
        mock_set_timeline.assert_not_called()
        mock_update_operator.assert_called_once_with(
            user_guid,
            transfer_event.operation,
            transfer_event.to_operator.id,
        )

    @staticmethod
    @patch("service.transfer_event_service.TransferEventDataAccessService.get_by_id")
    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    def test_get_if_authorized(mock_get_by_guid, mock_get_by_id):
        # Scenario 1: Unauthorized user
        mock_get_by_id.return_value = transfer_event = MagicMock(id=uuid4())
        mock_get_by_guid.return_value = unauthorized_user = MagicMock(user_guid=uuid4())
        unauthorized_user.is_industry_user.return_value = True

        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            TransferEventService.get_if_authorized(unauthorized_user.user_guid, transfer_event.id)

        # Scenario 2: Authorized user
        mock_get_by_guid.return_value = cas_admin = baker.make_recipe('registration.tests.utils.cas_admin')
        result = TransferEventService.get_if_authorized(cas_admin.user_guid, uuid4())
        assert result == transfer_event

    @staticmethod
    @patch("service.transfer_event_service.TransferEventDataAccessService.get_by_id")
    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    def test_get_and_validate_transfer_event_for_update(mock_get_by_guid, mock_get_by_id):
        # Scenario 1: Unauthorized user
        mock_get_by_id.return_value = transfer_event = MagicMock(
            id=uuid4(), status=TransferEvent.Statuses.TO_BE_TRANSFERRED
        )
        mock_get_by_guid.return_value = unauthorized_user = MagicMock(user_guid=uuid4())
        unauthorized_user.is_cas_analyst.return_value = False
        unauthorized_user.is_cas_director.return_value = False

        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            TransferEventService._get_and_validate_transfer_event_for_update(
                transfer_event.id, unauthorized_user.user_guid
            )

        # Scenario 2: Valid transfer event and authorized user (analyst)
        mock_get_by_guid.return_value = authorized_user = MagicMock()
        authorized_user.is_cas_analyst.return_value = True
        authorized_user.is_cas_director.return_value = False

        result = TransferEventService._get_and_validate_transfer_event_for_update(
            transfer_event.id, authorized_user.user_guid
        )
        assert result == transfer_event

        # Scenario 2.1: Valid transfer event and authorized user (analyst)
        mock_get_by_guid.return_value = authorized_user = MagicMock()
        authorized_user.is_cas_analyst.return_value = False
        authorized_user.is_cas_director.return_value = True

        result = TransferEventService._get_and_validate_transfer_event_for_update(
            transfer_event.id, authorized_user.user_guid
        )
        assert result == transfer_event

        # Scenario 3: Invalid transfer event status
        mock_get_by_id.return_value = invalid_transfer = MagicMock(id=uuid4(), status=TransferEvent.Statuses.COMPLETE)
        mock_get_by_guid.return_value = authorized_user

        with pytest.raises(Exception, match="Only transfer events with status 'To be transferred' can be modified."):
            TransferEventService._get_and_validate_transfer_event_for_update(
                invalid_transfer.id, authorized_user.user_guid
            )

    @staticmethod
    @patch("service.transfer_event_service.TransferEventService._get_and_validate_transfer_event_for_update")
    def test_delete_transfer_event(mock_get_and_validate_transfer_event_for_update):
        transfer_event_mock = MagicMock(id=uuid4())
        mock_get_and_validate_transfer_event_for_update.return_value = transfer_event_mock
        user_guid = uuid4()
        TransferEventService.delete_transfer_event(user_guid=user_guid, transfer_id=transfer_event_mock.id)
        mock_get_and_validate_transfer_event_for_update.assert_called_once_with(transfer_event_mock.id, user_guid)
        transfer_event_mock.delete.assert_called_once()

    @staticmethod
    @patch("service.transfer_event_service.TransferEventService._validate_no_overlapping_transfer_events")
    @patch("service.transfer_event_service.TransferEventDataAccessService.update_transfer_event")
    def test_update_operation_transfer_event(mock_update_transfer_event, mock_validate_no_overlapping):
        user_guid = uuid4()
        transfer_id = uuid4()
        operation_id = uuid4()
        payload = MagicMock(operation=operation_id, effective_date=timezone.now())

        # Test with valid operation ID
        TransferEventService._update_operation_transfer_event(user_guid, transfer_id, payload)

        mock_validate_no_overlapping.assert_called_once_with(operation_id=operation_id, current_transfer_id=transfer_id)
        mock_update_transfer_event.assert_called_once_with(
            user_guid, transfer_id, {"operation_id": operation_id, "effective_date": payload.effective_date}
        )

        # Test with missing operation ID
        payload.operation = None
        with pytest.raises(Exception, match="Operation is required for operation transfer events."):
            TransferEventService._update_operation_transfer_event(user_guid, transfer_id, payload)

    @staticmethod
    @patch("service.transfer_event_service.TransferEventService._validate_no_overlapping_transfer_events")
    @patch("service.transfer_event_service.TransferEventDataAccessService.update_transfer_event")
    def test_update_facility_transfer_event(mock_update_transfer_event, mock_validate_no_overlapping):
        user_guid = uuid4()
        transfer_id = uuid4()
        facility_ids = [uuid4(), uuid4()]
        payload = MagicMock(facilities=facility_ids, effective_date=timezone.now())

        updated_transfer_event_mock = MagicMock()
        mock_update_transfer_event.return_value = updated_transfer_event_mock

        # Test with valid facility IDs
        TransferEventService._update_facility_transfer_event(user_guid, transfer_id, payload)

        mock_validate_no_overlapping.assert_called_once_with(facility_ids=facility_ids, current_transfer_id=transfer_id)
        mock_update_transfer_event.assert_called_once_with(
            user_guid, transfer_id, payload.dict(include=["effective_date"])
        )
        updated_transfer_event_mock.facilities.set.assert_called_once_with(facility_ids)

        # Test with missing facility IDs
        payload.facilities = []
        with pytest.raises(Exception, match="Facilities are required for facility transfer events."):
            TransferEventService._update_facility_transfer_event(user_guid, transfer_id, payload)

    @staticmethod
    @patch("service.transfer_event_service.TransferEventService._get_and_validate_transfer_event_for_update")
    @patch("service.transfer_event_service.TransferEventService._update_operation_transfer_event")
    @patch("service.transfer_event_service.TransferEventService._update_facility_transfer_event")
    @patch("service.transfer_event_service.TransferEventService._process_event_if_effective")
    def test_update_transfer_event(
        mock_process_event_if_effective,
        mock_update_facility_transfer_event,
        mock_update_operation_transfer_event,
        mock_get_and_validate_transfer_event_for_update,
    ):
        user_guid = uuid4()
        transfer_id = uuid4()
        transfer_event_mock = MagicMock()
        mock_get_and_validate_transfer_event_for_update.return_value = transfer_event_mock

        # Scenario 1: Updating an operation transfer event
        payload_operation = MagicMock(transfer_entity="Operation", operation=uuid4(), effective_date="2025-01-20")
        TransferEventService.update_transfer_event(user_guid, transfer_id, payload_operation)
        mock_update_operation_transfer_event.assert_called_once_with(user_guid, transfer_id, payload_operation)
        mock_process_event_if_effective.assert_called_once_with(payload_operation, transfer_event_mock, user_guid)

        # Scenario 2: Updating a facility transfer event
        payload_facility = MagicMock(
            transfer_entity="Facility", facilities=[uuid4(), uuid4()], effective_date="2025-01-20"
        )
        TransferEventService.update_transfer_event(user_guid, transfer_id, payload_facility)
        mock_update_facility_transfer_event.assert_called_once_with(user_guid, transfer_id, payload_facility)
        mock_process_event_if_effective.assert_called_with(payload_facility, transfer_event_mock, user_guid)

        # Scenario 3: Invalid transfer entity
        payload_invalid = MagicMock(transfer_entity="Invalid", effective_date="2025-01-20")
        with pytest.raises(KeyError):
            TransferEventService.update_transfer_event(user_guid, transfer_id, payload_invalid)
```

## File: bc_obps/service/tests/test_user_operator_service.py
```python
from itertools import cycle
from unittest.mock import patch

import pytest
from model_bakery import baker
from registration.constants import UNAUTHORIZED_MESSAGE
from registration.models import Operator, UserOperator, Contact, BusinessRole
from registration.schema import OperatorIn, UserOperatorFilterSchema, UserOperatorStatusUpdate
from service.user_operator_service import UserOperatorService
from registration.enums.enums import AccessRequestStates, AccessRequestTypes

pytestmark = pytest.mark.django_db


class TestUserOperatorService:
    @staticmethod
    def test_save_operator():
        payload = OperatorIn(
            legal_name="Example Legal Name",
            trade_name="Example Trade Name",
            business_structure="General Partnership",
            cra_business_number="123456789",
            bc_corporate_registry_number="aaa1111111",
            street_address="123 Main St",
            municipality="City",
            province="ON",
            postal_code="A1B 2C3",
            operator_has_parent_operators=False,
        )

        operator_instance: Operator = Operator(
            business_structure=payload.business_structure,
            cra_business_number=payload.cra_business_number,
            bc_corporate_registry_number=payload.bc_corporate_registry_number,
            status=Operator.Statuses.APPROVED,
        )
        UserOperatorService.save_operator(payload, operator_instance)
        assert len(Operator.objects.all()) == 1
        assert Operator.objects.first().legal_name == payload.legal_name
        assert Operator.objects.first().trade_name == payload.trade_name
        assert Operator.objects.first().business_structure == payload.business_structure
        assert Operator.objects.first().cra_business_number == payload.cra_business_number
        assert Operator.objects.first().bc_corporate_registry_number == payload.bc_corporate_registry_number
        assert Operator.objects.first().status == Operator.Statuses.APPROVED

    @staticmethod
    def test_list_user_operators_industry_users_are_not_authorized():
        filters_1 = UserOperatorFilterSchema(
            user_friendly_id="1",
            status="pending",
            user__first_name="john",
            user__last_name="doe",
            user__email="john.doe@test.com",
            user__bceid_business_name="test business name",
            operator__legal_name="test legal name",
        )

        # make sure only irc user can access this
        industry_user = baker.make_recipe('registration.tests.utils.industry_operator_user')
        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            UserOperatorService.list_user_operators(
                user_guid=industry_user.user_guid, filters=filters_1, sort_field="created_at", sort_order="asc"
            )

    @staticmethod
    def test_list_user_operators():
        # add some user operators
        baker.make_recipe(
            'registration.tests.utils.user_operator',
            user=cycle(baker.make_recipe('registration.tests.utils.industry_operator_user', _quantity=5)),
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
            _quantity=5,
        )
        baker.make_recipe(
            'registration.tests.utils.user_operator',
            user=cycle(baker.make_recipe('registration.tests.utils.industry_operator_user', _quantity=5)),
            role=UserOperator.Roles.REPORTER,
            status=UserOperator.Statuses.APPROVED,
            _quantity=5,
        )
        baker.make_recipe(
            'registration.tests.utils.user_operator',
            user=cycle(baker.make_recipe('registration.tests.utils.industry_operator_user', _quantity=5)),
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.DECLINED,
            _quantity=5,
        )
        baker.make_recipe(
            'registration.tests.utils.user_operator',
            user=cycle(baker.make_recipe('registration.tests.utils.industry_operator_user', _quantity=5)),
            role=UserOperator.Roles.PENDING,
            status=UserOperator.Statuses.PENDING,
            _quantity=5,
        )

        assert UserOperator.objects.count() == 20

        # Check filter role (we only care about role)
        filters_2 = UserOperatorFilterSchema(
            user_friendly_id="",
            role="admin",
            user__first_name="",
            user__last_name="",
            user__email="",
            user__bceid_business_name="",
            operator__legal_name="",
        )
        cas_admin = baker.make_recipe('registration.tests.utils.cas_admin')
        user_operators_with_admin_access_role = UserOperatorService.list_user_operators(
            user_guid=cas_admin.user_guid, filters=filters_2, sort_field="role", sort_order="asc"
        )
        assert user_operators_with_admin_access_role.count() == 5
        assert user_operators_with_admin_access_role.filter(role=UserOperator.Roles.ADMIN).count() == 5

        # Check sorting
        filters_3 = filters_2.model_copy(
            update={"role": ""}
        )  # making a copy of filters_2 and updating role to empty string
        user_operators_sorted_by_user_friendly_id = UserOperatorService.list_user_operators(
            user_guid=cas_admin.user_guid, filters=filters_3, sort_field="user_friendly_id", sort_order="asc"
        )
        assert (
            user_operators_sorted_by_user_friendly_id.first().user_friendly_id
            < user_operators_sorted_by_user_friendly_id.last().user_friendly_id
        )
        user_operators_sorted_by_role = UserOperatorService.list_user_operators(
            user_guid=cas_admin.user_guid, filters=filters_3, sort_field="role", sort_order="asc"
        )
        assert user_operators_sorted_by_role.first().role == UserOperator.Roles.ADMIN
        assert user_operators_sorted_by_role.last().role == UserOperator.Roles.REPORTER

    @staticmethod
    @patch("service.user_operator_service.UserOperatorService.save_operator")
    @patch(
        "service.data_access_service.user_operator_service.UserOperatorDataAccessService.get_or_create_user_operator",
    )
    @patch("service.operator_service.OperatorService.update_operator")
    @patch("service.user_operator_service.send_operator_access_request_email")
    def test_create_operator_and_user_operator_with_new_contact(
        mock_email_service,
        mock_update_operator,
        mock_get_or_create_user_operator,
        mock_save_operator,
    ):
        user = baker.make_recipe('registration.tests.utils.industry_operator_user')
        payload = OperatorIn(
            legal_name="Test",
            business_structure="BC Corporation",
            bc_corporate_registry_number="aaa1111111",
            cra_business_number="999999999",
            street_address="Test",
            municipality="Test",
            province="AB",
            postal_code="H0H0H0",
        )
        operator_instance = baker.make_recipe('registration.tests.utils.operator', status=Operator.Statuses.APPROVED)
        mock_save_operator.return_value = operator_instance

        user_operator_instance = baker.make_recipe(
            'registration.tests.utils.user_operator',
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
            user=user,
            operator=operator_instance,
        )
        mock_get_or_create_user_operator.return_value = user_operator_instance, True

        mock_update_operator.return_value = None  # We don't care about the return value of this function
        UserOperatorService.create_operator_and_user_operator(user_guid=user.user_guid, payload=payload)

        mock_save_operator.assert_called_once()
        mock_get_or_create_user_operator.assert_called_once_with(user.user_guid, operator_instance.id)
        mock_update_operator.assert_called_once_with(user.user_guid, payload)

        assert Operator.objects.count() == 1
        assert Operator.objects.first().status == "Approved"
        assert Contact.objects.count() == 1
        assert Contact.objects.filter(
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            phone_number=user.phone_number,
            position_title=user.position_title,
            business_role=BusinessRole.objects.get(role_name="Operation Representative"),
            operator_id=operator_instance.id,
        ).exists()

        # although the user_operator instance is being approved, we don't want to send an email
        # because the user just created the operator so it's obvious they would have access
        mock_email_service.assert_not_called()

    @staticmethod
    @patch("service.user_operator_service.UserOperatorService.save_operator")
    @patch(
        "service.data_access_service.user_operator_service.UserOperatorDataAccessService.get_or_create_user_operator"
    )
    @patch("service.operator_service.OperatorService.update_operator")
    def test_create_operator_and_user_operator_with_existing_contact(
        mock_update_operator, mock_get_or_create_user_operator, mock_save_operator
    ):
        user = baker.make_recipe('registration.tests.utils.industry_operator_user')
        payload = OperatorIn(
            legal_name="Test",
            business_structure="BC Corporation",
            bc_corporate_registry_number="aaa1111111",
            cra_business_number="999999999",
            street_address="Test",
            municipality="Test",
            province="AB",
            postal_code="H0H0H0",
        )
        operator_instance = baker.make_recipe('registration.tests.utils.operator', status=Operator.Statuses.APPROVED)
        mock_save_operator.return_value = operator_instance

        user_operator_instance = baker.make_recipe(
            'registration.tests.utils.user_operator',
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
            user=user,
            operator=operator_instance,
        )
        mock_get_or_create_user_operator.return_value = user_operator_instance, True

        mock_update_operator.return_value = None  # We don't care about the return value of this function

        baker.make_recipe(
            'registration.tests.utils.contact',
            email=user.email,
            first_name='changed name',
            last_name='changed also',
            operator=operator_instance,
        )

        UserOperatorService.create_operator_and_user_operator(user_guid=user.user_guid, payload=payload)

        mock_save_operator.assert_called_once()
        mock_get_or_create_user_operator.assert_called_once_with(user.user_guid, operator_instance.id)
        mock_update_operator.assert_called_once_with(user.user_guid, payload)

        assert Operator.objects.count() == 1
        assert Operator.objects.first().status == "Approved"
        assert Contact.objects.count() == 1
        contact = Contact.objects.first()
        assert contact.first_name == 'changed name'
        assert contact.last_name == 'changed also'
        assert Contact.objects.filter(
            first_name='changed name',
            last_name='changed also',
            email=user.email,
            operator_id=operator_instance.id,
        ).exists()

    @staticmethod
    @patch("service.user_operator_service.UserOperatorService.check_if_user_eligible_to_access_user_operator")
    def test_delete_user_operator(mock_check_if_user_eligible_to_access_user_operator):
        user = baker.make_recipe('registration.tests.utils.industry_operator_user')
        user_operator = baker.make_recipe('registration.tests.utils.user_operator', user=user)

        # generate a random user_operator to make sure it is not deleted
        baker.make_recipe('registration.tests.utils.user_operator')

        UserOperatorService.delete_user_operator(user_guid=user.user_guid, user_operator_id=user_operator.id)

        mock_check_if_user_eligible_to_access_user_operator.assert_called_once_with(user.user_guid, user_operator.id)
        assert UserOperator.objects.count() == 1
        assert UserOperator.objects.filter(id=user_operator.id).exists() is False


class TestUpdateStatusAndCreateContact:
    @patch('service.user_operator_service.send_operator_access_request_email')
    def test_industry_user_cannot_approve_access_request_from_a_different_operator(self, mock_email_service):
        approved_admin_user_operator = baker.make_recipe(
            'registration.tests.utils.approved_user_operator', role=UserOperator.Roles.ADMIN
        )
        pending_user_operator = baker.make_recipe('registration.tests.utils.user_operator')

        with pytest.raises(Exception, match='Your user is not associated with this operator.'):
            UserOperatorService.update_status_and_create_contact(
                pending_user_operator.id,
                UserOperatorStatusUpdate(status='Approved', role=UserOperator.Roles.ADMIN),
                approved_admin_user_operator.user.user_guid,
            )

        mock_email_service.assert_not_called()

    @staticmethod
    @patch('service.user_operator_service.send_operator_access_request_email')
    def test_operator_admin_declines_access_request(mock_email_service):
        approved_admin_user_operator = baker.make_recipe(
            'registration.tests.utils.approved_user_operator', role=UserOperator.Roles.ADMIN
        )
        pending_user_operator = baker.make_recipe(
            'registration.tests.utils.user_operator', operator=approved_admin_user_operator.operator
        )

        pending_user_operator.user.business_guid = approved_admin_user_operator.user.business_guid

        UserOperatorService.update_status_and_create_contact(
            pending_user_operator.id,
            UserOperatorStatusUpdate(status='Declined', role=UserOperator.Roles.ADMIN),
            approved_admin_user_operator.user.user_guid,
        )

        pending_user_operator.refresh_from_db()  # refresh the pending_user_operator object to get the updated status
        assert pending_user_operator.status == UserOperator.Statuses.DECLINED
        assert pending_user_operator.role == UserOperator.Roles.PENDING
        assert pending_user_operator.verified_by == approved_admin_user_operator.user

        mock_email_service.assert_called_once_with(
            AccessRequestStates.DECLINED,
            AccessRequestTypes.OPERATOR_WITH_ADMIN,
            approved_admin_user_operator.operator.legal_name,
            pending_user_operator.user.get_full_name(),
            pending_user_operator.user.email,
        )

    @staticmethod
    def test_cas_admin_undoes_approved_access_request():
        approved_admin_user_operator = baker.make_recipe(
            'registration.tests.utils.approved_user_operator', role=UserOperator.Roles.ADMIN
        )
        previously_approved_user_operator = baker.make_recipe(
            'registration.tests.utils.user_operator',
            operator=approved_admin_user_operator.operator,
            role=UserOperator.Roles.REPORTER,
        )

        previously_approved_user_operator.user.business_guid = approved_admin_user_operator.user.business_guid
        UserOperatorService.update_status_and_create_contact(
            previously_approved_user_operator.id,
            UserOperatorStatusUpdate(status='Pending', role=UserOperator.Roles.PENDING),
            approved_admin_user_operator.user.user_guid,
        )

        previously_approved_user_operator.refresh_from_db()  # refresh the previously_approved_user_operator object to get the updated status
        assert previously_approved_user_operator.status == UserOperator.Statuses.PENDING
        assert previously_approved_user_operator.role == UserOperator.Roles.PENDING
        assert previously_approved_user_operator.verified_by is None

    @staticmethod
    def test_update_status_and_create_new_contact_success():
        industry_operator_user = baker.make_recipe(
            'registration.tests.utils.industry_operator_user',
            first_name="Wednesday",
            last_name="Addams",
            email="wednesday.addams@email.com",
            phone_number='+16044011234',
            position_title="child",
        )
        approved_admin_user_operator = baker.make_recipe(
            'registration.tests.utils.approved_user_operator', role=UserOperator.Roles.ADMIN
        )
        pending_user_operator = baker.make_recipe(
            'registration.tests.utils.user_operator',
            operator=approved_admin_user_operator.operator,
            user=industry_operator_user,
        )

        # Set some existing contacts to make sure the service doesn't override them
        pending_user_operator.operator.contacts.set(baker.make_recipe('registration.tests.utils.contact', _quantity=3))

        pending_user_operator.user.business_guid = approved_admin_user_operator.user.business_guid

        UserOperatorService.update_status_and_create_contact(
            pending_user_operator.id,
            UserOperatorStatusUpdate(status='Approved', role=UserOperator.Roles.ADMIN),
            approved_admin_user_operator.user.user_guid,
        )
        pending_user_operator.refresh_from_db()  # refresh the pending_user_operator object to get the updated status
        assert pending_user_operator.status == UserOperator.Statuses.APPROVED
        assert pending_user_operator.role == UserOperator.Roles.ADMIN
        assert pending_user_operator.verified_by == approved_admin_user_operator.user

        assert Contact.objects.count() == 4
        assert pending_user_operator.operator.contacts.count() == 4
        assert Contact.objects.filter(first_name="Wednesday").exists()

    @staticmethod
    def test_update_status_and_update_existing_contact_success():
        industry_operator_user = baker.make_recipe(
            'registration.tests.utils.industry_operator_user',
            first_name="Wednesday",
            last_name="Addams",
            email="wednesday.addams@email.com",
            phone_number='+16044011234',
            position_title="child",
        )
        approved_admin_user_operator = baker.make_recipe(
            'registration.tests.utils.approved_user_operator', role=UserOperator.Roles.ADMIN
        )
        pending_user_operator = baker.make_recipe(
            'registration.tests.utils.user_operator',
            operator=approved_admin_user_operator.operator,
            user=industry_operator_user,
        )

        # Create an existing contact with the same email as the pending one (e.g., a user was approved, unapproved, and re-approved, and they changed their info somwhere in this process)
        baker.make_recipe(
            'registration.tests.utils.contact',
            first_name="Thursday",
            last_name="Addams",
            email="wednesday.addams@email.com",
            phone_number='+16044011234',
            position_title="child",
        )

        pending_user_operator.user.business_guid = approved_admin_user_operator.user.business_guid

        UserOperatorService.update_status_and_create_contact(
            pending_user_operator.id,
            UserOperatorStatusUpdate(status='Approved', role=UserOperator.Roles.ADMIN),
            approved_admin_user_operator.user.user_guid,
        )
        pending_user_operator.refresh_from_db()  # refresh the pending_user_operator object to get the updated status
        assert pending_user_operator.status == UserOperator.Statuses.APPROVED
        assert pending_user_operator.role == UserOperator.Roles.ADMIN
        assert pending_user_operator.verified_by == approved_admin_user_operator.user

        assert pending_user_operator.operator.contacts.count() == 1
        assert Contact.objects.filter(first_name="Thursday").exists()

    @staticmethod
    def test_update_status_and_create_contact_does_not_create_duplicate_contacts():
        approved_admin_user_operator = baker.make_recipe(
            'registration.tests.utils.approved_user_operator', role=UserOperator.Roles.ADMIN
        )
        pending_user_operator = baker.make_recipe(
            'registration.tests.utils.user_operator',
            operator=approved_admin_user_operator.operator,
        )

        pending_user_operator.user.business_guid = approved_admin_user_operator.user.business_guid
        pending_user_operator.user.save()

        UserOperatorService.update_status_and_create_contact(
            pending_user_operator.id,
            UserOperatorStatusUpdate(status='Approved', role=UserOperator.Roles.ADMIN),
            approved_admin_user_operator.user.user_guid,
        )
        assert Contact.objects.count() == 1
        assert pending_user_operator.operator.contacts.count() == 1

        # Second call to the same function should not create duplicate contacts
        UserOperatorService.update_status_and_create_contact(
            pending_user_operator.id,
            UserOperatorStatusUpdate(status='Approved', role=UserOperator.Roles.ADMIN),
            approved_admin_user_operator.user.user_guid,
        )
        assert Contact.objects.count() == 1
        assert pending_user_operator.operator.contacts.count() == 1
```

## File: bc_obps/service/tests/test_user_service.py
```python
import pytest
from django.utils import timezone
from registration.models.app_role import AppRole
from registration.schema.user import UserUpdateRoleIn
from registration.tests.utils.bakers import (
    user_baker,
    user_operator_baker,
)
from registration.constants import UNAUTHORIZED_MESSAGE
from registration.models.user import User
from registration.models.user_operator import UserOperator
from registration.tests.utils.bakers import operator_baker
from model_bakery import baker
from service.user_service import UserService

pytestmark = pytest.mark.django_db


class TestUserService:
    @staticmethod
    def test_get_user_if_authorized_cas_user_success():
        admin_user = baker.make(User, app_role=AppRole.objects.get(role_name="cas_analyst"))
        target_user = user_baker()
        result = UserService.get_if_authorized(admin_user.pk, target_user.pk)
        assert result == target_user

    @staticmethod
    def test_get_user_if_authorized_cas_user_pending_fail():
        admin_user = baker.make(User, app_role=AppRole.objects.get(role_name="cas_pending"))
        target_user = user_baker()
        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            UserService.get_if_authorized(admin_user.pk, target_user.pk)

    @staticmethod
    def test_get_user_if_authorized_industry_user_success():
        admin_user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        target_user = user_baker(
            {'business_guid': admin_user.business_guid}
        )  # industry user admin can access user in same business(same business_guid)
        operator = operator_baker()
        user_operator_baker(
            {
                "user": admin_user,
                "operator": operator,
                "status": UserOperator.Statuses.APPROVED,
                "role": UserOperator.Roles.ADMIN,
            }
        )
        result = UserService.get_if_authorized(admin_user.pk, target_user.pk)
        assert result == target_user

    @staticmethod
    def test_get_user_if_authorized_industry_user_fail():
        user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        target_user = user_baker()
        operator = operator_baker()
        user_operator_baker(
            {
                "user": user,
                "operator": operator,
                "status": UserOperator.Statuses.APPROVED,
                "role": UserOperator.Roles.ADMIN,
            }
        )
        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            UserService.get_if_authorized(user.pk, target_user.pk)

    @staticmethod
    def test_update_user_role_fail():
        updating_user = baker.make_recipe('registration.tests.utils.cas_admin')
        user_to_update = updating_user
        with pytest.raises(Exception, match='You cannot change your own user role.'):
            UserService.update_user_role(
                updating_user.user_guid,
                user_to_update.user_guid,
                UserUpdateRoleIn(app_role='cas_director', archive=False),
            )

    @staticmethod
    def test_update_user_role_change_success():
        updating_user = baker.make_recipe('registration.tests.utils.cas_admin')
        user_to_update = baker.make_recipe('registration.tests.utils.cas_pending')

        UserService.update_user_role(
            updating_user.user_guid, user_to_update.user_guid, UserUpdateRoleIn(app_role='cas_director', archive=False)
        )

        user_to_update.refresh_from_db()
        assert user_to_update.app_role.role_name == 'cas_director'
        assert user_to_update.archived_at is None
        assert user_to_update.archived_by is None

    @staticmethod
    def test_update_user_role_archive_success():
        updating_user = baker.make_recipe('registration.tests.utils.cas_admin')
        user_to_update = baker.make_recipe('registration.tests.utils.cas_analyst')

        UserService.update_user_role(
            updating_user.user_guid, user_to_update.user_guid, UserUpdateRoleIn(app_role='cas_pending', archive=True)
        )

        user_to_update.refresh_from_db()
        assert user_to_update.app_role.role_name == 'cas_pending'
        assert user_to_update.archived_at is not None
        assert user_to_update.archived_by == updating_user

    @staticmethod
    def test_update_user_role_unarchive_success():
        updating_user = baker.make_recipe('registration.tests.utils.cas_admin')
        user_to_update = baker.make_recipe('registration.tests.utils.cas_pending', archived_at=timezone.now())

        UserService.update_user_role(
            updating_user.user_guid,
            user_to_update.user_guid,
            UserUpdateRoleIn(app_role='cas_analyst', archive=False),
            True,
        )

        user_to_update.refresh_from_db()
        assert user_to_update.app_role.role_name == 'cas_analyst'
        assert user_to_update.archived_at is None
        assert user_to_update.archived_by is None
```

## File: bc_obps/service/utils/constants.py
```python
# May 31st. Month and Day appended to reporting_year_id(calendar year as an int) in get_report_valid_date_from_version_id
# to form a date string used to find the valid configuration for a report version
REPORT_VERSION_DEFAULT_MONTH = 5
REPORT_VERSION_DEFAULT_DAY = 31
```

## File: bc_obps/service/utils/get_report_valid_date_from_version_id.py
```python
from datetime import date
from reporting.models.report_version import ReportVersion
from .constants import REPORT_VERSION_DEFAULT_MONTH, REPORT_VERSION_DEFAULT_DAY


def get_report_valid_date_from_version_id(report_version_id: int) -> date:
    report_version = ReportVersion.objects.get(id=report_version_id)
    return date(report_version.report.reporting_year_id, REPORT_VERSION_DEFAULT_MONTH, REPORT_VERSION_DEFAULT_DAY)
```

## File: bc_obps/service/activity_service.py
```python
import json
from reporting.models import Configuration, ConfigurationElement
from typing import List, Dict, Any
from registration.models import Activity
from uuid import UUID
from service.utils.get_report_valid_date_from_version_id import get_report_valid_date_from_version_id


class ActivityService:
    @classmethod
    def get_initial_activity_data(cls, version_id: int, facility_id: UUID, activity_id: int) -> str:
        source_type_map: dict[int, str] = {}
        report_date = get_report_valid_date_from_version_id(version_id)
        config = Configuration.objects.get(valid_from__lte=report_date, valid_to__gte=report_date)
        source_type_data = (
            ConfigurationElement.objects.select_related('source_type')
            .filter(activity_id=activity_id, valid_from__lte=config, valid_to__gte=config)
            .order_by('source_type__id')
            .distinct('source_type__id')
            .only('source_type__id', 'source_type__json_key')
        )
        for s in source_type_data:
            source_type_map[s.source_type.id] = s.source_type.json_key
        return json.dumps({"activityId": activity_id, "sourceTypeMap": source_type_map})

    @classmethod
    def get_all_activities(cls) -> List[Dict[str, Any]]:
        # Fetch activities and sort by weight
        activities = (
            Activity.objects.all().order_by('weight', 'name').values("id", "name", "applicable_to", "regulated_name")
        )
        return [dict(activity) for activity in activities]

    @classmethod
    def get_all_activity_ids(cls) -> List[int]:
        # Fetch activities and sort by weight
        return list(Activity.objects.all().values_list("id", flat=True).order_by("weight", "name"))
```

## File: bc_obps/service/application_access_service.py
```python
from typing import Dict, Optional
from uuid import UUID
from common.exceptions import UserError
from registration.enums.enums import AccessRequestStates, AccessRequestTypes
from registration.emails import send_operator_access_request_email
from service.email.email_service import EmailService
from registration.models import UserOperator
from service.data_access_service.operator_service import OperatorDataAccessService
from service.data_access_service.user_operator_service import UserOperatorDataAccessService
from service.data_access_service.user_service import UserDataAccessService


email_service = EmailService()


class ApplicationAccessService:
    @classmethod
    def is_user_eligible_to_request_access(cls, operator_id: UUID, user_guid: UUID) -> Optional[bool]:
        """
        Check if the business_guid of a user who is requesting access to an operator matches the business_guid of the operator's admin

        Args:
            user_guid (UUID): The guid of the user for whom eligibility is being checked.
            operator_id (int): The id of the operator to which access is being requested.

        Returns:
            True or raises an exception.
        """
        operators_business_bceid = OperatorDataAccessService.get_operators_business_guid(operator_id)
        users_business_bceid = UserDataAccessService.get_by_guid(user_guid).business_guid

        if operators_business_bceid != users_business_bceid:
            raise UserError(
                "Your business BCeID does not have access to this operator. Please contact your operator's administrator to request the correct business BCeID. If this issue persists, please contact"
            )
        return True

    # check_users_admin_request_eligibility
    @classmethod
    def is_user_eligible_to_request_admin_access(
        cls,
        operator_id: UUID,
        user_guid: UUID,
    ) -> Optional[bool]:
        """
        Check if a user is eligible to request admin access to an operator.

        Args:
            user_guid (uuid): The user for whom eligibility is being checked.
            operator_id (uuid): The id of the operator to which admin access is being requested.

        Returns:
            True or raises an exception.
        """
        approved_admins = UserOperatorDataAccessService.get_admin_users(operator_id, UserOperator.Statuses.APPROVED)
        if approved_admins.filter(user_guid=user_guid).exists():
            raise UserError("You are already an admin for this Operator.")
        if len(approved_admins) > 0:
            raise UserError("This Operator already has an admin user.")
        # User already has a pending request for this operator
        # NOTE: This is a bit of a weird case, but it's possible for a user to have a pending request for an operator and if we show the UserOperator request form, they could submit another request and end up with two
        pending_admins = UserOperatorDataAccessService.get_admin_users(operator_id, UserOperator.Statuses.PENDING)

        if pending_admins.filter(user_guid=user_guid).exists():
            raise UserError("You already have a pending request for this Operator.")

        return True

    @classmethod
    def request_access(cls, operator_id: UUID, user_guid: UUID) -> Dict[str, UUID]:
        if ApplicationAccessService.is_user_eligible_to_request_access(operator_id, user_guid):
            # Making a draft UserOperator instance if one doesn't exist
            user_operator, created = UserOperatorDataAccessService.get_or_create_user_operator(user_guid, operator_id)
            if created:
                send_operator_access_request_email(
                    AccessRequestStates.CONFIRMATION,
                    AccessRequestTypes.OPERATOR_WITH_ADMIN,
                    user_operator.operator.legal_name,
                    user_operator.user.get_full_name(),
                    user_operator.user.email,
                )

        return {"user_operator_id": user_operator.id, "operator_id": user_operator.operator.id}

    @classmethod
    def request_admin_access(cls, operator_id: UUID, user_guid: UUID) -> Dict[str, UUID]:
        if ApplicationAccessService.is_user_eligible_to_request_admin_access(operator_id, user_guid):
            # Making a draft UserOperator instance if one doesn't exist
            user_operator, created = UserOperatorDataAccessService.get_or_create_user_operator(user_guid, operator_id)
            if created:
                send_operator_access_request_email(
                    AccessRequestStates.CONFIRMATION,
                    AccessRequestTypes.ADMIN,
                    user_operator.operator.legal_name,
                    user_operator.user.get_full_name(),
                    user_operator.user.email,
                )
        return {"user_operator_id": user_operator.id, "operator_id": user_operator.operator.id}
```

## File: bc_obps/service/contact_service.py
```python
from typing import Optional
from django.db.models import QuerySet
from uuid import UUID
from common.exceptions import UserError
from registration.constants import UNAUTHORIZED_MESSAGE
from registration.models.contact import Contact
from registration.schema import (
    ContactFilterSchema,
    ContactWithPlacesAssigned,
    PlacesAssigned,
    ContactIn,
    OperationRepresentativeIn,
)
from service.data_access_service.contact_service import ContactDataAccessService
from service.data_access_service.user_service import UserDataAccessService
from ninja import Query
from ninja.types import DictStrAny
from django.db import transaction
from typing import cast, Union, Dict
from registration.models.business_role import BusinessRole
from service.data_access_service.address_service import AddressDataAccessService


class ContactService:
    @classmethod
    def get_if_authorized(cls, user_guid: UUID, contact_id: int) -> Optional[Contact]:
        user = UserDataAccessService.get_by_guid(user_guid)
        user_contacts = ContactDataAccessService.get_all_contacts_for_user(user)
        contact = user_contacts.filter(id=contact_id).first()
        if user.is_industry_user() and not contact:
            raise Exception(UNAUTHORIZED_MESSAGE)
        return contact

    @classmethod
    def get_contact_id_for_user(cls, user_guid: UUID) -> Optional[int]:
        user = UserDataAccessService.get_by_guid(user_guid)
        contact = ContactDataAccessService.get_contact_for_user(user)
        return contact.id if contact else None

    @classmethod
    def list_contacts(
        cls,
        user_guid: UUID,
        sort_field: Optional[str],
        sort_order: Optional[str],
        filters: ContactFilterSchema = Query(...),
    ) -> QuerySet[Contact]:
        user = UserDataAccessService.get_by_guid(user_guid)
        sort_direction = "-" if sort_order == "desc" else ""
        sort_by = f"{sort_direction}{sort_field}"
        base_qs = ContactDataAccessService.get_all_contacts_for_user(user).select_related("operator")

        return filters.filter(base_qs).order_by(sort_by)

    @classmethod
    def list_operation_representatives(
        cls,
        operation_id: UUID,
        user_guid: UUID,
    ) -> QuerySet[Contact]:
        from service.operation_service import OperationService  # to avoid circular imports

        operation = OperationService.get_if_authorized(user_guid, operation_id, ['id', 'operator_id'])
        return operation.contacts.order_by('-created_at')

    @classmethod
    @transaction.atomic()
    def create_contact(cls, user_guid: UUID, payload: Union[ContactIn, OperationRepresentativeIn]) -> Contact:
        contact_data: dict = payload.dict(include={*ContactIn.Meta.fields})
        # `business_role` is a mandatory field in the DB but we don't collect it from the user
        # so we set it to a default value here and we can change it later if needed
        contact_data['business_role'] = BusinessRole.objects.get(role_name="Operation Representative")
        operator_id = UserDataAccessService.get_user_operator_by_user(user_guid).operator.id
        contact_data['operator_id'] = operator_id
        cls._validate_contact_email(None, operator_id, contact_data['email'])
        contact: Contact
        contact = ContactDataAccessService.update_or_create(None, contact_data)

        # Create address
        address_data = payload.dict(
            include={'street_address', 'municipality', 'province', 'postal_code'}, exclude_none=True
        )

        if address_data:
            address = AddressDataAccessService.create_address(address_data)
            contact.address = address
            # not calling `set_create_or_update` because we are updating the contact in the same transaction
            contact.save(update_fields=['address_id'])
        return contact

    @classmethod
    @transaction.atomic()
    def update_contact(
        cls, user_guid: UUID, contact_id: int, payload: Union[ContactIn, OperationRepresentativeIn]
    ) -> Contact:
        # Make sure user has access to the contact
        if not ContactDataAccessService.user_has_access(user_guid, contact_id):
            raise Exception(UNAUTHORIZED_MESSAGE)

        address_data = payload.dict(include={'street_address', 'municipality', 'province', 'postal_code'})
        contact_data: Dict = payload.dict(
            include=['first_name', 'last_name', 'email', 'phone_number', 'position_title']
        )
        # Prevent updating contact if the contact is an 'Operation Representative' and required address fields are missing
        cls._validate_operation_representative_address(contact_id, address_data)

        # Prevent updating contact if the email is already in use by another contact associated with the same operator
        operator_id = UserDataAccessService.get_user_operator_by_user(user_guid).operator.id
        email: str = contact_data['email']
        cls._validate_contact_email(contact_id, operator_id, email)
        # UPDATE CONTACT

        contact = ContactDataAccessService.update_or_create(contact_id, contact_data)

        # UPDATE ADDRESS
        if any(address_data.values()):  # if any address data is provided
            address = AddressDataAccessService.upsert_address_from_data(address_data, contact.address_id)
            contact.address = address
            contact.save(update_fields=['address_id'])
        else:
            existing_contact_address = contact.address
            if existing_contact_address:
                contact.address = None
                contact.save(update_fields=['address'])
                # contact has an address and the payload has no address data, remove the address
                existing_contact_address.delete()
        return contact

    @classmethod
    def get_with_places_assigned(cls, user_guid: UUID, contact_id: int) -> Optional[ContactWithPlacesAssigned]:
        contact = cls.get_if_authorized(user_guid, contact_id)
        places_assigned = []
        if contact:
            role_name = contact.business_role.role_name
            for operation in contact.operations_contacts.all():
                place = PlacesAssigned(
                    role_name=role_name,
                    operation_name=operation.name,
                    operation_id=operation.id,
                )
                places_assigned.append(place)
            result = cast(ContactWithPlacesAssigned, contact)
            if places_assigned:
                result.places_assigned = places_assigned
            return result
        return None

    @classmethod
    def raise_exception_if_contact_missing_address_information(cls, contact_id: int) -> None:
        """This function checks that a contact has a complete address record (contact.address exists and all fields in the address model have a value). In general in the app, address is not mandatory, but in certain cases (e.g., when a contact is assigned to an operation as the Operation Representative), the business area requires the contact to have an address."""
        contact = ContactDataAccessService.get_by_id(contact_id)
        address = contact.address
        if not address or any(
            not getattr(address, field, None) for field in ['street_address', 'municipality', 'province', 'postal_code']
        ):
            raise UserError(
                f'The contact {contact.first_name} {contact.last_name} is missing address information. Please return to Contacts and fill in their address information before assigning them as an Operation Representative here.'
            )

    @classmethod
    def _validate_operation_representative_address(cls, contact_id: int, address_data: DictStrAny) -> None:
        """Raises an exception if the contact is an 'Operation Representative' and required address fields are missing."""
        contact = ContactDataAccessService.get_by_id(contact_id)
        if contact.business_role.role_name == "Operation Representative" and any(
            not address_data.get(field) for field in ['street_address', 'municipality', 'province', 'postal_code']
        ):
            raise UserError("This contact is an 'Operation Representative' and must have all address-related fields.")

    @classmethod
    def _validate_contact_email(cls, contact_id: Optional[int], operator_id: UUID, email: str) -> None:
        """Raises an exception if the contact email is already in use by another contact associated with the same operator.
        Slightly different error messages are raised depending on whether this is from an update or create.
        (contact_id is not None for update)
        """

        contacts = Contact.objects.filter(email__iexact=email, operator_id=operator_id)
        if contact_id is not None:
            contacts = contacts.exclude(id=contact_id)
        if contacts.exists():
            message = (
                f"A contact with the email '{email}' already exists. Please add a different contact or edit the existing contact."
                if contact_id is None
                else f"The email '{email}' is in use by another contact. Please use a different email address."
            )
            raise UserError(message)

    @classmethod
    def archive_contact(cls, user_guid: UUID, contact_id: int) -> None:
        """Archives a contact if the user has appropriate permissions."""
        contact = cls.get_if_authorized(user_guid, contact_id)
        if contact is not None:
            contact.set_archive(user_guid)
```

## File: bc_obps/service/document_service.py
```python
from typing import Tuple
from uuid import UUID
from django.core.files import File
from service.data_access_service.document_service import DocumentDataAccessService
from registration.models import Document, Operation
from service.data_access_service.operation_service import OperationDataAccessService


class DocumentService:
    @classmethod
    def get_operation_document_by_type_if_authorized(
        cls, user_guid: UUID, operation_id: UUID, document_type: str
    ) -> Document | None:
        from service.operation_service import OperationService

        OperationService.get_if_authorized(user_guid, operation_id, ['id', 'operator_id'])
        return DocumentDataAccessService.get_operation_document_by_type(operation_id, document_type)

    @classmethod
    def get_document_url_if_authorized(cls, user_guid: UUID, document_id: int) -> str:
        from service.operation_service import OperationService

        document = Document.objects.get(id=document_id)

        if document.operation_id:
            OperationService.get_if_authorized(user_guid, document.operation_id, ['id', 'operator_id'])
        else:
            raise ValueError(f"Document id {document_id} is not associated with any operation")

        document_url: str = document.get_file_url()

        return document_url

    @classmethod
    def create_or_replace_operation_document(
        cls, user_guid: UUID, operation_id: UUID, file_data: File, document_type: str
    ) -> Tuple[Document, bool]:
        """
        This function receives a document and operation id.
        Operations only have one of each type of document, so this function uses the type to check if an existing document needs to be replaced, or if no document exists and one must be created.
        This function does NOT set any m2m relationships.
        :returns: Tuple[Document, bool] where the bool is True if a new document was created, False if an existing document was updated
        """
        existing_document = cls.get_operation_document_by_type_if_authorized(user_guid, operation_id, document_type)
        # if there is an existing document, delete it
        if existing_document:
            existing_document.delete()

        document = DocumentDataAccessService.create_document(user_guid, file_data, document_type, operation_id)
        return document, True

    @classmethod
    def archive_or_delete_operation_document(cls, user_guid: UUID, operation_id: UUID, document_type: str) -> bool:
        """
        This function receives an operation ID and document type.
        If the operation's status != "Registered", the specified document will be deleted.
        If the operation's status == "Registered", and the specified document_type for the operation_id can be found, this
        function will archive that document.
        :returns: bool to indicate whether the document was successfully archived or deleted.
        """
        operation = OperationDataAccessService.get_by_id(operation_id)
        document = DocumentDataAccessService.get_operation_document_by_type(operation_id, document_type)
        if document and operation.status == Operation.Statuses.REGISTERED:
            document.set_archive(user_guid)
            return True
        elif document:
            document.delete()
            return True
        return False
```

## File: bc_obps/service/facility_designated_operation_timeline_service.py
```python
from datetime import datetime
from typing import Optional
from django.db.models import QuerySet
from uuid import UUID
from registration.models.facility import Facility
from registration.schema import FacilityDesignatedOperationTimelineFilterSchema
from service.data_access_service.user_service import UserDataAccessService
from ninja import Query
from registration.models import User
from registration.models.facility_designated_operation_timeline import FacilityDesignatedOperationTimeline
from service.user_operator_service import UserOperatorService
from django.db import transaction


class FacilityDesignatedOperationTimelineService:
    @classmethod
    def get_timeline_by_operation_id(
        cls, user: User, operation_id: UUID
    ) -> QuerySet[FacilityDesignatedOperationTimeline]:
        base_queryset = FacilityDesignatedOperationTimeline.objects.filter(
            operation__id=operation_id, end_date__isnull=True
        ).distinct()

        if user.is_industry_user():
            UserOperatorService.get_current_user_approved_user_operator_or_raise(user)

        return base_queryset

    @classmethod
    def list_timeline_by_operation_id(
        cls,
        user_guid: UUID,
        operation_id: UUID,
        sort_field: Optional[str],
        sort_order: Optional[str],
        filters: FacilityDesignatedOperationTimelineFilterSchema = Query(...),
    ) -> QuerySet[FacilityDesignatedOperationTimeline]:
        """List facilities belonging to a specific operation with specified sorting and filtering."""
        user = UserDataAccessService.get_by_guid(user_guid)
        sort_direction = "-" if sort_order == "desc" else ""
        sort_by = f"{sort_direction}{sort_field}"
        base_qs = cls.get_timeline_by_operation_id(user, operation_id)
        return filters.filter(base_qs).order_by(sort_by)

    @classmethod
    def get_current_timeline(
        cls, operation_id: UUID, facility_id: UUID
    ) -> Optional[FacilityDesignatedOperationTimeline]:
        return FacilityDesignatedOperationTimeline.objects.filter(
            operation_id=operation_id, facility_id=facility_id, end_date__isnull=True
        ).first()

    @classmethod
    def set_timeline_end_date(
        cls,
        timeline: FacilityDesignatedOperationTimeline,
        end_date: datetime,
    ) -> FacilityDesignatedOperationTimeline:
        timeline.end_date = end_date
        timeline.save(update_fields=["end_date"])
        return timeline

    @classmethod
    @transaction.atomic()
    def delete_facilities_by_operation_id(cls, user_guid: UUID, operation_id: UUID) -> None:
        user = UserDataAccessService.get_by_guid(user_guid)
        UserOperatorService.get_current_user_approved_user_operator_or_raise(user)

        FacilityDesignatedOperationTimeline.objects.filter(operation_id=operation_id).delete()
        Facility.objects.filter(operation_id=operation_id).delete()
```

## File: bc_obps/service/facility_report_service.py
```python
from uuid import UUID
from dataclasses import dataclass
from django.db import transaction
from typing import Any, Dict, List, Optional, cast
from ninja import Query
from registration.models import Activity, Facility
from reporting.models import ReportActivity, ReportProductEmissionAllocation, ReportProduct
from reporting.models.facility_report import FacilityReport
from reporting.models.report_operation import ReportOperation
from reporting.models.report_raw_activity_data import ReportRawActivityData
from reporting.schema.facility_report import FacilityReportListInSchema, FacilityReportFilterSchema
from django.db.models import QuerySet, F
from reporting.service.sync_validation_service import SyncValidationService
from service.activity_service import ActivityService


@dataclass
class FacilityReportData:
    facility_name: str
    facility_type: str
    facility_activities: List[Dict[str, Any]]
    other_activities: List[Dict[str, Any]]
    report_version_id: int
    is_completed: bool
    regulated_products: Optional[List[int]]
    facility_bcghgid: Optional[str] = None


class SaveFacilityReportData:
    def __init__(
        self,
        facility_name: str,
        facility_type: str,
        activities: List[int],
        regulated_products: Optional[List[int]],
        facility_bcghgid: Optional[str] = None,
    ):
        self.facility_name = facility_name
        self.facility_type = facility_type
        self.facility_bcghgid = facility_bcghgid
        self.activities = activities
        self.regulated_products = regulated_products


class FacilityReportService:
    @classmethod
    def _build_facility_report_data(cls, facility_report: FacilityReport, report_version_id: int) -> FacilityReportData:
        report_operation = ReportOperation.objects.filter(report_version_id=report_version_id).first()

        all_activities = ActivityService.get_all_activities()
        operation_activity_ids = (
            set(report_operation.activities.values_list('id', flat=True)) if report_operation else set()
        )
        operation_activities = [activity for activity in all_activities if activity['id'] in operation_activity_ids]
        other_activities = [activity for activity in all_activities if activity['id'] not in operation_activity_ids]

        return FacilityReportData(
            facility_name=facility_report.facility_name,
            facility_type=facility_report.facility_type,
            facility_activities=operation_activities,
            other_activities=other_activities,
            report_version_id=report_version_id,
            is_completed=facility_report.is_completed,
            regulated_products=list(
                ReportProduct.objects.filter(facility_report_id=facility_report.id).values_list('product_id', flat=True)
            ),
            facility_bcghgid=facility_report.facility_bcghgid,
        )

    @classmethod
    def get_facility_report_by_version_and_id(cls, report_version_id: int, facility_id: UUID) -> FacilityReport:
        facility_report = FacilityReport.objects.annotate(operation_id=F('report_version__report__operation_id')).get(
            report_version_id=report_version_id, facility_id=facility_id
        )

        facility_report.is_sync_allowed = SyncValidationService.is_facility_sync_allowed(report_version_id, facility_id)  # type: ignore[attr-defined]

        facility_report_data = cls._build_facility_report_data(facility_report, report_version_id)

        for field_name in ('facility_activities', 'other_activities'):
            setattr(facility_report, field_name, getattr(facility_report_data, field_name))

        return facility_report

    @classmethod
    def get_facility_report_by_version_id(cls, report_version_id: int) -> Optional[UUID]:
        return (
            FacilityReport.objects.filter(report_version__id=report_version_id)
            .values_list('facility_id', flat=True)
            .first()
        )

    @classmethod
    def get_activity_ids_for_facility(cls, version_id: int, facility_id: UUID) -> List[int]:
        facility_report = FacilityReport.objects.get(report_version_id=version_id, facility_id=facility_id)
        return list(facility_report.activities.values_list('id', flat=True))

    @classmethod
    def add_activities_to_facility_report(cls, facility_report: FacilityReport, activities: List[int]) -> None:
        """
        Add activities to a facility report without removing or duplicating existing ones.
        """
        facility_report.activities.add(*Activity.objects.filter(id__in=activities))

    @classmethod
    def set_activities_for_facility_report(cls, facility_report: FacilityReport, activities: List[int]) -> None:
        facility_report.activities.set(Activity.objects.filter(id__in=activities))
        report_activities_to_prune = ReportActivity.objects.filter(facility_report_id=facility_report.id).exclude(
            activity_id__in=activities
        )

        if report_activities_to_prune:
            # If activities are removed from a facility_report, then the corresponding report_activity data must be delete-cascaded
            report_activities_to_prune.delete()
            # If activities are removed from a facility report, then the allocation of emissions to all products must be deleted & re-allocated by the user
            ReportProductEmissionAllocation.objects.filter(
                report_emission_allocation__facility_report_id=facility_report.id
            ).delete()
            # If activities are removed from a facility_report, then the corresponding raw activity data must be delete-cascaded
            ReportRawActivityData.objects.filter(facility_report_id=facility_report.id).exclude(
                activity_id__in=activities
            ).delete()

    @classmethod
    def prune_report_product_data_for_facility_report(
        cls, facility_report: FacilityReport, regulated_products: List[int]
    ) -> None:
        report_products_to_prune = ReportProduct.objects.filter(facility_report_id=facility_report.id).exclude(
            product_id__in=regulated_products
        )

        if report_products_to_prune:
            report_product_ids = report_products_to_prune.values_list("id", flat=True)
            # If regulated_products are removed from a report_operation, then the corresponding report_product data must be deleted
            ReportProduct.objects.filter(facility_report_id=facility_report.id).exclude(
                product_id__in=regulated_products
            ).delete()
            # If regulated_products are removed from a report_operation, then the allocation of emissions to those products must be deleted & re-allocated by the user
            ReportProductEmissionAllocation.objects.filter(
                report_emission_allocation__facility_report_id=facility_report.id,
                report_product_id__in=report_product_ids,
            ).delete()

    @classmethod
    @transaction.atomic()
    def save_facility_report(cls, report_version_id: int, facility_id: UUID, data: Any) -> FacilityReport:
        """
        Update a facility report and its related activities.

        Args:
            report_version_id (int): The ID of the report version.
            facility_id (int): The ID of the facility.
            data (SaveFacilityReportData): The input data for the facility report.

        Returns:
            FacilityReport: The updated or created FacilityReport instance.
        """

        # Update FacilityReport instance
        facility_report = FacilityReport.objects.get(report_version_id=report_version_id, facility_id=facility_id)
        facility_report.facility_name = data.facility_name.strip()
        facility_report.facility_type = data.facility_type.strip()
        # Update ManyToMany fields (activities, report_products)
        if hasattr(data, 'activities'):
            cls.set_activities_for_facility_report(facility_report=facility_report, activities=data.activities)
        if hasattr(data, 'regulated_products'):
            cls.prune_report_product_data_for_facility_report(
                facility_report=facility_report, regulated_products=data.regulated_products
            )

        # Save the updated FacilityReport instance
        facility_report.save()

        return facility_report

    @classmethod
    def get_facility_report_list(
        cls,
        version_id: int,
        sort_field: Optional[str],
        sort_order: Optional[str],
        filters: FacilityReportFilterSchema = Query(...),
    ) -> QuerySet[FacilityReport]:
        sort_direction = "-" if sort_order == "desc" else ""
        sort_by = f"{sort_direction}{sort_field}"

        facilities = FacilityReport.objects.filter(report_version_id=version_id)

        queryset = (
            filters.filter(facilities)
            .order_by(sort_by)
            .values('id', 'facility_name', 'facility_id', 'facility_bcghgid', 'is_completed')
            .distinct()
        )

        return cast(QuerySet[FacilityReport], queryset)

    @classmethod
    @transaction.atomic
    def save_facility_report_list(cls, version_id: int, data: List[FacilityReportListInSchema]) -> None:

        for facility_data in data:
            facility_id = facility_data.facility
            is_completed = facility_data.is_completed

            # Update the facility report
            FacilityReport.objects.filter(report_version_id=version_id, facility_id=facility_id).update(
                is_completed=is_completed
            )

    @classmethod
    @transaction.atomic()
    def update_facility_report(cls, version_id: int, facility_id: UUID) -> FacilityReport:
        facility = Facility.objects.get(id=facility_id)
        facility_report = FacilityReport.objects.get(report_version_id=version_id, facility_id=facility_id)

        facility_report.facility_name = facility.name
        facility_report.facility_type = facility.type
        facility_report.facility_bcghgid = str(facility.bcghg_id.id) if facility.bcghg_id else None

        facility_report.save()

        return facility_report
```

## File: bc_obps/service/facility_service.py
```python
from typing import Optional
from django.db.models import QuerySet
from uuid import UUID
from common.exceptions import UserError
from registration.models.bc_greenhouse_gas_id import BcGreenhouseGasId
from service.data_access_service.facility_designated_operation_timeline_service import (
    FacilityDesignatedOperationTimelineDataAccessService,
)
from service.data_access_service.user_service import UserDataAccessService
from service.data_access_service.facility_service import FacilityDataAccessService
from registration.models import Facility
from registration.schema import FacilityIn
from service.data_access_service.well_authorization_number_service import WellAuthorizationNumberDataAccessService
from service.data_access_service.operation_service import OperationDataAccessService
from registration.constants import UNAUTHORIZED_MESSAGE
from service.data_access_service.address_service import AddressDataAccessService
from registration.models.operation import Operation
from registration.models import User
from registration.models import WellAuthorizationNumber
from django.db import transaction
from django.utils import timezone
from registration.models import Address


class FacilityService:
    @classmethod
    def check_user_access(cls, user_guid: UUID, operation: Operation) -> None:
        """
        Assesses whether a user has access to a given operation.

        This method performs the following steps:
        1. **Retrieve User:** Uses `UserDataAccessService.get_by_guid` to fetch the user instance based on the provided `user_guid`.
        2. **Check Access:** Checks if the retrieved user has access to the specified operation using `operation.user_has_access`.
        3. **Raise Unauthorized Exception:** If the user does not have access to the operation, an exception is raised with an appropriate unauthorized message.

        Parameters:
        - `user_guid` (UUID): The unique identifier of the user whose access is being checked.
        - `operation` (Operation): The operation instance to which access is being validated.

        Raises:
        - `Exception`: If the user does not have access to the operation, an exception is raised with the message defined in `UNAUTHORIZED_MESSAGE`.
        """
        # Retrieve the user instance based on the provided user_guid
        user: User = UserDataAccessService.get_by_guid(user_guid)

        # Check if the user has access to the specified operation
        if not operation.user_has_access(user.user_guid):
            # Raise an exception if access is denied
            raise Exception(UNAUTHORIZED_MESSAGE)

    @classmethod
    def prepare_facility_data(cls, payload: FacilityIn) -> dict:
        """
        Prepares facility data from the provided payload for further processing or database operations.

        This method performs the following steps:
        1. **Extract Data:** Extracts relevant fields from the `payload` (an instance of `FacilityIn`) to prepare a dictionary of facility data.
        2. **Include Specific Fields:** The method specifically includes fields such as 'name', 'type', 'latitude_of_largest_emissions', and 'longitude_of_largest_emissions'.

        Parameters:
        - `payload` (FacilityIn): The data payload containing facility details that need to be processed.

        Returns:
        - `dict`: A dictionary containing the extracted facility data.
        """
        # Prepare a dictionary of facility data by including specified fields from the payload
        return payload.dict(
            include={
                'name',
                'type',
                'is_current_year',
                'starting_date',
                'latitude_of_largest_emissions',
                'longitude_of_largest_emissions',
                'operation_id',
            }
        )

    @classmethod
    def build_address(cls, payload: FacilityIn, exclude_none: bool = True) -> dict:
        """Helper function to create an address model from payload data."""
        address_data = payload.dict(
            include={'street_address', 'municipality', 'province', 'postal_code'}, exclude_none=exclude_none
        )
        return address_data

    @classmethod
    def create_address(cls, address_data: dict) -> Optional[Address]:
        """Helper function to create an address model from payload data."""
        return AddressDataAccessService.create_address(address_data)

    @classmethod
    def handle_well_authorization_numbers(cls, user_guid: UUID, payload: FacilityIn, facility: Facility) -> None:
        """
        Helper function to process and set well authorization numbers for a facility.

        This method handles the addition and removal of well authorization numbers for a given facility based on
        the provided payload. It ensures that there are no duplicate well authorization numbers in the new set
        and updates the facility's well authorization numbers accordingly.

        Args:
            user_guid (UUID): The GUID of the user making the changes.
            payload (FacilityIn): The payload containing the new well authorization numbers.
            facility (Facility): The facility object to be updated.

        Raises:
            Exception: If there are duplicate well authorization numbers in the new set.
        """
        # Extract existing well authorization numbers from the facility
        existing_numbers_set = set(
            facility.well_authorization_numbers.values_list('well_authorization_number', flat=True)
        )
        # Must convert each value in payload.well_authorization_numbers to an integer, as the database expects integers but the payload is a list of strings
        new_numbers = [int(number) for number in payload.well_authorization_numbers]

        # Check for duplicates within the new_numbers
        if len(new_numbers) != len(set(new_numbers)):
            raise UserError("Well Authorization Number: Duplicates are not allowed.")

        # Convert existing numbers to a queryset for filtering
        existing_numbers_queryset = WellAuthorizationNumber.objects.filter(
            well_authorization_number__in=existing_numbers_set
        )

        # Numbers to add
        numbers_to_add = set(new_numbers) - existing_numbers_set

        # Add new numbers
        if numbers_to_add:
            for number in numbers_to_add:
                facility.well_authorization_numbers.add(
                    WellAuthorizationNumberDataAccessService.create_well_authorization_number(user_guid, number)
                )

        # Numbers to remove
        numbers_to_remove = existing_numbers_set - set(new_numbers)

        # Archive old numbers
        if numbers_to_remove:
            numbers_to_archive: QuerySet[WellAuthorizationNumber] = existing_numbers_queryset.filter(
                well_authorization_number__in=numbers_to_remove
            )
            for n in numbers_to_archive:
                n.set_archive(user_guid)

    @classmethod
    def get_if_authorized(cls, user_guid: UUID, facility_id: UUID) -> Facility:
        """Retrieve a facility if the user is authorized to access it."""
        facility: Facility = FacilityDataAccessService.get_by_id(facility_id)
        user: User = UserDataAccessService.get_by_guid(user_guid)
        if user.is_industry_user():
            if not facility.operation.user_has_access(user.user_guid):
                raise Exception(UNAUTHORIZED_MESSAGE)
        return facility

    @classmethod
    def get_if_director(cls, user_guid: UUID, facility_id: UUID) -> Facility:
        """Retrieve a facility if the user is a CAS director."""
        user: User = UserDataAccessService.get_by_guid(user_guid)
        if not user.is_cas_director():
            raise Exception(UNAUTHORIZED_MESSAGE)

        return FacilityDataAccessService.get_by_id(facility_id)

    @classmethod
    @transaction.atomic()
    def create_facility_with_designated_operation(cls, user_guid: UUID, payload: FacilityIn) -> Facility:
        """Create a facility with designated operation details."""
        from service.operation_service import OperationService

        operation = OperationService.get_if_authorized(user_guid, payload.operation_id, ['id', 'operator_id'])

        # Validate that SFO and EIO can only have one facility
        if operation.facilities.count() > 0 and operation.type != Operation.Types.LFO:
            raise UserError(
                "This type of operation (SFO or EIO) can only have one facility, this page should not be accessible"
            )

        facility_data = cls.prepare_facility_data(payload)
        address_data = cls.build_address(payload)
        if address_data:
            facility_data['address'] = cls.create_address(address_data)

        facility = FacilityDataAccessService.create_facility(user_guid, facility_data)
        FacilityDesignatedOperationTimelineDataAccessService.create_facility_designated_operation_timeline(
            user_guid, {'facility': facility, 'operation': operation, 'start_date': timezone.now()}
        )

        cls.handle_well_authorization_numbers(user_guid, payload, facility)

        # Must refresh facility when well numbers are changed
        facility.refresh_from_db()

        return facility

    @classmethod
    @transaction.atomic()
    def update_facility(cls, user_guid: UUID, facility_id: UUID, payload: FacilityIn) -> Facility:
        """
        Checks user access and, if authorized, updates a facility with new data.

        Parameters:
        - user_guid (UUID): The GUID of the user making the update request.
        - facility_id (UUID): The ID of the facility to be updated.
        - payload (FacilityIn): The new data for updating the facility.

        Returns:
        - Facility: The updated facility instance.
        """
        # Retrieve the operation object using the operation ID from the payload
        operation = OperationDataAccessService.get_by_id(payload.operation_id)

        # Check if the user has access to update the given operation
        cls.check_user_access(user_guid, operation)

        # Retrieve the facility object using the provided facility ID
        facility: Facility = FacilityDataAccessService.get_by_id(facility_id)

        # Prepare the facility data for updating, based on the provided payload
        facility_data = cls.prepare_facility_data(payload)

        # Update the address associated with the facility, if provided
        address_data = cls.build_address(payload, False)
        if any(address_data.values()):  # if any address data is provided
            address = AddressDataAccessService.upsert_address_from_data(address_data, facility.address_id)
            facility.address = address
            facility.save(update_fields=['address_id'])
        else:
            existing_address = facility.address
            if existing_address:
                facility.address = None
                facility.save(update_fields=['address'])
                # facility has an address and the payload has no address data, remove the address
                existing_address.delete()

        # Update the facility in the data access layer with the new data
        facility = FacilityDataAccessService.update_facility(facility_id, facility_data)

        # Process well authorization numbers and link them to the facility
        cls.handle_well_authorization_numbers(user_guid, payload, facility)

        # Must refresh facility when well numbers are changed
        facility.refresh_from_db()

        return facility

    @classmethod
    @transaction.atomic()
    def create_facilities_with_designated_operations(cls, user_guid: UUID, payload: list[FacilityIn]) -> list[Facility]:
        facilities = []
        for facility_data in payload:
            facilities.append(cls.create_facility_with_designated_operation(user_guid, facility_data))
        return facilities

    @classmethod
    def generate_bcghg_id(cls, user_guid: UUID, facility_id: UUID, bcghg_id: str | None = None) -> BcGreenhouseGasId:
        facility = FacilityService.get_if_director(user_guid, facility_id)

        if bcghg_id:
            bcghg_id_record, _ = BcGreenhouseGasId.objects.get_or_create(
                id=bcghg_id, defaults={'issued_by_id': user_guid, 'comments': 'bcghg id manually set to facility'}
            )
            facility.bcghg_id = bcghg_id_record
        else:
            facility.generate_unique_bcghg_id(user_guid=user_guid)

        facility.save(update_fields=['bcghg_id'])
        if facility.bcghg_id is None:
            raise Exception('Failed to create a BCGHG ID for the facility.')

        return facility.bcghg_id

    @classmethod
    def clear_bcghg_id(cls, user_guid: UUID, facility_id: UUID) -> None:
        facility = FacilityService.get_if_director(user_guid, facility_id)

        facility.bcghg_id = None
        facility.save(update_fields=['bcghg_id'])

    @classmethod
    @transaction.atomic()
    def update_operation_for_facility(cls, user_guid: UUID, facility: Facility, operation_id: UUID) -> Facility:
        """
        Update the operation for the facility
        At the time of implementation, this is only used for transferring facilities between operations and,
        is only available to cas_analyst users
        """

        user = UserDataAccessService.get_by_guid(user_guid)
        if not user.is_cas_analyst() and not user.is_cas_director():
            raise Exception(UNAUTHORIZED_MESSAGE)
        facility.operation_id = operation_id
        facility.save(update_fields=["operation_id"])
        return facility
```

## File: bc_obps/service/facility_snapshot_service.py
```python
import logging
from uuid import UUID
from django.db import transaction
from registration.models import Facility, FacilitySnapshot, Operation

logger = logging.getLogger(__name__)


class FacilitySnapshotService:
    @classmethod
    @transaction.atomic
    def create_facility_snapshot(
        cls,
        user_guid: UUID,
        facility: Facility,
        operation: Operation,
    ) -> FacilitySnapshot:
        """
        Create a snapshot of a facility at the time of transfer.

        Args:
            user_guid: The UUID of the user creating the snapshot
            facility: The facility to snapshot
            operation: The operation that owned the facility at snapshot time

        Returns:
            The created FacilitySnapshot instance
        """
        # Get address data if available
        address = facility.address
        street_address = address.street_address if address else None
        municipality = address.municipality if address else None
        province = address.province if address else None
        postal_code = address.postal_code if address else None

        # Get BCGHG ID if available
        bcghg_id = str(facility.bcghg_id.id) if facility.bcghg_id else None

        # Get well authorization numbers
        well_auth_numbers = list(
            facility.well_authorization_numbers.values_list('well_authorization_number', flat=True)
        )

        snapshot = FacilitySnapshot.objects.create(
            facility=facility,
            operation=operation,
            name=facility.name,
            is_current_year=facility.is_current_year,
            starting_date=facility.starting_date,
            type=facility.type,
            street_address=street_address,
            municipality=municipality,
            province=province,
            postal_code=postal_code,
            swrs_facility_id=facility.swrs_facility_id,
            bcghg_id=bcghg_id,
            latitude_of_largest_emissions=facility.latitude_of_largest_emissions,
            longitude_of_largest_emissions=facility.longitude_of_largest_emissions,
            well_authorization_numbers=well_auth_numbers,
            created_by_id=user_guid,
            updated_by_id=user_guid,
        )

        logger.info(f"Created facility snapshot {snapshot.id} for facility {facility.id} and operation {operation.id}")
        return snapshot
```

## File: bc_obps/service/form_builder_service.py
```python
import json
from django.core.cache import caches

from registration.models import Activity
from service.utils.get_report_valid_date_from_version_id import (
    get_report_valid_date_from_version_id,
)
from reporting.models import (
    Configuration,
    ConfigurationElement,
    ActivityJsonSchema,
    ActivitySourceTypeJsonSchema,
    CustomMethodologySchema,
    FacilityReport,
)
from typing import Dict, List, Optional, Any, Sequence
from django.db.models import QuerySet
from django.db.models import Prefetch
from service.data_access_service.fuel_service import FuelTypeDataAccessService


def get_custom_methodology_schema_by_id(schema_id: int) -> Dict[str, Any]:
    custom_schema = CustomMethodologySchema.objects.get(id=schema_id)
    return custom_schema.json_schema  # type: ignore[no-any-return]


def handle_methodologies(
    gas_type_id: int,
    activity_id: int,
    source_type_id: int,
    fetched_configuration_elements: Sequence[ConfigurationElement],
    config_element_for_methodologies: Sequence[ConfigurationElement],
    gas_type_one_of: Dict,
    index: int,
    add_not_applicable_methodology: bool,
) -> None:
    methodology_enum: List[str] = []
    methodology_map: Dict[int, str] = {}
    methodology_one_of: Dict[str, Dict[str, List]] = {"methodology": {"oneOf": []}}

    # Create a mapping for quick lookup
    fetched_config_map = {
        (elem.gas_type.id, elem.methodology_id): list(elem.prefetched_reporting_fields)  # type: ignore
        for elem in fetched_configuration_elements
    }

    # Iterate through methodologies
    for config_element_for_methodology in config_element_for_methodologies:
        methodology_name = config_element_for_methodology.methodology.name
        methodology_id = config_element_for_methodology.methodology.id
        methodology_enum.append(methodology_name)
        methodology_map[methodology_id] = methodology_name

        # Use the precomputed map for quick access
        key = (gas_type_id, methodology_id)
        if key not in fetched_config_map:
            raise Exception(
                f"No configuration found for activity_id {activity_id} & source_type_id {source_type_id} "
                f"& gas_type_id {gas_type_id} & methodology_id {methodology_id}"
            )

        reporting_fields = fetched_config_map[key]

        # Create methodology object
        methodology_object: Dict[str, Dict] = {"properties": {"methodology": {"enum": [methodology_name]}}}

        # Check for custom schema
        if config_element_for_methodology.custom_methodology_schema_id:
            # Fetch and add custom schema
            custom_schema = get_custom_methodology_schema_by_id(
                config_element_for_methodology.custom_methodology_schema_id
            )
            methodology_object["properties"].update(custom_schema.get("properties", {}))

        else:
            for reporting_field in reporting_fields:
                property_field = reporting_field.slug
                methodology_object["properties"][property_field] = {
                    "type": reporting_field.field_type,
                    "title": reporting_field.field_display_title or reporting_field.field_name,
                    "methodology_units": reporting_field.field_units,
                }

        methodology_one_of["methodology"]["oneOf"].append(methodology_object)

    # Check if "not applicable" options should be added
    if add_not_applicable_methodology:
        methodology_enum.append("Not Applicable")
        methodology_one_of["methodology"]["oneOf"].append({"properties": {"methodology": {"enum": ["Not Applicable"]}}})

    # Update gas_type_one_of with computed values
    gas_type_one_of["gasType"]["oneOf"][index]["properties"]["methodology"]["properties"]["methodology"][
        "enum"
    ] = methodology_enum
    gas_type_one_of["gasType"]["oneOf"][index]["properties"]["methodology"]["dependencies"] = methodology_one_of


def handle_gas_types(
    source_type_schema: ActivitySourceTypeJsonSchema,
    gas_type_enum: List,
    gas_type_one_of: Dict,
    config_element_for_gas_types: QuerySet[ConfigurationElement],
    activity_id: int,
    source_type_id: int,
    config_id: int,
    add_not_applicable_methodology: bool,
) -> None:
    # Convert QuerySet to a list for efficient iteration without extra database hits
    config_elements_list = list(config_element_for_gas_types)
    # Use a dictionary to keep track of gas type's chemical_formula
    gas_type_map: Dict[int, Dict[str, str]] = {
        ce.gas_type_id: {"chemical_formula": ce.gas_type.chemical_formula} for ce in config_elements_list
    }
    # Gather all necessary gas_type_ids for filtering fetched configurations
    gas_type_ids = list(gas_type_map.keys())

    # Fetch all relevant configuration elements with a single query
    fetched_configuration_elements = list(
        ConfigurationElement.objects.select_related("activity", "source_type", "gas_type", "methodology")
        .prefetch_related(Prefetch("reporting_fields", to_attr="prefetched_reporting_fields"))
        .filter(
            activity=activity_id,
            source_type=source_type_id,
            gas_type__id__in=gas_type_ids,
            valid_from__lte=config_id,
            valid_to__gte=config_id,
        )
    )

    # Organize fetched configuration elements by gas_type_id
    fetched_config_map: Dict[int, List[ConfigurationElement]] = {}
    for elem in fetched_configuration_elements:
        gas_type_id = elem.gas_type_id
        if gas_type_id not in fetched_config_map:
            fetched_config_map[gas_type_id] = []
        fetched_config_map[gas_type_id].append(elem)

    # Process each gas type element
    for index, config_element_for_gas_type in enumerate(config_elements_list):
        gas_type_id = config_element_for_gas_type.gas_type_id
        gas_type_info = gas_type_map.get(gas_type_id, {})
        gas_type_chemical_formula = gas_type_info.get("chemical_formula", "")

        # Add the gas type to the enum list
        gas_type_enum.append(gas_type_chemical_formula)

        # Retrieve methodologies associated with the current gas type
        config_element_for_methodologies = fetched_config_map.get(gas_type_id, [])

        if not config_element_for_methodologies:
            raise Exception(
                f"No configuration found for activity_id {activity_id} & source_type_id {source_type_id} "
                f"& gas_type_id {gas_type_id} & configuration {config_id}"
            )

        # Define the gas type schema
        gas_type_schema = {
            "properties": {
                "gasType": {"enum": [gas_type_chemical_formula]},
                "emission": {
                    "title": f"Emissions (t{gas_type_chemical_formula})",
                    "type": "number",
                    "minimum": 0,
                },
                "methodology": {
                    "type": "object",
                    "properties": {
                        "methodology": {
                            "title": "Methodology",
                            "type": "string",
                            "enum": [],
                        }
                    },
                },
            },
        }

        # Append the gas type schema to the oneOf branch
        gas_type_one_of["gasType"]["oneOf"].append(gas_type_schema)

        # Handle methodologies for the current gas type
        handle_methodologies(
            gas_type_id,
            activity_id,
            source_type_id,
            fetched_configuration_elements,
            config_element_for_methodologies,
            gas_type_one_of,
            index,
            add_not_applicable_methodology,
        )


def handle_source_type_schema(
    source_type_schema: ActivitySourceTypeJsonSchema,
    gas_type_enum: List,
    gas_type_one_of: Dict,
) -> Dict:
    st_schema: Dict = source_type_schema.json_schema
    # Append valid gas types to schema as an enum on the gasType property. Uses the has_unit / has_fuel booleans to determine the depth of the emissions array.
    if source_type_schema.has_unit and source_type_schema.has_fuel:
        # Fetch the list of fuels & add them to the fuelName enum
        fuel_list = list(FuelTypeDataAccessService.get_fuels().values_list("name", flat=True))
        st_schema["properties"]["units"]["items"]["properties"]["fuels"]["items"]["properties"]["fuelType"][
            "properties"
        ]["fuelName"]["enum"] = fuel_list

        st_schema["properties"]["units"]["items"]["properties"]["fuels"]["items"]["properties"]["emissions"]["items"][
            "properties"
        ]["gasType"]["enum"] = gas_type_enum
        st_schema["properties"]["units"]["items"]["properties"]["fuels"]["items"]["properties"]["emissions"]["items"][
            "dependencies"
        ] = gas_type_one_of
    elif source_type_schema.has_unit and not source_type_schema.has_fuel:
        st_schema["properties"]["units"]["items"]["properties"]["emissions"]["items"]["properties"]["gasType"][
            "enum"
        ] = gas_type_enum

        st_schema["properties"]["units"]["items"]["properties"]["emissions"]["items"]["dependencies"] = gas_type_one_of
    elif not source_type_schema.has_unit and source_type_schema.has_fuel:
        fuel_list = list(FuelTypeDataAccessService.get_fuels().values_list("name", flat=True))
        st_schema["properties"]["fuels"]["items"]["properties"]["fuelType"]["properties"]["fuelName"][
            "enum"
        ] = fuel_list

        st_schema["properties"]["fuels"]["items"]["properties"]["emissions"]["items"]["properties"]["gasType"][
            "enum"
        ] = gas_type_enum
        st_schema["properties"]["fuels"]["items"]["properties"]["emissions"]["items"]["dependencies"] = gas_type_one_of
    else:
        st_schema["properties"]["emissions"]["items"]["properties"]["gasType"]["enum"] = gas_type_enum
        st_schema["properties"]["emissions"]["items"]["dependencies"] = gas_type_one_of
    return st_schema


# Called by build_schema. Builds the source type schema including gas_type & methodology dependencies
def build_source_type_schema(
    config_id: int,
    activity_id: int,
    source_type_id: int,
    add_not_applicable_methodology: bool,
) -> Dict:
    form_builder_cache = caches["form_builder"]
    cache_key = f"{config_id}-{activity_id}-{source_type_id}"
    cache_hit: Dict = form_builder_cache.get(cache_key)

    if cache_hit:
        return cache_hit

    try:
        source_type_schema = ActivitySourceTypeJsonSchema.objects.get(
            activity_id=activity_id,
            source_type_id=source_type_id,
            valid_from__lte=config_id,
            valid_to__gte=config_id,
        )
    except Exception:
        raise Exception(
            f"No schema found for activity_id {activity_id} & source_type_id {source_type_id} & configuration {config_id}"
        )

    # Fetch valid gas_type values for activity-sourceType pair
    config_element_for_gas_types = (
        ConfigurationElement.objects.select_related("gas_type")
        .filter(
            activity_id=activity_id,
            source_type_id=source_type_id,
            valid_from__lte=config_id,
            valid_to__gte=config_id,
        )
        .distinct("gas_type__name")
    )
    gas_type_enum: List = []
    # Maps of the gas_type & methodology objects will be passed in the return object so we have the IDs on the frontend.
    gas_type_one_of: Dict = {"gasType": {"oneOf": []}}
    handle_gas_types(
        source_type_schema,
        gas_type_enum,
        gas_type_one_of,
        config_element_for_gas_types,
        activity_id,
        source_type_id,
        config_id,
        add_not_applicable_methodology,
    )

    json_schema = handle_source_type_schema(source_type_schema, gas_type_enum, gas_type_one_of)
    form_builder_cache.set(cache_key, json_schema)

    return json_schema


# build_schema will dynamically create a form depending on the parameters passed
# activity: Returns a form with just the activity schema + the set of related source_types
# activity + source_type(s): Returns the activity schema, plus the schema(s) for each source type id passed in the List, plus fills the gas_type enum with the valid gas types based on the activity & source type
# activity + source_type(s) + gas_type selection is made: Returns all of the above, plus fills out the methodology enum with the valid methodology options based on the activity, source_type & gas_type selected
# activity + source_type(s) + gas_type selection + methodology selection is made: Returns all of the above, plus the additional reporting fields associated to the methodology selection
# report_date is mandatory & determines the valid schemas & WCI configuration for the point in time that the report was created


def build_schema(
    config_id: int, activity: int, source_types: List[str] | List[int], facility_id: str, report_version_id: int
) -> str:
    activity_obj = Activity.objects.filter(id=activity).only("name").first()
    activity_name = activity_obj.name if activity_obj else f"Activity {activity}"
    # Check if the activity schema exists
    activity_schema_exists = ActivityJsonSchema.objects.filter(
        activity_id=activity, valid_from__lte=config_id, valid_to__gte=config_id
    ).exists()

    if not activity_schema_exists:
        # Return a fallback schema if no activity schema is found
        fallback_schema = {
            "type": "object",
            "title": activity_name,
            "properties": {
                "description": {
                    "type": "string",
                    "readOnly": True,
                },
            },
            "isFallbackSchema": True,
        }
        return json.dumps({"schema": fallback_schema})
    # Get activity schema
    activity_schema = ActivityJsonSchema.objects.only("json_schema").get(
        activity_id=activity, valid_from__lte=config_id, valid_to__gte=config_id
    )

    # Get facility type with id to determine adding "not applicable" methodology
    facility_type = FacilityReport.objects.get(
        facility_id=facility_id, report_version_id=report_version_id
    ).facility_type
    add_not_applicable_methodology = (
        True if facility_type == 'Small Aggregate' or facility_type == 'Medium Facility' else False
    )

    rjsf_schema: Dict = activity_schema.json_schema
    # Fetch valid config elements for the activity
    valid_config_elements = (
        ConfigurationElement.objects.select_related("source_type")
        .filter(activity_id=activity, valid_from__lte=config_id, valid_to__gte=config_id)
        .order_by("source_type__id")
        .distinct("source_type__id")
    )

    # Except if no valid config elements are found
    if not valid_config_elements:
        raise Exception(f"No valid source_types found for activity_id {activity} & configuration {config_id}")
    # If only one config element is found, the source type is mandatory & should be added to the schema
    elif valid_config_elements.count() == 1:
        first_valid_config_elements: Optional[ConfigurationElement] = valid_config_elements.first()
        if first_valid_config_elements:
            rjsf_schema["properties"]["sourceTypes"] = {
                "type": "object",
                "title": "Source Types",
                "properties": {},
            }
            rjsf_schema["properties"]["sourceTypes"]["properties"][first_valid_config_elements.source_type.json_key] = (
                build_source_type_schema(
                    config_id, activity, first_valid_config_elements.source_type_id, add_not_applicable_methodology
                )
            )

    # If there are multiple config elements for an activity, the user may choose which ones apply. The IDs of the selected source_types are passed as a list in the parameters & we add those schemas to the activity schema.
    else:
        for config_element in valid_config_elements:
            rjsf_schema["properties"][config_element.source_type.json_key] = {
                "type": "boolean",
                "title": config_element.source_type.name,
            }

    # If no source_types are passed & there are more than 1 valid source type, only return the activity schema
    if not source_types and valid_config_elements.count() > 1:
        return json.dumps({"schema": rjsf_schema})

    if valid_config_elements.count() > 1:
        # Create the Source Types object (within which all the selected source_type schemas will be defined)
        rjsf_schema["properties"]["sourceTypes"] = {
            "type": "object",
            "title": "Source Types",
            "properties": {},
        }
        # For each selected source_type, add the related schema
        for source_type in source_types:
            valid_config_element = valid_config_elements.get(source_type__id=source_type)
            rjsf_schema["properties"]["sourceTypes"]["properties"][valid_config_element.source_type.json_key] = (
                build_source_type_schema(
                    config_id, activity, valid_config_element.source_type_id, add_not_applicable_methodology
                )
            )

    return json.dumps({"schema": rjsf_schema})


class FormBuilderService:
    @classmethod
    def build_form_schema(
        cls, activity: int, report_version_id: int, source_types: List[str] | List[int], facility_id: str
    ) -> str:
        """
        Generates a form schema based on the provided activity, report version, and source types.

        Args:
            activity (int): The ID of the activity for which the form schema is being generated.
            report_version_id (int): The ID of the report version to determine the valid reporting period.
            source_types (List[str] | List[int]): A list of source types, which can be either strings or integers,
                                                  that are used to customize the form schema.
            facility_id (str): The UUID of the facility for LFO specific methodologies customization

        Returns:
            str: A string representation of the generated form schema.

        Description:
            - First, it verifies that the `activity` parameter is valid. If `activity` is None, it raises an exception.
            - Then, it determines the report date by using `get_report_valid_date_from_version_id()`,
              which extracts the valid reporting year based on the report version.
            - It retrieves a `Configuration` object that matches the report date by checking if the date
              falls between the `valid_from` and `valid_to` fields.
            - Finally, the schema is built by calling `build_schema()`, passing the configuration ID,
              activity, source types, and the report date.
        """
        if activity is None:
            raise Exception("Cannot build a schema without Activity data")

        report_date = get_report_valid_date_from_version_id(report_version_id)
        # Get config objects
        config = Configuration.objects.only("id").get(valid_from__lte=report_date, valid_to__gte=report_date)
        schema = build_schema(config.id, activity, source_types, facility_id, report_version_id)
        return schema
```

## File: bc_obps/service/operator_service.py
```python
from typing import Optional, Union, List
from common.exceptions import UserError
from registration.models.parent_operator import ParentOperator
from registration.models.partner_operator import PartnerOperator
from registration.schema import PartnerOperatorIn, OperatorIn, OperatorFilterSchema, ParentOperatorIn, OperatorSearchOut
from service.data_access_service.partner_operator_service import PartnerOperatorService
from service.data_access_service.address_service import AddressDataAccessService
from service.data_access_service.parent_operator_service import ParentOperatorService
from service.data_access_service.user_service import UserDataAccessService
from registration.models import Operator
from service.data_access_service.operator_service import OperatorDataAccessService
from uuid import UUID
from ninja import Query
from django.db import transaction
from registration.models import Address
from django.db.models import QuerySet


class OperatorService:
    @classmethod
    def get_operators_by_cra_number_or_legal_name(
        cls, cra_business_number: Optional[str] = None, legal_name: Optional[str] = ""
    ) -> Union[Operator, QuerySet[Operator], OperatorSearchOut, List[OperatorSearchOut]]:
        if not cra_business_number and not legal_name:
            raise UserError("No search value provided")
        if cra_business_number:
            try:
                operator: Operator = OperatorDataAccessService.get_operators_by_cra_number(cra_business_number)
                return OperatorSearchOut.model_validate(operator)
            except Exception:
                raise UserError("No matching operator found. Retry or add operator.")
        elif legal_name:
            try:
                operators: QuerySet[Operator] = OperatorDataAccessService.get_operators_by_legal_name(legal_name)
                return [OperatorSearchOut.model_validate(operator) for operator in operators]
            except Exception:
                raise UserError("No matching operator found. Retry or add operator.")
        return []

    @classmethod
    def has_required_fields(cls, operator: Operator) -> bool:
        # Get the fields that are required
        required_fields = [
            "legal_name",
            "cra_business_number",
            "bc_corporate_registry_number",
            "business_structure",
            "mailing_address",
        ]

        # Check if all required fields are not None and not empty/whitespace
        return all(
            getattr(operator, field) is not None
            and (not isinstance(getattr(operator, field), str) or getattr(operator, field).strip() != '')
            for field in required_fields
        )

    @classmethod
    @transaction.atomic()
    def upsert_partner_operators(
        cls, operator: Operator, partner_operator_data: list[PartnerOperatorIn] | None, user_guid: UUID
    ) -> None:
        old_partner_operators: QuerySet[PartnerOperator] = operator.partner_operators.all()

        # If all partner operators have been removed, archive them
        if not partner_operator_data:
            for old_partner in old_partner_operators:
                old_partner.set_archive(user_guid)
            return

        # Otherwise, create or update the partner operators
        new_partner_operators = [
            PartnerOperatorService.create_or_update(partner.id, operator, partner.dict())  # type: ignore[attr-defined]
            for partner in partner_operator_data
        ]

        for old_partner in old_partner_operators:
            if old_partner not in new_partner_operators:
                old_partner.set_archive(user_guid)

    @classmethod
    @transaction.atomic()
    def upsert_parent_operators(
        cls, operator: Operator, parent_operators_data: list[ParentOperatorIn] | None, user_guid: UUID
    ) -> None:
        old_parent_operators: QuerySet[ParentOperator] = operator.parent_operators.all()
        # if all parent operators have been removed, archive them
        if not parent_operators_data:
            for old_parent in old_parent_operators:
                old_parent.set_archive(user_guid)
            return

        new_parent_operators = []
        for po_data in parent_operators_data:
            po_operator_data: dict = po_data.dict(
                include={'legal_name', 'cra_business_number', 'foreign_address', 'foreign_tax_id_number'}
            )
            old_address_id = po_data.mailing_address
            new_address = po_data.dict(
                include={'street_address', 'municipality', 'province', 'postal_code'}, exclude_none=True
            )
            if old_address_id and not new_address:
                old_address = Address.objects.get(id=old_address_id)
                po_operator_data['mailing_address'] = None
                old_address.delete()

            if new_address:
                updated_mailing_address = AddressDataAccessService.upsert_address_from_data(new_address, old_address_id)
                po_operator_data['mailing_address'] = updated_mailing_address

            new_parent_operators.append(ParentOperatorService.create_or_update(po_data.id, operator, po_operator_data))

        for old_parent in old_parent_operators:
            if old_parent not in new_parent_operators:
                old_parent.set_archive(user_guid)

    @classmethod
    @transaction.atomic()
    def update_operator(cls, user_guid: UUID, payload: OperatorIn) -> Operator:
        # users can only update their own operators
        operator_id = UserDataAccessService.get_operator_by_user(user_guid).id
        parent_operator_data = payload.parent_operators_array
        partner_operator_data = payload.partner_operators_array
        operator_data: dict = payload.dict(
            include={
                'legal_name',
                'trade_name',
                'business_structure',
                'cra_business_number',
                'bc_corporate_registry_number',
            }
        )
        address_data = payload.dict(include={'street_address', 'municipality', 'province', 'postal_code'})
        mailing_address = AddressDataAccessService.upsert_address_from_data(address_data, payload.mailing_address)
        operator_data['mailing_address'] = mailing_address
        operator = OperatorDataAccessService.update_operator(operator_id, operator_data)

        # partner operators
        cls.upsert_partner_operators(operator, partner_operator_data, user_guid)

        # parent operators
        cls.upsert_parent_operators(operator, parent_operator_data, user_guid)

        return operator

    @classmethod
    def list_operators(
        cls, sort_field: Optional[str], sort_order: Optional[str], filters: OperatorFilterSchema = Query(...)
    ) -> QuerySet[Operator]:
        sort_direction = "-" if sort_order == "desc" else ""
        sort_by = f"{sort_direction}{sort_field}"
        base_qs = OperatorDataAccessService.get_all_operators()
        return filters.filter(base_qs).order_by(sort_by)
```

## File: bc_obps/service/report_service.py
```python
from uuid import UUID
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Case, When, Value, BooleanField
from django.db import transaction
from django.db.models import QuerySet
from common.exceptions import UserError
from registration.models import Activity
from registration.models import RegulatedProduct
from registration.models.operation import Operation
from reporting.models import ReportOperationRepresentative
from reporting.models.report import Report
from reporting.models.facility_report import FacilityReport
from reporting.models.report_operation import ReportOperation
from service.data_access_service.report_service import ReportDataAccessService
from service.data_access_service.reporting_year import ReportingYearDataAccessService
from service.operation_designated_operator_timeline_service import OperationDesignatedOperatorTimelineService
from service.report_version_service import ReportVersionService
from service.facility_report_service import FacilityReportService, SaveFacilityReportData
from typing import Any, List, Optional
from service.data_access_service.user_service import UserDataAccessService
from dataclasses import dataclass


@dataclass(frozen=True)
class CreateReportForReportingYearData:
    operation_id: UUID
    reporting_year: int
    registration_purpose: str


class SaveReportOperationData:
    def __init__(
        self,
        operator_legal_name: str,
        operation_name: str,
        operation_type: str,
        registration_purpose: str,
        bc_obps_regulated_operation_id: str,
        activities: List[int],
        regulated_products: List[int],
        operation_report_type: str,
        operation_representative_name: List[int],
        operator_trade_name: Optional[str] = None,
        operation_bcghgid: Optional[str] = None,
    ):
        self.operator_legal_name = operator_legal_name
        self.operation_name = operation_name
        self.operation_type = operation_type
        self.registration_purpose = registration_purpose
        self.bc_obps_regulated_operation_id = bc_obps_regulated_operation_id
        self.activities = activities
        self.regulated_products = regulated_products
        self.operation_report_type = operation_report_type
        self.operation_representative_name = operation_representative_name
        self.operator_trade_name = operator_trade_name
        self.operation_bcghgid = operation_bcghgid


class ReportService:
    @classmethod
    @transaction.atomic()
    def create_report(cls, operation_id: UUID, reporting_year: int) -> int:
        if ReportDataAccessService.report_exists(operation_id, reporting_year):
            raise UserError("A report already exists for this operation and year, unable to create a new one.")

        # Fetching report context
        designated_operator_timeline = (
            OperationDesignatedOperatorTimelineService.get_operation_designated_operator_for_reporting_year(
                operation_id=operation_id, reporting_year=reporting_year
            )
        )
        if not designated_operator_timeline:
            raise ObjectDoesNotExist(
                f"Designated operator for reporting year {reporting_year} not found for operation {operation_id}."
            )

        operation = Operation.objects.prefetch_related("activities", "regulated_products", "opted_in_operation").get(
            id=operation_id
        )

        # Creating report object

        report = Report.objects.create(
            operation=operation,
            operator=designated_operator_timeline.operator,
            reporting_year=ReportingYearDataAccessService.get_by_year(reporting_year),
        )

        report_version = ReportVersionService.create_report_version(
            report, use_transferred_operation_handling=designated_operator_timeline.has_been_transferred
        )

        return report_version.id

    @classmethod
    @transaction.atomic()
    def create_report_for_reporting_year(
        cls,
        user_guid: UUID,
        data: CreateReportForReportingYearData,
    ) -> int:
        operation_id = data.operation_id
        reporting_year = data.reporting_year

        user_operator = UserDataAccessService.get_user_operator_by_user(user_guid)
        operation = Operation.objects.prefetch_related(
            "activities",
            "regulated_products",
            "opted_in_operation",
        ).get(id=operation_id)

        # Check whether the operation had a designated operator during the selected reporting year
        designated_operator_timeline = (
            OperationDesignatedOperatorTimelineService.get_operation_designated_operator_for_reporting_year(
                operation_id=operation_id,
                reporting_year=reporting_year,
            )
        )

        if designated_operator_timeline:
            # Historical designation path:
            # allow report creation only if the authenticated user's operator was
            # the designated operator for the selected reporting year
            if designated_operator_timeline.operator.id != user_operator.operator_id:
                raise UserError(
                    f"This operation was owned by another operator in {reporting_year}, "
                    "you do not need to report on this operation. "
                    "If you believe this is incorrect, please contact ghgregulator@gov.bc.ca."
                )

            operator = designated_operator_timeline.operator
            use_transferred_operation_handling = designated_operator_timeline.has_been_transferred

        else:
            # Fallback path:
            # no historical designation exists for the selected reporting year
            # allow creation only if the operation is currently registered to the authenticated user's operator
            if operation.operator_id != user_operator.operator_id:
                raise UserError(
                    f"This operation was owned by another operation in {reporting_year}, "
                    "you do not need to report on this operation. "
                    "If you believe this is incorrect, please contact ghgregulator@gov.bc.ca."
                )

            if operation.status != Operation.Statuses.REGISTERED:
                raise UserError(
                    "Only currently registered operations can be used to create a report for this reporting year."
                )

            operator = user_operator.operator
            use_transferred_operation_handling = False

        # A report cannot be created if one already exists for the same operation and reporting year
        if ReportDataAccessService.report_exists(operation_id, reporting_year):
            raise UserError("A report already exists for this operation and year, unable to create a new one.")

        # BORO ID: validate that OBPS Regulated, Opt-in, and New Entrant operations
        selected_registration_purpose = data.registration_purpose

        requires_boro_id = selected_registration_purpose in [
            Operation.Purposes.OBPS_REGULATED_OPERATION,
            Operation.Purposes.OPTED_IN_OPERATION,
            Operation.Purposes.NEW_ENTRANT_OPERATION,
        ]

        if requires_boro_id and operation.bc_obps_regulated_operation_id is None:
            raise UserError(
                "This operation does not have a BORO ID, please wait for a BORO ID to be issued before starting this report."
            )

        report = Report.objects.create(
            operation=operation,
            operator=operator,
            reporting_year=ReportingYearDataAccessService.get_by_year(reporting_year),
        )

        report_version = ReportVersionService.create_report_version(
            report,
            use_transferred_operation_handling=use_transferred_operation_handling,
            registration_purpose=selected_registration_purpose,
        )

        return report_version.id

    @staticmethod
    def get_report_by_id(report_id: int) -> Report:
        return Report.objects.get(id=report_id)

    @classmethod
    @transaction.atomic
    def save_report_operation(cls, report_version_id: int, data: Any) -> ReportOperation:
        # Fetch the existing report operation
        report_operation = ReportOperation.objects.get(report_version__id=report_version_id)

        # Update the selected_for_report field based on the provided data
        representative_ids_in_data = data.operation_representative_name
        ReportOperationRepresentative.objects.filter(report_version_id=report_version_id).update(
            selected_for_report=Case(
                When(id__in=representative_ids_in_data, then=Value(True)),
                default=Value(False),
                output_field=BooleanField(),
            )
        )
        # Update fields from data
        report_operation.operator_legal_name = data.operator_legal_name
        report_operation.operator_trade_name = data.operator_trade_name
        report_operation.operation_name = data.operation_name
        report_operation.operation_type = data.operation_type
        report_operation.operation_bcghgid = data.operation_bcghgid
        report_operation.bc_obps_regulated_operation_id = data.bc_obps_regulated_operation_id

        # Fetch and set ManyToMany fields
        activities = Activity.objects.filter(id__in=data.activities)
        report_operation.activities.set(activities)
        regulated_products = RegulatedProduct.objects.filter(id__in=data.regulated_products)
        report_operation.regulated_products.set(regulated_products)
        report_operation.save()

        if report_operation.operation_type == 'Linear Facilities Operation':
            facility_reports: QuerySet[FacilityReport] = FacilityReport.objects.filter(
                report_version__id=report_version_id
            )
            # For facility reports that haven't yet been marked Completed,
            # add all operation-level activities as defaults (without removing any existing facility-level selections the user may have made)
            uncompleted_reports = (f for f in facility_reports if not f.is_completed)
            for f in uncompleted_reports:
                FacilityReportService.add_activities_to_facility_report(facility_report=f, activities=data.activities)
                # Always update regulated products
                FacilityReportService.prune_report_product_data_for_facility_report(
                    facility_report=f, regulated_products=data.regulated_products
                )
        else:
            facility_report: FacilityReport = FacilityReport.objects.get(report_version__id=report_version_id)
            facility_report_save_data = SaveFacilityReportData(
                facility_name=report_operation.operation_name,
                facility_type=facility_report.facility_type,
                activities=data.activities,
                regulated_products=data.regulated_products,
            )
            FacilityReportService.save_facility_report(
                report_version_id=facility_report.report_version_id,
                facility_id=facility_report.facility_id,
                data=facility_report_save_data,
            )

        return report_operation

    @staticmethod
    def get_registration_purpose_by_version_id(version_id: int) -> dict:
        registration_purpose = ReportOperation.objects.get(report_version__id=version_id).registration_purpose
        return {"registration_purpose": registration_purpose}
```

## File: bc_obps/service/report_version_service.py
```python
from django.db import transaction

from reporting.models.report_product import ReportProduct
from registration.models import Operation
from registration.models.contact import Contact
from reporting.models.report import Report
from reporting.models.report_operation import ReportOperation
from service.data_access_service.facility_service import FacilityDataAccessService
from reporting.models import ReportOperationRepresentative
from django.db.models import Min, F
from dataclasses import dataclass
from django.db.models import Prefetch
from reporting.models import ReportVersion, FacilityReport, ReportActivity, ReportNonAttributableEmissions
from typing import Union, List, Any
from service.operation_service import OperationService


@dataclass
class ReportVersionData:
    reason_for_change: str


class ReportVersionService:
    @staticmethod
    @transaction.atomic
    def create_report_version(
        report: Report,
        report_type: str = "Annual Report",
        use_transferred_operation_handling: bool = False,
        registration_purpose: str | None = None,
    ) -> ReportVersion:
        # Creating draft version
        report_version = ReportVersion.objects.create(report=report, report_type=report_type)
        # Pre-populating data to the draft version
        operation = report.operation
        operator = report.operator
        effective_registration_purpose = (
            registration_purpose or operation.registration_purpose or Operation.Purposes.OBPS_REGULATED_OPERATION
        )
        if effective_registration_purpose == Operation.Purposes.OPTED_IN_OPERATION and operation.opted_in_operation:
            operation_opted_out_final_reporting_year = operation.opted_in_operation.final_reporting_year_id
        else:
            operation_opted_out_final_reporting_year = None

        report_operation = ReportOperation.objects.create(
            operator_legal_name=operator.legal_name,
            operator_trade_name=operator.trade_name,
            operation_name=operation.name,
            operation_type=operation.type,
            operation_bcghgid=operation.bcghg_id.id if operation.bcghg_id else None,
            bc_obps_regulated_operation_id=(
                operation.bc_obps_regulated_operation.id if operation.bc_obps_regulated_operation else ""
            ),
            report_version=report_version,
            registration_purpose=effective_registration_purpose,
            operation_opted_out_final_reporting_year=operation_opted_out_final_reporting_year,
            naics_code=operation.naics_code,
        )
        # Special handling for report where the operation has been transferred
        if use_transferred_operation_handling:
            contacts = Contact.objects.filter(operator=operator, business_role="Operation Representative")
            selected_representative_state = False
        else:
            contacts = operation.contacts.all()
            selected_representative_state = True

        for contact in contacts:
            ReportOperationRepresentative.objects.create(
                report_version=report_version,
                representative_name=contact.get_full_name(),
                selected_for_report=selected_representative_state,
            )
        report_operation.activities.add(*list(operation.activities.all()))
        report_operation.regulated_products.add(
            *OperationService.get_valid_operation_regulated_products(operation, report.reporting_year.reporting_year)
        )

        facilities = FacilityDataAccessService.get_current_facilities_by_operation(operation)

        for f in facilities:
            facility_report = FacilityReport.objects.create(
                facility=f,
                facility_name=f.name,
                facility_type=f.type,
                facility_bcghgid=f.bcghg_id.id if f.bcghg_id else None,
                report_version=report_version,
                is_completed=False,
            )
            facility_report.activities.add(*list(operation.activities.all()))

        return report_version

    @staticmethod
    @transaction.atomic
    def save_report_version(report_version_id: int, data: ReportVersionData) -> ReportVersion:
        """
        Updates the given ReportVersion reason_for_change

        Args:
            report_version_id: the ID of the ReportVersion to update
            data:  a ReportVersionData instance carrying the reason

        Returns:
            The updated ReportVersion instance.
        """
        # Load the version
        report_version = ReportVersion.objects.select_for_update().get(id=report_version_id)

        # Set and save the reason for change
        report_version.reason_for_change = data.reason_for_change
        report_version.save(update_fields=["reason_for_change"])

        return report_version

    @staticmethod
    @transaction.atomic()
    def delete_report_version(report_version_id: int) -> bool:
        """
        Deletes report version with the given report_version_id
        Returns True if deletion is successful, False otherwise.
        """
        deleted, _ = ReportVersion.objects.filter(id=report_version_id).delete()
        return deleted > 0

    @staticmethod
    @transaction.atomic
    def change_report_version_type(report_version_id: int, new_report_type: str) -> ReportVersion:
        report_version = ReportVersion.objects.get(id=report_version_id)
        if report_version.report_type == new_report_type:
            return report_version

        ReportVersionService.delete_report_version(report_version.id)
        new_report_version = ReportVersionService.create_report_version(report_version.report, new_report_type)

        return new_report_version

    @staticmethod
    def is_initial_report_version(version_id: int) -> bool:
        """
        Checks if this report version is the initial report version by determining
        whether the given ReportVersion is the earliest version for the report

        Args:
            version_id: The unique identifier of the report version.

        Returns:
            True if the version is the earliest version for the report else returns False.
        """

        is_initial_report_version: bool = (
            ReportVersion.objects.filter(
                id=version_id,
            )
            .annotate(min_report_version=Min("report__report_versions__id"))
            .filter(id=F("min_report_version"))
            .exists()
        )

        # Return whether this is the first report version
        return is_initial_report_version

    @staticmethod
    def fetch_full_report_version(version_id: int, prefetch_full_facility_report: bool) -> ReportVersion:
        """
        Fetch a ReportVersion with related data for serialization.

        Args:
            version_id (int): ID of the ReportVersion to fetch.
            prefetch_full_facility_report (bool):
                - True: Fetch full facility_reports data, including activity records.
                - False: Fetch minimal facility_reports data (only facility ID and name).

        Returns:
            ReportVersion: The ReportVersion with selected related objects prefetched.
        """
        # Get operation_type in a single lightweight query

        operation_type = (
            ReportVersion.objects.select_related("report_operation")
            .values_list("report_operation__operation_type", flat=True)
            .get(id=version_id)
        )
        # Build prefetches
        prefetches: List[Union[str, Prefetch[Any, Any, Any]]] = [
            "report_electricity_import_data",
            "report_new_entrant",
            "report_compliance_summary",
            "report_operation_representatives",
            Prefetch(
                "report_non_attributable_emissions",
                queryset=ReportNonAttributableEmissions.objects.select_related("emission_category").prefetch_related(
                    "gas_type"
                ),
            ),
            Prefetch(
                "report_products",
                queryset=ReportProduct.objects.select_related("product"),
            ),
            "report_operation__activities",
            "report_operation__regulated_products",
        ]
        if operation_type == Operation.Types.LFO and not prefetch_full_facility_report:
            prefetches.append(
                Prefetch(
                    "facility_reports",
                    queryset=FacilityReport.objects.only("facility_id", "facility_name"),
                )
            )
        elif operation_type != Operation.Types.EIO:
            prefetches.append(
                Prefetch(
                    "facility_reports",
                    queryset=FacilityReport.objects.prefetch_related(
                        Prefetch(
                            "reportactivity_records",
                            queryset=ReportActivity.objects.select_related("activity", "activity_base_schema"),
                        ),
                    ),
                )
            )
        report_version: ReportVersion = (
            ReportVersion.objects.select_related(
                "report_operation", "report_verification", "report_additional_data", "report_person_responsible"
            )
            .prefetch_related(*prefetches)
            .get(id=version_id)
        )
        return report_version
```

## File: bc_obps/service/reporting_year_service.py
```python
from django.db.models import QuerySet
from django.utils import timezone
from reporting.models.report import Report
from reporting.models.report_version import ReportVersion
from reporting.models.reporting_year import ReportingYear


class ReportingYearService:
    MIN_REPORTING_YEAR = 2024

    @classmethod
    def get_current_reporting_year(cls) -> ReportingYear:
        now = timezone.now()

        return ReportingYear.objects.get(reporting_window_start__lte=now, reporting_window_end__gte=now)

    @classmethod
    def get_all_reporting_years(cls, exclude_past: bool = False) -> QuerySet[ReportingYear]:
        """
        Returns all ReportingYear objects in the database, or only the ReportingYears that haven't already closed.
        @param exclude_past (optional, boolean) - will exclude from the returned list ReportingYears that have already ended.
        """
        qs = ReportingYear.objects.all()
        if exclude_past:
            current_year = cls.get_current_reporting_year()
            resp = qs.filter(reporting_year__gte=current_year.reporting_year)
            return resp
        return qs

    @classmethod
    def is_reporting_open(cls, reporting_year: ReportingYear) -> bool:
        """
        Determines if reporting is currently open based on server time.
        Returns True if current time is after the report_open_date.
        """
        now = timezone.now()
        return now > reporting_year.report_open_date if reporting_year.report_open_date else False

    @classmethod
    def get_report_reporting_year(cls, report_id: int) -> ReportingYear:
        report = Report.objects.get(id=report_id)
        return report.reporting_year

    @classmethod
    def get_reporting_year_by_version_id(cls, version_id: int) -> ReportingYear:
        report_version = ReportVersion.objects.get(id=version_id)
        return report_version.report.reporting_year

    @classmethod
    def get_previous_reporting_years(cls) -> QuerySet[ReportingYear]:
        """
        Returns reporting years that are eligible for the Start Past Report workflow

        Only reporting years from MIN_REPORTING_YEAR up to (but not including) the current
        reporting year are returned.
        """
        current_reporting_year = cls.get_current_reporting_year()

        return ReportingYear.objects.filter(
            reporting_year__gte=cls.MIN_REPORTING_YEAR,
            reporting_year__lt=current_reporting_year.reporting_year,
        ).order_by("-reporting_year")
```

## File: bc_obps/service/transfer_event_service.py
```python
import logging
from typing import cast, List, Union
from uuid import UUID
from django.db import transaction
from django.utils import timezone
from django.db.models import QuerySet
from common.exceptions import UserError
from registration.constants import UNAUTHORIZED_MESSAGE
from registration.models import User
from registration.models.event.transfer_event import TransferEvent
from typing import Optional
from ninja import Query
from registration.schema import (
    TransferEventCreateIn,
    TransferEventFilterSchema,
    TransferEventUpdateIn,
)
from service.data_access_service.facility_designated_operation_timeline_service import (
    FacilityDesignatedOperationTimelineDataAccessService,
)
from service.data_access_service.operation_designated_operator_timeline_service import (
    OperationDesignatedOperatorTimelineDataAccessService,
)
from service.data_access_service.transfer_event_service import TransferEventDataAccessService
from service.data_access_service.user_service import UserDataAccessService
from service.facility_designated_operation_timeline_service import FacilityDesignatedOperationTimelineService
from service.facility_service import FacilityService
from service.facility_snapshot_service import FacilitySnapshotService
from service.operation_designated_operator_timeline_service import OperationDesignatedOperatorTimelineService
from service.operation_service import OperationService

logger = logging.getLogger(__name__)


class TransferEventService:
    @classmethod
    def list_transfer_events(
        cls,
        sort_field: Optional[str],
        sort_order: Optional[str],
        filters: TransferEventFilterSchema = Query(...),
    ) -> QuerySet[TransferEvent]:
        sort_direction = "-" if sort_order == "desc" else ""
        sort_by = f"{sort_direction}{sort_field}"
        queryset = (
            filters.filter(TransferEvent.objects.order_by(sort_by, "id"))
            .values(
                'id',
                'effective_date',
                'status',
                'created_at',
                'operation__name',
                'operation__id',
                'facilities__name',
                'facilities__id',
            )
            .distinct()
        )
        return cast(QuerySet[TransferEvent], queryset)

    @classmethod
    def _validate_no_overlapping_transfer_events(
        cls,
        operation_id: Optional[UUID] = None,
        facility_ids: Optional[List[UUID]] = None,
        current_transfer_id: Optional[UUID] = None,
    ) -> None:
        """
        Validates that there are no overlapping active transfer events for the given operation or facilities.
        If we are updating an existing transfer event, we can exclude it from the check.
        """
        if operation_id:
            # Check for overlapping transfer events with the operation
            overlapping_operation_query = TransferEvent.objects.filter(
                operation_id=operation_id,
                status__in=[
                    TransferEvent.Statuses.TO_BE_TRANSFERRED,
                    TransferEvent.Statuses.COMPLETE,
                ],
            )

            if current_transfer_id:
                overlapping_operation_query = overlapping_operation_query.exclude(id=current_transfer_id)

            if overlapping_operation_query.exists():
                raise UserError("An active transfer event already exists for the selected operation.")

        if facility_ids:
            # Check for overlapping transfer events with the facilities
            overlapping_facilities_query = TransferEvent.objects.filter(
                facilities__id__in=facility_ids,
                status__in=[
                    TransferEvent.Statuses.TO_BE_TRANSFERRED,
                    TransferEvent.Statuses.COMPLETE,
                ],
            ).distinct()

            if current_transfer_id:
                overlapping_facilities_query = overlapping_facilities_query.exclude(id=current_transfer_id)

            if overlapping_facilities_query.exists():
                raise UserError(
                    "One or more facilities in this transfer event are already part of an active transfer event."
                )

    @classmethod
    def _process_event_if_effective(
        cls,
        payload: Union[TransferEventCreateIn, TransferEventUpdateIn],
        transfer_event: TransferEvent,
        user_guid: UUID,
    ) -> None:
        # Check if the effective date is today or in the past and process the event
        now = timezone.now()
        if payload.effective_date <= now:  # type: ignore[union-attr] # mypy not aware of model schema field in TransferEventCreateIn
            cls._process_single_event(transfer_event, user_guid)

    @classmethod
    @transaction.atomic
    def create_transfer_event(cls, user_guid: UUID, payload: TransferEventCreateIn) -> TransferEvent:
        user = UserDataAccessService.get_by_guid(user_guid)
        if not user.is_cas_analyst() and not user.is_cas_director():
            raise UserError("User is not authorized to create transfer events.")

        # Validate against overlapping transfer events
        if payload.transfer_entity == "Operation":
            cls._validate_no_overlapping_transfer_events(operation_id=payload.operation)
        elif payload.transfer_entity == "Facility":
            cls._validate_no_overlapping_transfer_events(facility_ids=payload.facilities)

        # Prepare the payload for the data access service
        prepared_payload = {
            "from_operator_id": payload.from_operator,
            "to_operator_id": payload.to_operator,
            "effective_date": payload.effective_date,  # type: ignore[attr-defined] # mypy not aware of model schema field
        }

        transfer_event = None
        if payload.transfer_entity == "Operation":
            if not payload.operation:
                raise UserError("Operation is required for operation transfer events.")

            # make sure that the from_operator and to_operator are different(we can't transfer operations within the same operator)
            if payload.from_operator == payload.to_operator:
                raise UserError("Operations cannot be transferred within the same operator.")

            prepared_payload.update(
                {
                    "operation_id": payload.operation,
                }
            )
            transfer_event = TransferEventDataAccessService.create_transfer_event(user_guid, prepared_payload)

        elif payload.transfer_entity == "Facility":
            if not all([payload.facilities, payload.from_operation, payload.to_operation]):
                raise UserError(
                    "Facilities, from_operation, and to_operation are required for facility transfer events."
                )

            # make sure that the from_operation and to_operation are different(we can't transfer facilities within the same operation)
            if payload.from_operation == payload.to_operation:
                raise UserError("Facilities cannot be transferred within the same operation.")

            prepared_payload.update(
                {
                    "from_operation_id": payload.from_operation,
                    "to_operation_id": payload.to_operation,
                }
            )
            transfer_event = TransferEventDataAccessService.create_transfer_event(user_guid, prepared_payload)

            # doing a check just to make mypy happy
            payload_facilities = payload.facilities
            if payload_facilities:
                transfer_event.facilities.set(payload_facilities)

        cls._process_event_if_effective(payload, transfer_event, user_guid)

        return transfer_event

    @classmethod
    def process_due_transfer_events(cls) -> None:
        """
        Process all due transfer events (effective date <= today and status = 'To be transferred').
        Updates timelines and marks the events as 'Transferred'.
        """
        today = timezone.now().date()

        # Fetch all due transfer events with related fields to optimize queries
        transfer_events = TransferEvent.objects.filter(
            status=TransferEvent.Statuses.TO_BE_TRANSFERRED,
            effective_date__date__lte=today,
        )

        if not transfer_events:
            return

        processed_events = []

        for event in transfer_events:
            try:
                cls._process_single_event(event)
                processed_events.append(event.id)
            except Exception as e:
                logger.error(f"Failed to process event {event.id}: {e}")

        logger.info(f"Successfully processed {len(processed_events)} transfer events.")
        if processed_events:
            logger.info(f"Event IDs: {processed_events}")

    @classmethod
    @transaction.atomic
    def _process_single_event(cls, event: TransferEvent, user_guid: Optional[UUID] = None) -> None:
        """
        Processes a single transfer event, delegating based on its type.
        """
        # If the timeline update is user-triggered (via a transfer event with a past effective date), use the user_guid.
        # Otherwise, for cronjob updates, use created_by_id from the event.
        processed_by_id: UUID = user_guid if user_guid else event.created_by.pk  # type: ignore # we are sure that created_by is not None

        if event.facilities.exists():
            cls._process_facilities_transfer(event, processed_by_id)
        elif event.operation:
            cls._process_operation_transfer(event, processed_by_id)

        # Mark the transfer event as 'Transferred'
        event.status = TransferEvent.Statuses.TRANSFERRED
        event.save(update_fields=["status"])

    @classmethod
    def _process_facilities_transfer(cls, event: TransferEvent, user_guid: UUID) -> None:
        """
        Process a facility transfer event. Updates the timelines for all associated facilities.
        Creates a snapshot of each facility before the transfer to preserve data for the old operator.
        """
        for facility in event.facilities.all():
            # Create a snapshot of the facility for the old operation before transferring
            FacilitySnapshotService.create_facility_snapshot(
                user_guid=user_guid,
                facility=facility,
                operation=event.from_operation,  # type: ignore # we are sure that from_operation is not None
            )

            # get the current timeline for the facility and operation
            current_timeline = FacilityDesignatedOperationTimelineService.get_current_timeline(event.from_operation.id, facility.id)  # type: ignore # we are sure that from_operation is not None

            if current_timeline:
                FacilityDesignatedOperationTimelineService.set_timeline_end_date(
                    current_timeline,
                    event.effective_date,
                )

            # Create a new timeline
            FacilityDesignatedOperationTimelineDataAccessService.create_facility_designated_operation_timeline(
                user_guid=user_guid,
                facility_designated_operation_timeline_data={
                    "facility": facility,
                    "operation": event.to_operation,
                    "start_date": event.effective_date,
                },
            )
            # update the facility's operation
            FacilityService.update_operation_for_facility(user_guid=user_guid, facility=facility, operation_id=event.to_operation.id)  # type: ignore # we are sure that operation is not None

    @classmethod
    @transaction.atomic()
    def _process_operation_transfer(cls, event: TransferEvent, user_guid: UUID) -> None:
        """
        Process an operation transfer event. Updates the timelines for the associated operation.
        Creates snapshots of all facilities belonging to the operation for the old operator.
        Deletes the link between the contacts and the original operator (ie, deletes the record in the operation_contacts through table).
        Does not delete the contact record in the contact table.
        """

        # Create snapshots for all facilities belonging to the operation before transfer
        facilities = event.operation.facilities.all()  # type: ignore # we are sure that operation is not None
        for facility in facilities:
            FacilitySnapshotService.create_facility_snapshot(
                user_guid=user_guid,
                facility=facility,
                operation=event.operation,  # type: ignore # we are sure that operation is not None
            )

        # get the current timeline for the operation and operator
        current_timeline = OperationDesignatedOperatorTimelineService.get_current_timeline(event.from_operator.id, event.operation.id)  # type: ignore # we are sure that operation is not None

        if current_timeline:
            OperationDesignatedOperatorTimelineService.set_timeline_end_date(
                current_timeline,
                event.effective_date,
            )

        # remove contacts that belong to the original operator
        operation_contacts = event.operation.contacts.filter(operator=event.from_operator)  # type: ignore # we are sure that operation is not None
        for contact in operation_contacts:
            # remove the contact from the operation (without deleting the contact - it might be used elsewhere)
            event.operation.contacts.remove(contact)  # type: ignore # we are sure that operation is not None

        # Create a new timeline
        OperationDesignatedOperatorTimelineDataAccessService.create_operation_designated_operator_timeline(
            user_guid=user_guid,
            operation_designated_operator_timeline_data={
                "operation": event.operation,
                "operator": event.to_operator,
                "start_date": event.effective_date,
            },
        )

        # update the operation's operator
        OperationService.update_operator(user_guid, event.operation, event.to_operator.id)  # type: ignore # we are sure that operation is not None

    @classmethod
    def get_if_authorized(cls, user_guid: UUID, transfer_id: UUID) -> TransferEvent:
        user: User = UserDataAccessService.get_by_guid(user_guid)
        if user.is_industry_user():
            raise Exception(UNAUTHORIZED_MESSAGE)
        transfer_event: TransferEvent = TransferEventDataAccessService.get_by_id(transfer_id)
        return transfer_event

    @classmethod
    def _get_and_validate_transfer_event_for_update(cls, transfer_id: UUID, user_guid: UUID) -> TransferEvent:
        user = UserDataAccessService.get_by_guid(user_guid)
        if not user.is_cas_analyst() and not user.is_cas_director():
            raise Exception(UNAUTHORIZED_MESSAGE)
        transfer_event = TransferEventDataAccessService.get_by_id(transfer_id)
        if transfer_event.status != TransferEvent.Statuses.TO_BE_TRANSFERRED:
            raise UserError("Only transfer events with status 'To be transferred' can be modified.")
        return transfer_event

    @classmethod
    def delete_transfer_event(cls, user_guid: UUID, transfer_id: UUID) -> None:
        transfer_event = cls._get_and_validate_transfer_event_for_update(transfer_id, user_guid)
        transfer_event.delete()
        return None

    @classmethod
    def _update_operation_transfer_event(
        cls, user_guid: UUID, transfer_id: UUID, payload: TransferEventUpdateIn
    ) -> None:
        operation_id = payload.operation
        if not operation_id:
            raise UserError("Operation is required for operation transfer events.")
        cls._validate_no_overlapping_transfer_events(operation_id=operation_id, current_transfer_id=transfer_id)
        TransferEventDataAccessService.update_transfer_event(
            user_guid, transfer_id, {"operation_id": operation_id, "effective_date": payload.effective_date}  # type: ignore[attr-defined] # mypy not aware of model schema field
        )

    @classmethod
    def _update_facility_transfer_event(
        cls, user_guid: UUID, transfer_id: UUID, payload: TransferEventUpdateIn
    ) -> None:
        facility_ids = payload.facilities
        if not facility_ids:
            raise UserError("Facilities are required for facility transfer events.")
        cls._validate_no_overlapping_transfer_events(facility_ids=facility_ids, current_transfer_id=transfer_id)
        updated_transfer_event = TransferEventDataAccessService.update_transfer_event(
            user_guid, transfer_id, payload.dict(include=["effective_date"])
        )
        updated_transfer_event.facilities.set(facility_ids)  # type: ignore[arg-type] # mypy requires actual Facility objects but passing UUIDs is fine

    @classmethod
    @transaction.atomic
    def update_transfer_event(cls, user_guid: UUID, transfer_id: UUID, payload: TransferEventUpdateIn) -> TransferEvent:
        transfer_event = cls._get_and_validate_transfer_event_for_update(transfer_id, user_guid)
        {
            "Operation": cls._update_operation_transfer_event,
            "Facility": cls._update_facility_transfer_event,
        }[
            payload.transfer_entity
        ](user_guid, transfer_id, payload)
        cls._process_event_if_effective(payload, transfer_event, user_guid)
        return transfer_event
```

## File: bc_obps/service/user_operator_service.py
```python
from typing import Dict, Literal, Optional
from uuid import UUID
from registration.emails import send_operator_access_request_email
from registration.enums.enums import AccessRequestStates, AccessRequestTypes
from registration.schema import OperatorIn, UserOperatorFilterSchema, UserOperatorStatusUpdate
from registration.utils import update_model_instance
from service.data_access_service.user_operator_service import UserOperatorDataAccessService
from service.data_access_service.user_service import UserDataAccessService
from service.data_access_service.operator_service import OperatorDataAccessService
from registration.models import Operator, User, UserOperator, Contact, BusinessRole
from django.db import transaction
from registration.constants import UNAUTHORIZED_MESSAGE
from service.operator_service import OperatorService
from django.db.models import QuerySet
from django.db.models.functions import Lower
from ninja import Query
from django.utils import timezone


class UserOperatorService:
    @classmethod
    def check_if_user_eligible_to_access_user_operator(cls, user_guid: UUID, user_operator_id: UUID) -> Optional[bool]:
        """
        Check if a user is eligible to access a user_operator (i.e., they're allowed to access their own information (user_operator, operations, etc.) but not other people's).

        Args:
            user_guid (uuid): The user for whom eligibility is being checked.
            user_operator_id (uuid): The id of the user_operator to which access is being requested.

        Returns:
            True or raises an exception.
        """

        user: User = UserDataAccessService.get_by_guid(user_guid)
        user_operator: UserOperator = UserOperatorDataAccessService.get_user_operator_by_id(user_operator_id)
        if user.is_industry_user() and user_operator.user.user_guid != user_guid:
            raise PermissionError("Your user is not associated with this operator.")
        # internal users are always allowed to access user operators. (Though the authorize function prevents them from accessing certain external-only endpoints)
        return None

    @classmethod
    def get_current_user_approved_user_operator_or_raise(cls, user: User) -> UserOperator:
        user_operator = UserOperatorDataAccessService.get_approved_user_operator(user)
        if not user_operator:
            raise Exception(UNAUTHORIZED_MESSAGE)
        return user_operator

    # Function to create operator instance
    @classmethod
    @transaction.atomic()
    def save_operator(cls, updated_data: OperatorIn, operator_instance: Operator) -> Operator:
        # fields to update on the Operator model
        operator_related_fields = [
            "legal_name",
            "trade_name",
            "business_structure",
            "cra_business_number",
            "bc_corporate_registry_number",
        ]
        created_operator_instance: Operator = update_model_instance(
            operator_instance, operator_related_fields, updated_data.dict()
        )
        created_operator_instance.save(update_fields=operator_related_fields + ["status"])

        return created_operator_instance

    @classmethod
    @transaction.atomic()
    def create_operator_and_user_operator(cls, user_guid: UUID, payload: OperatorIn) -> Dict[str, UUID]:
        """
        Function to create a user_operator and an operator
        We also need to create a contact for the user_operator once operator is created

        Parameters:
            payload: Request payload from Operator form POST
            user_guid: GUID of the user.

        Returns:
            dict: A dictionary containing the IDs of the created user_operator and operator.
                - 'user_operator_id' (UUID): ID of the user_operator.
                - 'operator_id' (UUID): ID of the operator.

        """

        # create/save operator instance as approved
        operator_instance: Operator = Operator(
            cra_business_number=payload.cra_business_number,
            bc_corporate_registry_number=payload.bc_corporate_registry_number,
            # treating business_structure as a foreign key
            business_structure=payload.business_structure,  # type: ignore[misc] # we use field validator which returns a BusinessStructure object
            # set as approved
            status=Operator.Statuses.APPROVED,
        )
        operator: Operator = cls.save_operator(payload, operator_instance)

        # create/save user operator instance as an approved admin
        user_operator, created = UserOperatorDataAccessService.get_or_create_user_operator(user_guid, operator.id)
        if created:
            user_operator.role = UserOperator.Roles.ADMIN
            user_operator.status = UserOperator.Statuses.APPROVED
            user_operator.save()

        # update the user-operator operator with data in the request payload
        OperatorService.update_operator(user_guid, payload)

        # Create a contact record for the user_operator and add it to the operator's contacts
        # Using get_or_create to avoid creating duplicate contacts(if any)
        Contact.objects.get_or_create(
            email=user_operator.user.email,
            operator_id=user_operator.operator_id,
            defaults={
                "first_name": user_operator.user.first_name,
                "last_name": user_operator.user.last_name,
                "phone_number": str(user_operator.user.phone_number),
                "position_title": user_operator.user.position_title,
                "business_role": BusinessRole.objects.get(role_name="Operation Representative"),
            },
        )

        return {"user_operator_id": user_operator.id, 'operator_id': user_operator.operator.id}

    @classmethod
    def list_user_operators(
        cls,
        user_guid: UUID,
        sort_field: Optional[str],
        sort_order: Optional[Literal["desc", "asc"]],
        filters: UserOperatorFilterSchema = Query(...),
    ) -> QuerySet[UserOperator]:
        user = UserDataAccessService.get_by_guid(user_guid)
        # This service is only available to IRC users
        if not user.is_irc_user():
            raise Exception(UNAUTHORIZED_MESSAGE)

        # Used to show internal users the list of user_operators to approve/deny
        base_qs = UserOperatorDataAccessService.get_user_operator_requests_for_irc_users()

        # `created_at` and `user_friendly_id` are not case-insensitive fields and Lower() cannot be applied to them
        if sort_field in ['created_at', 'user_friendly_id']:
            sort_direction = "-" if sort_order == "desc" else ""
            return filters.filter(base_qs).order_by(f"{sort_direction}{sort_field}")

        # Use Lower for case-insensitive ordering
        lower_sort_field = Lower(sort_field)
        if sort_order == "desc":
            # Apply descending order
            return filters.filter(base_qs).order_by(lower_sort_field.desc())
        # Apply ascending order
        return filters.filter(base_qs).order_by(lower_sort_field)

    @classmethod
    @transaction.atomic()
    def update_status_and_create_contact(
        cls, user_operator_id: UUID, payload: UserOperatorStatusUpdate, admin_user_guid: UUID
    ) -> UserOperator:
        """Function to update the user_operator status. If they are being approved, we create a Contact record for them."""
        admin_user: User = UserDataAccessService.get_by_guid(admin_user_guid)
        user_operator: UserOperator = UserOperatorDataAccessService.get_user_operator_by_id(user_operator_id)

        if admin_user.is_industry_user():
            try:
                operator_business_guid = OperatorDataAccessService.get_operators_business_guid(
                    user_operator.operator.id
                )
            except Exception:
                # operator_business_guid can be None if no admins are approved yet (business_guids come from admin users)
                operator_business_guid = None
            if operator_business_guid != admin_user.business_guid:
                # industry users can only update the status of user_operators from the same operator as themselves
                raise PermissionError("Your user is not associated with this operator.")
            access_request_type: AccessRequestTypes = AccessRequestTypes.OPERATOR_WITH_ADMIN

        user_operator.status = payload.status  # type: ignore[attr-defined]
        updated_role = payload.role

        if user_operator.status in [UserOperator.Statuses.APPROVED, UserOperator.Statuses.DECLINED]:
            user_operator.verified_at = timezone.now()
            user_operator.verified_by_id = admin_user_guid

            if user_operator.status == UserOperator.Statuses.DECLINED:
                # Set role to pending for now but we may want to add a new role for declined
                user_operator.role = UserOperator.Roles.PENDING

            if user_operator.status == UserOperator.Statuses.APPROVED and updated_role != UserOperator.Roles.PENDING:
                # we only update the role if the user_operator is being approved
                user_operator.role = updated_role  # type: ignore[assignment]
                # Create a contact record for the user_operator and add it to the operator's contacts
                # Using get_or_create to avoid creating duplicate contacts
                Contact.objects.get_or_create(
                    email=user_operator.user.email,
                    operator_id=user_operator.operator_id,
                    defaults={
                        "first_name": user_operator.user.first_name,
                        "last_name": user_operator.user.last_name,
                        "phone_number": str(user_operator.user.phone_number),
                        "position_title": user_operator.user.position_title,
                        "business_role": BusinessRole.objects.get(role_name="Operation Representative"),
                    },
                )

            if admin_user.is_irc_user():
                access_request_type = AccessRequestTypes.ADMIN

            # Send email to user if their request was approved or declined (using the appropriate email template)
            send_operator_access_request_email(
                AccessRequestStates(user_operator.status),
                # If the admin user is an IRC user, the access request type is admin,
                # otherwise the admin user is an external user and the access request is for an operator with existing admin
                access_request_type,
                user_operator.operator.legal_name,
                user_operator.user.get_full_name(),
                user_operator.user.email,
            )

        elif user_operator.status == UserOperator.Statuses.PENDING:
            user_operator.verified_at = None
            user_operator.verified_by_id = None
            user_operator.role = UserOperator.Roles.PENDING
        user_operator.save(update_fields=["status", "verified_at", "verified_by_id", "role"])

        return user_operator

    @classmethod
    def delete_user_operator(cls, user_guid: UUID, user_operator_id: UUID) -> None:
        cls.check_if_user_eligible_to_access_user_operator(user_guid, user_operator_id)
        UserOperator.objects.filter(id=user_operator_id).delete()
        return None
```

## File: bc_obps/service/user_profile_service.py
```python
from django.conf import settings
from registration.schema import UserIn
from service.data_access_service.user_service import UserDataAccessService
from registration.models import AppRole
from registration.enums.enums import IdPs
from uuid import UUID
from registration.models import User


class UserProfileService:
    @classmethod
    def create_user_profile(cls, user_guid: UUID, user_data: UserIn) -> User:
        # Determine the role based on the identity provider
        role_mapping = {
            IdPs.IDIR.value: (
                AppRole.objects.get(role_name="cas_analyst")
                if settings.BYPASS_ROLE_ASSIGNMENT
                else AppRole.objects.get(role_name="cas_pending")
            ),
            IdPs.BCEIDBUSINESS.value: AppRole.objects.get(role_name="industry_user"),
        }
        role: AppRole = role_mapping.get(user_data.identity_provider)  # type: ignore[assignment] # we know this will not be None
        return UserDataAccessService.create_user(user_guid, role, user_data)
```

## File: bc_obps/service/user_service.py
```python
from uuid import UUID
from common.exceptions import UserError
from registration.constants import UNAUTHORIZED_MESSAGE
from registration.models.user import User
from registration.schema.user import UserUpdateRoleIn
from service.data_access_service.user_service import UserDataAccessService


class UserService:
    @classmethod
    def get_if_authorized(cls, admin_user_guid: UUID, target_user_guid: UUID) -> User:
        admin_user: User = UserDataAccessService.get_by_guid(admin_user_guid)
        target_user: User = UserDataAccessService.get_by_guid(target_user_guid)
        if (
            admin_user.is_industry_user() and admin_user.business_guid == target_user.business_guid
        ) or admin_user.is_irc_user():
            return target_user
        raise Exception(UNAUTHORIZED_MESSAGE)

    @classmethod
    def update_user_role(
        cls,
        updating_user_guid: UUID,
        user_to_update_guid: UUID,
        updated_data: UserUpdateRoleIn,
        include_archived: bool = False,
    ) -> User:
        """
        Update a user role. Users cannot update their own roles.

        Args:
            *updating_user_guid: The guid of the user who is doing the updating
            user_to_update_guid: the guid of the user who is being updating
            updated_data: The data to update the user with (role and whether or not to archive/un-archive)
            include_archived: Whether or not to included archived users when doing operations on users.
        """
        if updating_user_guid == user_to_update_guid:
            raise UserError('You cannot change your own user role.')

        user: User = UserDataAccessService.update_user(user_to_update_guid, updated_data, include_archived)

        if updated_data.archive:
            user.set_archive(updating_user_guid)
            user.refresh_from_db()
        else:
            user.archived_at, user.archived_by = None, None
            user.save(update_fields=["archived_at", "archived_by"])

        return user
```

## File: bc_obps/manage.py
```python
#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

from dotenv import load_dotenv


def main():
    """Run administrative tasks."""
    load_dotenv()

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bc_obps.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
```

## File: bc_obps/bc_obps/storage_backends.py
```python
from datetime import datetime
import os
import re
import shutil
from typing import Any
from django.conf import settings
from django.core.files.storage import FileSystemStorage, Storage
from storages.backends.gcloud import GoogleCloudStorage  # type: ignore
from django.core.files.base import ContentFile


def add_filename_suffix(filename: str, suffix: str | None = None) -> str:
    """
    Small utility to add a suffix to a file name, before a potential extension.
    Defaults to a timestamp integer (YYYYMMDDHHmmSS)
    Example:
      the/path/the_file.txt -> the/path/the_file_20250522245133.txt
    """
    name, extension = os.path.splitext(filename)
    file_suffix = suffix if suffix is not None else f'_{datetime.now().strftime("%Y%m%d%H%M%S")}'

    # Remove the last 15 characters if we match a timestamp we inserted previously
    if re.search(r'_20\d{12}$', name) is not None:
        name = name[:-15]

    return f"{name}{file_suffix}{extension}"


def keep_deleted_items(storage_instance: Storage) -> Storage:
    """
    Wrapper function to make a storage instance keep deleted files on the storage.
    This is to allow compatibility with the `simple_history` module which assumes
    file references are kept on the storage medium.
    """
    setattr(storage_instance, "delete", lambda *_: None)
    return storage_instance


class SimpleLocal(FileSystemStorage):
    """Local file storage that is always considered as using the clean bucket."""

    location = os.path.join(settings.MEDIA_ROOT)

    def url(self, name: str | None = None) -> str:
        return f"http://localhost:8000{super().url(name)}"

    def get_file_bucket(self, name: str) -> str | None:
        return "Clean"

    def duplicate_file(self, name: str) -> str:
        """
        Duplicate a file
        """
        new_file = add_filename_suffix(name)
        shutil.copy2(f"{self.location}/{name}", f"{self.location}/{new_file}")

        return new_file


class UnifiedGcsStorage(GoogleCloudStorage):
    """
    A storage backend for the clean, quarantined, and unscanned buckets.
    - `_save` always saves to the unscanned bucket.
    - `exists` checks if the file exists in any of the three buckets.
    - `delete` removes the file from all three buckets.
    """

    def __init__(self: Any, *args: Any, **kwargs: Any) -> None:
        self._unscanned_bucket_name = settings.GS_UNSCANNED_BUCKET_NAME
        self._quarantined_bucket_name = settings.GS_QUARANTINED_BUCKET_NAME
        self._clean_bucket_name = settings.GS_CLEAN_BUCKET_NAME

        # Defaults to the clean bucket
        super().__init__(bucket_name=self._clean_bucket_name, *args, **kwargs)

    def _quarantined_handler(self) -> GoogleCloudStorage:
        return GoogleCloudStorage(bucket_name=self._quarantined_bucket_name)

    def _unscanned_handler(self) -> GoogleCloudStorage:
        return GoogleCloudStorage(bucket_name=self._unscanned_bucket_name)

    def _clean_handler(self) -> GoogleCloudStorage:
        return GoogleCloudStorage(bucket_name=self._clean_bucket_name)

    def _save(self, name: str, content: ContentFile) -> Any:
        """Always save to the unscanned bucket."""
        return self._unscanned_handler()._save(name, content)

    def delete(self, name: str) -> None:
        """Delete the file from all three buckets."""
        self._unscanned_handler().delete(name)
        self._quarantined_handler().delete(name)
        self._clean_handler().delete(name)

    def _exists_in_quarantined_bucket(self, name: str) -> bool:
        return self._quarantined_handler().exists(name)  # type: ignore[no-any-return]

    def _exists_in_clean_bucket(self, name: str) -> bool:
        return self._clean_handler().exists(name)  # type: ignore[no-any-return]

    def _exists_in_unscanned_bucket(self, name: str) -> bool:
        return self._unscanned_handler().exists(name)  # type: ignore[no-any-return]

    def exists(self, name: str) -> bool:
        return (
            self._exists_in_clean_bucket(name)
            or self._exists_in_unscanned_bucket(name)
            or self._exists_in_quarantined_bucket(name)
        )

    def get_file_bucket(self, name: str) -> str | None:
        if self._exists_in_clean_bucket(name):
            return "Clean"

        if self._exists_in_unscanned_bucket(name):
            return "Unscanned"

        if self._exists_in_quarantined_bucket(name):
            return "Quarantined"

        return None

    def duplicate_file(self, name: str) -> str:
        """
        Duplicate a file
        """
        new_file = add_filename_suffix(name)

        if not self._exists_in_clean_bucket(name):
            raise Exception("Cannot duplicate an unscanned file")

        bucket = self._clean_handler().bucket
        blob = bucket.blob(name)

        # From the GCP API documentation: For a destination
        # object that does not yet exist, set the if_generation_match precondition to 0.
        blob_copy = bucket.copy_blob(blob, bucket, new_file, if_generation_match=0)

        return blob_copy.name  # type: ignore
```

## File: bc_obps/service/tests/test_operation_designated_operator_timeline_service.py
```python
import pytest
from django.utils import timezone
from model_bakery import baker
from service.operation_designated_operator_timeline_service import (
    OperationDesignatedOperatorTimelineService,
)

pytestmark = pytest.mark.django_db


class TestOperationDesignatedOperatorTimelineService:
    @staticmethod
    def test_get_current_timeline():
        timeline_with_no_end_date = baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline', end_date=None
        )
        # another timeline for the same operation to make sure it is not returned
        baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operation=timeline_with_no_end_date.operation,
        )
        result_found = OperationDesignatedOperatorTimelineService.get_current_timeline(
            timeline_with_no_end_date.operator_id, timeline_with_no_end_date.operation_id
        )
        assert result_found == timeline_with_no_end_date

        timeline_with_end_date = baker.make_recipe('registration.tests.utils.operation_designated_operator_timeline')
        result_not_found = OperationDesignatedOperatorTimelineService.get_current_timeline(
            timeline_with_end_date.operator_id, timeline_with_end_date.operation_id
        )
        assert result_not_found is None

    @staticmethod
    def test_set_timeline_end_date():
        timeline = baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
        )
        end_date = timezone.now()

        updated_timeline = OperationDesignatedOperatorTimelineService.set_timeline_end_date(timeline, end_date)

        assert updated_timeline.end_date == end_date
        assert updated_timeline.operator_id == timeline.operator_id
        assert updated_timeline.operation_id == timeline.operation_id

        # Verify the changes are saved in the database
        timeline.refresh_from_db()
        assert timeline.end_date == end_date

    @staticmethod
    def test_get_operation_designated_operator_for_reporting_year():

        operation = baker.make_recipe('registration.tests.utils.operation')
        operator1 = baker.make_recipe('registration.tests.utils.operator')
        operator2 = baker.make_recipe('registration.tests.utils.operator')

        timeline1 = baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operation=operation,
            operator=operator1,
            start_date=timezone.make_aware(timezone.datetime(2024, 6, 1)),
            end_date=timezone.make_aware(timezone.datetime(2025, 5, 31)),
        )
        timeline2 = baker.make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operation=operation,
            operator=operator2,
            start_date=timezone.make_aware(timezone.datetime(2025, 5, 31)),
            end_date=None,
        )

        # test returns correct result for given reporting years
        result1 = OperationDesignatedOperatorTimelineService.get_operation_designated_operator_for_reporting_year(
            operation.id, 2024
        )

        assert result1.operation == timeline1.operation
        assert result1.operator == timeline1.operator
        assert result1.start_date == timeline1.start_date
        assert result1.end_date == timeline1.end_date
        assert result1.has_been_transferred is True

        result2 = OperationDesignatedOperatorTimelineService.get_operation_designated_operator_for_reporting_year(
            operation.id, 2025
        )
        assert result2.operation == timeline2.operation
        assert result2.operator == timeline2.operator
        assert result2.start_date == timeline2.start_date
        assert result2.end_date == timeline2.end_date
        assert result2.has_been_transferred is False

        # test returns None if no timeline found
        result_none = OperationDesignatedOperatorTimelineService.get_operation_designated_operator_for_reporting_year(
            operation.id, 2023
        )
        assert result_none is None
```

## File: bc_obps/service/operation_designated_operator_timeline_service.py
```python
from datetime import datetime
from typing import Optional
from uuid import UUID
from django.db.models import Q
from dataclasses import dataclass
from registration.models import OperationDesignatedOperatorTimeline
from registration.models.operation import Operation
from registration.models.operator import Operator
from django.utils import timezone


@dataclass
class OperationDesignatedOperatorTimelinePlus:
    operation: Operation
    operator: Operator
    start_date: datetime | None
    end_date: datetime | None

    @property
    def has_been_transferred(self) -> bool:
        return self.end_date is not None and self.end_date.date() <= timezone.now().date()


class OperationDesignatedOperatorTimelineService:
    @classmethod
    def get_current_timeline(
        cls, operator_id: UUID, operation_id: UUID
    ) -> Optional[OperationDesignatedOperatorTimeline]:
        return OperationDesignatedOperatorTimeline.objects.filter(
            operator_id=operator_id, operation_id=operation_id, end_date__isnull=True
        ).first()

    @classmethod
    def set_timeline_end_date(
        cls,
        timeline: OperationDesignatedOperatorTimeline,
        end_date: datetime,
    ) -> OperationDesignatedOperatorTimeline:
        timeline.end_date = end_date
        timeline.save(update_fields=["end_date"])
        return timeline

    @classmethod
    def get_operation_designated_operator_for_reporting_year(
        cls, operation_id: UUID, reporting_year: int
    ) -> Optional[OperationDesignatedOperatorTimelinePlus]:
        """
        Retrieves the OperationDesignatedOperatorTimeline record for a specific operation and reporting year,
        with an annotated boolean field 'has_been_transferred'.
        """

        timeline = OperationDesignatedOperatorTimeline.objects.filter(
            Q(end_date__year__gt=reporting_year) | Q(end_date__isnull=True),
            start_date__year__lte=reporting_year,
            operation_id=operation_id,
        ).first()
        if not timeline:
            return None
        return OperationDesignatedOperatorTimelinePlus(
            operation=timeline.operation,
            operator=timeline.operator,
            start_date=timeline.start_date,
            end_date=timeline.end_date,
        )
```

## File: bc_obps/service/tests/operation_service/test_operation_service_reportable.py
```python
import pytest
from uuid import uuid4
from unittest.mock import patch, MagicMock
from model_bakery import baker
from registration.models import Operation
from service.operation_service import OperationService

pytestmark = pytest.mark.django_db


class TestOperationServiceReportable:
    @staticmethod
    def test_get_registration_purposes_for_operation_type_sfo_lfo():
        expected_purposes = [
            Operation.Purposes.OBPS_REGULATED_OPERATION,
            Operation.Purposes.OPTED_IN_OPERATION,
            Operation.Purposes.NEW_ENTRANT_OPERATION,
            Operation.Purposes.REPORTING_OPERATION,
        ]

        assert OperationService._get_registration_purposes_for_operation_type(Operation.Types.SFO) == expected_purposes
        assert OperationService._get_registration_purposes_for_operation_type(Operation.Types.LFO) == expected_purposes

    @staticmethod
    def test_get_registration_purposes_for_operation_type_eio():
        assert OperationService._get_registration_purposes_for_operation_type(Operation.Types.EIO) == [
            Operation.Purposes.ELECTRICITY_IMPORT_OPERATION,
        ]

    @staticmethod
    @patch.object(OperationService, "_get_registration_purposes_for_operation_type")
    def test_build_reportable_operation_row(mock_get_purposes: MagicMock):
        mock_purposes = [Operation.Purposes.REPORTING_OPERATION]
        mock_get_purposes.return_value = mock_purposes

        operation = baker.make_recipe(
            "registration.tests.utils.operation",
            type=Operation.Types.SFO,
            name="Test Row Operation",
        )

        result = OperationService._build_reportable_operation_row(
            operation,
            2022,
        )

        assert result == {
            "operation_id": operation.id,
            "operation_name": "Test Row Operation",
            "reporting_year": 2022,
            "registration_purposes": mock_purposes,
        }
        mock_get_purposes.assert_called_once_with(Operation.Types.SFO)

    @staticmethod
    @patch("service.data_access_service.user_service.UserDataAccessService.get_user_operator_by_user")
    @patch("service.reporting_year_service.ReportingYearService.get_previous_reporting_years")
    def test_list_previous_reportable_operations(
        mock_get_previous_reporting_years: MagicMock,
        mock_get_user_operator: MagicMock,
    ):
        user_guid = uuid4()

        user_operator = baker.make_recipe(
            "registration.tests.utils.approved_user_operator",
        )
        mock_get_user_operator.return_value = user_operator

        year_2091 = MagicMock(reporting_year=2091)
        year_2092 = MagicMock(reporting_year=2092)
        mock_get_previous_reporting_years.return_value = [year_2092, year_2091]

        # Designated operation with no existing reports, should result in 2 records being returned
        designated_op = baker.make_recipe(
            "registration.tests.utils.operation",
            operator=user_operator.operator,
            status=Operation.Statuses.REGISTERED,
            type=Operation.Types.SFO,
            name="Designated Op",
        )

        baker.make_recipe(
            "registration.tests.utils.operation_designated_operator_timeline",
            operation=designated_op,
            operator=user_operator.operator,
            start_date='2090-01-01',
            end_date=None,
        )

        # Designated operation, but should only result in 1 record returned due to the existing 2091 report
        op_with_report_2091 = baker.make_recipe(
            "registration.tests.utils.operation",
            operator=user_operator.operator,
            status=Operation.Statuses.REGISTERED,
            type=Operation.Types.SFO,
            name="Op With 2021 Report",
        )

        baker.make_recipe(
            "registration.tests.utils.operation_designated_operator_timeline",
            operation=op_with_report_2091,
            operator=user_operator.operator,
            start_date='2090-01-01',
            end_date='2099-01-01',
        )

        # Operation that is not designated to the operator via a timeline record, should not be included in the results
        baker.make_recipe(
            "registration.tests.utils.operation",
            operator=user_operator.operator,
            status=Operation.Statuses.REGISTERED,
            type=Operation.Types.LFO,
            name="Ignored Op",
        )

        reporting_year_2092 = baker.make_recipe(
            "reporting.tests.utils.reporting_year",
            reporting_year=2092,
        )

        baker.make_recipe(
            "reporting.tests.utils.report",
            operation=op_with_report_2091,
            reporting_year=reporting_year_2092,
        )

        results = OperationService.list_previous_reportable_operations(user_guid)

        assert len(results) == 3
        # Two results from the designated operation with no reports for the 2 reporting years
        assert len([x for x in results if x.get("operation_name") == "Designated Op"]) == 2
        # One result from the designated operation with a report for the 2091 reporting year
        assert len([x for x in results if x.get("operation_name") == "Op With 2021 Report"]) == 1
        # No results for operation that should be ignored
        assert len([x for x in results if x.get("operation_name") == "Ignored Op"]) == 0
```

## File: bc_obps/service/operation_service.py
```python
from datetime import date, datetime
from typing import List, Optional, Tuple, Callable, Generator
from zoneinfo import ZoneInfo
from common.lib.dataclasses import asdict
from django.core.files.uploadedfile import UploadedFile
from django.db.models import QuerySet
from common.exceptions import UserError
from registration.emails import send_registration_and_boro_id_email
from registration.enums.enums import EmailTemplateNames
from registration.models.facility import Facility
from registration.models.regulated_product import RegulatedProduct
from registration.signals.signals import operation_registration_purpose_changed
from registration.utils import is_document_scan_complete
from service.contact_service import ContactService
from service.data_access_service.document_service import DocumentDataAccessService
from service.data_access_service.operation_designated_operator_timeline_service import (
    OperationDesignatedOperatorTimelineDataAccessService,
)
from registration.models.bc_greenhouse_gas_id import BcGreenhouseGasId
from registration.models.bc_obps_regulated_operation import BcObpsRegulatedOperation
from registration.models.document_type import DocumentType
from registration.models.facility_designated_operation_timeline import FacilityDesignatedOperationTimeline
from registration.constants import UNAUTHORIZED_MESSAGE
from registration.models.address import Address
from registration.models.contact import Contact
from registration.models.multiple_operator import MultipleOperator
from registration.models.document import Document
from service.data_access_service.address_service import AddressDataAccessService
from service.data_access_service.multiple_operator_service import MultipleOperatorService
from registration.models.user_operator import UserOperator
from registration.models import Operation, User
from ninja import Query
from django.db import transaction
from service.data_access_service.operation_service import OperationDataAccessService
from service.data_access_service.user_service import UserDataAccessService
from uuid import UUID
from registration.models.opted_in_operation_detail import OptedInOperationDetail
from service.data_access_service.opted_in_operation_detail_service import OptedInOperationDataAccessService
from service.data_types.operation_service import (
    MultipleOperatorData,
    OperationData,
    OptedInOperationDetailData,
    UpdateOperationData,
)
from service.document_service import DocumentService
from service.facility_designated_operation_timeline_service import FacilityDesignatedOperationTimelineService
from service.facility_service import FacilityService
from registration.schema import (
    OperationRepresentativeIn,
    FacilityIn,
    OperationTimelineFilterSchema,
)
from django.db.models import Q
from django.utils import timezone
from registration.models.operation_designated_operator_timeline import OperationDesignatedOperatorTimeline
from service.reporting_year_service import ReportingYearService
from django.conf import settings
from reporting.models.report import Report


class OperationService:

    OPERATION_DEFAULT_START_DATE = datetime(2024, 1, 1, tzinfo=ZoneInfo("America/Vancouver"))

    @classmethod
    def get_if_authorized(
        cls,
        user_guid: UUID,
        operation_id: UUID,
        only_fields: Optional[List[str]] = None,
    ) -> Operation:
        operation: Operation
        if only_fields:
            operation = Operation.objects.only(*only_fields).get(id=operation_id)
        else:
            operation = OperationDataAccessService.get_by_id(operation_id)
        user: User = UserDataAccessService.get_by_guid(user_guid)
        if user.is_industry_user():
            if not operation.user_has_access(user.user_guid):
                raise Exception(UNAUTHORIZED_MESSAGE)
        return operation

    @classmethod
    def list_operations_timeline(
        cls,
        user_guid: UUID,
        sort_field: Optional[str],
        sort_order: Optional[str],
        filters: OperationTimelineFilterSchema = Query(...),
    ) -> QuerySet[OperationDesignatedOperatorTimeline]:
        user = UserDataAccessService.get_by_guid(user_guid)
        sort_direction = "-" if sort_order == "desc" else ""
        sort_by = f"{sort_direction}{sort_field}"
        base_qs = OperationDesignatedOperatorTimelineDataAccessService.get_operation_timeline_for_user(user)
        return filters.filter(base_qs).order_by(sort_by)

    @classmethod
    def list_current_users_unregistered_operations(
        cls,
        user_guid: UUID,
    ) -> QuerySet[Operation]:
        user = UserDataAccessService.get_by_guid(user_guid)
        return OperationDataAccessService.get_all_current_operations_for_user(user).filter(
            ~Q(status=Operation.Statuses.REGISTERED)
        )

    @classmethod
    @transaction.atomic()
    def update_status(cls, user_guid: UUID, operation_id: UUID, status: Operation.Statuses) -> Operation:
        operation = OperationService.get_if_authorized(user_guid, operation_id)
        fields_to_update = ['status']
        if status == Operation.Statuses.REGISTERED:
            cls.raise_exception_if_operation_missing_registration_information(operation)
            operation.submission_date = timezone.now()
            fields_to_update.append('submission_date')
        operation.status = Operation.Statuses(status)
        operation.save(update_fields=fields_to_update)

        # if the operation status is now "Registered", we send an email to the user to confirm that the operation is now registered.
        # this works under the assumption that once an operation's status is set to Registered, update_status()
        # will not be called again for the same operation. update_status() should only get called from the Registration workflow,
        # (not from the Admin module), and once an operation is registered, it can no longer be accessed from the Registration workflow.
        if operation.status == Operation.Statuses.REGISTERED:
            send_registration_and_boro_id_email(
                EmailTemplateNames.REGISTRATION_CONFIRMATION,
                operation.operator.legal_name,
                operation,
                UserDataAccessService.get_by_guid(user_guid),
            )
        return operation

    @classmethod
    @transaction.atomic()
    def update_opted_in_operation_detail(
        cls, user_guid: UUID, operation_id: UUID, payload: OptedInOperationDetailData
    ) -> OptedInOperationDetail:
        operation = OperationService.get_if_authorized(user_guid, operation_id, ['id', 'operator_id'])
        if not operation.opted_in_operation:
            raise OptedInOperationDetail.DoesNotExist("Operation does not have an opted-in operation.")
        return OptedInOperationDataAccessService.update_opted_in_operation_detail(
            operation.opted_in_operation.id, payload
        )

    @classmethod
    def get_opted_in_operation_detail(cls, user_guid: UUID, operation_id: UUID) -> Optional[OptedInOperationDetail]:
        operation = OperationService.get_if_authorized(user_guid, operation_id, ['id', 'operator_id'])
        return operation.opted_in_operation

    @classmethod
    @transaction.atomic()
    def update_opted_in_final_reporting_year(
        cls, user_guid: UUID, operation_id: UUID, final_reporting_year: int | None
    ) -> OptedInOperationDetail:
        operation = OperationService.get_if_authorized(user_guid, operation_id, ['id', 'operator_id'])
        if not operation.opted_in_operation:
            raise OptedInOperationDetail.DoesNotExist("There is no opted-in operation detail for this operation.")
        return OptedInOperationDataAccessService.update_opted_in_final_reporting_year(
            operation.opted_in_operation.id, final_reporting_year
        )

    @classmethod
    def create_or_replace_new_entrant_application(
        cls, user_guid: UUID, operation_id: UUID, new_entrant_application: UploadedFile | None
    ) -> Operation:
        operation = OperationService.get_if_authorized(user_guid, operation_id, ['id', 'operator_id'])

        if new_entrant_application is not None:
            (
                new_entrant_application_document,
                new_entrant_application_document_created,
            ) = DocumentService.create_or_replace_operation_document(
                user_guid,
                operation_id,
                new_entrant_application,
                "new_entrant_application",
            )
            if new_entrant_application_document_created:
                operation.documents.add(new_entrant_application_document)

        return operation

    @classmethod
    @transaction.atomic()
    def create_operation_representative(
        cls, user_guid: UUID, operation_id: UUID, payload: OperationRepresentativeIn
    ) -> Contact:
        operation: Operation = OperationService.get_if_authorized(user_guid, operation_id, ['id', 'operator_id'])
        existing_contact_id = payload.existing_contact_id
        if existing_contact_id:
            # We need to prevent users from updating the contact's first name, last name, and email if they are using an existing contact
            # This is already handled in the schema, but we need to make sure it's enforced here as well
            contact: Contact = Contact.objects.get(id=existing_contact_id)
            if any(
                [
                    payload.first_name != contact.first_name,  # type: ignore[attr-defined]
                    payload.last_name != contact.last_name,  # type: ignore[attr-defined]
                    payload.email != contact.email,  # type: ignore[attr-defined]
                ]
            ):
                raise UserError("Cannot update first name, last name, or email of existing contact.")
            contact = ContactService.update_contact(user_guid, existing_contact_id, payload)
        else:
            contact = ContactService.create_contact(user_guid, payload)
        operation.contacts.add(contact)
        return contact

    @classmethod
    @transaction.atomic()
    def _create_or_update_eio(cls, user_guid: UUID, operation: Operation, payload: OperationData) -> None:
        # EIO operations have a facility with the same data as the operation
        eio_payload = FacilityIn(name=payload.name, type=Facility.Types.ELECTRICITY_IMPORT, operation_id=operation.id)
        facility = operation.facilities.first()
        if not facility:
            FacilityService.create_facilities_with_designated_operations(user_guid, [eio_payload])
        else:
            FacilityService.update_facility(user_guid, facility.id, eio_payload)

    @classmethod
    @transaction.atomic()
    def _create_opted_in_operation_detail(cls, user_guid: UUID, operation: Operation) -> Operation:
        """
        Creates an empty OptedInOperationDetail instance for the specified operation.
        This method is called before any opt-in data is available.
        """

        operation.opted_in_operation = OptedInOperationDetail.objects.create(created_by_id=user_guid)
        operation.save(update_fields=['opted_in_operation'])

        return operation

    @classmethod
    @transaction.atomic()
    def remove_operation_representative(
        cls,
        user_guid: UUID,
        operation_id: UUID,
        contact_id: int,
    ) -> int:
        operation: Operation = OperationService.get_if_authorized(user_guid, operation_id, ['id', 'operator_id'])
        operation.contacts.remove(contact_id)

        return contact_id

    @classmethod
    @transaction.atomic()
    def _create_operation(
        cls,
        user_guid: UUID,
        operation_data: OperationData,
    ) -> Operation:
        operation_fields = operation_data.operation_fields()

        user_operator: UserOperator = UserDataAccessService.get_user_operator_by_user(user_guid)
        operation_fields['operator_id'] = user_operator.operator_id

        operation = OperationDataAccessService.create_operation(
            user_guid,
            operation_fields,
            operation_data.activities if hasattr(operation_data, "activities") and operation_data.activities else [],
            (
                operation_data.regulated_products
                if hasattr(operation_data, "regulated_products") and operation_data.regulated_products
                else []
            ),
        )

        OperationDesignatedOperatorTimelineDataAccessService.create_operation_designated_operator_timeline(
            user_guid,
            {
                'operator': user_operator.operator,
                'operation': operation,
                'start_date': cls.OPERATION_DEFAULT_START_DATE,
            },
        )

        # create documents
        operation_documents = []

        if operation_data.boundary_map:
            operation_documents.append(
                DocumentDataAccessService.create_document(
                    user_guid,
                    operation_data.boundary_map,
                    'boundary_map',
                    operation.id,
                )
            )
        if operation_data.process_flow_diagram:
            operation_documents.append(
                DocumentDataAccessService.create_document(
                    user_guid,
                    operation_data.process_flow_diagram,
                    'process_flow_diagram',
                    operation.id,
                )
            )
        if operation_data.new_entrant_application:
            operation_documents.append(
                DocumentDataAccessService.create_document(
                    user_guid,
                    operation_data.new_entrant_application,
                    'new_entrant_application',
                    operation.id,
                )
            )

        operation.documents.add(*operation_documents)

        # handle multiple operators
        multiple_operators_data = operation_data.multiple_operators_array
        cls.upsert_multiple_operators(operation, multiple_operators_data, user_guid)

        # handle purposes
        if operation.registration_purpose == Operation.Purposes.OPTED_IN_OPERATION:
            operation = cls._create_opted_in_operation_detail(user_guid, operation)
        if operation.registration_purpose == Operation.Purposes.ELECTRICITY_IMPORT_OPERATION:
            cls._create_or_update_eio(user_guid, operation, operation_data)

        return operation

    @classmethod
    @transaction.atomic()
    def register_operation_information(
        cls,
        user_guid: UUID,
        operation_id: UUID | None,
        payload: OperationData,
    ) -> Operation:
        # can't optimize this much more without looking at files--the extra hits to operation are in the middleware, and the multi hits to document are from the resolvers
        operation: Operation
        if operation_id:
            operation = OperationService.get_if_authorized(user_guid, operation_id)
            cls.update_operation(user_guid, payload, operation_id)
        else:
            operation = cls._create_operation(
                user_guid,
                payload,
            )
        if operation.status == Operation.Statuses.NOT_STARTED:
            cls.update_status(user_guid, operation.id, Operation.Statuses.DRAFT)
        return operation

    @classmethod
    @transaction.atomic()
    def upsert_multiple_operators(
        cls, operation: Operation, multiple_operators_data: list[MultipleOperatorData] | None, user_guid: UUID
    ) -> None:
        old_multiple_operators: QuerySet[MultipleOperator] = operation.multiple_operators.all()
        # if all multiple operators have been removed, archive them
        if not multiple_operators_data:
            for old_multiple in old_multiple_operators:
                old_multiple.set_archive(user_guid)
            return

        new_multiple_operators = []
        for mo_data in multiple_operators_data:
            mo_operator_data: dict = asdict(
                mo_data,
                include={
                    'legal_name',
                    'trade_name',
                    'business_structure_id',
                    'cra_business_number',
                    'bc_corporate_registry_number',
                },
            )

            old_address_id = mo_data.attorney_address if hasattr(mo_data, 'attorney_address') else None
            new_address: dict = asdict(
                mo_data,
                include={'street_address', 'municipality', 'province', 'postal_code'},
                exclude_none=True,
            )
            if old_address_id and not new_address:
                old_address = Address.objects.get(id=old_address_id)
                mo_operator_data['attorney_address'] = None
                old_address.delete()

            if new_address:
                updated_attorney_address = AddressDataAccessService.upsert_address_from_data(
                    new_address, old_address_id
                )
                mo_operator_data['attorney_address'] = updated_attorney_address

            new_multiple_operators.append(
                MultipleOperatorService.create_or_update(mo_data.id, operation, user_guid, mo_operator_data)
            )

        for old_multiple in old_multiple_operators:
            if old_multiple not in new_multiple_operators:
                old_multiple.set_archive(user_guid)

    @classmethod
    @transaction.atomic()
    def update_operation(
        cls,
        user_guid: UUID,
        updated_operation_data: OperationData,
        operation_id: UUID,
    ) -> Operation:
        # will need to retrieve operation as it exists currently in DB first, to determine whether there's been a change to the RP

        operation: Operation = OperationService.get_if_authorized(
            user_guid,
            operation_id,
        )

        if updated_operation_data.registration_purpose != operation.registration_purpose:
            updated_operation_data = cls.handle_change_of_registration_purpose(
                user_guid, operation, updated_operation_data
            )
            # send a signal that the registration purpose has changed
            operation_registration_purpose_changed.send(
                sender=OperationService,
                operation_id=operation.id,
            )
        if updated_operation_data.type != operation.type:
            if operation.status == Operation.Statuses.REGISTERED:
                raise UserError("Cannot change the type of an operation that has already been registered.")
            FacilityDesignatedOperationTimelineService.delete_facilities_by_operation_id(user_guid, operation.id)

        operation_data = updated_operation_data.operation_fields()

        operation_data['pk'] = operation_id
        operation_data['operator_id'] = operation.operator.id

        operation, _ = Operation.custom_update_or_create(Operation, **operation_data)

        operation.activities.set(updated_operation_data.activities or [])
        operation.regulated_products.set(updated_operation_data.regulated_products or [])

        if operation.status == Operation.Statuses.REGISTERED and isinstance(
            updated_operation_data, UpdateOperationData
        ):
            # operation representatives are only mandatory to register (vs. simply update) and operation
            for contact_id in updated_operation_data.operation_representatives:
                ContactService.raise_exception_if_contact_missing_address_information(contact_id)

            operation.contacts.set(updated_operation_data.operation_representatives)

        # create or replace documents
        operation_documents = [
            doc
            for doc, created in [
                *(
                    [
                        DocumentService.create_or_replace_operation_document(
                            user_guid,
                            operation.id,
                            updated_operation_data.boundary_map,
                            'boundary_map',
                        )
                    ]
                    if updated_operation_data.boundary_map
                    else []
                ),
                *(
                    [
                        DocumentService.create_or_replace_operation_document(
                            user_guid,
                            operation.id,
                            updated_operation_data.process_flow_diagram,
                            'process_flow_diagram',
                        )
                    ]
                    if updated_operation_data.process_flow_diagram
                    else []
                ),
                *(
                    [
                        DocumentService.create_or_replace_operation_document(
                            user_guid,
                            operation.id,
                            updated_operation_data.new_entrant_application,
                            'new_entrant_application',
                        )
                    ]
                    if updated_operation_data.new_entrant_application
                    else []
                ),
            ]
            if created
        ]
        operation.documents.add(*operation_documents)

        # # this is not handled by changing registration purpose
        if (
            operation.registration_purpose == Operation.Purposes.OPTED_IN_OPERATION
            and operation.opted_in_operation is None
        ):
            operation = cls._create_opted_in_operation_detail(user_guid, operation)

        if operation.registration_purpose == Operation.Purposes.ELECTRICITY_IMPORT_OPERATION:
            cls._create_or_update_eio(user_guid, operation, updated_operation_data)

        # # handle multiple operators
        multiple_operators_data = updated_operation_data.multiple_operators_array
        cls.upsert_multiple_operators(operation, multiple_operators_data, user_guid)

        return operation

    @classmethod
    def is_operation_opt_in_information_complete(cls, operation: Operation) -> bool:
        """
        This function checks if all opt-in information is complete.
        Complete means an operation has both a FK to the opt-in detail, and the details are complete.
        """
        opted_in_operation = operation.opted_in_operation
        if not opted_in_operation:
            return False

        required_fields = [
            'meets_section_3_emissions_requirements',
            'meets_electricity_import_operation_criteria',
            'meets_entire_operation_requirements',
            'meets_section_6_emissions_requirements',
            'meets_naics_code_11_22_562_classification_requirements',
            'meets_producing_gger_schedule_a1_regulated_product',
            'meets_reporting_and_regulated_obligations',
            'meets_notification_to_director_on_criteria_change',
        ]

        return all(getattr(opted_in_operation, field) is not None for field in required_fields)

    @classmethod
    def is_operation_new_entrant_information_complete(cls, operation: Operation) -> bool:
        """
        This function checks whether the expected data for new-entrant operations has been saved.
        Date of first shipment is no longer required for 2025+ registrations.
        """
        if not operation.documents.filter(type=DocumentType.objects.get(name="new_entrant_application")).exists():
            return False
        return True

    @classmethod
    def raise_exception_if_operation_missing_registration_information(cls, operation: Operation) -> None:
        """
        This function checks if the given operation instance has all necessary registration information.
        If any required information is missing, it raises an appropriate exception.
        """

        def check_conditions() -> Generator[Tuple[Callable[[], bool], str], None, None]:
            yield lambda: operation.registration_purpose is not None, "Operation must have a registration purpose."
            yield (
                lambda: operation.contacts.filter(
                    business_role__role_name='Operation Representative',
                    address__street_address__isnull=False,
                    address__municipality__isnull=False,
                    address__province__isnull=False,
                    address__postal_code__isnull=False,
                ).exists(),
                "Operation must have an operation representative with an address.",
            )
            yield (
                lambda: FacilityDesignatedOperationTimeline.objects.filter(operation=operation).exists(),
                "Operation must have at least one facility.",
            )
            # unless the registration purpose is Electricity Import Operation, the operation should have at least 1 reporting activity
            yield (
                lambda: not (
                    operation.registration_purpose != Operation.Purposes.ELECTRICITY_IMPORT_OPERATION
                    and not operation.activities.exists()
                ),
                "Operation must have at least one reporting activity.",
            )

            # Check if the operation has both a process flow diagram and a boundary map (unless it is an EIO)
            yield (
                lambda: not (
                    operation.registration_purpose != Operation.Purposes.ELECTRICITY_IMPORT_OPERATION
                    and operation.documents.filter(Q(type__name='process_flow_diagram') | Q(type__name='boundary_map'))
                    .distinct()
                    .count()
                    < 2
                ),
                "Operation must have a process flow diagram and a boundary map.",
            )

            # Check if operation documents have been scanned for malware (skip the check in CI because we don't hit GCS)
            yield (
                lambda: True if settings.CI == 'true' else is_document_scan_complete(operation),
                "Please wait. Your attachments are being scanned for malware, this may take a few minutes.",
            )
            # Check if operation documents are malware free
            yield (
                lambda: not operation.documents.filter(
                    status=Document.FileStatus.QUARANTINED,
                ).exists(),
                f"Potential threat detected in "
                f"{', '.join(operation.documents.filter(status=Document.FileStatus.QUARANTINED).values_list('file', flat=True))}. "
                f"Please go back and replace these attachments before submitting.",
            )
            yield (
                lambda: not (
                    operation.registration_purpose == Operation.Purposes.NEW_ENTRANT_OPERATION
                    and not cls.is_operation_new_entrant_information_complete(operation)
                ),
                "Operation must have a signed statutory declaration and date of first shipment if it is a new entrant.",
            )
            yield (
                lambda: not (
                    operation.registration_purpose == Operation.Purposes.OPTED_IN_OPERATION
                    and not cls.is_operation_opt_in_information_complete(operation)
                ),
                "Operation must have completed opt-in information if it is opted in.",
            )

        for condition, error_message in check_conditions():
            if not condition():
                raise UserError(error_message)

    @classmethod
    def generate_boro_id(cls, user_guid: UUID, operation_id: UUID) -> Optional[BcObpsRegulatedOperation]:
        user: User = UserDataAccessService.get_by_guid(user_guid)
        if not user.is_cas_director():
            raise Exception(UNAUTHORIZED_MESSAGE)

        # This service is only used by internal users who are authorized to view everything, so we don't have to use get_if_authorized
        operation: Operation = OperationDataAccessService.get_by_id(operation_id)

        if operation.bc_obps_regulated_operation:
            raise UserError('Operation already has a BORO ID.')
        if not operation.is_regulated_operation:
            raise UserError('Non-regulated operations cannot be issued BORO IDs.')
        if operation.status != Operation.Statuses.REGISTERED:
            raise UserError('Operations must be registered before they can be issued a BORO ID.')

        operation.generate_unique_boro_id(user_guid=user_guid)
        operation.save(update_fields=['bc_obps_regulated_operation'])
        if operation.bc_obps_regulated_operation is None:
            raise Exception('Failed to create a BORO ID for the operation.')

        # send an email to every Operation Representative for the operation, notifying them that a BORO ID has been issued.
        send_registration_and_boro_id_email(
            EmailTemplateNames.BORO_ID_ISSUANCE, operation.operator.legal_name, operation
        )
        return operation.bc_obps_regulated_operation

    @classmethod
    @transaction.atomic()
    def generate_bcghg_id(cls, user_guid: UUID, operation_id: UUID, bcghg_id: str | None = None) -> BcGreenhouseGasId:
        user: User = UserDataAccessService.get_by_guid(user_guid)
        if not user.is_cas_director():
            raise Exception(UNAUTHORIZED_MESSAGE)
        # This service is only used by internal users who are authorized to view everything, so we don't have to use get_if_authorized
        operation = OperationDataAccessService.get_by_id(operation_id)

        if bcghg_id:
            bcghg_id_record, _ = BcGreenhouseGasId.objects.get_or_create(
                id=bcghg_id, defaults={'issued_by_id': user_guid, 'comments': 'bcghg id manually set to operation'}
            )
            operation.bcghg_id = bcghg_id_record
        else:
            operation.generate_unique_bcghg_id(user_guid=user_guid)

        operation.save(update_fields=['bcghg_id'])
        if operation.bcghg_id is None:
            raise Exception('Failed to create a BCGHG ID for the operation.')

        # For SFOs, facility should also have the BCGHG ID
        if operation.type == Operation.Types.SFO:
            # an operation muse be registered before it can be issued a BCGHG ID, so there will always be a facility
            sfo_facility = Facility.objects.get(operation=operation)
            sfo_facility.bcghg_id = operation.bcghg_id
            sfo_facility.save(update_fields=['bcghg_id'])
            if sfo_facility.bcghg_id is None:
                raise Exception('Failed to add the BCGHG ID to the facility.')
        return operation.bcghg_id

    @classmethod
    def clear_bcghg_id(cls, user_guid: UUID, operation_id: UUID) -> None:
        user: User = UserDataAccessService.get_by_guid(user_guid)
        if not user.is_cas_director():
            raise Exception(UNAUTHORIZED_MESSAGE)
        # This service is only used by internal users who are authorized to view everything, so we don't have to use get_if_authorized
        operation = OperationDataAccessService.get_by_id(operation_id)

        operation.bcghg_id = None
        operation.save(update_fields=['bcghg_id'])

    @classmethod
    @transaction.atomic()
    def update_operator(cls, user_guid: UUID, operation: Operation, operator_id: UUID) -> Operation:
        """
        Update the operator for the operation
        At the time of implementation, this is only used for transferring operations between operators and,
        is only available to cas_analyst and cas_director users
        """
        user = UserDataAccessService.get_by_guid(user_guid)
        if not user.is_cas_analyst() and not user.is_cas_director():
            raise Exception(UNAUTHORIZED_MESSAGE)
        operation.operator_id = operator_id
        operation.save(update_fields=["operator_id"])

        return operation

    @classmethod
    def handle_change_of_registration_purpose(
        cls, user_guid: UUID, operation: Operation, operation_data: OperationData
    ) -> OperationData:
        """
        Logic to handle the situation when an industry user changes the selected registration purpose (RP) for their operation.
        Changing the RP can happen during or after submitting the operation's registration info.
        Depending on what the old RP was, some operation data may need to be removed.
        Generally, if the operation was already registered when the RP changed, the original data will be archived.
        If the operation wasn't yet registered when the selected RP changed, the original data will be deleted.
        """
        old_purpose = operation.registration_purpose

        if old_purpose == Operation.Purposes.ELECTRICITY_IMPORT_OPERATION:
            # EIOs have one facility that has the same information as the operation
            FacilityDesignatedOperationTimeline.objects.get(operation=operation).delete()
            operation.facilities.all().delete()
        if old_purpose == Operation.Purposes.OPTED_IN_OPERATION:
            if operation.opted_in_operation_id:  # To make mypy happy
                OptedInOperationDetail.objects.filter(pk=operation.opted_in_operation_id).delete()
        elif old_purpose == Operation.Purposes.NEW_ENTRANT_OPERATION:
            operation_data.date_of_first_shipment = None
            DocumentService.archive_or_delete_operation_document(user_guid, operation.id, 'new_entrant_application')

        new_purpose = operation_data.registration_purpose
        if new_purpose == Operation.Purposes.ELECTRICITY_IMPORT_OPERATION:
            # remove operation data that's no longer relevant (because operation is now an EIO)
            operation_data.activities = []
            operation_data.regulated_products = []
            operation_data.naics_code_id = None
            operation_data.secondary_naics_code_id = None
            operation_data.tertiary_naics_code_id = None
            operation_data.boundary_map = None
            operation_data.process_flow_diagram = None
            DocumentService.archive_or_delete_operation_document(user_guid, operation.id, 'process_flow_diagram')
            DocumentService.archive_or_delete_operation_document(user_guid, operation.id, 'boundary_map')
        elif new_purpose in [
            Operation.Purposes.REPORTING_OPERATION,
            Operation.Purposes.POTENTIAL_REPORTING_OPERATION,
        ]:
            # remove regulated products - they're not relevant to Reporting/Potential Reporting operations
            operation_data.regulated_products = []

        return operation_data

    # list previous reportable operations methods:
    @staticmethod
    def get_valid_operation_regulated_products(operation: Operation, reporting_year: int) -> QuerySet[RegulatedProduct]:
        """
        Get the operation's regulated products that are valid for a specific reporting year.
        Uses May 1st of the reporting year as the date to check against the regulated product's valid_from and valid_to dates.
        """
        reporting_year_date = date(reporting_year, 5, 1)
        return operation.regulated_products.filter(
            valid_from__lte=reporting_year_date, valid_to__gte=reporting_year_date
        )

    @staticmethod
    def _get_registration_purposes_for_operation_type(
        operation_type: str,
    ) -> list[str]:
        """
        Returns the registration purposes that may be selected when creating
        a past report for an operation
        """

        # SFO and LFO
        if operation_type in (Operation.Types.SFO, Operation.Types.LFO):
            return [
                Operation.Purposes.OBPS_REGULATED_OPERATION,
                Operation.Purposes.OPTED_IN_OPERATION,
                Operation.Purposes.NEW_ENTRANT_OPERATION,
                Operation.Purposes.REPORTING_OPERATION,
            ]

        # EIO
        if operation_type == Operation.Types.EIO:
            return [
                Operation.Purposes.ELECTRICITY_IMPORT_OPERATION,
            ]

        raise ValueError(f"Unsupported operation type: {operation_type}")

    @classmethod
    def _build_reportable_operation_row(
        cls,
        operation: Operation,
        reporting_year: int,
    ) -> dict[str, UUID | str | int | list[str]]:
        """
        Builds a reportable operation response row
        """
        return {
            "operation_id": operation.id,
            "operation_name": operation.name,
            "reporting_year": reporting_year,
            "registration_purposes": cls._get_registration_purposes_for_operation_type(
                operation.type,
            ),
        }

    @classmethod
    def list_previous_reportable_operations(
        cls,
        user_guid: UUID,
    ) -> list[dict]:
        """
        Returns the reporting year/operation combinations for which the current user is eligible to create a report in a previous year
        Operations with existing reports for a reporting year are excluded
        """

        user_operator = UserDataAccessService.get_user_operator_by_user(user_guid)
        reporting_years = ReportingYearService.get_previous_reporting_years()
        year_values = sorted({reporting_year.reporting_year for reporting_year in reporting_years})
        timelines = list(
            OperationDesignatedOperatorTimeline.objects.select_related("operation")
            .filter(
                Q(end_date__year__gt=year_values[0]) | Q(end_date__isnull=True),
                operator_id=user_operator.operator_id,
                operation__status=Operation.Statuses.REGISTERED,
                start_date__year__lte=year_values[-1],
            )
            .order_by("operation__name")
        )

        existing_reports = set(
            Report.objects.filter(
                operation_id__in={timeline.operation_id for timeline in timelines},
                reporting_year__reporting_year__in=year_values,
            ).values_list("operation_id", "reporting_year__reporting_year")
        )

        reportable_operations: list[dict] = []
        seen: set[tuple[UUID, int]] = set()
        for year in year_values:
            for timeline in timelines:
                if timeline.start_date is None or timeline.start_date.year > year:
                    continue
                if timeline.end_date is not None and timeline.end_date.year <= year:
                    continue

                operation_year = (timeline.operation_id, year)
                if operation_year in existing_reports or operation_year in seen:
                    continue

                seen.add(operation_year)
                reportable_operations.append(
                    cls._build_reportable_operation_row(
                        timeline.operation,
                        year,
                    )
                )

        return reportable_operations
```
