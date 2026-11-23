from django.db import migrations
from reporting.migrations._helpers import load_source_type_schemas_from_json


class Migration(migrations.Migration):
    dependencies = [
        ('reporting', '0224_add_biocarbon'),
    ]

    operations = [
        migrations.RunPython(
            code=load_source_type_schemas_from_json,
            reverse_code=migrations.RunPython.noop,
        ),
    ]
