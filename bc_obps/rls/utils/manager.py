from django.conf import settings
from django.db import connection
from django.db.backends.utils import CursorWrapper
from psycopg.sql import Identifier, SQL
from rls.enums import RlsRoles
from django.apps import apps
from rls.utils.m2m import M2mRls


class RlsManager:
    @staticmethod
    def revoke_all_privileges() -> None:
        # Convert enum values into an SQL-safe list
        role_identifiers = [Identifier(role.value) for role in RlsRoles]
        with connection.cursor() as cursor:
            drop_owned_by_query = SQL('drop owned by {}').format(SQL(', ').join(role_identifiers))
            grant_usage_query = SQL("grant usage on schema erc to {}").format(SQL(', ').join(role_identifiers))
            cursor.execute(drop_owned_by_query)
            cursor.execute(grant_usage_query)

            # Grant usage and all privileges on all tables in schema erc_history to public(We don't care about this schema)
            cursor.execute("grant usage on schema erc_history to public")
            cursor.execute("grant all privileges on all tables in schema erc_history to public")
            # Grant usage and select privileges on all tables in schema common to public
            cursor.execute("grant usage on schema common to public")
            cursor.execute("grant select on all tables in schema common to public")

    @classmethod
    def apply_rls(cls) -> None:
        apps_to_apply_rls = [app for app in settings.LOCAL_APPS if app != 'rls']
        for app_name in apps_to_apply_rls:
            for model_name in apps.all_models[app_name]:
                cls.apply_rls_for_model(app_name, model_name)

    @classmethod
    def apply_rls_for_model(cls, app_name: str, model_name: str) -> None:
        model = apps.all_models[app_name][model_name]
        if hasattr(model, 'Rls'):
            rls = model.Rls
            with connection.cursor() as cursor:
                if hasattr(rls, 'grants'):
                    for grant in rls.grants:
                        grant.apply_grant(cursor)
                if hasattr(rls, 'm2m_rls_list'):
                    for m2m_rls in rls.m2m_rls_list:
                        cls.apply_m2m_rls(cursor, m2m_rls)

            # TODO: Implement the following part when the RlsPolicy class is implemented
            # if rls.enable_rls:
            #     cursor.execute('alter table %s.%s enable row level security', [rls.schema, rls.table])
            #     for policy in rls.policies:
            #         policy.apply_policy(cursor)

    @classmethod
    def apply_m2m_rls(cls, cursor: CursorWrapper, m2m_rls: M2mRls) -> None:
        for grant in m2m_rls.grants:
            grant.apply_grant(cursor)
        # TODO: Implement the following part when the RlsPolicy class is implemented
        # if m2m.enable_rls:
        #     cursor.execute('alter table %s.%s enable row level security', [m2m.schema, m2m.table])
        #     for policy in m2m.policies:
        #         policy.apply_policy(cursor)

    @classmethod
    def re_apply_rls(cls) -> None:
        cls.revoke_all_privileges()
        cls.apply_rls()
