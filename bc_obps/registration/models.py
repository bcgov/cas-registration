import uuid
from django.db import models
from phonenumber_field.modelfields import PhoneNumberField


class Document(models.Model):
    """Document model"""

    file = models.FileField(upload_to='documents', db_comment="")
    document_type = models.CharField(max_length=1000, db_comment="Type of document, e.g., boundary map")
    description = models.CharField(max_length=1000, db_comment="")

    class Meta:
        db_table_comment = "Documents"


class NaicsCode(models.Model):
    """NAICS code model"""

    naics_code = models.CharField(max_length=1000, db_comment="")
    ciip_sector = models.CharField(max_length=1000, db_comment="")
    naics_description = models.CharField(max_length=1000, db_comment="")

    class Meta:
        db_table_comment = "Naics codes"


class UserAndContactCommonInfo(models.Model):
    """User and contact common information abstract base class"""

    first_name = models.CharField(max_length=1000, db_comment="")
    last_name = models.CharField(max_length=1000, db_comment="")
    mailing_address = models.CharField(max_length=1000, db_comment="")
    email = models.EmailField(max_length=254, db_comment="")
    phone_number = PhoneNumberField(blank=True, db_comment="")

    class Meta:
        abstract = True
        db_table_comment = "An abstract base class (used for putting common information into a number of other models) containing fields for users and contacts"


class User(UserAndContactCommonInfo):
    """User model"""

    user_guid = models.UUIDField(primary_key=True, default=uuid.uuid4, db_comment="")
    business_guid = models.UUIDField(default=uuid.uuid4, db_comment="")
    position_title = models.CharField(max_length=1000, db_comment="")
    documents = models.ManyToManyField(Document, blank=True, related_name="user_documents")

    class Meta:
        db_table_comment = "App users"
        constraints = [
            models.UniqueConstraint(
                fields=["user_guid", "business_guid"],
                name="uuid_user_and_business_constraint",
            )
        ]


class Contact(UserAndContactCommonInfo):
    """Contact model"""

    is_operational_representative = models.BooleanField(db_comment="")
    verified_at = models.DateTimeField(db_comment="", blank=True, null=True)
    verified_by = models.ForeignKey(
        User, on_delete=models.DO_NOTHING, db_comment="", blank=True, null=True, related_name='contacts'
    )

    class Meta:
        db_table_comment = "Contacts (people who don't use the app, e.g. authorized signing officers)"
        indexes = [
            models.Index(fields=["verified_by"], name="contact_verified_by_idx"),
        ]
        constraints = [models.UniqueConstraint(fields=['email'], name='contact_email_constraint')]


class Operator(models.Model):
    """Operator model"""

    legal_name = models.CharField(max_length=1000, db_comment="")
    trade_name = models.CharField(max_length=1000, db_comment="")
    cra_business_number = models.CharField(max_length=1000, db_comment="")
    bc_corporate_registry_number = models.CharField(max_length=1000, db_comment="")
    business_structure = models.CharField(max_length=1000, db_comment="")
    mailing_address = models.CharField(max_length=1000, db_comment="")
    bceid = models.CharField(max_length=1000, db_comment="")
    parent_operator = models.ForeignKey(
        'self', on_delete=models.CASCADE, related_name='parent', db_comment="", blank=True, null=True
    )
    relationship_with_parent_operator = models.CharField(max_length=1000, db_comment="", blank=True, null=True)
    compliance_obligee = models.ForeignKey('self', on_delete=models.CASCADE, related_name='obligee', db_comment="")
    date_aso_became_responsible_for_operator = models.DateTimeField(db_comment="")
    documents = models.ManyToManyField(Document, blank=True, related_name='operator_documents')
    contacts = models.ManyToManyField(Contact, related_name='operator_contacts')
    operators = models.ManyToManyField(User, through="UserOperator", related_name='operator_users')

    class Meta:
        db_table_comment = "Operators (also called organizations)"
        # don't need indexes if we end up using `unique`
        indexes = [
            models.Index(fields=["parent_operator"], name="parent_operator_idx"),
            models.Index(fields=["compliance_obligee"], name="compliance_obligee_idx"),
        ]


class UserOperator(models.Model):
    """User operator model"""

    class Roles(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        REPORTER = 'reporter', 'Reporter'

    class Statuses(models.TextChoices):
        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    users = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name="user_operators")
    operators = models.ForeignKey(Operator, on_delete=models.DO_NOTHING, db_comment="", related_name="user_operators")
    role = models.CharField(max_length=1000, choices=Roles.choices, db_comment="")
    status = models.CharField(max_length=1000, choices=Statuses.choices, default=Statuses.PENDING, db_comment="")
    user_is_aso = models.BooleanField(db_comment="")
    aso_is_owner_or_operator = models.BooleanField(db_comment="")
    user_is_third_party = models.BooleanField(db_comment="")
    proof_of_authority = models.ForeignKey(
        Document, on_delete=models.DO_NOTHING, db_comment="", related_name='user_operators_proof_of_authority'
    )
    signed_statuatory_declaration = models.ForeignKey(
        Document,
        on_delete=models.DO_NOTHING,
        db_comment="",
        related_name='user_operators_signed_statuatory_declaration',
    )

    class Meta:
        db_table_comment = "Through table to connect Users and Operators and track access requests"
        indexes = [
            models.Index(fields=["users"], name="user_operator_user_id_idx"),
            models.Index(fields=["operators"], name="user_operator_operator_id_idx"),
        ]


class Operation(models.Model):
    """Operation model"""

    operator_id = models.ForeignKey(Operator, on_delete=models.CASCADE, db_comment="", related_name='operations')
    name = models.CharField(max_length=1000, db_comment="")
    operation_type = models.CharField(max_length=1000, db_comment="")
    naics_code = models.ForeignKey(NaicsCode, on_delete=models.DO_NOTHING, db_comment="", related_name="operations")
    eligible_commercial_product_name = models.CharField(max_length=1000, db_comment="")
    permit_id = models.CharField(max_length=1000, db_comment="")
    npr_id = models.CharField(max_length=1000, db_comment="", blank=True, null=True)
    ghfrp_id = models.CharField(max_length=1000, db_comment="", blank=True, null=True)
    bcghrp_id = models.CharField(max_length=1000, db_comment="", blank=True, null=True)
    petrinex_id = models.CharField(max_length=1000, db_comment="", blank=True, null=True)
    location = models.PointField(geography=True, db_comment="")
    legal_land_description = models.CharField(max_length=1000, db_comment="")
    nearest_municipality = models.CharField(max_length=1000, db_comment="")
    operator_percent_of_ownership = models.DecimalField(decimal_places=10, max_digits=10, db_comment="")
    registered_for_obps = models.BooleanField(db_comment="")
    verified_at = models.DateTimeField(db_comment="", blank=True, null=True)
    verified_by = models.ForeignKey(
        User, on_delete=models.DO_NOTHING, db_comment="", blank=True, null=True, related_name='operations'
    )
    estimated_emissions = models.DecimalField(decimal_places=10, max_digits=10, db_comment="")
    documents = models.ManyToManyField(Document, blank=True, related_name='operation_documents')
    contacts = models.ManyToManyField(Contact, related_name='operation_contacts')

    class Meta:
        db_table_comment = "Operations (also called facilities)"
        indexes = [
            models.Index(fields=["operator_id"], name="operator_id_idx"),
            models.Index(fields=["naics_code"], name="naics_code_idx"),
            models.Index(fields=["verified_by"], name="operation_verified_by_idx"),
        ]
