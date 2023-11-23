---
Django ER Diagram
---

erDiagram
AppRole {
CharField role_name
CharField role_description
}
DocumentType {
BigAutoField id
CharField name
}
Document {
BigAutoField id
FileField file
ForeignKey type
CharField description
}
NaicsCode {
BigAutoField id
CharField naics_code
CharField ciip_sector
CharField naics_description
}
NaicsCategory {
BigAutoField id
CharField naics_category
}
RegulatedProduct {
BigAutoField id
CharField name
}
ReportingActivity {
BigAutoField id
CharField name
}
User {
CharField first_name
CharField last_name
CharField position_title
CharField street_address
CharField municipality
CharField province
CharField postal_code
CharField email
CharField phone_number
UUIDField user_guid
UUIDField business_guid
ForeignKey app_role
ManyToManyField documents
}
BusinessRole {
CharField role_name
CharField role_description
}
Contact {
BigAutoField id
CharField first_name
CharField last_name
CharField position_title
CharField street_address
CharField municipality
CharField province
CharField postal_code
CharField email
CharField phone_number
ForeignKey business_role
ManyToManyField documents
}
Operator {
BigAutoField id
CharField legal_name
CharField trade_name
IntegerField cra_business_number
IntegerField bc_corporate_registry_number
CharField business_structure
CharField physical_street_address
CharField physical_municipality
CharField physical_province
CharField physical_postal_code
CharField mailing_street_address
CharField mailing_municipality
CharField mailing_province
CharField mailing_postal_code
CharField website
ManyToManyField documents
ManyToManyField contacts
}
ParentChildOperator {
BigAutoField id
ForeignKey parent_operator
ForeignKey child_operator
DecimalField percentage_owned_by_parent_company
}
UserOperator {
BigAutoField id
ForeignKey user
ForeignKey operator
CharField role
CharField status
DateTimeField verified_at
ForeignKey verified_by
}
Operation {
BigAutoField id
CharField name
CharField type
ForeignKey naics_code
ForeignKey naics_category
DecimalField previous_year_attributable_emissions
IntegerField swrs_facility_id
CharField bcghg_id
BooleanField opt_in
ForeignKey operator
DateTimeField verified_at
ForeignKey verified_by
CharField status
ManyToManyField regulated_products
ManyToManyField reporting_activities
ManyToManyField documents
ManyToManyField contacts
}
Document }|--|| DocumentType : type
User }|--|| AppRole : app_role
User }|--|{ Document : documents
Contact }|--|| BusinessRole : business_role
Contact }|--|{ Document : documents
Operator }|--|{ Document : documents
Operator }|--|{ Contact : contacts
ParentChildOperator }|--|| Operator : parent_operator
ParentChildOperator }|--|| Operator : child_operator
UserOperator }|--|| User : user
UserOperator }|--|| Operator : operator
UserOperator }|--|| User : verified_by
Operation }|--|| NaicsCode : naics_code
Operation }|--|| NaicsCategory : naics_category
Operation }|--|| Operator : operator
Operation }|--|| User : verified_by
Operation }|--|{ RegulatedProduct : regulated_products
Operation }|--|{ ReportingActivity : reporting_activities
Operation }|--|{ Document : documents
Operation }|--|{ Contact : contacts
