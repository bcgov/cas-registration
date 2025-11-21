from django.db import migrations
from common.utils import reset_dashboard_data


def reset_dashboard_data_fn(_, schema_editor):
    reset_dashboard_data()


class Migration(migrations.Migration):

    dependencies = [
        ('common', '0097_supplementary_report_submitted_after_deadline_template_template'),
    ]

    operations = [
        migrations.RunPython(reset_dashboard_data_fn, elidable=True),
    ]
