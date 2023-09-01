from django.db import models, uuid

class User(models.Model, db_comment=""):
    first_name = models.CharField(max_length=1000, db_comment="", db_comment="")
    last_name = models.CharField(max_length=1000, db_comment="")
    user_guid = models.CharField(max_length=1000, db_comment="")
    business_guid uuid = models.CharField(max_length=1000, db_comment="")
    position_title = models.CharField(max_length=1000, db_comment="")
    mailing_address = models.CharField(max_length=1000, db_comment="")
     email = models.EmailField(max_length=254, db_comment="")
    phone = models.IntegerField(db_comment="")

class Operator (models.Model, db_comment=""):
    class Statuses(models.TextChoices, db_comment=""):
        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        DENIED = 'rejected', 'Rejected'
    legal_name = models.CharField(max_length=1000, db_comment="")  
    trade_name = models.CharField(max_length=1000, db_comment="")
    business_number = models.CharField(max_length=1000, db_comment="")
    business_structure = models.CharField(max_length=1000, db_comment="") 
    mailing_address = models.CharField(max_length=1000, db_comment="") 
    bceid = models.CharField(max_length=1000, db_comment="") 
    parent_operator = models.ForeignKey('self', on_delete=models.CASCADE,db_comment="")
    relationship_with_parent_operator = models.CharField(max_length=1000, db_comment="") 
    compliance_obligee = models.ForeignKey('self', on_delete=models.CASCADE,db_comment="")
    date_aso_became_responsible_for_operator = models.DateTimeField(db_comment="")
    # status = models.CharField(max_length=50, choices=Statuses.choices, default=Statuses.PENDING, db_comment="")
    class Meta:
        # don't need indexes if we end up using `unique`
        indexes = [
            models.Index(fields=["parent_operator"], name="parent_operator_idx"),
            models.Index(fields=["compliance_obligee"], name="compliance_obligee_idx")]

class UserOperator(models.Model, db_comment=""):
    
    # class Roles(models.TextChoices, db_comment=""):
    #     ADMIN = 'admin', 'Admin'
    #     SUPERADMIN = 'superadmin', 'SuperAdmin'
    
    class Statuses(models.TextChoices, db_comment=""):
        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    user_id = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='user_operators', db_comment="")
    operator_id = models.ForeignKey(Operator, on_delete=models.DO_NOTHING, related_name='user_operators', db_comment="")
    # role = models.CharField(max_length=100, choices=Roles.choices, db_comment="")
    role = models.CharField(max_length=1000, db_comment="")
    status = models.CharField(max_length=1000, choices=Statuses.choices, default=Statuses.PENDING, db_comment="")
    user_is_aso = models.BooleanField
    user_is_third_party = models.BooleanField
    proof_of_authority = models.ForeignKey(Documents, on_delete=models.DO_NOTHING, db_comment="")
    class Meta:
        indexes = [
            models.Index(fields=["user_id"], name="user_id_idx"),
            models.Index(fields=["operator_id"], name="operator_id_idx")]
    
class Operation(models.Model, db_comment=""):
    operator_id = models.ForeignKey(Operator, on_delete=models.CASCADE, db_comment="")
    name = models.CharField(max_length=1000, db_comment="")
    operation_type = models.CharField(max_length=1000, db_comment="")
    naics_code = models.ForeignKey(NaicsCode, on_delete=models.CASCADE, db_comment="")
    first_year_of_commercial_operation = models.IntegerField(db_comment="")
    description_of_operation_criteria = models.CharField(max_length=1000, db_comment="")
    permit_id = models.CharField(max_length=1000, db_comment="")
    npr_id = models.CharField(max_length=1000, db_comment="")
    ghfrp_id = models.CharField(max_length=1000, db_comment="")
    bcghrp_id = models.CharField(max_length=1000, db_comment="")
    petrinex_id = models.CharField(max_length=1000, db_comment="")
    # brianna install postgis
    location = models.PointField(geography=True, default=Point(0.0, 0.0, db_comment=""), db_comment="")
    legal_land_description = models.CharField(max_length=1000, db_comment="")
    nearest_municipality = models.CharField(max_length=1000, db_comment="")
    boundary_map = models.ForeignKey(Documents, on_delete=models.DO_NOTHING, db_comment="")
    operator_percent_of_ownership = models.DecimalField(db_comment="")
    registered_for_obps = models.BooleanField
    verified_at = models.DateTimeField(db_comment="")
    verified_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, db_comment="")
    estimated_emissions = models.DecimalField(db_comment="")
    class Meta:
        indexes = [
            models.Index(fields=["operator_id"], name="operator_id_idx"),
            models.Index(fields=["naics_code"], name="naics_code_idx"),
            models.Index(fields=["boundary_map"], name="boundary_map_idx"),
            models.Index(fields=["verified_by"], name="verified_by_idx"),
            ]

class Contact(models.Model, db_comment=""):
    first_name = models.CharField(max_length=1000, db_comment="")
    last_name = models.CharField(max_length=1000, db_comment="")
    email = models.EmailField(max_length=254, db_comment="")
    phone = models.IntegerField(db_comment="")
    is_operational_representative = models.BooleanField(db_comment="")
    verified_at = models.DateTimeField(db_comment="")(db_comment="")
    verified_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, db_comment="")
    class Meta:
        indexes = [
            models.Index(fields=["verified_by"], name="verified_by_idx"),
            ]
    
class OperatorContact(models.Model, db_comment=""):
        contact_id = models.ForeignKey(Contact, on_delete=models.DO_NOTHING, db_comment="")
        operator_id = models.ForeignKey(Operator, on_delete=models.DO_NOTHING, db_comment="")

class OperationContact(models.Model, db_comment=""):
        contact_id = models.ForeignKey(Contact, on_delete=models.DO_NOTHING, db_comment="")
        operator_id = models.ForeignKey(Operator, on_delete=models.DO_NOTHING, db_comment="")

class NacisCode(models.Model, db_comment=""):
        naics_code = models.CharField(max_length=1000, db_comment="")
        ciip_sector = models.CharField(max_length=1000, db_comment="")
        naics_description = models.CharField(max_length=1000, db_comment="")


        # this may be helpful: https://docs.djangoproject.com/en/4.2/ref/models/fields/#django.db.models.FileField.upload_to
class Dcoument(models.Model, db_comment=""):
        file = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, db_comment="")
        description = models.CharField(max_length=1000, db_comment="")
        file_name = models.CharField(max_length=1000, db_comment="")
        file_type = models.CharField(max_length=1000, db_comment="")
        file_size = models.CharField(max_length=1000, db_comment="")
class UserDocument(models.Model, db_comment=""):
        document_id = models.ForeignKey(Document, on_delete=models.DO_NOTHING, db_comment="")
        user_id = models.ForeignKey(User, on_delete=models.DO_NOTHING, db_comment="")
class OperationDocument(models.Model, db_comment=""):
        document_id = models.ForeignKey(Document, on_delete=models.DO_NOTHING, db_comment="")
        operation_id = models.ForeignKey(Operation, on_delete=models.DO_NOTHING, db_comment="")
class OperatorDocument(models.Model, db_comment=""):
        document_id = models.ForeignKey(Document, on_delete=models.DO_NOTHING, db_comment="")
        operator_id = models.ForeignKey(Operator, on_delete=models.DO_NOTHING, db_comment="")

