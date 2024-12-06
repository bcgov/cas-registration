class RlsRoles:
    INDUSTRY_USER = "industry_user"
    CAS_DIRECTOR = "cas_director"
    CAS_ADMIN = "cas_admin"
    CAS_ANALYST = "cas_analyst"
    CAS_PENDING = "cas_pending"
    CAS_VIEW_ONLY = "cas_view_only"


class RlsOperations:
    SELECT = "select"
    UPDATE = "update"
    INSERT = "insert"
    DELETE = "delete"


class RlsGrant:
    def __init__(self, role, grants, table, schema="erc"):  # type: ignore
        self.role = role
        self.grants = grants
        self.table = table
        self.schema = schema

    def apply_grant(self, cursor):  # type: ignore
        grant_string = ",".join(self.grants)
        execute_string = f'grant {grant_string} on {self.schema}.{self.table} to {self.role}'
        cursor.execute(execute_string)


class RlsPolicy:
    def __init__(self, role, policy_name, operation, table, using_statement=False, check_statement=False, schema="erc"):  # type: ignore
        self.role = role
        self.policy_name = policy_name
        self.operation = operation
        self.using_statement = using_statement
        self.check_statement = check_statement
        self.table = table
        self.schema = schema

    def apply_policy(self, cursor):  # type: ignore
        execute_string = (
            f'create policy {self.policy_name} on {self.schema}.{self.table} for {self.operation} to {self.role}'
        )
        if self.using_statement:
            execute_string += f' using {self.using_statement}'
        if self.check_statement:
            execute_string += f' with check {self.check_statement}'
        cursor.execute(execute_string)
