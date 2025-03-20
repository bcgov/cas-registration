from registration.models.rls_config import TableRlsConfig


class Rls(TableRlsConfig):
    """
    RLS Configuration for ComplianceFee table
    """

    # Table name for references in SQL conditions
    BASE_TABLE = 'erc"."compliance_fee'

    # Enable all RLS operations
    ENABLE_RLS_SELECT = True
    ENABLE_RLS_INSERT = True
    ENABLE_RLS_UPDATE = True
    ENABLE_RLS_DELETE = True

    # Mapping of roles to SELECT conditions
    ROLE_SELECT_CONDITIONS = {
        "cas_admin": "TRUE",  # CAS admins can see all
        "industry_user": """
            EXISTS (
                SELECT 1
                FROM erc"."operator_user ou
                INNER JOIN erc"."compliance_obligation co ON co.id = compliance_fee.compliance_obligation_id
                INNER JOIN erc"."compliance_summary cs ON cs.id = co.compliance_summary_id
                INNER JOIN erc"."reporting_period_emission_report rper ON rper.id = cs.report_id
                INNER JOIN erc"."operator o ON o.id = rper.operator_id
                WHERE ou.operator_id = o.id
                AND ou.user_guid = current_setting('app.current_user')::uuid
            )
        """,
        "cas_analyst": "TRUE",  # Analysts can see all
        "cas_pending": "FALSE",  # Pending users cannot access
    }

    # Mapping of roles to INSERT conditions - only admins and analysts can create
    ROLE_INSERT_CONDITIONS = {
        "cas_admin": "TRUE",
        "industry_user": "FALSE",
        "cas_analyst": "TRUE",
        "cas_pending": "FALSE",
    }

    # Mapping of roles to UPDATE conditions - only admins and analysts can update
    ROLE_UPDATE_CONDITIONS = {
        "cas_admin": "TRUE",
        "industry_user": "FALSE",
        "cas_analyst": "TRUE",
        "cas_pending": "FALSE",
    }

    # Mapping of roles to DELETE conditions - only admins can delete
    ROLE_DELETE_CONDITIONS = {
        "cas_admin": "TRUE",
        "industry_user": "FALSE",
        "cas_analyst": "FALSE",
        "cas_pending": "FALSE",
    } 