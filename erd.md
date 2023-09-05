To view this Entity Relationship Diagram, copy-paste the code below into the [Mermaid Live Editor](https://mermaid.live/edit), or install the Markdown Preview Mermaid VS Code extension.

What are these/what table should they be associated with?

- statuatory declaration
- percentage ownership (can operations be part of more than one operator?)
- Commitment to meet compliance obligation
- Amount of operations (operations registration needed)
- Main contact user

Considerations/questions

- there could be more than one ASO?
- operation vs. operator in provided doc
- unsure about what documents were meant to be associated with; might have too many doc tables

```mermaid
erDiagram
    USERANDCONTACTCOMMONINFO {
        first_name varchar
        last_name varchar
        email email
        phone phone
}
    USER {
        id int PK
        business_guid uuid
        user_guid uuid
        position_title varchar
        mailing_address varchar
        first_name varchar
        last_name varchar
        email email
        phone phone
    }
    OPERATOR {
        id int PK
        legal_name varchar
        trade_name varchar
        business_number int
        business_structure varchar
        mailing_address varchar
        bceid varchar
        parent_operator operator_id FK
        relationship_with_parent_operator varchar
        compliance_obligee operator_id FK
        date_aso_became_responsible_for_operator timestamptz
    }
    USER_OPERATOR {
         id int PK
         user_id int FK
         org_id int FK
         role varchar
         user_is_aso boolean
         user_is_third_party boolean
         proof_of_authority document_id FK
         status varchar
    }
    CONTACT {
        id int PK
        is_operational_representative boolean
        verified_at timestamptz
        verified_by user_id FK
        first_name varchar
        last_name varchar
        email email
        phone phone
    }
    OPERATOR_CONTACT {
        id int PK
        contact_id int FK
        operator_id int FK
    }
    OPERATION_CONTACT {
        id int PK
        contact_id int FK
        operator_id int FK
    }
    OPERATION {
        id int PK
        operator_id int FK
        name varchar
        naics_code int FK
        first_year_of_commercial_operation int
        description_of_operation_criteria varchar
        permit_id varchar
        npr_id varchar
        ghfrp_id varchar
        bcghrp_id varchar
        petrinex_id varchar
        coordinates point
        legal_land_description varchar
        nearest_municipality varchar
        operator_percent_of_ownership numeric
        registered_for_obps boolean
        verified_at timestamptz
        verified_by user_id FK
        estimated_emissions numeric
    }
    NAICS_CODE {
        id int PK
        naics_code varchar
        ciip_sector varchar
        naics_description varchar
    }
    DOCUMENT {
        id int PK
        file uuid
        document_type varchar
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
    OPERATION_DOCUMENT {
        id int PK
        document_id int FK
        operation_id in FK
    }
    OPERATOR_DOCUMENT {
        id int PK
        document_id int FK
        operator_id int FK
    }

    USER |{--|| USER_OPERATOR : contains
    OPERATOR |{--|| USER_OPERATOR : contains
    OPERATION |{--|| OPERATOR : contains
    USER_DOCUMENT |{--|| USER : has
    USER_DOCUMENT |{--|| DOCUMENT : has
    OPERATION_DOCUMENT |{--|| OPERATION : has
    OPERATION_DOCUMENT |{--|| DOCUMENT : has
    OPERATOR_DOCUMENT |{--|| OPERATOR : has
    OPERATOR_DOCUMENT |{--|| DOCUMENT : has
    OPERATOR_CONTACT |{--|| CONTACT : has
    OPERATION_CONTACT |{--|| CONTACT : has
    OPERATION_CONTACT |{--|| OPERATION : has
    OPERATOR_CONTACT |{--|| OPERATOR : has
    NAICS_CODE |{--|| OPERATION : has



```

this is probably more for reporting:
PRODUCT |{--|| OPERATION : produces
PRODUCT {
id int PK
operation_id int FK
name varchar
first_production_date timestamptz
}
