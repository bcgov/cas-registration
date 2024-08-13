from django.db import migrations


def create_new_activity(apps, schema_monitor):
    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    ReportingActivity.objects.create(
        name='General stationary combustion solely for the purpose of line tracing',
        slug='gsc_solely_line_tracing',
        weight=200.0,
    )


def delete_new_activity(apps, schema_monitor):
    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    ReportingActivity.objects.filter(
        name='General stationary combustion solely for the purpose of line tracing'
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0030_slug_and_weight_on_activity_model'),
    ]

    operations = [
        migrations.RunPython(create_new_activity, delete_new_activity),
    ]
