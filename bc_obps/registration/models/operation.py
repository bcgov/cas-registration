from typing import Optional
import re
from uuid import UUID
import uuid
from django.db import models
from registration.constants import BORO_ID_REGEX
from registration.models import (
    TimeStampedModel,
    Operator,
    NaicsCode,
    User,
    Document,
    Contact,
    RegulatedProduct,
    Activity,
    BcObpsRegulatedOperation,
    DocumentType,
    UserOperator,
    OptedInOperationDetail,
    NewEntrantOperationDetail,
)
from simple_history.models import HistoricalRecords
from django.utils import timezone
from django.core.exceptions import ValidationError


class Operation(TimeStampedModel):
    class Statuses(models.TextChoices):
        NOT_STARTED = "Not Started"
        DRAFT = "Draft"
        PENDING = "Pending"
        APPROVED = "Approved"
        DECLINED = "Declined"
        CHANGES_REQUESTED = "Changes Requested"
        REGISTERED = "Registered"
        TRANSFERRED = "Transferred"
        CLOSED = "Closed"
        TEMPORARILY_SHUTDOWN = "Temporarily Shutdown"

    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, db_comment="Primary key to identify the operation", verbose_name="ID"
    )
    name = models.CharField(max_length=1000, db_comment="The name of an operation")
    type = models.CharField(max_length=1000, db_comment="The type of an operation")
    operator = models.ForeignKey(
        Operator,
        on_delete=models.PROTECT,
        db_comment="The operator who owns the operation",
        related_name="operations",
    )
    operation_has_multiple_operators = models.BooleanField(
        db_comment="Whether or not the operation has multiple operators", default=False
    )

    naics_code = models.ForeignKey(
        NaicsCode,
        on_delete=models.PROTECT,
        null=True,
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
    bcghg_id = models.CharField(
        max_length=1000,
        db_comment="An operation's BCGHG identifier. Only needed if the operation submitted a report the previous year.",
        blank=True,
        null=True,
    )

    opt_in = models.BooleanField(
        db_comment="Whether or not the operation is required to register or is simply opting in. Only needed if the operation did not report the previous year.",
        blank=True,
        null=True,
    )

    verified_at = models.DateTimeField(
        db_comment="The time the operation was verified by an IRC user. If exists, the operation is registered for OBPS.",
        blank=True,
        null=True,
    )
    verified_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        db_comment="The IRC user who verified the operator",
        blank=True,
        null=True,
        related_name="operation_verified_by",
    )
    submission_date = models.DateTimeField(
        db_comment="The time the user submitted the operation registration request",
        blank=True,
        null=True,
    )
    documents = models.ManyToManyField(
        Document,
        blank=True,
        related_name="operations",
    )
    point_of_contact = models.ForeignKey(
        Contact,
        on_delete=models.PROTECT,
        related_name="operations",
        blank=True,
        null=True,
        db_comment="Foreign key to the contact that is the point of contact (point of contact is only used in registration 1)",
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

    new_entrant_operation = models.OneToOneField(
        NewEntrantOperationDetail,
        blank=True,
        null=True,
        on_delete=models.SET_NULL,
        db_comment="Details about the operation if it is a new entrant",
        related_name="operation",
    )
    history = HistoricalRecords(
        table_name='erc_history"."operation_history',
        m2m_fields=[regulated_products, activities, documents],
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Table containing information about operations. 'Industrial operation' means one or more facilities, or a prescribed activity, to which greenhouse gas emissions are attributable, subject to subsection (3)of the Greenhouse Gas Industrial Reporting and Control Act: https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/14029_01#section1."
        db_table = 'erc"."operation'
        constraints = [
            models.UniqueConstraint(
                fields=["swrs_facility_id"],
                name="swrs_facility_id_unique_constraint",
            )
        ]
        indexes = [
            models.Index(fields=["status"], name="operation_status_idx"),
        ]

    def get_statutory_declaration(self) -> Optional[Document]:
        """
        Returns the statutory declaration associated with the operation.
        """

        return (
            self.documents.filter(type=DocumentType.objects.get(name="signed_statutory_declaration"))
            .only('file')
            .first()
        )  # filter returns a queryset, so we use .first() to get the single record (there will only ever be one statutory declaration per operation)

    def get_boundary_map(self) -> Optional[Document]:
        """
        Returns the boundary map document associated with the operation.
        """

        return self.documents.filter(type=DocumentType.objects.get(name="boundary_map")).only('file').first()

    def get_process_flow_diagram(self) -> Optional[Document]:
        """
        Returns the process flow diagram document associated with the operation.
        """

        return self.documents.filter(type=DocumentType.objects.get(name="process_flow_diagram")).only('file').first()

    def get_new_entrant_application(self) -> Optional[Document]:
        """
        Returns the new entrant application document associated with the operation (document only exists if the operation has registered as a New Entrant).
        """

        return self.documents.filter(type=DocumentType.objects.get(name="new_entrant_application")).only('file').first()

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

    def generate_unique_boro_id(self) -> None:
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

        new_boro_id_instance = BcObpsRegulatedOperation.objects.create(id=new_boro_id)
        self.bc_obps_regulated_operation = new_boro_id_instance

    @property
    def current_designated_operator(self) -> Operator:
        """
        Returns the current designated operator of the operation.
        """
        return self.designated_operators.get(end_date__isnull=True).operator
