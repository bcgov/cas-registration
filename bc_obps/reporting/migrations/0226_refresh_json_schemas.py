from django.db import migrations
from reporting.migrations._helpers import load_source_type_schemas_from_json


class Migration(migrations.Migration):
    dependencies = [
        ('reporting', '0225_V5_25_3'),
    ]

    operations = [
        migrations.RunPython(
            code=load_source_type_schemas_from_json,
            reverse_code=migrations.RunPython.noop,
        ),
    ]
