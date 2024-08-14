from django.db import migrations


def create_new_activity(apps, schema_monitor):
    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    ReportingActivity.objects.create(
        name='General stationary combustion solely for the purpose of line tracing',
        slug='gsc_solely_for_line_tracing',
        weight=200.0,
        applicable_to='all',
    )


def delete_new_activity(apps, schema_monitor):
    ReportingActivity = apps.get_model('registration', 'ReportingActivity')
    ReportingActivity.objects.filter(
        name='General stationary combustion solely for the purpose of line tracing'
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0031_historicalregistrationpurpose_registrationpurpose'),
    ]

    operations = [
        migrations.RunPython(create_new_activity, delete_new_activity),
    ]
