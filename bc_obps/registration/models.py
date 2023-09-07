import uuid
from django.db import models
from phonenumber_field.modelfields import PhoneNumberField
from django.contrib.gis.db import models

class Document(models.Model):
    file = models.FileField(upload_to='documents', db_comment="")
    document_type = models.CharField(max_length=1000, db_comment="Type of document, e.g., boundary map")
    description = models.CharField(max_length=1000, db_comment="")
    class Meta:
        db_table_comment = "Documents"

class NaicsCode(models.Model):
    naics_code = models.CharField(max_length=1000, db_comment="")
    ciip_sector = models.CharField(max_length=1000, db_comment="")
    naics_description = models.CharField(max_length=1000, db_comment="")
    class Meta:
        db_table_comment = "Naics codes"

class UserAndContactCommonInfo(models.Model):
    first_name = models.CharField(max_length=1000, db_comment="")
    last_name = models.CharField(max_length=1000, db_comment="")
    mailing_address = models.CharField(max_length=1000, db_comment="")
    email = models.EmailField(max_length=254, db_comment="")
    phone_number = PhoneNumberField(blank=True, db_comment="")
    class Meta:
        abstract = True
        db_table_comment = "An abstract base class (used for putting common information into a number of other models) containing fields for users and contacts"

class User(UserAndContactCommonInfo):
    user_guid = models.UUIDField(primary_key=True, default=uuid.uuid4, db_comment="")
    business_guid  = models.UUIDField(default=uuid.uuid4, db_comment="")
    position_title = models.CharField(max_length=1000, db_comment="")
    documents  = models.ManyToManyField(Document,blank=True, null=True)
    class Meta:
        db_table_comment = "App users"

class Contact(UserAndContactCommonInfo):
    is_operational_representative = models.BooleanField(db_comment="")
    verified_at = models.DateTimeField(db_comment="",blank=True, null=True)
    verified_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, db_comment="",blank=True, null=True)
    class Meta:
        db_table_comment = "Contacts (people who don't use the app, e.g. authorized signing officers)"
        indexes = [
            models.Index(fields=["verified_by"], name="contact_verified_by_idx"),
            ]

class Operator (models.Model):
    # class Statuses(models.TextChoices):
    #     PENDING = 'pending', 'Pending'
    #     APPROVED = 'approved', 'Approved'
    #     DENIED = 'rejected', 'Rejected'
    legal_name = models.CharField(max_length=1000, db_comment="")  
    trade_name = models.CharField(max_length=1000, db_comment="")
    business_number = models.CharField(max_length=1000, db_comment="")
    business_structure = models.CharField(max_length=1000, db_comment="") 
    mailing_address = models.CharField(max_length=1000, db_comment="") 
    bceid = models.CharField(max_length=1000, db_comment="") 
    parent_operator = models.ForeignKey('self', on_delete=models.CASCADE, related_name='parent', db_comment="",blank=True, null=True)
    relationship_with_parent_operator = models.CharField(max_length=1000, db_comment="",blank=True, null=True) 
    compliance_obligee = models.ForeignKey('self', on_delete=models.CASCADE, related_name='obligee', db_comment="")
    date_aso_became_responsible_for_operator = models.DateTimeField(db_comment="")
    # status = models.CharField(max_length=50, choices=Statuses.choices, default=Statuses.PENDING, db_comment="")
    documents  = models.ManyToManyField(Document,blank=True, null=True)
    contacts  = models.ManyToManyField(Contact)
    operators = models.ManyToManyField(User, through="UserOperator")
    class Meta:
        db_table_comment = "Operators (also called organizations)"
        # don't need indexes if we end up using `unique`
        indexes = [
            models.Index(fields=["parent_operator"], name="parent_operator_idx"),
            models.Index(fields=["compliance_obligee"], name="compliance_obligee_idx")]

class UserOperator(models.Model):
    
    # class Roles(models.TextChoices):
    #     ADMIN = 'admin', 'Admin'
    #     SUPERADMIN = 'superadmin', 'SuperAdmin'
    
    class Statuses(models.TextChoices):
        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    users = models.ForeignKey(User, on_delete=models.CASCADE)
    operators = models.ForeignKey(Operator, on_delete=models.CASCADE)
    role = models.CharField(max_length=1000, db_comment="")
    status = models.CharField(max_length=1000, choices=Statuses.choices, default=Statuses.PENDING, db_comment="")
    user_is_aso = models.BooleanField
    user_is_third_party = models.BooleanField
    proof_of_authority = models.ForeignKey(Document, on_delete=models.DO_NOTHING, db_comment="")
    class Meta:
        db_table_comment = "Through table to connect Users and Operators and track access requests"
        indexes = [
            models.Index(fields=["users"], name="user_operator_user_id_idx"),
            models.Index(fields=["operators"], name="user_operator_operator_id_idx")]
    
class Operation(models.Model):
    operator_id = models.ForeignKey(Operator, on_delete=models.CASCADE, db_comment="")
    name = models.CharField(max_length=1000, db_comment="")
    operation_type = models.CharField(max_length=1000, db_comment="")
    naics_code = models.ForeignKey(NaicsCode, on_delete=models.CASCADE, db_comment="")
    first_year_of_commercial_operation = models.IntegerField(db_comment="")
    description_of_operation_criteria = models.CharField(max_length=1000, db_comment="")
    permit_id = models.CharField(max_length=1000, db_comment="")
    npr_id = models.CharField(max_length=1000, db_comment="",blank=True, null=True)
    ghfrp_id = models.CharField(max_length=1000, db_comment="",blank=True, null=True)
    bcghrp_id = models.CharField(max_length=1000, db_comment="",blank=True, null=True)
    petrinex_id = models.CharField(max_length=1000, db_comment="",blank=True, null=True)
    location = models.PointField(geography=True, db_comment="")
    legal_land_description = models.CharField(max_length=1000, db_comment="")
    nearest_municipality = models.CharField(max_length=1000, db_comment="")
    operator_percent_of_ownership = models.DecimalField(decimal_places=10, max_digits=10,db_comment="")
    registered_for_obps = models.BooleanField
    verified_at = models.DateTimeField(db_comment="",blank=True, null=True)
    verified_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, db_comment="",blank=True, null=True)
    estimated_emissions = models.DecimalField(decimal_places=10, max_digits=10,db_comment="")
    documents  = models.ManyToManyField(Document,blank=True, null=True)
    contacts  = models.ManyToManyField(Contact)
    class Meta:
        db_table_comment = "Operations (also called facilities)"
        indexes = [
            models.Index(fields=["operator_id"], name="operator_id_idx"),
            models.Index(fields=["naics_code"], name="naics_code_idx"),
            models.Index(fields=["verified_by"], name="operation_verified_by_idx"),
            ]




