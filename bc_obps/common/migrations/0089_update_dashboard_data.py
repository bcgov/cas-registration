from django.db import migrations
from common.utils import reset_dashboard_data


def reset_dashboard_data_fn(_, schema_editor):
    reset_dashboard_data()


class Migration(migrations.Migration):

    dependencies = [
        ('common', '0088_notice_of_obligation_due_email_template'),
    ]

    operations = [
        migrations.RunPython(reset_dashboard_data_fn, elidable=True),
    ]
