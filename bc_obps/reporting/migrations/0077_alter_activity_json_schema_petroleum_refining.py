from django.db import migrations
import json
import os


def update_activity_source_type_json_schema_and_configuration_elements(apps, schema_editor):
    ActivitySourceTypeJsonSchema = apps.get_model("reporting", "ActivitySourceTypeJsonSchema")
    Activity = apps.get_model("registration", "Activity")
    SourceType = apps.get_model("reporting", "SourceType")

    activity = Activity.objects.get(name="Petroleum refining")

    new_source_type = SourceType.objects.get(name="Equipment leaks at refineries")

    old_source_type = SourceType.objects.get(name="Equipment leaks")

    cwd = os.getcwd()

    with open(
        f"{cwd}/reporting/json_schemas/2024/petroleum_refining/8_equipment_leaks_at_refineries.json"
    ) as schema_file:
        schema = json.load(schema_file)

    ActivitySourceTypeJsonSchema.objects.filter(
        activity=activity,
        source_type=old_source_type,
    ).update(source_type=new_source_type, json_schema=schema)


class Migration(migrations.Migration):
    dependencies = [
        ('reporting', '0076_alter_configuration_element_petroleum_refining'),
    ]

    operations = [
        migrations.RunPython(update_activity_source_type_json_schema_and_configuration_elements),
    ]
