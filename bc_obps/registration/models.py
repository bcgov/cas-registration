import uuid
from django.db import models
from phonenumber_field.modelfields import PhoneNumberField
from localflavor.ca.models import CAPostalCodeField, CAProvinceField


class AppRole(models.Model):
    """AppRole model"""

    role_name = models.CharField(primary_key=True, serialize=False, db_comment='The name identifying the role assigned to a user. This role defines their permissions within the app. Also acts as the primary key.', max_length=100)
    role_description = models.CharField(db_comment='Description of the app role', max_length=1000)

    class Meta:
        db_table_comment = "This table contains the definitions for roles within the app/database. These roles are used to define the permissions a user has within the app"
        db_table = 'erc"."app_role'

class DocumentType(models.Model):
    """Document type model"""

    name = models.CharField(
        max_length=1000,
        db_comment="Name of document type (e.g. opt in signed statuatory declaration)",
    )

    class Meta:
        db_table_comment = "Table that contains types of documents"
        db_table = 'erc"."document_type'


class Document(models.Model):
    """Document model"""

    file = models.FileField(upload_to="documents", db_comment="The file format, metadata, etc.")
    type = models.ForeignKey(
        DocumentType,
        on_delete=models.DO_NOTHING,
        related_name="contacts",
        db_comment="Type of document, e.g., boundary map",
    )
    description = models.CharField(max_length=1000, db_comment="Description of the document")

    class Meta:
        db_table_comment = "Documents"
        db_table = 'erc"."document'

    indexes = [
        models.Index(fields=["type"], name="document_type_idx"),
    ]


class NaicsCode(models.Model):
    """NAICS code model"""

    naics_code = models.CharField(max_length=1000, db_comment="NAICS code")
    ciip_sector = models.CharField(
        max_length=1000,
        db_comment="Sector that the code belongs to in the CIIP program",
    )
    naics_description = models.CharField(max_length=1000, db_comment="Description of the NAICS code")

    class Meta:
        db_table_comment = "Naics codes"
        db_table = 'erc"."naics_code'


class NaicsCategory(models.Model):
    """NAICS category model"""

    naics_category = models.CharField(max_length=1000, db_comment="The naics_catory name")

    class Meta:
        db_table_comment = "Naics categories"
        db_table = 'erc"."naics_category'


class RegulatedProduct(models.Model):
    """Regulated products model"""

    name = models.CharField(max_length=1000, db_comment="The name of a regulated product")

    class Meta:
        db_table_comment = "Regulated products"
        db_table = 'erc"."regulated_product'


class ReportingActivity(models.Model):
    """Reporting activity model"""

    name = models.CharField(max_length=1000, db_comment="The name of a reporting activity")

    class Meta:
        db_table_comment = "Reporting activities"
        db_table = 'erc"."reporting_activity'


class UserAndContactCommonInfo(models.Model):
    """User and contact common information abstract base class"""

    class Roles(models.TextChoices):
        SENIOR_OFFICER = "senior_officer", "Senior Officer"
        OPERATION_REPRESENTATIVE = (
            "operation_representative",
            "Operation Representative",
        )
        AUTHORIZED_SIGNING_OFFICER = (
            "authorized_signing_officer",
            "Authorized Signing Officer",
        )
        OPERATION_REGISTRATION_LEAD = (
            "operation_registration_lead",
            "Operation Registration Lead",
        )

    first_name = models.CharField(max_length=1000, db_comment="A user or contact's first name")
    last_name = models.CharField(max_length=1000, db_comment="A user or contact's last name")
    position_title = models.CharField(max_length=1000, db_comment="A user or contact's position title")
    street_address = models.CharField(max_length=1000, db_comment="A user or contact's street address")
    municipality = models.CharField(max_length=1000, db_comment="A user or contact's municipality")
    province = CAProvinceField(
        db_comment="A user or contact's province, restricted to two-letter province postal abbreviations"
    )
    postal_code = CAPostalCodeField(
        db_comment="A user or contact's postal code, limited to valid Canadian postal codes"
    )
    email = models.EmailField(max_length=254, db_comment="A user or contact's email, limited to valid emails")
    phone_number = PhoneNumberField(
        blank=True,
        db_comment="A user or contact's phone number, limited to valid phone numbers",
    )

    role = models.CharField(
        max_length=1000,
        choices=Roles.choices,
        blank=True,
        db_comment="A user or contact's role with an operation (e.g. senior operator). Certain roles need authority from other roles to do things.",
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
        related_name="user_documents",
    )
    app_role = models.ForeignKey(
        AppRole,
        on_delete=models.DO_NOTHING,
        related_name="user_app_role",
        db_comment="The role assigned to this user which defines the permissions the use has.",
    )

    class Meta:
        db_table_comment = "App users"
        db_table = 'erc"."user'
        constraints = [
            models.UniqueConstraint(
                fields=["user_guid", "business_guid"],
                name="uuid_user_and_business_constraint",
            )
        ]


class Contact(UserAndContactCommonInfo):
    """Contact model"""

    documents = models.ManyToManyField(
        Document,
        blank=True,
        related_name="contact_documents",
    )

    class Meta:
        db_table_comment = "Contacts (people who don't use the app, e.g. authorized signing officers)"
        db_table = 'erc"."contact'
        indexes = [
            models.Index(fields=["role"], name="contact_role_idx"),
        ]
        constraints = [models.UniqueConstraint(fields=["email"], name="contact_email_constraint")]


class Operator(models.Model):
    """Operator model"""

    legal_name = models.CharField(max_length=1000, db_comment="The legal name of an operator")
    trade_name = models.CharField(max_length=1000, blank=True, db_comment="The trade name of an operator")
    cra_business_number = models.IntegerField(db_comment="The CRA business number of an operator")
    bc_corporate_registry_number = models.IntegerField(db_comment="The BC corporate registry number of an operator")
    business_structure = models.CharField(max_length=1000, db_comment="The legal name of an operator")
    physical_street_address = models.CharField(
        max_length=1000,
        db_comment="The physical street address of an operator (where the operator is physically located)",
    )
    physical_municipality = models.CharField(
        max_length=1000,
        db_comment="The physical municipality of an operator ",
    )
    physical_province = CAProvinceField(
        db_comment="The physical street address of an operator, restricted to two-letter province postal abbreviations"
    )
    physical_postal_code = CAPostalCodeField(
        db_comment="The physical postal code address of an operator, limited to valid Canadian postal codes"
    )
    mailing_street_address = models.CharField(max_length=1000, db_comment="The mailing street address of an operator")
    mailing_municipality = models.CharField(max_length=1000, db_comment="The mailing municipality of an operator")
    mailing_province = CAProvinceField(
        db_comment="The mailing province of an operator, restricted to two-letter province postal abbreviations"
    )
    mailing_postal_code = CAPostalCodeField(
        db_comment="The mailing postal code of an operator, limited to valid Canadian postal codes"
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
        related_name="operator_documents",
    )
    contacts = models.ManyToManyField(
        Contact,
        blank=True,
        related_name="operator_contacts",
    )

    class Meta:
        db_table_comment = "Operators (also called organizations)"
        # don't need indexes if we end up using `unique`
        db_table = 'erc"."operator'


class ParentChildOperator(models.Model):
    """Parent child operator model"""

    parent_operator = models.ForeignKey(
        Operator,
        on_delete=models.DO_NOTHING,
        related_name="parent_child_operator_parent_operator",
        db_comment="The parent operator of an operator in a parent-child relationship",
    )
    child_operator = models.ForeignKey(
        Operator,
        on_delete=models.DO_NOTHING,
        related_name="parent_child_operator_child_operator",
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


class UserOperator(models.Model):
    """User operator model"""

    class Roles(models.TextChoices):
        ADMIN = "admin", "Admin"
        REPORTER = "reporter", "Reporter"

    class Statuses(models.TextChoices):
        DRAFT = "draft", "Draft"
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

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
        db_comment="The status of an operator in the app (e.g. pending review)",
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
        related_name="user_operators_verified_by",
    )

    class Meta:
        db_table_comment = "Through table to connect Users and Operators and track access requests"
        db_table = 'erc"."user_operator'
        indexes = [
            models.Index(fields=["user"], name="user_operator_user_idx"),
            models.Index(fields=["operator"], name="user_operator_operator_idx"),
        ]


class OperationAndFacilityCommonInfo(models.Model):
    """Operation and facility common information abstract base class"""

    name = models.CharField(max_length=1000, db_comment="An operation or facility's name")
    type = models.CharField(max_length=1000, db_comment="An operation or facility's type")
    naics_code = models.ForeignKey(
        NaicsCode,
        on_delete=models.DO_NOTHING,
        db_comment="An operation or facility's NAICS code",
        related_name="operations_facilities_naics_code",
    )
    naics_category = models.ForeignKey(
        NaicsCategory,
        on_delete=models.DO_NOTHING,
        db_comment="An operation or facility's NAICS category",
        related_name="operations_facilities_naics_catetories",
    )

    previous_year_attributable_emissions = models.DecimalField(
        decimal_places=5,
        max_digits=10,
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

    regulated_products = models.ManyToManyField(
        RegulatedProduct,
        blank=True,
        related_name="operations_facilities_regulated_products",
    )
    reporting_activities = models.ManyToManyField(
        ReportingActivity,
        blank=True,
        related_name="operations_facilities_reporting_activity",
    )

    class Meta:
        abstract = True
        db_table_comment = "An abstract base class (used for putting common information into a number of other models) containing fields for operations and facilities"
        db_table = 'erc"."operation'


class Operation(OperationAndFacilityCommonInfo):
    """Operation model"""

    class Statuses(models.TextChoices):
        NOT_REGISTERED = "not_registered", "Not Registered"
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    operator = models.ForeignKey(
        Operator,
        on_delete=models.DO_NOTHING,
        db_comment="The operator who owns the operation",
        related_name="operations",
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
        related_name="operation_documents",
    )
    contacts = models.ManyToManyField(
        Contact,
        related_name="operation_contacts",
    )
    status = models.CharField(
        max_length=1000,
        choices=Statuses.choices,
        default=Statuses.PENDING,
        db_comment="The status of an operation in the app (e.g. pending review)",
    )
    # temporary handling, many-to-many handled in #138
    # operators = models.ForeignKey(
    #     Operator,
    #     on_delete=models.DO_NOTHING,
    #     db_comment="The operator(s) that owns the operation",
    #     related_name="user_operators",
    # )

    class Meta:
        db_table_comment = "Operations (also called facilities)"
        db_table = 'erc"."operation'
        indexes = [
            models.Index(fields=["operator"], name="operator_idx"),
            models.Index(fields=["naics_code"], name="naics_code_idx"),
            models.Index(fields=["verified_by"], name="operation_verified_by_idx"),
        ]
