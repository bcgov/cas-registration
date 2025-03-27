from django.conf import settings
from django.db import connection
from django.db.backends.utils import CursorWrapper
from psycopg.sql import Identifier, SQL
from rls.enums import RlsRoles
from django.apps import apps
from rls.utils.m2m import M2mRls


class RlsManager:
    @staticmethod
    def reset_privileges_for_roles() -> None:
        # Convert enum values into an SQL-safe list
        role_identifiers = [Identifier(role.value) for role in RlsRoles]
        roles = SQL(', ').join(role_identifiers)

        queries = [
            SQL("revoke all privileges on all tables in schema erc from {}"),
            SQL("grant usage on schema erc to {}"),
            SQL("grant usage on schema public to {}"),
            SQL("grant usage on schema erc_history to {}"),
            SQL("grant all privileges on all tables in schema erc_history to {}"),
            SQL("grant usage on schema common to {}"),
            SQL("grant select, insert on all tables in schema common to {}"),
            SQL("grant select on public.django_content_type to {}"),
        ]

        # Tables and sequences that need to be granted INSERT and UPDATE privileges
        tables = [
            'registration_historicalfacility_well_authorization_numbers',
            'registration_historicaloperation_contacts',
            'registration_historicaloperation_activities',
            'registration_historicaloperation_regulated_products',
        ]
        sequences = [
            'registration_historicalfacility_well_authori_m2m_history_id_seq',
            'registration_historicaloperation_contacts_m2m_history_id_seq',
            'registration_historicaloperation_activities_m2m_history_id_seq',
            'registration_historicaloperation_regulated_p_m2m_history_id_seq',
        ]

        with connection.cursor() as cursor:
            for query in queries:
                cursor.execute(query.format(roles))

            for table in tables:
                cursor.execute(SQL("grant select, insert, update on public.{} to {};").format(Identifier(table), roles))

            for sequence in sequences:
                cursor.execute(
                    SQL("grant usage, select, update on sequence public.{} to {};").format(Identifier(sequence), roles)
                )

            if settings.DEBUG:
                # Grant all privileges on all tables in schema public to roles in DEBUG mode
                # This is to avoid permission issues with silk profiler
                debug_queries = [
                    SQL("grant usage on schema public to {}"),
                    SQL("grant all privileges on all tables in schema public to {}"),
                ]
                for query in debug_queries:
                    cursor.execute(query.format(roles))

    @classmethod
    def apply_rls(cls) -> None:
        apps_to_apply_rls = settings.RLS_GRANT_APPS
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
        cls.reset_privileges_for_roles()
        cls.apply_rls()
