from django.db import migrations


def init_compliance_periods(apps, schema_editor):
    CompliancePeriod = apps.get_model('compliance', 'CompliancePeriod')
    ReportingYear = apps.get_model('reporting', 'ReportingYear')

    CompliancePeriod.objects.create(
        created_at='2024-01-01T00:00:00Z',
        updated_at='2024-01-01T00:00:00Z',
        start_date='2024-01-01',
        end_date='2024-12-31',
        compliance_deadline='2025-11-30',
        invoice_generation_date='2025-11-01',
        reporting_year=ReportingYear.objects.get(reporting_year=2024),
    )


def reverse_init_compliance_periods(apps, schema_editor):
    CompliancePeriod = apps.get_model('compliance', 'CompliancePeriod')
    CompliancePeriod.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('compliance', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(init_compliance_periods, reverse_init_compliance_periods),
    ]
