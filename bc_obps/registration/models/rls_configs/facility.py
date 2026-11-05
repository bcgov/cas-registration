from registration.enums.enums import RegistrationTableNames
from rls.enums import RlsRoles, RlsOperations
from rls.utils.helpers import generate_rls_grants, generate_m2m_rls, generate_policy_mapping, generate_rls_policies
from rls.utils.m2m import M2MPolicyStatements


class Rls:
    enable_rls = True
    schema = "erc"
    table = RegistrationTableNames.FACILITY

    role_grants_mapping = {
        RlsRoles.INDUSTRY_USER: [
            RlsOperations.SELECT,
            RlsOperations.INSERT,
            RlsOperations.UPDATE,
            RlsOperations.DELETE,
        ],  # Industry User needs delete permission for the specific flow when changing registration purpose from EIO
        # To issue BORO ID and BCGHG ID
        RlsRoles.CAS_DIRECTOR: [RlsOperations.SELECT, RlsOperations.UPDATE],
        RlsRoles.CAS_ADMIN: [RlsOperations.SELECT],
        # CAS_ANALYST needs to be able to update the operation_id field when transferring a facility
        RlsRoles.CAS_ANALYST: [RlsOperations.SELECT, RlsOperations.UPDATE],
        RlsRoles.CAS_VIEW_ONLY: [RlsOperations.SELECT],
    }
    grants = generate_rls_grants(role_grants_mapping, RegistrationTableNames.FACILITY)
    # M2M relationships
    m2m_models_grants_mapping = {
        RegistrationTableNames.FACILITY_WELL_AUTHORIZATION_NUMBERS: {
            RlsRoles.INDUSTRY_USER: [
                RlsOperations.SELECT,
                RlsOperations.INSERT,
                RlsOperations.UPDATE,
                RlsOperations.DELETE,  # Granting this permission so that user can remove the instance from the through table
            ],
            RlsRoles.CAS_DIRECTOR: [RlsOperations.SELECT],
            RlsRoles.CAS_ADMIN: [RlsOperations.SELECT],
            RlsRoles.CAS_ANALYST: [RlsOperations.SELECT],
            RlsRoles.CAS_VIEW_ONLY: [RlsOperations.SELECT],
        }
    }
    m2m_models_policies_mapping = {
        RegistrationTableNames.FACILITY_WELL_AUTHORIZATION_NUMBERS: M2MPolicyStatements(
            using_statement='true', delete_using_statement='true'
        ),
    }
    m2m_rls_list = generate_m2m_rls(m2m_models_grants_mapping, m2m_models_policies_mapping)

    industry_user_using_statement = """
        exists (
            select 1 from erc.operation o
            join erc.user_operator uo
                on uo.operator_id = o.operator_id
                and o.id = facility.operation_id
                and uo.user_id = current_setting('my.guid', true)::uuid
                and uo.status='Approved'
        )
    """

    industry_user_delete_using_statement = """
        exists (
            select 1 from erc.operation o
            join erc.user_operator uo
                on uo.operator_id = o.operator_id
                and o.id = facility.operation_id
                and uo.user_id = current_setting('my.guid', true)::uuid
                and uo.status='Approved'
                and (o.type = 'Electricity Import Operation' or o.status != 'Registered')
        )
    """

    role_operation_policy_map = {
        RlsRoles.INDUSTRY_USER: [
            {RlsOperations.SELECT.value: 'true'},
            {RlsOperations.INSERT.value: industry_user_using_statement},
            {RlsOperations.UPDATE.value: industry_user_using_statement},
            {RlsOperations.DELETE.value: industry_user_delete_using_statement},
        ],
        RlsRoles.CAS_DIRECTOR: [{RlsOperations.SELECT.value: "true", RlsOperations.UPDATE.value: "true"}],
        RlsRoles.CAS_ADMIN: [{RlsOperations.SELECT.value: "true"}],
        RlsRoles.CAS_ANALYST: [{RlsOperations.SELECT.value: "true", RlsOperations.UPDATE.value: "true"}],
        RlsRoles.CAS_VIEW_ONLY: [{RlsOperations.SELECT.value: "true"}],
    }

    role_policy_mapping = generate_policy_mapping(
        role_operation_policy_mapping=role_operation_policy_map,
    )

    policies = generate_rls_policies(role_policy_mapping, table)
