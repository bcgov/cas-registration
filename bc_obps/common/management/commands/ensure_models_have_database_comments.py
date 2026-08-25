from django.core.management.base import BaseCommand
from django.apps import apps


class Command(BaseCommand):
    help = "Checks if all models and fields have db_table_comment and db_comment respectively."

    def handle(self, *args, **options):
        apps_to_check = ['registration', 'common', 'reporting']  # Your list of apps
        errors = self.check_db_comments(apps_to_check)
        self.report_errors(errors)

    def get_models(self, app_label):
        """Retrieves all models from the specified app label."""
        app_config = apps.get_app_config(app_label)
        return app_config.get_models()

    def check_db_comments(self, apps_to_check):
        errors = []
        for app_label in apps_to_check:
            app_models = self.get_models(app_label)
            for model in app_models:
                if model.__name__.startswith('Historical'):  # Skip models starting with 'Historical'
                    continue
                if not model._meta.db_table_comment:
                    errors.insert(0, f"Model: {model.__name__} has no db_table_comment")
                errors.extend(self.check_model_fields(model))
        return errors

    def check_model_fields(self, model):
        errors = []
        for field in model._meta.get_fields(
            include_parents=False, include_hidden=False
        ):  # we don't want to include parent fields or hidden fields
            if self.should_skip_field(field):
                continue
            if not field.db_comment:
                errors.append(f"Model: {model.__name__} has no db_comment => field: {field.name}")
        return errors

    def should_skip_field(self, field):
        return (
            field.auto_created
            or field.many_to_many
            or field.name == 'id'
            or field.name.startswith(('history_', 'created_', 'updated_', 'archived_'))
        )

    def report_errors(self, errors):
        if errors:
            self.stdout.write(self.style.ERROR(f"⛔️ Found {len(errors)} models without comments:"))
            self.stdout.write("\n")
            for index, error in enumerate(errors, start=1):
                self.stdout.write(f"{index}. {error}")
                self.stdout.write("-------------------------------------------------")
            raise SystemExit(1)
        else:
            self.stdout.write(self.style.SUCCESS("✅ All models in apps have db_comments"))
