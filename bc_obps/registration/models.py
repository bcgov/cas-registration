import uuid
from django.db import models
from phonenumber_field.modelfields import PhoneNumberField
from localflavor.ca.models import CAPostalCodeField, CAProvinceField


class DocumentType(models.Model):
    """Document type model"""

    # brianna this should be in the table, not choices, migration
    class Types(models.TextChoices):
        BOUNDARY_MAP = ("boundary_map", "boundary_map")
        SIGNED_STATUATORY_DECLARATION = (
            "signed_statuatory_declaration",
            "signed_statuatory_declaration",
        )
        PROCESS_FLOW_DIAGRAM = ("process_flow_diagram", "process_flow_diagram")
        PROOF_OF_AUTHORITY_OF_PARTNER_COMPANY = (
            "proof_of_authority_of_partner_company",
            "proof_of_authority_of_partner_company",
        )
        SENIOR_OFFICER_PROOF_OF_AUTHORITY = (
            "senior_officer_proof_of_authority",
            "senior_officer_proof_of_authority",
        )
        OPERATION_REPRESENTATIVE_PROOF_OF_AUTHORITY = (
            "operation_representative_proof_of_authority",
            "operation_representative_proof_of_authority",
        )
        SOCE_SENIOR_OFFICER_PROOF_OF_AUTHORITY = (
            "soce_senior_officer_proof_of_authority",
            "soce_senior_officer_proof_of_authority",
        )
        PROOF_OF_START = ("proof_of_start", "proof_of_start")
        OPT_IN_SIGNED_STATUATORY_DECLARATION = (
            "opt_in_signed_statuatory_declaration",
            "opt_in_signed_statuatory_declaration",
        )

    name = models.CharField(max_length=1000, db_comment="", choices=Types.choices)

    class Meta:
        db_table_comment = "Table that contains types of allowed documents"
        db_table = 'erc"."document_type'


class Document(models.Model):
    """Document model"""

    file = models.FileField(upload_to="documents", db_comment="")
    type = models.ForeignKey(
        DocumentType,
        on_delete=models.DO_NOTHING,
        related_name="contacts",
        db_comment="Type of document, e.g., boundary map",
    )
    description = models.CharField(max_length=1000, db_comment="")

    class Meta:
        db_table_comment = "Documents"
        db_table = 'erc"."document'

    indexes = [
        models.Index(fields=["type"], name="document_type_idx"),
    ]


class NaicsCode(models.Model):
    """NAICS code model"""

    naics_code = models.CharField(max_length=1000, db_comment="")
    ciip_sector = models.CharField(max_length=1000, db_comment="")
    naics_description = models.CharField(max_length=1000, db_comment="")

    class Meta:
        db_table_comment = "Naics codes"
        db_table = 'erc"."naics_code'


class NaicsCategory(models.Model):
    """NAICS category model"""

    naics_category = models.CharField(max_length=1000, db_comment="")

    class Meta:
        db_table_comment = "Naics categories"
        db_table = 'erc"."naics_category'


class PetrinexId(models.Model):
    """Petrinex ID model"""

    id = models.CharField(primary_key=True, default=uuid.uuid4, db_comment="")

    class Meta:
        db_table_comment = "Petrinex ids"
        db_table = 'erc"."petrinex_id'


class RegulatedProduct(models.Model):
    """Regulated products model"""

    name = models.CharField(max_length=1000, db_comment="")

    class Meta:
        db_table_comment = "Regulated products"
        db_table = 'erc"."regulated_product'


class UserAndContactCommonInfo(models.Model):
    """User and contact common information abstract base class"""

    first_name = models.CharField(max_length=1000, db_comment="")
    last_name = models.CharField(max_length=1000, db_comment="")
    position_title = models.CharField(max_length=1000, db_comment="")
    street_address = models.CharField(max_length=1000, db_comment="")
    municipality = models.CharField(max_length=1000, db_comment="")
    province = CAProvinceField(db_comment="")
    postal_code = CAPostalCodeField(db_comment="")
    email = models.EmailField(max_length=254, db_comment="")
    phone_number = PhoneNumberField(blank=True, db_comment="")

    class Meta:
        abstract = True
        db_table_comment = "An abstract base class (used for putting common information into a number of other models) containing fields for users and contacts"


class User(UserAndContactCommonInfo):
    """User model"""

    user_guid = models.UUIDField(primary_key=True, default=uuid.uuid4, db_comment="")
    business_guid = models.UUIDField(default=uuid.uuid4, db_comment="")
    documents = models.ManyToManyField(Document, blank=True, related_name="user_documents")

    class Meta:
        db_table_comment = "App users"
        db_table = 'erc"."user'
        constraints = [
            models.UniqueConstraint(
                fields=["user_guid", "business_guid"],
                name="uuid_user_and_business_constraint",
            )
        ]


class Role(models.Model):
    """Role model"""

    class Roles(models.TextChoices):
        SENIOR_OFFICER = "senior_officer", "senior officer"
        OPERATION_REPRESENTATIVE = (
            "operation_representative",
            "operation representative",
        )
        AUTHORIZED_SIGNING_OFFICER = (
            "authorized_signing_officer",
            "authorized signing officer",
        )
        OPERATION_REGISTRATION_LEAD = (
            "operation_registration_lead",
            "operation registration lead",
        )

    role_name = models.CharField(max_length=1000, choices=Roles.choices, db_comment="")

    class Meta:
        db_table_comment = "Table to list all contact roles"
        db_table = 'erc"."role'


class Contact(UserAndContactCommonInfo):
    """Contact model"""

    role = models.ForeignKey(Role, on_delete=models.DO_NOTHING, related_name="contacts")

    class Meta:
        db_table_comment = "Contacts (people who don't use the app, e.g. authorized signing officers)"
        db_table = 'erc"."contact'
        indexes = [
            models.Index(fields=["role"], name="contact_role_idx"),
        ]
        constraints = [models.UniqueConstraint(fields=["email"], name="contact_email_constraint")]


class Operator(models.Model):
    """Operator model"""

    legal_name = models.CharField(max_length=1000, db_comment="")
    trade_name = models.CharField(max_length=1000, db_comment="")
    cra_business_number = models.IntegerField(db_comment="")
    bc_corporate_registry_number = models.IntegerField(db_comment="")
    duns_number = models.IntegerField(db_comment="")
    business_structure = models.CharField(max_length=1000, db_comment="")
    physical_street_address = models.CharField(max_length=1000, db_comment="")
    physical_municipality = models.CharField(max_length=1000, db_comment="")
    physical_province = CAProvinceField(db_comment="")
    physical_postal_code = CAPostalCodeField(db_comment="")
    mailing_street_address = models.CharField(max_length=1000, db_comment="")
    mailing_municipality = models.CharField(max_length=1000, db_comment="")
    mailing_province = CAProvinceField(db_comment="")
    mailing_postal_code = CAPostalCodeField(db_comment="")
    website = models.URLField(
        max_length=200,
        db_comment="",
        blank=True,
        null=True,
    )
    bceid = models.IntegerField(db_comment="")
    compliance_entity = models.ForeignKey(
        "self",
        on_delete=models.DO_NOTHING,
        related_name="operator_compliance_entity",
        db_comment="",
    )

    documents = models.ManyToManyField(Document, blank=True, related_name="operator_documents")
    contacts = models.ManyToManyField(Contact, related_name="operator_contacts")

    class Meta:
        db_table_comment = "Operators (also called organizations)"
        # don't need indexes if we end up using `unique`
        db_table = 'erc"."operator'
        indexes = [
            models.Index(fields=["compliance_entity"], name="compliance_entity_idx"),
        ]


class ParentChildOperator(models.Model):
    """Parent child operator model"""

    parent_operator = models.ForeignKey(
        Operator,
        on_delete=models.DO_NOTHING,
        related_name="parent_child_operator_parent_operator",
        db_comment="",
    )
    child_operator = models.ForeignKey(
        Operator,
        on_delete=models.DO_NOTHING,
        related_name="parent_child_operator_child_operator",
        db_comment="",
    )
    percentage_owned_by_parent_company = models.DecimalField(decimal_places=5, max_digits=10, db_comment="")

    relationship_with_parent_operator = models.CharField(max_length=1000, db_comment="", blank=True)

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
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    users = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name="user_operators")
    operators = models.ForeignKey(
        Operator,
        on_delete=models.DO_NOTHING,
        db_comment="",
        related_name="user_operators",
    )
    role = models.CharField(max_length=1000, choices=Roles.choices, db_comment="")
    status = models.CharField(
        max_length=1000,
        choices=Statuses.choices,
        default=Statuses.PENDING,
        db_comment="",
    )
    verified_at = models.DateTimeField(db_comment="", blank=True, null=True)
    verified_by = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
        db_comment="",
        blank=True,
        null=True,
        related_name="user_operators_verified_by",
    )

    class Meta:
        db_table_comment = "Through table to connect Users and Operators and track access requests"
        db_table = 'erc"."user_operator'
        indexes = [
            models.Index(fields=["users"], name="user_operator_user_idx"),
            models.Index(fields=["operators"], name="user_operator_operator_idx"),
        ]


class OperationAndFacilityCommonInfo(models.Model):
    """User and contact common information abstract base class"""

    name = models.CharField(max_length=1000, db_comment="")
    type = models.CharField(max_length=1000, db_comment="")
    naics_code = models.ForeignKey(
        NaicsCode,
        on_delete=models.DO_NOTHING,
        db_comment="",
        related_name="operations_facilities_naics_code",
    )
    naics_category = models.ForeignKey(
        NaicsCategory,
        on_delete=models.DO_NOTHING,
        db_comment="",
        related_name="operations_facilities_naics_catetories",
    )
    reporting_activities = models.CharField(max_length=1000, db_comment="")
    permit_issuing_agency = models.CharField(
        max_length=1000,
        db_comment="",
        blank=True,
        null=True,
    )
    permit_number = models.CharField(
        max_length=1000,
        db_comment="",
        blank=True,
        null=True,
    )
    previous_year_attributable_emissions = models.DecimalField(
        decimal_places=5, max_digits=10, db_comment="", blank=True, null=True
    )
    swrs_facility_id = models.IntegerField(db_comment="", blank=True, null=True)
    bcghg_id = models.CharField(max_length=1000, db_comment="", blank=True)
    current_year_estimated_emissions = models.DecimalField(
        decimal_places=5, max_digits=10, db_comment="", blank=True, null=True
    )
    opt_in = models.BooleanField(db_comment="")
    new_entrant = models.BooleanField(db_comment="", blank=True, null=True)
    start_of_commercial_operation = models.DateTimeField(db_comment="", blank=True, null=True)
    physical_street_address = models.CharField(max_length=1000, db_comment="")
    physical_municipality = models.CharField(max_length=1000, db_comment="")
    physical_province = CAProvinceField(db_comment="")
    physical_postal_code = CAPostalCodeField(db_comment="")
    legal_land_description = models.CharField(max_length=1000, db_comment="")
    latitude = models.DecimalField(decimal_places=5, max_digits=10, db_comment="")
    longitude = models.DecimalField(decimal_places=5, max_digits=10, db_comment="")
    npri_id = models.IntegerField(
        db_comment="",
        blank=True,
        null=True,
    )
    bcer_permit_id = models.IntegerField(
        db_comment="",
        blank=True,
        null=True,
    )
    petrinex_ids = models.ManyToManyField(PetrinexId, blank=True, related_name="operations_facilities_petrinex_ids")
    regulated_products = models.ManyToManyField(
        RegulatedProduct,
        blank=True,
        related_name="operations_facilities_regulated_products",
    )

    class Meta:
        abstract = True
        db_table_comment = "An abstract base class (used for putting common information into a number of other models) containing fields for operations and facilities"
        db_table = 'erc"."operation'


class Operation(OperationAndFacilityCommonInfo):
    """Operation model"""

    operator = models.ForeignKey(Operator, on_delete=models.DO_NOTHING, db_comment="", related_name="operations")
    registered_for_obps = models.BooleanField(db_comment="", default=False)
    major_new_operation = models.BooleanField(db_comment="", blank=True, null=True)
    verified_at = models.DateTimeField(db_comment="", blank=True, null=True)
    verified_by = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
        db_comment="",
        blank=True,
        null=True,
        related_name="operation_verified_by",
    )
    documents = models.ManyToManyField(Document, blank=True, related_name="operation_documents")
    contacts = models.ManyToManyField(Contact, related_name="operation_contacts")

    class Meta:
        db_table_comment = "Operations (also called facilities)"
        db_table = 'erc"."operation'
        indexes = [
            models.Index(fields=["operator"], name="operator_idx"),
            models.Index(fields=["naics_code"], name="naics_code_idx"),
            models.Index(fields=["verified_by"], name="operation_verified_by_idx"),
        ]


class OperatorOperation(models.Model):
    """OperatorOperation"""

    operators = models.ForeignKey(
        Operator,
        on_delete=models.DO_NOTHING,
        db_comment="",
        related_name="operator_operators",
    )
    operations = models.ForeignKey(
        Operation,
        on_delete=models.DO_NOTHING,
        db_comment="",
        related_name="operator_operations",
    )

    class Meta:
        db_table_comment = (
            "Through table to connect Operations and Operators and track parent companies and compliance entities"
        )
        db_table = 'erc"."operator_operation'
        indexes = [
            models.Index(fields=["operations"], name="operator_operation_idx"),
            models.Index(fields=["operators"], name="operator_operator_idx"),
        ]
