---
Django ER Diagram
---
erDiagram
HistoricalAddress {
    BigIntegerField id
    CharField street_address
    CharField municipality
    CharField province
    CharField postal_code
    UUIDField history_user_id
    AutoField history_id
    DateTimeField history_date
    CharField history_change_reason
    CharField history_type
}
Address {
    BigAutoField id
    CharField street_address
    CharField municipality
    CharField province
    CharField postal_code
}
HistoricalAppRole {
    CharField role_name
    CharField role_description
    UUIDField history_user_id
    AutoField history_id
    DateTimeField history_date
    CharField history_change_reason
    CharField history_type
}
AppRole {
    CharField role_name
    CharField role_description
}
HistoricalBcObpsRegulatedOperation {
    CharField id
    DateTimeField issued_at
    TextField comments
    UUIDField history_user_id
    AutoField history_id
    DateTimeField history_date
    CharField history_change_reason
    CharField history_type
}
BcObpsRegulatedOperation {
    CharField id
    DateTimeField issued_at
    TextField comments
}
HistoricalBusinessRole {
    CharField role_name
    CharField role_description
    UUIDField history_user_id
    AutoField history_id
    DateTimeField history_date
    CharField history_change_reason
    CharField history_type
}
BusinessRole {
    CharField role_name
    CharField role_description
}
HistoricalBusinessStructure {
    CharField name
    UUIDField history_user_id
    AutoField history_id
    DateTimeField history_date
    CharField history_change_reason
    CharField history_type
}
BusinessStructure {
    CharField name
}
HistoricalDocumentType {
    BigIntegerField id
    CharField name
    UUIDField history_user_id
    AutoField history_id
    DateTimeField history_date
    CharField history_change_reason
    CharField history_type
}
DocumentType {
    BigAutoField id
    CharField name
}
HistoricalDocument {
    BigIntegerField id
    DateTimeField created_at
    DateTimeField updated_at
    DateTimeField archived_at
    TextField file
    CharField description
    UUIDField history_user_id
    ForeignKey created_by
    ForeignKey updated_by
    ForeignKey archived_by
    ForeignKey type
    AutoField history_id
    DateTimeField history_date
    CharField history_change_reason
    CharField history_type
}
Document {
    BigAutoField id
    ForeignKey created_by
    DateTimeField created_at
    ForeignKey updated_by
    DateTimeField updated_at
    ForeignKey archived_by
    DateTimeField archived_at
    FileField file
    ForeignKey type
    CharField description
}
HistoricalContact {
    BigIntegerField id
    DateTimeField created_at
    DateTimeField updated_at
    DateTimeField archived_at
    CharField first_name
    CharField last_name
    CharField position_title
    CharField email
    CharField phone_number
    UUIDField history_user_id
    ForeignKey created_by
    ForeignKey updated_by
    ForeignKey archived_by
    ForeignKey business_role
    ForeignKey address
    AutoField history_id
    DateTimeField history_date
    CharField history_change_reason
    CharField history_type
}
HistoricalContact_documents {
    BigIntegerField id
    ForeignKey contact
    ForeignKey document
    ForeignKey history
    AutoField m2m_history_id
}
Contact {
    BigAutoField id
    ForeignKey created_by
    DateTimeField created_at
    ForeignKey updated_by
    DateTimeField updated_at
    ForeignKey archived_by
    DateTimeField archived_at
    CharField first_name
    CharField last_name
    CharField position_title
    CharField email
    CharField phone_number
    ForeignKey business_role
    ForeignKey address
    ManyToManyField documents
}
HistoricalUser {
    CharField first_name
    CharField last_name
    CharField position_title
    CharField email
    CharField phone_number
    UUIDField user_guid
    UUIDField business_guid
    CharField bceid_business_name
    UUIDField history_user_id
    ForeignKey app_role
    AutoField history_id
    DateTimeField history_date
    CharField history_change_reason
    CharField history_type
}
HistoricalUser_documents {
    BigIntegerField id
    ForeignKey user
    ForeignKey document
    ForeignKey history
    AutoField m2m_history_id
}
User {
    CharField first_name
    CharField last_name
    CharField position_title
    CharField email
    CharField phone_number
    UUIDField user_guid
    UUIDField business_guid
    CharField bceid_business_name
    ForeignKey app_role
    ManyToManyField documents
}
HistoricalOperator {
    DateTimeField created_at
    DateTimeField updated_at
    DateTimeField archived_at
    UUIDField id
    CharField legal_name
    CharField trade_name
    IntegerField cra_business_number
    IntegerField swrs_organisation_id
    CharField bc_corporate_registry_number
    CharField website
    CharField status
    DateTimeField verified_at
    BooleanField is_new
    UUIDField history_user_id
    ForeignKey created_by
    ForeignKey updated_by
    ForeignKey archived_by
    ForeignKey business_structure
    ForeignKey physical_address
    ForeignKey mailing_address
    ForeignKey verified_by
    AutoField history_id
    DateTimeField history_date
    CharField history_change_reason
    CharField history_type
}
HistoricalOperator_documents {
    BigIntegerField id
    ForeignKey operator
    ForeignKey document
    ForeignKey history
    AutoField m2m_history_id
}
HistoricalOperator_contacts {
    BigIntegerField id
    ForeignKey operator
    ForeignKey contact
    ForeignKey history
    AutoField m2m_history_id
}
Operator {
    ForeignKey created_by
    DateTimeField created_at
    ForeignKey updated_by
    DateTimeField updated_at
    ForeignKey archived_by
    DateTimeField archived_at
    UUIDField id
    CharField legal_name
    CharField trade_name
    IntegerField cra_business_number
    IntegerField swrs_organisation_id
    CharField bc_corporate_registry_number
    ForeignKey business_structure
    ForeignKey physical_address
    ForeignKey mailing_address
    CharField website
    CharField status
    DateTimeField verified_at
    ForeignKey verified_by
    BooleanField is_new
    ManyToManyField documents
    ManyToManyField contacts
}
HistoricalParentOperator {
    BigIntegerField id
    DateTimeField created_at
    DateTimeField updated_at
    DateTimeField archived_at
    IntegerField operator_index
    CharField legal_name
    CharField trade_name
    IntegerField cra_business_number
    CharField foreign_tax_id_number
    CharField bc_corporate_registry_number
    CharField website
    CharField foreign_address
    UUIDField history_user_id
    ForeignKey created_by
    ForeignKey updated_by
    ForeignKey archived_by
    ForeignKey child_operator
    ForeignKey business_structure
    ForeignKey physical_address
    ForeignKey mailing_address
    AutoField history_id
    DateTimeField history_date
    CharField history_change_reason
    CharField history_type
}
ParentOperator {
    BigAutoField id
    ForeignKey created_by
    DateTimeField created_at
    ForeignKey updated_by
    DateTimeField updated_at
    ForeignKey archived_by
    DateTimeField archived_at
    ForeignKey child_operator
    IntegerField operator_index
    CharField legal_name
    CharField trade_name
    IntegerField cra_business_number
    CharField foreign_tax_id_number
    CharField bc_corporate_registry_number
    ForeignKey business_structure
    CharField website
    ForeignKey physical_address
    ForeignKey mailing_address
    CharField foreign_address
}
HistoricalPartnerOperator {
    BigIntegerField id
    DateTimeField created_at
    DateTimeField updated_at
    DateTimeField archived_at
    CharField legal_name
    CharField trade_name
    IntegerField cra_business_number
    CharField bc_corporate_registry_number
    UUIDField history_user_id
    ForeignKey created_by
    ForeignKey updated_by
    ForeignKey archived_by
    ForeignKey bc_obps_operator
    ForeignKey business_structure
    AutoField history_id
    DateTimeField history_date
    CharField history_change_reason
    CharField history_type
}
PartnerOperator {
    BigAutoField id
    ForeignKey created_by
    DateTimeField created_at
    ForeignKey updated_by
    DateTimeField updated_at
    ForeignKey archived_by
    DateTimeField archived_at
    ForeignKey bc_obps_operator
    CharField legal_name
    CharField trade_name
    IntegerField cra_business_number
    CharField bc_corporate_registry_number
    ForeignKey business_structure
}
HistoricalUserOperator {
    DateTimeField created_at
    DateTimeField updated_at
    DateTimeField archived_at
    UUIDField id
    IntegerField user_friendly_id
    CharField role
    CharField status
    DateTimeField verified_at
    UUIDField history_user_id
    ForeignKey created_by
    ForeignKey updated_by
    ForeignKey archived_by
    ForeignKey user
    ForeignKey operator
    ForeignKey verified_by
    AutoField history_id
    DateTimeField history_date
    CharField history_change_reason
    CharField history_type
}
UserOperator {
    ForeignKey created_by
    DateTimeField created_at
    ForeignKey updated_by
    DateTimeField updated_at
    ForeignKey archived_by
    DateTimeField archived_at
    UUIDField id
    IntegerField user_friendly_id
    ForeignKey user
    ForeignKey operator
    CharField role
    CharField status
    DateTimeField verified_at
    ForeignKey verified_by
}
HistoricalRegulatedProduct {
    BigIntegerField id
    CharField name
    UUIDField history_user_id
    AutoField history_id
    DateTimeField history_date
    CharField history_change_reason
    CharField history_type
}
RegulatedProduct {
    BigAutoField id
    CharField name
}
HistoricalNaicsCode {
    BigIntegerField id
    CharField naics_code
    CharField naics_description
    UUIDField history_user_id
    AutoField history_id
    DateTimeField history_date
    CharField history_change_reason
    CharField history_type
}
NaicsCode {
    BigAutoField id
    CharField naics_code
    CharField naics_description
}
HistoricalActivity {
    BigIntegerField id
    CharField name
    CharField applicable_to
    CharField slug
    FloatField weight
    UUIDField history_user_id
    AutoField history_id
    DateTimeField history_date
    CharField history_change_reason
    CharField history_type
}
Activity {
    BigAutoField id
    CharField name
    CharField applicable_to
    CharField slug
    FloatField weight
}
HistoricalOperation {
    DateTimeField created_at
    DateTimeField updated_at
    DateTimeField archived_at
    UUIDField id
    CharField name
    CharField type
    BooleanField operation_has_multiple_operators
    IntegerField swrs_facility_id
    CharField bcghg_id
    BooleanField opt_in
    DateTimeField verified_at
    DateTimeField submission_date
    CharField status
    UUIDField history_user_id
    ForeignKey created_by
    ForeignKey updated_by
    ForeignKey archived_by
    ForeignKey operator
    ForeignKey naics_code
    ForeignKey verified_by
    ForeignKey point_of_contact
    ForeignKey bc_obps_regulated_operation
    AutoField history_id
    DateTimeField history_date
    CharField history_change_reason
    CharField history_type
}
HistoricalOperation_documents {
    BigIntegerField id
    ForeignKey operation
    ForeignKey document
    ForeignKey history
    AutoField m2m_history_id
}
HistoricalOperation_regulated_products {
    BigIntegerField id
    ForeignKey operation
    ForeignKey regulatedproduct
    ForeignKey history
    AutoField m2m_history_id
}
HistoricalOperation_activities {
    BigIntegerField id
    ForeignKey operation
    ForeignKey activity
    ForeignKey history
    AutoField m2m_history_id
}
Operation {
    ForeignKey created_by
    DateTimeField created_at
    ForeignKey updated_by
    DateTimeField updated_at
    ForeignKey archived_by
    DateTimeField archived_at
    UUIDField id
    CharField name
    CharField type
    ForeignKey operator
    BooleanField operation_has_multiple_operators
    ForeignKey naics_code
    IntegerField swrs_facility_id
    CharField bcghg_id
    BooleanField opt_in
    DateTimeField verified_at
    ForeignKey verified_by
    DateTimeField submission_date
    ForeignKey point_of_contact
    CharField status
    OneToOneField bc_obps_regulated_operation
    ManyToManyField documents
    ManyToManyField regulated_products
    ManyToManyField activities
}
HistoricalWellAuthorizationNumber {
    DateTimeField created_at
    DateTimeField updated_at
    DateTimeField archived_at
    IntegerField well_authorization_number
    UUIDField history_user_id
    ForeignKey created_by
    ForeignKey updated_by
    ForeignKey archived_by
    AutoField history_id
    DateTimeField history_date
    CharField history_change_reason
    CharField history_type
}
WellAuthorizationNumber {
    ForeignKey created_by
    DateTimeField created_at
    ForeignKey updated_by
    DateTimeField updated_at
    ForeignKey archived_by
    DateTimeField archived_at
    IntegerField well_authorization_number
}
HistoricalFacility {
    DateTimeField created_at
    DateTimeField updated_at
    DateTimeField archived_at
    UUIDField id
    CharField name
    BooleanField is_current_year
    DateTimeField starting_date
    CharField type
    IntegerField swrs_facility_id
    CharField bcghg_id
    DecimalField latitude_of_largest_emissions
    DecimalField longitude_of_largest_emissions
    UUIDField history_user_id
    ForeignKey created_by
    ForeignKey updated_by
    ForeignKey archived_by
    ForeignKey address
    AutoField history_id
    DateTimeField history_date
    CharField history_change_reason
    CharField history_type
}
Facility {
    ForeignKey created_by
    DateTimeField created_at
    ForeignKey updated_by
    DateTimeField updated_at
    ForeignKey archived_by
    DateTimeField archived_at
    UUIDField id
    CharField name
    BooleanField is_current_year
    DateTimeField starting_date
    CharField type
    ForeignKey address
    IntegerField swrs_facility_id
    CharField bcghg_id
    DecimalField latitude_of_largest_emissions
    DecimalField longitude_of_largest_emissions
    ManyToManyField well_authorization_numbers
}
HistoricalEvent {
    DateTimeField created_at
    DateTimeField updated_at
    DateTimeField archived_at
    UUIDField id
    DateTimeField effective_date
    CharField type
    JSONField additional_data
    UUIDField history_user_id
    ForeignKey created_by
    ForeignKey updated_by
    ForeignKey archived_by
    ForeignKey operation
    ForeignKey facility
    AutoField history_id
    DateTimeField history_date
    CharField history_change_reason
    CharField history_type
}
Event {
    ForeignKey created_by
    DateTimeField created_at
    ForeignKey updated_by
    DateTimeField updated_at
    ForeignKey archived_by
    DateTimeField archived_at
    UUIDField id
    ForeignKey operation
    ForeignKey facility
    DateTimeField effective_date
    CharField type
    JSONField additional_data
}
HistoricalFacilityOwnershipTimeline {
    BigIntegerField id
    DateTimeField created_at
    DateTimeField updated_at
    DateTimeField archived_at
    DateTimeField start_date
    DateTimeField end_date
    UUIDField history_user_id
    ForeignKey created_by
    ForeignKey updated_by
    ForeignKey archived_by
    ForeignKey facility
    ForeignKey operation
    AutoField history_id
    DateTimeField history_date
    CharField history_change_reason
    CharField history_type
}
FacilityOwnershipTimeline {
    BigAutoField id
    ForeignKey created_by
    DateTimeField created_at
    ForeignKey updated_by
    DateTimeField updated_at
    ForeignKey archived_by
    DateTimeField archived_at
    ForeignKey facility
    ForeignKey operation
    DateTimeField start_date
    DateTimeField end_date
}
HistoricalMultipleOperator {
    BigIntegerField id
    DateTimeField created_at
    DateTimeField updated_at
    DateTimeField archived_at
    IntegerField operator_index
    CharField legal_name
    CharField trade_name
    IntegerField cra_business_number
    CharField bc_corporate_registry_number
    CharField website
    DecimalField percentage_ownership
    BooleanField mailing_address_same_as_physical
    UUIDField history_user_id
    ForeignKey created_by
    ForeignKey updated_by
    ForeignKey archived_by
    ForeignKey operation
    ForeignKey business_structure
    ForeignKey physical_address
    ForeignKey mailing_address
    AutoField history_id
    DateTimeField history_date
    CharField history_change_reason
    CharField history_type
}
MultipleOperator {
    BigAutoField id
    ForeignKey created_by
    DateTimeField created_at
    ForeignKey updated_by
    DateTimeField updated_at
    ForeignKey archived_by
    DateTimeField archived_at
    ForeignKey operation
    IntegerField operator_index
    CharField legal_name
    CharField trade_name
    IntegerField cra_business_number
    CharField bc_corporate_registry_number
    ForeignKey business_structure
    CharField website
    DecimalField percentage_ownership
    ForeignKey physical_address
    ForeignKey mailing_address
    BooleanField mailing_address_same_as_physical
}
HistoricalOperationOwnershipTimeline {
    BigIntegerField id
    DateTimeField created_at
    DateTimeField updated_at
    DateTimeField archived_at
    DateTimeField start_date
    DateTimeField end_date
    UUIDField history_user_id
    ForeignKey created_by
    ForeignKey updated_by
    ForeignKey archived_by
    ForeignKey operation
    ForeignKey operator
    AutoField history_id
    DateTimeField history_date
    CharField history_change_reason
    CharField history_type
}
OperationOwnershipTimeline {
    BigAutoField id
    ForeignKey created_by
    DateTimeField created_at
    ForeignKey updated_by
    DateTimeField updated_at
    ForeignKey archived_by
    DateTimeField archived_at
    ForeignKey operation
    ForeignKey operator
    DateTimeField start_date
    DateTimeField end_date
}
HistoricalRegistrationPurpose {
    BigIntegerField id
    DateTimeField created_at
    DateTimeField updated_at
    DateTimeField archived_at
    CharField registration_purpose
    UUIDField history_user_id
    ForeignKey created_by
    ForeignKey updated_by
    ForeignKey archived_by
    ForeignKey operation
    AutoField history_id
    DateTimeField history_date
    CharField history_change_reason
    CharField history_type
}
RegistrationPurpose {
    BigAutoField id
    ForeignKey created_by
    DateTimeField created_at
    ForeignKey updated_by
    DateTimeField updated_at
    ForeignKey archived_by
    DateTimeField archived_at
    CharField registration_purpose
    ForeignKey operation
}
HistoricalDocument }|--|| User : created_by
HistoricalDocument }|--|| User : updated_by
HistoricalDocument }|--|| User : archived_by
HistoricalDocument }|--|| DocumentType : type
Document }|--|| User : created_by
Document }|--|| User : updated_by
Document }|--|| User : archived_by
Document }|--|| DocumentType : type
HistoricalContact }|--|| User : created_by
HistoricalContact }|--|| User : updated_by
HistoricalContact }|--|| User : archived_by
HistoricalContact }|--|| BusinessRole : business_role
HistoricalContact }|--|| Address : address
HistoricalContact_documents }|--|| Contact : contact
HistoricalContact_documents }|--|| Document : document
HistoricalContact_documents }|--|| HistoricalContact : history
Contact }|--|| User : created_by
Contact }|--|| User : updated_by
Contact }|--|| User : archived_by
Contact }|--|| BusinessRole : business_role
Contact }|--|| Address : address
Contact }|--|{ Document : documents
HistoricalUser }|--|| AppRole : app_role
HistoricalUser_documents }|--|| User : user
HistoricalUser_documents }|--|| Document : document
HistoricalUser_documents }|--|| HistoricalUser : history
User }|--|| AppRole : app_role
User }|--|{ Document : documents
HistoricalOperator }|--|| User : created_by
HistoricalOperator }|--|| User : updated_by
HistoricalOperator }|--|| User : archived_by
HistoricalOperator }|--|| BusinessStructure : business_structure
HistoricalOperator }|--|| Address : physical_address
HistoricalOperator }|--|| Address : mailing_address
HistoricalOperator }|--|| User : verified_by
HistoricalOperator_documents }|--|| Operator : operator
HistoricalOperator_documents }|--|| Document : document
HistoricalOperator_documents }|--|| HistoricalOperator : history
HistoricalOperator_contacts }|--|| Operator : operator
HistoricalOperator_contacts }|--|| Contact : contact
HistoricalOperator_contacts }|--|| HistoricalOperator : history
Operator }|--|| User : created_by
Operator }|--|| User : updated_by
Operator }|--|| User : archived_by
Operator }|--|| BusinessStructure : business_structure
Operator }|--|| Address : physical_address
Operator }|--|| Address : mailing_address
Operator }|--|| User : verified_by
Operator }|--|{ Document : documents
Operator }|--|{ Contact : contacts
HistoricalParentOperator }|--|| User : created_by
HistoricalParentOperator }|--|| User : updated_by
HistoricalParentOperator }|--|| User : archived_by
HistoricalParentOperator }|--|| Operator : child_operator
HistoricalParentOperator }|--|| BusinessStructure : business_structure
HistoricalParentOperator }|--|| Address : physical_address
HistoricalParentOperator }|--|| Address : mailing_address
ParentOperator }|--|| User : created_by
ParentOperator }|--|| User : updated_by
ParentOperator }|--|| User : archived_by
ParentOperator }|--|| Operator : child_operator
ParentOperator }|--|| BusinessStructure : business_structure
ParentOperator }|--|| Address : physical_address
ParentOperator }|--|| Address : mailing_address
HistoricalPartnerOperator }|--|| User : created_by
HistoricalPartnerOperator }|--|| User : updated_by
HistoricalPartnerOperator }|--|| User : archived_by
HistoricalPartnerOperator }|--|| Operator : bc_obps_operator
HistoricalPartnerOperator }|--|| BusinessStructure : business_structure
PartnerOperator }|--|| User : created_by
PartnerOperator }|--|| User : updated_by
PartnerOperator }|--|| User : archived_by
PartnerOperator }|--|| Operator : bc_obps_operator
PartnerOperator }|--|| BusinessStructure : business_structure
HistoricalUserOperator }|--|| User : created_by
HistoricalUserOperator }|--|| User : updated_by
HistoricalUserOperator }|--|| User : archived_by
HistoricalUserOperator }|--|| User : user
HistoricalUserOperator }|--|| Operator : operator
HistoricalUserOperator }|--|| User : verified_by
UserOperator }|--|| User : created_by
UserOperator }|--|| User : updated_by
UserOperator }|--|| User : archived_by
UserOperator }|--|| User : user
UserOperator }|--|| Operator : operator
UserOperator }|--|| User : verified_by
HistoricalOperation }|--|| User : created_by
HistoricalOperation }|--|| User : updated_by
HistoricalOperation }|--|| User : archived_by
HistoricalOperation }|--|| Operator : operator
HistoricalOperation }|--|| NaicsCode : naics_code
HistoricalOperation }|--|| User : verified_by
HistoricalOperation }|--|| Contact : point_of_contact
HistoricalOperation }|--|| BcObpsRegulatedOperation : bc_obps_regulated_operation
HistoricalOperation_documents }|--|| Operation : operation
HistoricalOperation_documents }|--|| Document : document
HistoricalOperation_documents }|--|| HistoricalOperation : history
HistoricalOperation_regulated_products }|--|| Operation : operation
HistoricalOperation_regulated_products }|--|| RegulatedProduct : regulatedproduct
HistoricalOperation_regulated_products }|--|| HistoricalOperation : history
HistoricalOperation_activities }|--|| Operation : operation
HistoricalOperation_activities }|--|| Activity : activity
HistoricalOperation_activities }|--|| HistoricalOperation : history
Operation }|--|| User : created_by
Operation }|--|| User : updated_by
Operation }|--|| User : archived_by
Operation }|--|| Operator : operator
Operation }|--|| NaicsCode : naics_code
Operation }|--|| User : verified_by
Operation }|--|| Contact : point_of_contact
Operation ||--|| BcObpsRegulatedOperation : bc_obps_regulated_operation
Operation }|--|{ Document : documents
Operation }|--|{ RegulatedProduct : regulated_products
Operation }|--|{ Activity : activities
HistoricalWellAuthorizationNumber }|--|| User : created_by
HistoricalWellAuthorizationNumber }|--|| User : updated_by
HistoricalWellAuthorizationNumber }|--|| User : archived_by
WellAuthorizationNumber }|--|| User : created_by
WellAuthorizationNumber }|--|| User : updated_by
WellAuthorizationNumber }|--|| User : archived_by
HistoricalFacility }|--|| User : created_by
HistoricalFacility }|--|| User : updated_by
HistoricalFacility }|--|| User : archived_by
HistoricalFacility }|--|| Address : address
Facility }|--|| User : created_by
Facility }|--|| User : updated_by
Facility }|--|| User : archived_by
Facility }|--|| Address : address
Facility }|--|{ WellAuthorizationNumber : well_authorization_numbers
HistoricalEvent }|--|| User : created_by
HistoricalEvent }|--|| User : updated_by
HistoricalEvent }|--|| User : archived_by
HistoricalEvent }|--|| Operation : operation
HistoricalEvent }|--|| Facility : facility
Event }|--|| User : created_by
Event }|--|| User : updated_by
Event }|--|| User : archived_by
Event }|--|| Operation : operation
Event }|--|| Facility : facility
HistoricalFacilityOwnershipTimeline }|--|| User : created_by
HistoricalFacilityOwnershipTimeline }|--|| User : updated_by
HistoricalFacilityOwnershipTimeline }|--|| User : archived_by
HistoricalFacilityOwnershipTimeline }|--|| Facility : facility
HistoricalFacilityOwnershipTimeline }|--|| Operation : operation
FacilityOwnershipTimeline }|--|| User : created_by
FacilityOwnershipTimeline }|--|| User : updated_by
FacilityOwnershipTimeline }|--|| User : archived_by
FacilityOwnershipTimeline }|--|| Facility : facility
FacilityOwnershipTimeline }|--|| Operation : operation
HistoricalMultipleOperator }|--|| User : created_by
HistoricalMultipleOperator }|--|| User : updated_by
HistoricalMultipleOperator }|--|| User : archived_by
HistoricalMultipleOperator }|--|| Operation : operation
HistoricalMultipleOperator }|--|| BusinessStructure : business_structure
HistoricalMultipleOperator }|--|| Address : physical_address
HistoricalMultipleOperator }|--|| Address : mailing_address
MultipleOperator }|--|| User : created_by
MultipleOperator }|--|| User : updated_by
MultipleOperator }|--|| User : archived_by
MultipleOperator }|--|| Operation : operation
MultipleOperator }|--|| BusinessStructure : business_structure
MultipleOperator }|--|| Address : physical_address
MultipleOperator }|--|| Address : mailing_address
HistoricalOperationOwnershipTimeline }|--|| User : created_by
HistoricalOperationOwnershipTimeline }|--|| User : updated_by
HistoricalOperationOwnershipTimeline }|--|| User : archived_by
HistoricalOperationOwnershipTimeline }|--|| Operation : operation
HistoricalOperationOwnershipTimeline }|--|| Operator : operator
OperationOwnershipTimeline }|--|| User : created_by
OperationOwnershipTimeline }|--|| User : updated_by
OperationOwnershipTimeline }|--|| User : archived_by
OperationOwnershipTimeline }|--|| Operation : operation
OperationOwnershipTimeline }|--|| Operator : operator
HistoricalRegistrationPurpose }|--|| User : created_by
HistoricalRegistrationPurpose }|--|| User : updated_by
HistoricalRegistrationPurpose }|--|| User : archived_by
HistoricalRegistrationPurpose }|--|| Operation : operation
RegistrationPurpose }|--|| User : created_by
RegistrationPurpose }|--|| User : updated_by
RegistrationPurpose }|--|| User : archived_by
RegistrationPurpose }|--|| Operation : operation