from typing import Any, Iterable, List, Type
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.apps import apps
from django.db.models import Model


# Apps that are exempt from the database comment requirement. `task_scheduler` holds internal
# job-queue bookkeeping tables that are not part of the reportable data model, so comments are not required
EXEMPT_APPS = {"task_scheduler"}


class Command(BaseCommand):
    help = "Checks if all models and fields have db_table_comment and db_comment respectively."

    def handle(self, *args: Any, **options: Any) -> None:
        errors = self.check_db_comments(self.get_apps_to_check())
        self.report_errors(errors)

    @staticmethod
    def get_apps_to_check() -> List[str]:
        skipped = EXEMPT_APPS.union(settings.NON_PROD_APPS)
        return [app_label for app_label in settings.LOCAL_APPS if app_label not in skipped]

    @staticmethod
    def get_models(app_label: str) -> Iterable[Type[Model]]:
        """Retrieves all models from the specified app label."""
        app_config = apps.get_app_config(app_label)
        return app_config.get_models()

    def check_db_comments(self, apps_to_check: List[str]) -> List[str]:
        errors = []
        for app_label in apps_to_check:
            app_models = self.get_models(app_label)
            for model in app_models:
                if model.__name__.startswith('Historical'):  # Skip models starting with 'Historical'
                    continue
                if not model._meta.db_table_comment:
                    errors.append(f"Model: {model.__name__} has no db_table_comment")
                errors.extend(self.check_model_fields(model))
        return errors

    def check_model_fields(self, model: Type[Model]) -> List[str]:
        errors = []
        for field in model._meta.get_fields(
            include_parents=False, include_hidden=False
        ):  # we don't want to include parent fields or hidden fields
            if self.should_skip_field(field):
                continue
            if not field.db_comment:
                errors.append(f"Model: {model.__name__} has no db_comment => field: {field.name}")
        return errors

    @staticmethod
    def should_skip_field(field: Any) -> bool:
        return (
            field.auto_created
            or field.many_to_many
            or field.name == 'id'
            or field.name.startswith(('history_', 'created_', 'updated_', 'archived_'))
        )

    def report_errors(self, errors: List[str]) -> None:
        if errors:
            self.stdout.write(self.style.ERROR(f"⛔️ Found {len(errors)} tables or columns without comments:"))
            self.stdout.write("\n")
            for index, error in enumerate(errors, start=1):
                self.stdout.write(f"{index}. {error}")
                self.stdout.write("-------------------------------------------------")
            raise CommandError("Some models or fields are missing database comments")
        self.stdout.write(self.style.SUCCESS("✅ All models in apps have db_comments"))
