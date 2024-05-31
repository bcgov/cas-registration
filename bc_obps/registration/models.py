from typing import List, Optional
import re
import typing
from uuid import UUID
import uuid
from common.models import BaseModel
from django.db import models
from phonenumber_field.modelfields import PhoneNumberField
from localflavor.ca.models import CAPostalCodeField, CAProvinceField
from registration.constants import (
    BC_CORPORATE_REGISTRY_REGEX,
    BC_CORPORATE_REGISTRY_REGEX_MESSAGE,
    CRA_BUSINESS_NUMBER_MESSAGE,
    BORO_ID_REGEX,
    USER_CACHE_PREFIX,
)
from simple_history.models import HistoricalRecords
from django.core.validators import RegexValidator, MaxValueValidator, MinValueValidator
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.core.files.storage import default_storage
from django.core.cache import cache


class TimeStampedModelManager(models.Manager):
    def get_queryset(self) -> models.QuerySet:
        """Return only objects that have not been archived"""
        return super().get_queryset().filter(archived_at__isnull=True)


class TimeStampedModel(BaseModel):
    created_by = models.ForeignKey(
        'User', null=True, blank=True, on_delete=models.PROTECT, related_name='%(class)s_created'
    )
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_by = models.ForeignKey(
        'User', on_delete=models.PROTECT, null=True, blank=True, related_name='%(class)s_updated'
    )
    updated_at = models.DateTimeField(null=True, blank=True)
    archived_by = models.ForeignKey(
        'User', on_delete=models.PROTECT, null=True, blank=True, related_name='%(class)s_archived'
    )
    archived_at = models.DateTimeField(null=True, blank=True)
    objects = TimeStampedModelManager()

    class Meta:
        abstract = True

    def set_create_or_update(self, modifier_pk: UUID) -> None:
        """
        Set the created by field if it is not already set.
        Otherwise, set the updated by field and updated at field.
        """
        if not self.created_by_id:  # created_at is automatically set by auto_now_add
            self.__class__.objects.filter(pk=self.pk).update(created_by_id=modifier_pk)
        else:
            self.__class__.objects.filter(pk=self.pk).update(updated_by_id=modifier_pk, updated_at=timezone.now())

    def set_archive(self, modifier_pk: UUID) -> None:
        """Set the archived by field and archived at field if they are not already set."""
        if self.archived_by_id or self.archived_at:
            raise ValueError("Archived by or archived at is already set.")
        self.__class__.objects.filter(pk=self.pk).update(archived_by_id=modifier_pk, archived_at=timezone.now())

    @property
    def _history_user(self) -> Optional['User']:
        return self.archived_by or self.updated_by or self.created_by


class AppRole(BaseModel):
    """AppRole model"""

    role_name = models.CharField(
        primary_key=True,
        serialize=False,
        db_comment='The name identifying the role assigned to a user. This role defines their permissions within the app. Also acts as the primary key.',
        max_length=100,
    )
    role_description = models.CharField(db_comment='Description of the app role', max_length=1000)
    history = HistoricalRecords(
        table_name='erc_history"."app_role_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "This table contains the definitions for roles within the BCIERs apps. These roles are used to define the permissions a user has within BCIERs apps."
        db_table = 'erc"."app_role'

    # We need try/except blocks here because the app_role table may not exist yet when we run migrations
    @staticmethod
    def get_authorized_irc_roles() -> List[str]:
        """
        Return the roles that are considered as authorized CAS users (excluding cas_pending).
        """
        try:
            return list(
                AppRole.objects.filter(role_name__in=["cas_admin", "cas_analyst"]).values_list("role_name", flat=True)
            )
        except Exception:
            return []

    @staticmethod
    def get_all_app_roles() -> List[str]:
        """
        Return all the roles in the app.
        """
        try:
            return list(AppRole.objects.values_list("role_name", flat=True))
        except Exception:
            return []

    @staticmethod
    def get_all_authorized_app_roles() -> List[str]:
        """
        Return all the roles in the app except cas_pending.
        """
        try:
            return list(AppRole.objects.exclude(role_name="cas_pending").values_list("role_name", flat=True))
        except Exception:
            return []


class DocumentType(BaseModel):
    """Document type model"""

    name = models.CharField(
        max_length=1000,
        db_comment="Name of document type (e.g. opt in signed statutory declaration)",
    )
    history = HistoricalRecords(
        table_name='erc_history"."document_type_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Table that contains types of documents."
        db_table = 'erc"."document_type'


class Document(TimeStampedModel):
    """Document model"""

    file = models.FileField(upload_to="documents", db_comment="The file format, metadata, etc.")
    type = models.ForeignKey(
        DocumentType,
        on_delete=models.DO_NOTHING,
        related_name="documents",
        db_comment="Type of document, e.g., boundary map",
    )
    description = models.CharField(max_length=1000, blank=True, null=True, db_comment="Description of the document")
    history = HistoricalRecords(
        table_name='erc_history"."document_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = (
            "Table that contains information about documents such as file metadata, type, and description."
        )
        db_table = 'erc"."document'
        indexes = [
            models.Index(fields=["type"], name="document_type_idx"),
        ]

    @typing.no_type_check
    def delete(self, *args, **kwargs):
        # Delete the file from Google Cloud Storage before deleting the model instance
        if self.file:
            default_storage.delete(self.file.name)

        super().delete(*args, **kwargs)


class NaicsCode(BaseModel):
    """NAICS code model"""

    naics_code = models.CharField(max_length=1000, db_comment="NAICS code")
    naics_description = models.CharField(max_length=1000, db_comment="Description of the NAICS code")
    history = HistoricalRecords(
        table_name='erc_history"."naics_code_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Table contains NAICS codes & their descriptions. NAICS code means the 6-digit code applicable to one or more producing units within a reporting operation under the North American Industrial Classification System (NAICS) Canada, 2007, published by Statistics Canada. Operations can have more than one NAICS code. More information, including version history for NAICS codes can be found at https://www.statcan.gc.ca/en/concepts/industry."
        db_table = 'erc"."naics_code'

    @typing.no_type_check
    def save(self, *args, **kwargs):
        """
        Override the save method to clear the cache when/if the NAICS code is saved.
        """
        cache.delete('naics_codes')
        super().save(*args, **kwargs)


class RegulatedProduct(BaseModel):
    """Regulated products model"""

    name = models.CharField(max_length=1000, db_comment="The name of a regulated product")
    history = HistoricalRecords(
        table_name='erc_history"."regulated_product_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Table containing the names of regulated products. Regulated product means a product listed in column 2 of Table 2 of Schedule A.1 of the Greenhouse Gas Industrial Reporting and Control Act: https://www.bclaws.gov.bc.ca/civix/document/id/lc/statreg/249_2015."
        db_table = 'erc"."regulated_product'

    def __str__(self) -> str:
        return self.name

    @typing.no_type_check
    def save(self, *args, **kwargs):
        """
        Override the save method to clear the cache when/if the regulated product is saved.
        """
        cache.delete('regulated_products')
        super().save(*args, **kwargs)


class ReportingActivity(BaseModel):
    """Reporting activity model"""

    class Applicability(models.TextChoices):
        SFO = "sfo"
        LFO = "lfo"
        ALL = "all"

    name = models.CharField(max_length=1000, db_comment="The name of a reporting activity")
    applicable_to = models.CharField(
        max_length=1000, choices=Applicability.choices, db_comment="Which type of facility the activity applies to"
    )
    history = HistoricalRecords(
        table_name='erc_history"."reporting_activity_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Table containing names activities. If facilities carry out these activities, in many cases they are required to report. Some activities can only be carried out by certain types of facilities. Reporting activities are listed in column 2 of Table 1 of Schedule A of the Greenhouse Gas Industrial Reporting and Control Act: https://www.bclaws.gov.bc.ca/civix/document/id/lc/statreg/249_2015."
        db_table = 'erc"."reporting_activity'

    def __str__(self) -> str:
        return f"{self.name} ({self.applicable_to})"


class Address(BaseModel):
    """Address model"""

    street_address = models.CharField(
        max_length=1000, null=True, blank=True, db_comment="Street address of relevant location)"
    )
    municipality = models.CharField(
        max_length=1000, null=True, blank=True, db_comment="Municipality of relevant location"
    )
    province = CAProvinceField(
        db_comment="Province of the relevant location, restricted to two-letter province postal abbreviations",
        null=True,
        blank=True,
    )
    postal_code = CAPostalCodeField(
        db_comment="Postal code of relevant location, limited to valid Canadian postal codes", null=True, blank=True
    )
    history = HistoricalRecords(
        table_name='erc_history"."address_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Table containing address data. Only Canadian addresses are supported."
        db_table = 'erc"."address'


class UserAndContactCommonInfo(BaseModel):
    """User and contact common information abstract base class"""

    first_name = models.CharField(max_length=1000, db_comment="A user or contact's first name")
    last_name = models.CharField(max_length=1000, db_comment="A user or contact's last name")
    position_title = models.CharField(max_length=1000, db_comment="A user or contact's position title")
    email = models.EmailField(max_length=254, db_comment="A user or contact's email, limited to valid emails")
    phone_number = PhoneNumberField(
        blank=True,
        db_comment="A user or contact's phone number, limited to valid phone numbers",
    )

    class Meta:
        abstract = True
        db_table_comment = "An abstract base class (used for putting common information into a number of other models) containing fields for users and contacts."

    def get_full_name(self) -> str:
        """
        Return the full name of the user or contact.
        """
        return f"{self.first_name} {self.last_name}"


class User(UserAndContactCommonInfo):
    """User model"""

    user_guid = models.UUIDField(primary_key=True, db_comment="A GUID to identify the user")
    business_guid = models.UUIDField(db_comment="A GUID to identify the business")
    bceid_business_name = models.CharField(
        max_length=1000,
        db_comment="The name of the business the user is associated with as per their Business BCeID account",
    )
    documents = models.ManyToManyField(
        Document,
        blank=True,
        related_name="users",
    )
    app_role = models.ForeignKey(
        AppRole,
        on_delete=models.DO_NOTHING,
        related_name="users",
        db_comment="The role assigned to this user which defines the permissions the use has.",
    )
    history = HistoricalRecords(
        table_name='erc_history"."user_history',
        m2m_fields=[documents],
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Table containing information about app users. Industry users are all associated with a business and are identified via their Business BCEID."
        db_table = 'erc"."user'
        constraints = [
            models.UniqueConstraint(
                fields=["user_guid", "business_guid"],
                name="uuid_user_and_business_constraint",
            )
        ]
        indexes = [
            models.Index(fields=["app_role"], name="user_app_role_idx"),
        ]

    def is_irc_user(self) -> bool:
        """
        Return whether or not the user is an IRC user.
        """
        return self.app_role.role_name in AppRole.get_authorized_irc_roles()

    def is_industry_user(self) -> bool:
        """
        Return whether or not the user is an industry user.
        """
        return self.app_role.role_name == "industry_user"

    def get_approved_user_operator(self) -> Optional['UserOperator']:
        """
        Return the approved UserOperator record associated with the user.
        Based on the Constraint, there should only be one UserOperator associated with a user and operator.
        """
        return self.user_operators.only("operator_id").filter(status=UserOperator.Statuses.APPROVED).first()

    @typing.no_type_check
    def save(self, *args, **kwargs) -> None:
        """
        Override the save method to clear the cache when the user is saved.
        """
        cache_key = f"{USER_CACHE_PREFIX}{self.user_guid}"
        cache.delete(cache_key)
        super().save(*args, **kwargs)


class BusinessRole(BaseModel):
    """
    Roles that a Contact can have within an operator/operation
    """

    role_name = models.CharField(
        primary_key=True,
        serialize=False,
        db_comment='The name identifying the role assigned to a Contact. Also acts as the primary key.',
        max_length=100,
    )
    role_description = models.CharField(db_comment='Description of the business role', max_length=1000)
    history = HistoricalRecords(
        table_name='erc_history"."business_role_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "This table contains the definitions for roles within the operator/operation. These roles are used to define the permissions a user has within the operator/operation."
        db_table = 'erc"."business_role'


class Contact(UserAndContactCommonInfo, TimeStampedModel):
    """Contact model"""

    documents = models.ManyToManyField(
        Document,
        blank=True,
        related_name="contacts",
    )
    business_role = models.ForeignKey(
        BusinessRole,
        on_delete=models.DO_NOTHING,
        related_name="contacts",
        db_comment="The role assigned to this contact which defines the permissions the contact has.",
    )
    address = models.ForeignKey(
        Address,
        blank=True,
        null=True,
        on_delete=models.DO_NOTHING,
        db_comment="Foreign key to the address of a user or contact",
        related_name="contacts",
    )

    history = HistoricalRecords(
        table_name='erc_history"."contact_history',
        m2m_fields=[documents],
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Table containing information about contacts. Contacts are people that IRC may need to get in touch with to confirmation information about industry. Contacts can be BCIERs app users (in which case they will also have a record in the Users table), but they don't have to be."
        db_table = 'erc"."contact'
        indexes = [
            models.Index(fields=["business_role"], name="contact_role_idx"),
        ]

    # def __str__(self) -> str:
    #     fields = [f"{field.name}={getattr(self, field.name)}" for field in self._meta.fields]
    #     return ' - '.join(fields)


class BusinessStructure(BaseModel):
    """The business structure of an operator"""

    name = models.CharField(primary_key=True, max_length=1000, db_comment="The name of a business structure")
    history = HistoricalRecords(
        table_name='erc_history"."business_structure_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Table containing operator business structures. Business structure refers to the legal and organizational framework under which a business operates (e.g., partnership, sole proprietorship, corporation, limited liability company)."
        db_table = 'erc"."business_structure'

    @typing.no_type_check
    def save(self, *args, **kwargs):
        """
        Override the save method to clear the cache when the business structure is saved.
        """
        cache.delete('business_structures')
        super().save(*args, **kwargs)


class Operator(TimeStampedModel):
    """Operator model"""

    class Statuses(models.TextChoices):
        DRAFT = "Draft"
        PENDING = "Pending"
        APPROVED = "Approved"
        DECLINED = "Declined"
        CHANGES_REQUESTED = "Changes Requested"

    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, db_comment="Primary key to identify the operator", verbose_name="ID"
    )
    legal_name = models.CharField(max_length=1000, db_comment="The legal name of an operator", unique=True)
    trade_name = models.CharField(max_length=1000, blank=True, db_comment="The trade name of an operator")
    cra_business_number = models.IntegerField(
        validators=[
            MaxValueValidator(999999999, message=CRA_BUSINESS_NUMBER_MESSAGE),
            MinValueValidator(100000000, message=CRA_BUSINESS_NUMBER_MESSAGE),  # Assuming  9-digit number
        ],
        db_comment="The CRA business number of an operator",
    )
    swrs_organisation_id = models.IntegerField(
        db_comment="An identifier used in the CIIP/SWRS dataset (in swrs: organisation = operator). This identifier will only be populated for operators that were imported from that dataset.",
        blank=True,
        null=True,
    )
    bc_corporate_registry_number = models.CharField(
        db_comment="The BC corporate registry number of an operator",
        null=True,
        unique=True,
        validators=[RegexValidator(regex=BC_CORPORATE_REGISTRY_REGEX, message=BC_CORPORATE_REGISTRY_REGEX_MESSAGE)],
    )
    business_structure = models.ForeignKey(
        BusinessStructure,
        on_delete=models.DO_NOTHING,
        null=True,
        blank=True,
        db_comment="The business structure of an operator",
        related_name="operators",
    )
    physical_address = models.ForeignKey(
        Address,
        on_delete=models.DO_NOTHING,
        null=True,
        db_comment="The physical address of an operator (where the operator is physically located)",
        related_name="operators_physical",
    )
    mailing_address = models.ForeignKey(
        Address,
        on_delete=models.DO_NOTHING,
        db_comment="The mailing address of an operator",
        related_name="operators_mailing",
        blank=True,
        null=True,
    )
    website = models.URLField(
        max_length=200,
        db_comment="The website address of an operator",
        blank=True,
        null=True,
    )

    documents = models.ManyToManyField(
        Document,
        blank=True,
        related_name="operators",
    )
    contacts = models.ManyToManyField(
        Contact,
        blank=True,
        related_name="operators",
    )
    status = models.CharField(
        max_length=1000,
        choices=Statuses.choices,
        default=Statuses.DRAFT,
        db_comment="The status of an operator in the app (e.g. draft)",
    )
    verified_at = models.DateTimeField(
        db_comment="The time an operator was verified by an IRC user",
        blank=True,
        null=True,
    )
    verified_by = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
        db_comment="The IRC user who verified the operator",
        blank=True,
        null=True,
        related_name="operators_verified_by",
    )
    is_new = models.BooleanField(
        db_comment="Flag to indicate whether CAS internal staff need to explicitly approve the Operator at the same time that they're approving the request for prime admin access. (If a prime admin is requesting access to an existing operator, then the operator is not new and does need to be approved.)",
        default=True,
    )
    history = HistoricalRecords(
        table_name='erc_history"."operator_history',
        m2m_fields=[documents, contacts],
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["cra_business_number"],
                name="cra_business_number_unique_constraint",
            )
        ]
        db_table_comment = "Table containing operator information. An operator is the person who owns and/or controls and directs industrial operations. An operator can own multiple operations. For more information see definitions in the Greenhouse Gas Industrial Reporting and Control Act: https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/14029_01#section1: https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/14029_01#section1"
        db_table = 'erc"."operator'

    # def __str__(self) -> str:
    #     fields = [f"{field.name}={getattr(self, field.name)}" for field in self._meta.fields]
    #     return ' - '.join(fields)


class UserOperator(TimeStampedModel):
    """User operator model"""

    class Roles(models.TextChoices):
        ADMIN = "admin", "Admin"
        REPORTER = "reporter", "Reporter"
        PENDING = "pending", "Pending"

    class Statuses(models.TextChoices):
        PENDING = "Pending"
        APPROVED = "Approved"
        DECLINED = "Declined"

    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, db_comment="Primary key to identify the user operator", verbose_name="ID"
    )
    user_friendly_id = models.IntegerField(
        null=True, blank=True, db_comment="A user-friendly ID to identify the user operator"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
        related_name="user_operators",
        db_comment="A user associated with an operator",
    )
    operator = models.ForeignKey(
        Operator,
        on_delete=models.DO_NOTHING,
        db_comment="An operator associated with a user",
        related_name="user_operators",
    )
    role = models.CharField(
        max_length=1000,
        choices=Roles.choices,
        default=Roles.PENDING,
        db_comment="The role of a user associated with an operator (e.g. admin)",
    )
    status = models.CharField(
        max_length=1000,
        choices=Statuses.choices,
        default=Statuses.PENDING,
        db_comment="The status of a user operator in the app (e.g. pending review)",
    )
    verified_at = models.DateTimeField(
        db_comment="The time a user operator was verified by an IRC user",
        blank=True,
        null=True,
    )
    verified_by = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
        db_comment="The IRC user who verified the user operator",
        blank=True,
        null=True,
        related_name="user_operators_verified_by",
    )
    history = HistoricalRecords(
        table_name='erc_history"."user_operator_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Through table to connect Users and Operators and track access requests"
        db_table = 'erc"."user_operator'
        indexes = [
            models.Index(fields=["user"], name="user_operator_user_idx"),
            models.Index(fields=["operator"], name="user_operator_operator_idx"),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "operator"],
                name="user_and_operator_unique_constraint",
            )
        ]

    # def __str__(self) -> str:
    #     fields = [f"{field.name}={getattr(self, field.name)}" for field in self._meta.fields]
    #     return ' - '.join(fields)

    def get_senior_officer(self) -> Optional[Contact]:
        """
        Returns the senior officer associated with the useroperator's operator.
        Assuming that there is only one senior officer per operator.
        """
        return self.operator.contacts.filter(business_role=BusinessRole.objects.get(role_name='Senior Officer')).first()

    def user_is_senior_officer(self) -> bool:
        """
        Verifies whether the useroperator's user is present in the contacts associated with the operator.
        """
        senior_officer = self.get_senior_officer()
        if not senior_officer:
            return False  # if there is no senior officer, then the user is not a senior officer
        user = self.user
        return (
            senior_officer.first_name == user.first_name
            and senior_officer.last_name == user.last_name
            and senior_officer.email == user.email
        )

    @staticmethod
    def get_all_industry_user_operator_roles() -> List[str]:
        """
        Return all UserOperator.role options
        """
        return UserOperator.Roles.values

    @typing.no_type_check
    def save(self, *args, **kwargs):
        # Add a user_friendly_id to the UserOperator if it doesn't already have one
        if not self.user_friendly_id:
            self.user_friendly_id = UserOperator.objects.count() + 1
        super().save(*args, **kwargs)


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


class Facility(TimeStampedModel):
    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, db_comment="Primary key to identify the facility", verbose_name="ID"
    )
    address = models.ForeignKey(
        Address,
        on_delete=models.DO_NOTHING,
        db_comment="The address of the facility",
        blank=True,
        null=True,
        related_name='%(class)s_address',
    )
    swrs_facility_id = models.IntegerField(
        db_comment="A facility's SWRS facility ID.",
        blank=True,
        null=True,
    )
    bcghg_id = models.CharField(
        max_length=1000,
        db_comment="A facility's BCGHG identifier.",
        blank=True,
        null=True,
    )
    history = HistoricalRecords(
        table_name='erc_history"."facility_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Contains data on facilities that emit carbon emissions and must report them to Clean Growth. A linear facility operation is made up of several different facilities whereas a single facility operation has only one facility. In the case of a single facility operation, much of the data in this table will overlap with the parent record in the operation table."
        db_table = 'erc"."facility'
        verbose_name_plural = "Facilities"

    @property
    def current_owner(self) -> Operation:
        """
        Returns the current owner(operation) of the facility.
        """
        return self.ownerships.get(end_date__isnull=True).operation


class WellAuthorizationNumber(TimeStampedModel):
    well_authorization_number = models.IntegerField(
        primary_key=True, db_comment="A well authorization number from the BC Energy Regulator"
    )
    facility = models.ForeignKey(Facility, on_delete=models.DO_NOTHING, related_name="well_authorization_numbers")

    history = HistoricalRecords(
        table_name='erc_history"."well_authorization_number_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "A table containing well authorization numbers. Authorization numbers are assigned by the British Columbia Energy Regulator: https://www.bc-er.ca/what-we-regulate/oil-gas/wells/. Facilities can have multiple well authorization numbers."
        db_table = 'erc"."well_authorization_number'


class MultipleOperator(TimeStampedModel):
    """def here"""

    operation = models.ForeignKey(
        Operation,
        db_comment="The operation that this multiple operator is associated with",
        on_delete=models.DO_NOTHING,
        related_name="multiple_operator",
    )
    operator_index = models.IntegerField(
        db_comment="Index used to differentiate operators for this operation for saving/updating purposes"
    )
    legal_name = models.CharField(max_length=1000, db_comment="The legal name of an operator")
    trade_name = models.CharField(max_length=1000, db_comment="The trade name of an operator")
    cra_business_number = models.IntegerField(db_comment="The CRA business number of an operator")
    bc_corporate_registry_number = models.CharField(
        db_comment="The BC corporate registry number of an operator",
        validators=[RegexValidator(regex=BC_CORPORATE_REGISTRY_REGEX, message=BC_CORPORATE_REGISTRY_REGEX_MESSAGE)],
    )
    business_structure = models.ForeignKey(
        BusinessStructure,
        on_delete=models.DO_NOTHING,
        null=True,
        db_comment="The business structure of an operator",
        related_name="multiple_operator",
    )
    website = models.URLField(
        max_length=200,
        db_comment="The website address of an operator",
        blank=True,
        null=True,
    )
    percentage_ownership = models.DecimalField(
        decimal_places=5,
        max_digits=10,
        db_comment="The percentage of the operation which this operator owns",
        blank=True,
        null=True,
    )
    # TODO: add documents
    # proof_of_authority = models.FileField(
    #     upload_to="documents",
    #     db_comment="",
    #     blank=True,
    #     null=True,
    # )
    physical_address = models.ForeignKey(
        Address,
        on_delete=models.DO_NOTHING,
        db_comment="The physical address of an operator (where the operator is physically located)",
        related_name="multiple_operator_physical",
    )
    mailing_address = models.ForeignKey(
        Address,
        on_delete=models.DO_NOTHING,
        db_comment="The mailing address of an operator",
        related_name="multiple_operator_mailing",
        blank=True,
        null=True,
    )
    mailing_address_same_as_physical = models.BooleanField(
        db_comment="Whether or not the mailing address is the same as the physical address", default=True
    )
    history = HistoricalRecords(
        table_name='erc_history"."multiple_operator_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Table containing data about operations' operators. An operation's designated (primary) operator has a record in the Operator table (this information has been submitted by someone who works for that operator). Any additional operators are stored in this table (additional operator information has been submitted by a user who works for a different operator, so this user should not have access to the Operator table record)."
        db_table = 'erc"."multiple_operator'


class BcObpsRegulatedOperation(BaseModel):
    """BC OBPS Regulated Operation model"""

    id = models.CharField(
        primary_key=True,
        max_length=255,
        db_comment="The BC OBPS regulated operation ID of an operation when operation is approved",
    )
    issued_at = models.DateTimeField(
        auto_now_add=True,
        db_comment="The time the BC OBPS Regulated Operation ID was issued by an IRC user",
    )
    comments = models.TextField(
        blank=True,
        db_comment="Comments from admins in the case that a BC OBPS Regulated Operation ID is revoked",
    )
    history = HistoricalRecords(
        table_name='erc_history"."bc_obps_regulated_operation_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Table to store BC OBPS Regulated Operation metadata. Once an operation has been approved as a BC OBPS Regulated Operations (IRC has determined the operation meets certain criteria and should be included in the program), then it is issued an ID."
        db_table = 'erc"."bc_obps_regulated_operation'

    @typing.no_type_check
    def save(self, *args, **kwargs) -> None:
        """
        Override the save method to set the issued_at field if it is not already set.
        """
        if not re.match(BORO_ID_REGEX, self.id):
            raise ValidationError("Generated BORO ID is not in the correct format.")
        if not self.issued_at:
            self.issued_at = timezone.now()
        super().save(*args, **kwargs)


class ParentOperator(TimeStampedModel):
    """Metadata for parent operators associated with a child operator"""

    child_operator = models.ForeignKey(
        Operator,
        db_comment="The operator that this parent operator is associated with",
        on_delete=models.DO_NOTHING,
        related_name="parent_operators",
    )
    operator_index = models.IntegerField(
        db_comment="Index used to differentiate parent operators for the child operator for saving/updating purposes"
    )
    legal_name = models.CharField(max_length=1000, db_comment="The legal name of an operator")
    trade_name = models.CharField(max_length=1000, blank=True, db_comment="The trade name of an operator")
    cra_business_number = models.IntegerField(db_comment="The CRA business number of an operator")
    bc_corporate_registry_number = models.CharField(
        db_comment="The BC corporate registry number of an operator",
        validators=[RegexValidator(regex=BC_CORPORATE_REGISTRY_REGEX, message=BC_CORPORATE_REGISTRY_REGEX_MESSAGE)],
    )
    business_structure = models.ForeignKey(
        BusinessStructure,
        on_delete=models.DO_NOTHING,
        db_comment="The business structure of an operator",
        related_name="parent_operators",
    )
    website = models.URLField(
        max_length=200,
        db_comment="The website address of an operator",
        blank=True,
        null=True,
    )
    physical_address = models.ForeignKey(
        Address,
        on_delete=models.DO_NOTHING,
        db_comment="The physical address of an operator (where the operator is physically located)",
        related_name="parent_operators_physical",
    )
    mailing_address = models.ForeignKey(
        Address,
        on_delete=models.DO_NOTHING,
        db_comment="The mailing address of an operator",
        related_name="parent_operators_mailing",
        blank=True,
        null=True,
    )
    history = HistoricalRecords(
        table_name='erc_history"."parent_operator_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Table containing data about operators' parent operators. Parent operators may have a record in the Operator table. If so, that record is controlled by someone who works for that parent operator. The information in this table is controlled by child operators who should not have access to other operator's records."
        db_table = 'erc"."parent_operator'
        indexes = [
            models.Index(fields=["child_operator"], name="po_child_operator_idx"),
            models.Index(fields=["business_structure"], name="po_business_structure_idx"),
            models.Index(fields=["physical_address"], name="po_physical_address_idx"),
            models.Index(fields=["mailing_address"], name="po_mailing_address_idx"),
        ]


class OperationType(BaseModel):
    """
    TODO: we need to make the type of operation a foreign key to this model(This needs a data migration to populate the operation type field in the operation model using this model)(A whole new ticket)
    """

    name = models.CharField(primary_key=True, max_length=1000, db_comment="The name of an operation type")
    history = HistoricalRecords(
        table_name='erc_history"."operation_type_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Operation types"
        db_table = 'erc"."operation_type'

    def __str__(self) -> str:
        return self.name


class FacilityType(BaseModel):
    name = models.CharField(unique=True, max_length=1000, db_comment="The name of a facility type")
    operation_type = models.ForeignKey(
        OperationType,
        on_delete=models.DO_NOTHING,
        related_name="facility_types",
        db_comment="The type of operation that this facility type is associated with",
    )
    history = HistoricalRecords(
        table_name='erc_history"."facility_type_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Facility types"
        db_table = 'erc"."facility_type'

    def __str__(self) -> str:
        return f"{self.name} - {self.operation_type.name}"


class FacilityOwnershipTimeline(TimeStampedModel):
    facility = models.ForeignKey(Facility, on_delete=models.DO_NOTHING, related_name="ownerships")
    operation = models.ForeignKey(Operation, on_delete=models.DO_NOTHING, related_name="facility_ownerships")
    name = models.CharField(max_length=1000, db_comment="The name of the facility when the operation owned it")
    facility_type = models.ForeignKey(
        FacilityType,
        on_delete=models.DO_NOTHING,
        related_name="facility_ownerships",
        db_comment="The type of facility that the operation owned",
    )
    start_date = models.DateTimeField(
        blank=True, null=True, db_comment="The start date of the ownership of the facility"
    )
    end_date = models.DateTimeField(blank=True, null=True, db_comment="The end date of the ownership of the facility")

    history = HistoricalRecords(
        table_name='erc_history"."facility_ownership_timeline_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "A table to connect facilities and operations"
        db_table = 'erc"."facility_ownership_timeline'
        constraints = [
            models.UniqueConstraint(
                fields=['facility'],
                condition=models.Q(end_date__isnull=True),
                name='unique_active_ownership_per_facility',
            )
        ]


"""
NOTE:
1- We need to populate this data model using the data from the existing operations (Need to create ownerships)
2- Once updated, we need to update all references to an operation to use this model instead
3- First step should happen once we update all references throughout the code to use this model
4- We need to update the operation model to remove the fields that are now in this model
"""


class OperationOwnershipTimeline(TimeStampedModel):
    operation = models.ForeignKey(Operation, on_delete=models.DO_NOTHING, related_name="ownerships")
    operator = models.ForeignKey(Operator, on_delete=models.DO_NOTHING, related_name="operation_ownerships")
    name = models.CharField(
        max_length=1000, db_comment="The name of an operation"
    )  # TODO: Need a data migration to populate this
    operation_type = models.ForeignKey(
        OperationType,
        on_delete=models.DO_NOTHING,
        related_name="operation_ownerships",
        db_comment="The type of operation that the operator owned",
    )  # TODO: Need a data migration to populate this
    operation_has_multiple_operators = models.BooleanField(
        db_comment="Whether or not the operation has multiple operators", default=False
    )  # TODO: Need a data migration to populate this
    opt_in = models.BooleanField(
        db_comment="Whether or not the operation is required to register or is simply opting in. Only needed if the operation did not report the previous year.",
        blank=True,
        null=True,
    )  # TODO: Need a data migration to populate this
    documents = models.ManyToManyField(
        Document,
        blank=True,
        related_name="operation_ownerships",
    )  # TODO: Need a data migration to populate this
    point_of_contact = models.ForeignKey(
        Contact,
        on_delete=models.DO_NOTHING,
        related_name="operation_ownerships",
        blank=True,
        null=True,
        db_comment="Foreign key to the contact that is the point of contact",
    )  # TODO: Need a data migration to populate this
    regulated_products = models.ManyToManyField(
        RegulatedProduct,
        blank=True,
        related_name="operation_ownerships",
    )  # TODO: Need a data migration to populate this
    reporting_activities = models.ManyToManyField(
        ReportingActivity,
        blank=True,
        related_name="operation_ownerships",
    )  # TODO: Need a data migration to populate this
    start_date = models.DateTimeField(
        blank=True, null=True, db_comment="The start date of the ownership of the operation"
    )  # TODO: Need a data migration to populate this
    end_date = models.DateTimeField(blank=True, null=True, db_comment="The end date of the ownership of the operation")

    history = HistoricalRecords(
        table_name='erc_history"."operation_ownership_timeline_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "A table to connect operations and operators"
        db_table = 'erc"."operation_ownership_timeline'
        constraints = [
            models.UniqueConstraint(
                fields=['operation'],
                condition=models.Q(end_date__isnull=True),
                name='unique_active_ownership_per_operation',
            )
        ]
