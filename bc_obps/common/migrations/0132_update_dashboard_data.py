from django.db import migrations

from common.utils import reset_dashboard_data


def reset_dashboard_data_fn(_, schema_editor):
    reset_dashboard_data()


class Migration(migrations.Migration):
    dependencies = [
        ("common", "0131_V5_15_1"),
    ]

    operations = [
        migrations.RunPython(
            code=reset_dashboard_data_fn,
        ),
    ]
