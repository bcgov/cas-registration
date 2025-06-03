from django.apps import apps
from django.conf import settings
from django.db import connection
from registration.models.app_role import AppRole
from registration.models.user import User
from model_bakery import baker
from rls.enums import RlsOperations, RlsRoles
from rls.middleware.rls import RlsMiddleware


def get_models_for_rls(app_name=None):
    rls_apps_tuple = tuple(settings.RLS_GRANT_APPS)
    return [
        model
        for model in apps.get_models()
        # modules that don't have `models` in their path are excluded
        # These modules are for historical data models, and we don't need to apply RLS on them
        if model.__module__.startswith(app_name if app_name else rls_apps_tuple) and ".models." in model.__module__
    ]

def noop(*args, **kwargs):
    pass

def test_policies_for_cas_roles(model, select_function = noop, insert_function=noop, update_function=noop, delete_function=noop):
    # assign cas_admin for instanizing the user; role will change based on policy
    user = baker.make_recipe('registration.tests.utils.cas_admin')

    with connection.cursor() as cursor:
        for i, (role, operations) in enumerate(model.Rls.role_grants_mapping.items()):
                user.app_role = AppRole.objects.get(role_name=role.value)
                user.save()
                
                if role == RlsRoles.INDUSTRY_USER:
                    continue

                RlsMiddleware._set_user_guid_and_role(cursor, user)

                if RlsOperations.SELECT in operations:
                    if select_function is noop:
                        raise ValueError(f"SELECT operation granted for role {role}, but no select_function provided.")
                    select_function(cursor, i)

                if RlsOperations.INSERT in operations:
                    if insert_function is noop:
                        raise ValueError(f"INSERT operation granted for role {role}, but no select_function provided.")
                    insert_function(cursor, i)

                if RlsOperations.UPDATE in operations:
                    if update_function is noop:
                        raise ValueError(f"UPDATE operation granted for role {role}, but no select_function provided.")
                    update_function(cursor, i)

                if RlsOperations.DELETE in operations:
                    if delete_function is noop:
                        raise ValueError(f"DELETE operation granted for role {role}, but no select_function provided.")
                    delete_function(cursor, i)

