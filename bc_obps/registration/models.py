from typing import List, Optional
import uuid, re
from django.db import models
from phonenumber_field.modelfields import PhoneNumberField
from localflavor.ca.models import CAPostalCodeField, CAProvinceField
from simple_history.models import HistoricalRecords
from django.core.validators import RegexValidator
from django.utils import timezone
from django.core.exceptions import ValidationError


class TimeStampedModelManager(models.Manager):
    def get_queryset(self):
        """Return only objects that have not been archived"""
        return super().get_queryset().filter(archived_at__isnull=True)


class TimeStampedModel(models.Model):
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

    def set_create_or_update(self, modifier: 'User') -> None:
        """
        Set the created by field if it is not already set.
        Otherwise, set the updated by field and updated at field.
        """
        if not self.created_by:  # created_at is automatically set by auto_now_add
            self.created_by = modifier
        else:
            self.updated_by = modifier
            self.updated_at = timezone.now()

        self.save(update_fields=['created_by', 'updated_by', 'updated_at'])

    def set_archive(self, modifier: 'User') -> None:
        """Set the archived by field and archived at field if they are not already set."""
        if self.archived_by or self.archived_at:
            raise ValueError("Archived by or archived at is already set.")
        self.archived_at = timezone.now()
        self.archived_by = modifier
        self.save(update_fields=['archived_by', 'archived_at'])


class AppRole(models.Model):
    """AppRole model"""

    role_name = models.CharField(
        primary_key=True,
        serialize=False,
        db_comment='The name identifying the role assigned to a user. This role defines their permissions within the app. Also acts as the primary key.',
        max_length=100,
    )
    role_description = models.CharField(db_comment='Description of the app role', max_length=1000)
    history = HistoricalRecords(table_name='erc_history"."app_role_history')

    class Meta:
        db_table_comment = "This table contains the definitions for roles within the app/database. These roles are used to define the permissions a user has within the app"
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
    def get_all_industry_user_operator_roles() -> List[str]:
        """
        Return all UserOperator.role options (including None).
        """
        roles = [choice.value for choice in UserOperator.Roles]
        roles.append(None)
        return roles

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


class DocumentType(models.Model):
    """Document type model"""

    name = models.CharField(
        max_length=1000,
        db_comment="Name of document type (e.g. opt in signed statutory declaration)",
    )
    history = HistoricalRecords(table_name='erc_history"."document_type_history')

    class Meta:
        db_table_comment = "Table that contains types of documents"
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
    description = models.CharField(max_length=1000, db_comment="Description of the document")
    history = HistoricalRecords(table_name='erc_history"."document_history')

    class Meta:
        db_table_comment = "Documents"
        db_table = 'erc"."document'

    indexes = [
        models.Index(fields=["type"], name="document_type_idx"),
    ]


class NaicsCode(models.Model):
    """NAICS code model"""

    naics_code = models.CharField(max_length=1000, db_comment="NAICS code")
    naics_description = models.CharField(max_length=1000, db_comment="Description of the NAICS code")
    history = HistoricalRecords(table_name='erc_history"."naics_code_history')

    class Meta:
        db_table_comment = "Naics codes"
        db_table = 'erc"."naics_code'


class RegulatedProduct(models.Model):
    """Regulated products model"""

    name = models.CharField(max_length=1000, db_comment="The name of a regulated product")
    history = HistoricalRecords(table_name='erc_history"."regulated_product_history')

    class Meta:
        db_table_comment = "Regulated products"
        db_table = 'erc"."regulated_product'


class ReportingActivity(models.Model):
    """Reporting activity model"""

    class Applicablity(models.TextChoices):
        SFO = "sfo"
        LFO = "lfo"
        ALL = "all"

    name = models.CharField(max_length=1000, db_comment="The name of a reporting activity")
    applicable_to = models.CharField(
        max_length=1000, choices=Applicablity.choices, db_comment="Which type of facility the activity applies to"
    )
    history = HistoricalRecords(table_name='erc_history"."reporting_activity_history')

    class Meta:
        db_table_comment = "Reporting activities"
        db_table = 'erc"."reporting_activity'


class Address(models.Model):
    """Address model"""

    street_address = models.CharField(max_length=1000, db_comment="Street address of relevant location)")
    municipality = models.CharField(max_length=1000, db_comment="Municipality of relevant location")
    province = CAProvinceField(
        db_comment="Province of the relevant location, restricted to two-letter province postal abbreviations"
    )
    postal_code = CAPostalCodeField(
        db_comment="Postal code of relevant location, limited to valid Canadian postal codes"
    )
    history = HistoricalRecords(table_name='erc_history"."address_history')

    class Meta:
        db_table_comment = "Address"
        db_table = 'erc"."address'


class UserAndContactCommonInfo(models.Model):
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
        db_table_comment = "An abstract base class (used for putting common information into a number of other models) containing fields for users and contacts"


class User(UserAndContactCommonInfo):
    """User model"""

    user_guid = models.UUIDField(primary_key=True, default=uuid.uuid4, db_comment="A GUID to identify the user")
    business_guid = models.UUIDField(default=uuid.uuid4, db_comment="A GUID to identify the business")
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
    history = HistoricalRecords(table_name='erc_history"."user_history', m2m_fields=[documents])

    class Meta:
        db_table_comment = "App users"
        db_table = 'erc"."user'
        constraints = [
            models.UniqueConstraint(
                fields=["user_guid", "business_guid"],
                name="uuid_user_and_business_constraint",
            )
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


class BusinessRole(models.Model):
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
    history = HistoricalRecords(table_name='erc_history"."business_role_history')

    class Meta:
        db_table_comment = "This table contains the definitions for roles within the operator/operation. These roles are used to define the permissions a user has within the operator/operation"
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
        on_delete=models.DO_NOTHING,
        db_comment="Foreign key to the address of a user or contact",
        related_name="contacts",
    )

    history = HistoricalRecords(table_name='erc_history"."contact_history', m2m_fields=[documents])

    class Meta:
        db_table_comment = "Contacts (people who don't use the app, e.g. authorized signing officers)"
        db_table = 'erc"."contact'
        indexes = [
            models.Index(fields=["business_role"], name="contact_role_idx"),
        ]


class BusinessStructure(models.Model):
    """The legal name of an operator"""

    name = models.CharField(primary_key=True, max_length=1000, db_comment="The name of a business structure")
    history = HistoricalRecords(table_name='erc_history"."business_structure_history')

    class Meta:
        db_table_comment = "The legal name of an operator"
        db_table = 'erc"."business_structure'


class Operator(TimeStampedModel):
    """Operator model"""

    class Statuses(models.TextChoices):
        DRAFT = "Draft"
        PENDING = "Pending"
        APPROVED = "Approved"
        REJECTED = "Rejected"
        CHANGES_REQUESTED = ("Changes Requested",)

    legal_name = models.CharField(max_length=1000, db_comment="The legal name of an operator")
    trade_name = models.CharField(max_length=1000, blank=True, db_comment="The trade name of an operator")
    cra_business_number = models.IntegerField(db_comment="The CRA business number of an operator")
    bc_corporate_registry_number = models.CharField(
        db_comment="The BC corporate registry number of an operator",
        validators=[
            RegexValidator(
                regex="^[A-Za-z]{1,3}\d{7}$",
                message='"BC Corporate Registry Number should be 1-3 letters followed by 7 digits".',
            )
        ],
    )
    business_structure = models.ForeignKey(
        BusinessStructure,
        on_delete=models.DO_NOTHING,
        db_comment="The business structure of an operator",
        related_name="operators",
    )
    physical_address = models.ForeignKey(
        Address,
        on_delete=models.DO_NOTHING,
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
    history = HistoricalRecords(table_name='erc_history"."operator_history', m2m_fields=[documents, contacts])

    class Meta:
        db_table_comment = "Operators (also called organizations)"
        # don't need indexes if we end up using `unique`
        db_table = 'erc"."operator'


class ParentChildOperator(models.Model):
    """Parent child operator model"""

    parent_operator = models.ForeignKey(
        Operator,
        on_delete=models.DO_NOTHING,
        related_name="parent_child_operator_parent_operators",
        db_comment="The parent operator of an operator in a parent-child relationship",
    )
    child_operator = models.ForeignKey(
        Operator,
        on_delete=models.DO_NOTHING,
        related_name="parent_child_operator_child_operators",
        db_comment="The child operator of an operator in a parent-child relationship",
    )
    percentage_owned_by_parent_company = models.DecimalField(
        decimal_places=5,
        max_digits=10,
        db_comment="The percentage of an operator owned by the parent company",
        blank=True,
        null=True,
    )

    class Meta:
        db_table_comment = "Through table to connect parent and child operators"
        db_table = 'erc"."parent_child_operator'
        indexes = [
            models.Index(fields=["parent_operator"], name="parent_operator_idx"),
            models.Index(fields=["child_operator"], name="child_operator_idx"),
        ]


class UserOperator(TimeStampedModel):
    """User operator model"""

    class Roles(models.TextChoices):
        ADMIN = "admin", "Admin"
        REPORTER = "reporter", "Reporter"

    class Statuses(models.TextChoices):
        DRAFT = "Draft"
        PENDING = "Pending"
        APPROVED = "Approved"
        REJECTED = "Rejected"

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
        db_comment="The role of a user associated with an operator (e.g. admin)",
    )
    status = models.CharField(
        max_length=1000,
        choices=Statuses.choices,
        default=Statuses.DRAFT,
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
    history = HistoricalRecords(table_name='erc_history"."user_operator_history')

    class Meta:
        db_table_comment = "Through table to connect Users and Operators and track access requests"
        db_table = 'erc"."user_operator'
        indexes = [
            models.Index(fields=["user"], name="user_operator_user_idx"),
            models.Index(fields=["operator"], name="user_operator_operator_idx"),
        ]

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


class OperationAndFacilityCommonInfo(TimeStampedModel):
    """Operation and facility common information abstract base class"""

    name = models.CharField(max_length=1000, db_comment="An operation or facility's name")
    type = models.CharField(max_length=1000, db_comment="An operation or facility's type")
    naics_code = models.ForeignKey(
        NaicsCode,
        on_delete=models.DO_NOTHING,
        db_comment="An operation or facility's NAICS code",
        related_name='%(class)ss',
    )

    previous_year_attributable_emissions = models.IntegerField(
        db_comment="An operation or facility's attributable emissions from the previous year. Only needed if the operation/facility submitted a report the previous year.",
        blank=True,
        null=True,
    )
    swrs_facility_id = models.IntegerField(
        db_comment="An operation or facility's SWRS facility ID. Only needed if the operation/facility submitted a report the previous year.",
        blank=True,
        null=True,
    )
    bcghg_id = models.CharField(
        max_length=1000,
        db_comment="An operation or facility's BCGHG identifier. Only needed if the operation/facility submitted a report the previous year.",
        blank=True,
        null=True,
    )

    opt_in = models.BooleanField(
        db_comment="Whether or not the operation/facility is required to register or is simply opting in. Only needed if the operation/facility did not report the previous year.",
        blank=True,
        null=True,
    )

    class Meta:
        abstract = True
        db_table_comment = "An abstract base class (used for putting common information into a number of other models) containing fields for operations and facilities"
        db_table = 'erc"."operation'


boro_id_pattern = r'^\d{2}-\d{4}$'


class Operation(OperationAndFacilityCommonInfo):
    """Operation model"""

    class Statuses(models.TextChoices):
        NOT_REGISTERED = "Not Registered"
        PENDING = "Pending"
        APPROVED = "Approved"
        REJECTED = "Rejected"

    operator = models.ForeignKey(
        Operator,
        on_delete=models.DO_NOTHING,
        db_comment="The operator who owns the operation",
        related_name="operations",
    )
    operation_has_multiple_operators = models.BooleanField(
        db_comment="Whether or not the operation has multiple operators", default=False
    )
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
    documents = models.ManyToManyField(
        Document,
        blank=True,
        related_name="operations",
    )
    application_lead = models.ForeignKey(
        Contact,
        on_delete=models.DO_NOTHING,
        related_name="operations",
        blank=True,
        null=True,
        db_comment="Foreign key to the contact that is the application lead",
    )
    status = models.CharField(
        max_length=1000,
        choices=Statuses.choices,
        default=Statuses.NOT_REGISTERED,
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
    )
    reporting_activities = models.ManyToManyField(
        ReportingActivity,
        blank=True,
        related_name='%(class)ss',
    )
    history = HistoricalRecords(
        table_name='erc_history"."operation_history', m2m_fields=[regulated_products, reporting_activities, documents]
    )

    class Meta:
        db_table_comment = "Operations (also called facilities)"
        db_table = 'erc"."operation'
        indexes = [
            models.Index(fields=["operator"], name="operator_idx"),
            models.Index(fields=["naics_code"], name="naics_code_idx"),
            models.Index(fields=["verified_by"], name="operation_verified_by_idx"),
        ]

    def generate_unique_boro_id(self) -> None:
        """
        Generate a unique BC OBPS regulated operation ID based on the current year and the latest BORO ID.
        """

        # if the operation already has a BORO ID, return it
        if self.bc_obps_regulated_operation:
            return self.bc_obps_regulated_operation

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

        if not re.match(boro_id_pattern, new_boro_id):
            raise ValidationError("Generated BORO ID is not in the correct format.")
        if Operation.objects.filter(bc_obps_regulated_operation__pk=new_boro_id).exists():
            raise ValidationError("Generated BORO ID is not unique.")

        new_boro_id_instance = BcObpsRegulatedOperation.objects.create(id=new_boro_id)
        self.bc_obps_regulated_operation = new_boro_id_instance


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
        validators=[
            RegexValidator(
                regex="^[A-Za-z]{1,3}\d{7}$",
                message='"BC Corporate Registry Number should be 1-3 letters followed by 7 digits".',
            )
        ],
    )
    business_structure = models.ForeignKey(
        BusinessStructure,
        on_delete=models.DO_NOTHING,
        db_comment="The business structure of an operator",
        related_name="multiple_operator",
    )
    website = models.URLField(
        max_length=200,
        db_comment="The website address of an operator",
        blank=True,
        # default blank since optional fields returning null will trigger RJSF validation the next time the form is saved
        default="",
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
    history = HistoricalRecords(table_name='erc_history"."multiple_operator_history')

    class Meta:
        db_table_comment = "Table to store multiple operator metadata"
        db_table = 'erc"."multiple_operator'


class BcObpsRegulatedOperation(models.Model):
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
    history = HistoricalRecords(table_name='erc_history"."bc_obps_regulated_operation_history')

    class Meta:
        db_table_comment = "Table to store BC OBPS Regulated Operation metadata"
        db_table = 'erc"."bc_obps_regulated_operation'

    def save(self, *args, **kwargs):
        """
        Override the save method to set the issued_at field if it is not already set.
        """
        if not re.match(boro_id_pattern, self.id):
            raise ValidationError("Generated BORO ID is not in the correct format.")
        if not self.issued_at:
            self.issued_at = timezone.now()
        super().save(*args, **kwargs)
