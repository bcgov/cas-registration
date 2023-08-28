To view this Entity Relationship Diagram, copy-paste the code below into the [Mermaid Live Editor](https://mermaid.live/edit), or install the Markdown Preview Mermaid VS Code extension.

What are these/what table should they be associated with?

- statuatory declaration
- percentage ownership (can facilities be part of more than one organization?)
- Commitment to meet compliance obligation
- Amount of facilities (facilities registration needed)
- Main contact user

Considerations/questions

- there could be more than one ASO?
- facility vs. operator in provided doc
- unsure about what documents were meant to be associated with; might have too many doc tables

```mermaid
erDiagram
    USER {
        id int PK
        business_guid uuid
        user_guid uuid
        first_name varchar
        last_name varchar
        position_title varchar
        mailing_address varchar
        email varchar
        phone int
    }
    ORGANIZATION {
        id int
        legal_name varchar
        trade_name varchar
        business_number int
        business_structure varchar
        mailing_address varchar
        bceid UNKNOOOOWN
        parent_organization organization_id FK
        relationship_with_parent_organization varchar
        compliance_obligee organization_id FK
        date_aso_became_responsible_for_organization timestamptz
    }
    USER_ORGANIZATION {
         id int PK
         user_id int FK
         org_id int FK
         role varchar
         user_is_aso boolean
         user_is_third_party boolean
         proof_of_authority document_id FK
         status varchar
    }
    FACILITY {
        id int PK
        organization_id int FK
        name varchar
        naics_code int FK
        amount_of_bcobps_products UNKNOOWN
        first_year_of_commercial_operation int
        description_of_operation_criteria varchar
        permit_id UNKNOOOWN
        npr_id UNKNOOOWN nullable
        ghfrp_id UNKNOOOWN nullable
        bcghrp_id UNKNOOOWN nullable
        petrinex_id UNKNOOOWN nullable
        coordinates point
        legal_land_description varchar
        nearest_municipality varchar
        boundary_map document_id FK
        operator_percent_of_ownership numeric
    }
    PRODUCT {
        id int PK
        facility_id int FK
        name varchar
        first_production_date timestamptz
    }
    DOCUMENT {
        id int PK
        file uuid
        description varchar
        file_name varchar
        file_type varchar
        file_size varchar
    }
    USER_DOCUMENT {
        id int PK
        document_id int FK
        user_id in FK
    }
    FACILITY_DOCUMENT {
        id int PK
        document_id int FK
        facility_id in FK
    }
    ORGANIZATION_DOCUMENT {
        id int PK
        document_id int FK
        organization_id in FK
    }

    USER |{--|| USER_ORGANIZATION : contains
    ORGANIZATION |{--|| USER_ORGANIZATION : contains
    FACILITY |{--|| ORGANIZATION : contains
    PRODUCT |{--|| FACILITY : produces
    USER_DOCUMENT |{--|| USER : has
    USER_DOCUMENT |{--|| DOCUMENT : has
    FACILITY_DOCUMENT |{--|| FACILITY : has
    FACILITY_DOCUMENT |{--|| DOCUMENT : has
    ORGANIZATION_DOCUMENT |{--|| ORGANIZATION : has
    ORGANIZATION_DOCUMENT |{--|| DOCUMENT : has



```
