from django.db import migrations
from common.utils import reset_dashboard_data


def reset_dashboard_data_fn(_, schema_editor):
    reset_dashboard_data()


class Migration(migrations.Migration):

    dependencies = [
        ('common', '0074_V3_17_1'),
    ]

    operations = [
        migrations.RunPython(reset_dashboard_data_fn, elidable=True),
    ]
