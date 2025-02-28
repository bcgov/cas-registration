# Generated manually

from django.db import migrations


def init_compliance_periods(apps, schema_editor):
    '''
    Add initial compliance period data from fixtures
    '''
    from django.core.management import call_command

    fixture_files = [
        'compliance/fixtures/mock/compliance_periods.json',
    ]

    # Load the fixtures
    for fixture in fixture_files:
        call_command('loaddata', fixture)


def reverse_init_compliance_periods(apps, schema_editor):
    '''
    Remove seeded compliance periods
    '''
    CompliancePeriod = apps.get_model('compliance', 'CompliancePeriod')
    CompliancePeriod.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('compliance', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(init_compliance_periods, reverse_init_compliance_periods),
    ] 