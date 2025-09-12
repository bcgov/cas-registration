from django.apps import apps
from django.conf import settings
from django.db import connection
from registration.models.app_role import AppRole
from registration.models.user import User
from rls.enums import RlsOperations, RlsRoles
from rls.middleware.rls import RlsMiddleware
from django.db import transaction
from model_bakery import baker


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


def run_with_rollback(cursor, fn):
    with transaction.atomic():
        fn(cursor)
        transaction.set_rollback(True)


def assert_policies_for_cas_roles(
    model,
    select_function=noop,
    insert_function=noop,
    update_function=noop,
    delete_function=noop,
):
    """
    Helper function for testing Row-Level Security (RLS) policies for various CAS roles.

    This function iterates through all roles defined in the `role_grants_mapping` of the provided model's RLS configuration.
    For each role, it assigns the role to a user, sets the user's role and GUID in the database session, and tests the
    allowed database operations (SELECT, INSERT, UPDATE, DELETE) for that role. If an operation is granted but no
    corresponding function is provided, a `ValueError` is raised. All database changes are rolled back after each operation
    to ensure the database state remains unchanged.

    Args:
        model (Model): The Django model containing the RLS configuration (`role_grants_mapping`) to test.
        select_function (Callable, optional): A function to test the SELECT operation. Defaults to `noop`.
        insert_function (Callable, optional): A function to test the INSERT operation. Defaults to `noop`.
        update_function (Callable, optional): A function to test the UPDATE operation. Defaults to `noop`.
        delete_function (Callable, optional): A function to test the DELETE operation. Defaults to `noop`.

    Raises:
        ValueError: If an operation is granted for a role but no corresponding function is provided.
        ValueError: If the `select_function`, `insert_function`, `update_function`, or `delete_function` is not provided
                    for an operation that is granted to the role.

    Notes:
        - The function skips testing for the `INDUSTRY_USER` role, as it is handled separately.
        - The `run_with_rollback` function is used to ensure that all database changes are rolled back after each operation.
        - The `cas_admin` user is used as a base user, and their role is dynamically updated during the test.


    """

    user = baker.make_recipe('registration.tests.utils.cas_admin')

    with connection.cursor() as cursor:
        for role, operations in model.Rls.role_grants_mapping.items():
            user.app_role = AppRole.objects.get(role_name=role.value)
            user.save()

            if role == RlsRoles.INDUSTRY_USER:
                continue

            RlsMiddleware._set_user_guid_and_role(cursor, user)

            if RlsOperations.SELECT in operations:
                if select_function is noop:
                    raise ValueError("SELECT operation granted, but no select_function provided.")
                run_with_rollback(cursor, select_function)

            if RlsOperations.INSERT in operations:
                if insert_function is noop:
                    raise ValueError(f"INSERT operation granted for role {role}, but no insert_function provided.")
                run_with_rollback(cursor, insert_function)

            if RlsOperations.UPDATE in operations:
                if update_function is noop:
                    raise ValueError(f"UPDATE operation granted for role {role}, but no update_function provided.")
                run_with_rollback(cursor, update_function)

            if RlsOperations.DELETE in operations:
                if delete_function is noop:
                    raise ValueError(f"DELETE operation granted for role {role}, but no delete_function provided.")
                run_with_rollback(cursor, delete_function)


def assert_policies_for_industry_user(
    model_name,
    user: User,
    select_function=noop,
    insert_function=noop,
    update_function=noop,
    delete_function=noop,
    forbidden_select_function=noop,
    forbidden_insert_function=noop,
    forbidden_update_function=noop,
    forbidden_delete_function=noop,
):
    """
    This function is a helper for testing RLS policies for the industry_user role. Write the select, insert, update, and delete functions and assertions in the test files (see test_contact.py for examples) and then pass them to this function.
    If we forget to test an operation that RLS applies to, this function will raise a ValueError. It rolls back the changes after each operation to ensure the database state remains unchanged for subsequent tests.
    If forbidden operations are flagged to be tested, this function will attempt to run the functions specified, not in the role grants and expect them to fail. If they succeed, a ValueError is raised.
    """
    if not hasattr(model_name.Rls, 'enable_rls') or not model_name.Rls.enable_rls:
        return

    with connection.cursor() as cursor:
        RlsMiddleware._set_user_guid_and_role(cursor, user)
        operations = model_name.Rls.role_grants_mapping[RlsRoles.INDUSTRY_USER]

        if RlsOperations.SELECT in operations:
            if select_function is noop or forbidden_select_function is noop:
                raise ValueError(
                    "SELECT operation granted, but no select_function or forbidden_select_function provided."
                )
            run_with_rollback(cursor, select_function)
            run_with_rollback(cursor, forbidden_select_function)

        if RlsOperations.INSERT in operations:
            if insert_function is noop or forbidden_insert_function is noop:
                raise ValueError(
                    "INSERT operation granted, but no insert_function or forbidden_insert_function provided."
                )
            run_with_rollback(cursor, insert_function)
            run_with_rollback(cursor, forbidden_insert_function)

        if RlsOperations.UPDATE in operations:
            if update_function is noop or forbidden_update_function is noop:
                raise ValueError(
                    "UPDATE operation granted, but no update_function or forbidden_update_function provided."
                )
            run_with_rollback(cursor, update_function)
            run_with_rollback(cursor, forbidden_update_function)

        if RlsOperations.DELETE in operations:
            if delete_function is noop or forbidden_delete_function is noop:
                raise ValueError(
                    "DELETE operation granted, but no delete_function or forbidden_delete_function provided."
                )
            run_with_rollback(cursor, delete_function)
            run_with_rollback(cursor, forbidden_delete_function)
