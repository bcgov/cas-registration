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
    ReportingActivity,
    BcObpsRegulatedOperation,
    DocumentType,
    UserOperator,
)
from simple_history.models import HistoricalRecords
from django.utils import timezone
from django.core.exceptions import ValidationError


class Operation(TimeStampedModel):
    """Operation model"""

    class Statuses(models.TextChoices):
        NOT_STARTED = "Not Started"
        DRAFT = "Draft"
        PENDING = "Pending"
        APPROVED = "Approved"
        DECLINED = "Declined"
        CHANGES_REQUESTED = "Changes Requested"

    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, db_comment="Primary key to identify the operation", verbose_name="ID"
    )
    name = models.CharField(
        max_length=1000, db_comment="The name of an operation"
    )  # TODO: Delete this once we added the data migration for ownership
    type = models.CharField(
        max_length=1000, db_comment="The type of an operation"
    )  # TODO: Delete this once we added the data migration for ownership
    operator = models.ForeignKey(
        Operator,
        on_delete=models.DO_NOTHING,
        db_comment="The operator who owns the operation",
        related_name="operations",
    )  # TODO: Delete this once we added the data migration for ownership
    operation_has_multiple_operators = models.BooleanField(
        db_comment="Whether or not the operation has multiple operators", default=False
    )  # TODO: Delete this once we added the data migration for ownership

    naics_code = models.ForeignKey(
        NaicsCode,
        on_delete=models.DO_NOTHING,
        null=True,
        db_comment="An operation's NAICS code",
        related_name='operations',
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
    )  # TODO: Delete this once we added the data migration for ownership

    verified_at = models.DateTimeField(
        db_comment="The time the operation was verified by an IRC user. If exists, the operation is registered for OBPS.",
        blank=True,
        null=True,
    )
    verified_by = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
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
    )  # TODO: Delete this once we added the data migration for ownership
    point_of_contact = models.ForeignKey(
        Contact,
        on_delete=models.DO_NOTHING,
        related_name="operations",
        blank=True,
        null=True,
        db_comment="Foreign key to the contact that is the point of contact",
    )  # TODO: Delete this once we added the data migration for ownership
    status = models.CharField(
        max_length=1000,
        choices=Statuses.choices,
        default=Statuses.NOT_STARTED,
        db_comment="The status of an operation in the app (e.g. pending review)",
    )
    # Setting this to OneToOneField instead of ForeignKey because we want to enforce that there is only one BORO ID per operation
    bc_obps_regulated_operation = models.OneToOneField(
        "BcObpsRegulatedOperation",
        on_delete=models.DO_NOTHING,
        blank=True,
        null=True,
        db_comment="The BC OBPS regulated operation ID of an operation when operation is approved",
    )
    regulated_products = models.ManyToManyField(
        RegulatedProduct,
        blank=True,
        related_name='%(class)ss',
    )  # TODO: Delete this once we added the data migration for ownership
    reporting_activities = models.ManyToManyField(
        ReportingActivity,
        blank=True,
        related_name='%(class)ss',
    )  # TODO: Delete this once we added the data migration for ownership
    history = HistoricalRecords(
        table_name='erc_history"."operation_history',
        m2m_fields=[regulated_products, reporting_activities, documents],
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
            models.Index(fields=["operator"], name="operator_idx"),
            models.Index(fields=["naics_code"], name="naics_code_idx"),
            models.Index(fields=["verified_by"], name="operation_verified_by_idx"),
            models.Index(fields=["created_at"], name="operation_created_at_idx"),
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

    # def __str__(self) -> str:
    #     fields = [f"{field.name}={getattr(self, field.name)}" for field in self._meta.fields]
    #     return ' - '.join(fields)

    @property
    def current_owner(self) -> Operator:
        """
        Returns the current owner of the operation.
        """
        return self.ownerships.get(end_date__isnull=True).operator
