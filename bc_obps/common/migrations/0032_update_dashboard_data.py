from django.db import migrations
from common.utils import reset_dashboard_data


def reset_dashboard_data_fn(_, schema_editor):
    reset_dashboard_data()


class Migration(migrations.Migration):

    dependencies = [
        ('common', '0031_V1_19_0'),
    ]

    operations = [
        migrations.RunPython(reset_dashboard_data_fn, elidable=True),
    ]
