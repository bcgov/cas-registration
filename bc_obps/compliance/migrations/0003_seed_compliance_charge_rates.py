from django.db import migrations
from decimal import Decimal


def seed_compliance_charge_rates(apps, schema_editor):
    ComplianceChargeRate = apps.get_model('compliance', 'ComplianceChargeRate')
    ReportingYear = apps.get_model('reporting', 'ReportingYear')

    # Initial compliance charge rates per year
    initial_rates = [
        {'year': 2024, 'rate': Decimal('80.00')},
        {'year': 2025, 'rate': Decimal('95.00')},
        {'year': 2026, 'rate': Decimal('110.00')},
    ]

    # Create charge rates
    for rate_info in initial_rates:
        reporting_year = ReportingYear.objects.get(reporting_year=rate_info['year'])
        ComplianceChargeRate.objects.create(reporting_year=reporting_year, rate=rate_info['rate'])


def reverse_seed_compliance_charge_rates(apps, schema_editor):
    """
    Remove seeded compliance charge rates
    """
    ComplianceChargeRate = apps.get_model('compliance', 'ComplianceChargeRate')
    ComplianceChargeRate.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('compliance', '0002_seed_compliance_periods'),
    ]

    operations = [
        migrations.RunPython(seed_compliance_charge_rates, reverse_seed_compliance_charge_rates),
    ]
