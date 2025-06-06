import re
from typing import Optional
from uuid import UUID
import uuid
from django.db import models
from common.enums import Schemas
from registration.constants import BORO_ID_REGEX
from registration.enums.enums import RegistrationTableNames
from registration.models import (
    TimeStampedModel,
    Operator,
    NaicsCode,
    Contact,
    RegulatedProduct,
    Activity,
    BcObpsRegulatedOperation,
    UserOperator,
    OptedInOperationDetail,
)

from registration.models.business_role import BusinessRole
from django.db.models import QuerySet
from simple_history.models import HistoricalRecords
from django.utils import timezone
from django.core.exceptions import ValidationError
from registration.models.document import Document
from registration.models.document_type import DocumentType
from registration.models.rls_configs.operation import Rls as OperationRls
import pgtrigger


class Operation(TimeStampedModel):
    class Purposes(models.TextChoices):
        REPORTING_OPERATION = 'Reporting Operation'
        OBPS_REGULATED_OPERATION = 'OBPS Regulated Operation'
        OPTED_IN_OPERATION = 'Opted-in Operation'
        NEW_ENTRANT_OPERATION = 'New Entrant Operation'
        ELECTRICITY_IMPORT_OPERATION = 'Electricity Import Operation'
        POTENTIAL_REPORTING_OPERATION = 'Potential Reporting Operation'

    class Statuses(models.TextChoices):
        NOT_STARTED = "Not Started"
        DRAFT = "Draft"
        REGISTERED = "Registered"
        DECLINED = "Declined"

    class DateOfFirstShipmentChoices(models.TextChoices):
        ON_OR_BEFORE_MARCH_31_2024 = "On or before March 31, 2024"
        ON_OR_AFTER_APRIL_1_2024 = "On or after April 1, 2024"

    class Types(models.TextChoices):
        LFO = "Linear Facilities Operation"
        SFO = "Single Facility Operation"
        EIO = "Electricity Import Operation"

    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, db_comment="Primary key to identify the operation", verbose_name="ID"
    )
    name = models.CharField(max_length=1000, db_comment="The name of an operation")
    type = models.CharField(max_length=1000, choices=Types, db_comment="The type of an operation")
    operator = models.ForeignKey(
        Operator,
        on_delete=models.PROTECT,
        db_comment="The operator who owns the operation",
        related_name="operations",
    )
    naics_code = models.ForeignKey(
        NaicsCode,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        db_comment="This column refers to an operation's primary NAICS code.",
        related_name='operations',
    )
    secondary_naics_code = models.ForeignKey(
        NaicsCode,
        on_delete=models.DO_NOTHING,
        null=True,
        blank=True,
        db_comment="This column refers to an operation's secondary NAICS code.",
        related_name='operations_naics_secondary',
    )
    tertiary_naics_code = models.ForeignKey(
        NaicsCode,
        on_delete=models.DO_NOTHING,
        null=True,
        blank=True,
        db_comment="This column refers to an operation's tertiary NAICS code.",
        related_name='operations_naics_tertiary',
    )
    swrs_facility_id = models.IntegerField(
        db_comment="An operation's SWRS facility ID. Only needed if the operation submitted a report the previous year.",
        blank=True,
        null=True,
    )
    bcghg_id = models.OneToOneField(
        "BcGreenhouseGasId",
        on_delete=models.PROTECT,
        max_length=1000,
        db_comment="An operation's BCGHG identifier.",
        blank=True,
        null=True,
    )
    submission_date = models.DateTimeField(
        db_comment="The time the user submitted the operation registration request",
        blank=True,
        null=True,
    )
    contacts = models.ManyToManyField(
        Contact,
        blank=True,
        related_name='operations_contacts',
    )
    status = models.CharField(
        max_length=1000,
        choices=Statuses.choices,
        default=Statuses.NOT_STARTED,
        db_comment="The status of an operation in the app (e.g. pending review)",
    )
    # Setting this to OneToOneField instead of ForeignKey because we want to enforce that there is only one BORO ID per operation
    bc_obps_regulated_operation = models.OneToOneField(
        "BcObpsRegulatedOperation",
        on_delete=models.PROTECT,
        blank=True,
        null=True,
        db_comment="The BC OBPS regulated operation ID of an operation when operation is approved",
    )
    regulated_products = models.ManyToManyField(
        RegulatedProduct,
        blank=True,
        related_name='%(class)ss',
    )
    activities = models.ManyToManyField(
        Activity,
        blank=True,
        related_name='%(class)ss',
    )
    opted_in_operation = models.OneToOneField(
        OptedInOperationDetail,
        blank=True,
        null=True,
        on_delete=models.SET_NULL,
        db_comment="Details about the operation if it is opted in",
        related_name="operation",
    )
    date_of_first_shipment = models.CharField(
        max_length=1000,
        blank=True,
        null=True,
        choices=DateOfFirstShipmentChoices.choices,
        db_comment="The date of the operation's first shipment (determines which application and statutory declaration template should be used)",
    )
    registration_purpose = models.CharField(
        max_length=1000,
        choices=Purposes.choices,
        null=True,
        blank=True,
        db_comment="The industry user-selected registration purpose (category). This field is only relevant to Registration 2 module (where it is required for an operation to be registered).",
    )
    history = HistoricalRecords(
        table_name='erc_history"."operation_history',
        m2m_fields=[regulated_products, activities, contacts],
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "Table containing information about operations. 'Industrial operation' means one or more facilities, or a prescribed activity, to which greenhouse gas emissions are attributable, subject to subsection (3)of the Greenhouse Gas Industrial Reporting and Control Act: https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/14029_01#section1."
        db_table = f'{Schemas.ERC.value}"."{RegistrationTableNames.OPERATION.value}'
        constraints = [
            models.UniqueConstraint(
                fields=["swrs_facility_id"],
                name="swrs_facility_id_unique_constraint",
            )
        ]
        indexes = [
            models.Index(fields=["status"], name="operation_status_idx"),
        ]
        triggers = [
            *TimeStampedModel.Meta.triggers,
            pgtrigger.Trigger(
                name="restrict_bcghg_id_unless_registered",
                when=pgtrigger.Before,
                operation=pgtrigger.Insert | pgtrigger.Update,
                condition=pgtrigger.Q(new__bcghg_id__isnull=False),
                func="""
                    if new.status != 'Registered' and
                       (tg_op = 'insert' or new.bcghg_id_id is distinct from old.bcghg_id_id) then
                        raise exception 'Cannot assign bcghg_id to Operation unless status is Registered';
                    end if;
                    return new;
                """,
            ),
            pgtrigger.Trigger(
                name="restrict_boro_id_unless_registered",
                when=pgtrigger.Before,
                operation=pgtrigger.Insert | pgtrigger.Update,
                condition=pgtrigger.Q(new__bc_obps_regulated_operation__isnull=False),
                func="""
                    if new.status != 'Registered' and
                        (tg_op = 'insert' or new.bc_obps_regulated_operation_id is distinct from old.bc_obps_regulateD_operation_id) then
                            raise exception 'Cannot assign bc_obps_regulated_operation to Operation unless status is Registered';
                    end if;
                    return new;
                """,
            ),
        ]

    Rls = OperationRls

    def get_new_entrant_application(self) -> Optional[Document]:
        """
        Returns the new entrant application document associated with the operation (document only exists if the operation has registered as a New Entrant).
        """

        return (
            self.documents.filter(type=DocumentType.objects.get(name="new_entrant_application"))
            .only('file', 'status')
            .first()
        )

    def get_boundary_map(self) -> Optional[Document]:
        """
        Returns the boundary map document associated with the operation.
        """

        return self.documents.filter(type=DocumentType.objects.get(name="boundary_map")).only('file', 'status').first()

    def get_process_flow_diagram(self) -> Optional[Document]:
        """
        Returns the process flow diagram document associated with the operation.
        """

        return (
            self.documents.filter(type=DocumentType.objects.get(name="process_flow_diagram"))
            .only('file', 'status')
            .first()
        )

    def get_operation_representatives(self) -> QuerySet[Contact]:
        """
        Returns the operation representatives associated with the operation.
        """
        return self.contacts.filter(business_role=BusinessRole.objects.get(role_name='Operation Representative'))

    def user_has_access(self, user_guid: UUID) -> bool:
        """
        Returns whether a user has access to the operation.
        """
        return (
            UserOperator.objects.only('user__user_guid', 'operator__id')
            .select_related('operator', 'user')
            .filter(user_id=user_guid, operator_id=self.operator_id, status=UserOperator.Statuses.APPROVED)
            .exists()
        )

    def generate_unique_boro_id(self, user_guid: UUID) -> None:
        """
        Generate a unique BC OBPS regulated operation ID based on the current year and the latest BORO ID.
        """

        # if the operation already has a BORO ID, do nothing
        if self.bc_obps_regulated_operation:
            return None

        current_year_last_digits = timezone.now().year % 100  # Get the last two digits of the current year

        latest_boro_id = BcObpsRegulatedOperation.objects.order_by('-id').values_list('id', flat=True).first()

        latest_number = 1
        if latest_boro_id:
            latest_latest_boro_id_year, latest_boro_id_number = map(int, latest_boro_id.split('-'))
            # Check if the latest BORO ID is from the current year
            if latest_latest_boro_id_year == current_year_last_digits:
                latest_number = latest_boro_id_number + 1

        new_boro_id = (
            f"{current_year_last_digits}-{latest_number:04d}"  # Pad the number with zeros to make it 4 digits long
        )

        if not re.match(BORO_ID_REGEX, new_boro_id):
            raise ValidationError("Generated BORO ID is not in the correct format.")
        if Operation.objects.filter(bc_obps_regulated_operation__pk=new_boro_id).exists():
            raise ValidationError("Generated BORO ID is not unique.")

        new_boro_id_instance = BcObpsRegulatedOperation.objects.create(id=new_boro_id, issued_by_id=user_guid)
        self.bc_obps_regulated_operation = new_boro_id_instance

    def generate_unique_bcghg_id(self, user_guid: UUID) -> None:
        from registration.models.utils import generate_unique_bcghg_id_for_operation_or_facility

        generate_unique_bcghg_id_for_operation_or_facility(self, user_guid)

    @property
    def is_regulated_operation(self) -> bool:
        """
        Returns a boolean that describes whether the operation is regulated or not.
        """
        return self.registration_purpose in [
            Operation.Purposes.OBPS_REGULATED_OPERATION,
            Operation.Purposes.NEW_ENTRANT_OPERATION,
            Operation.Purposes.OPTED_IN_OPERATION,
        ]

    def __str__(self) -> str:
        return f"{self.name} ({self.id})"
