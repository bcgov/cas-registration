from django.db import migrations
from decimal import Decimal


def seed_compliance_charge_rates(apps, schema_editor):
    """
    Seed initial compliance charge rates for years 2024-2030
    """
    ComplianceChargeRate = apps.get_model('compliance', 'ComplianceChargeRate')
    ReportingYear = apps.get_model('reporting', 'ReportingYear')

    initial_rates = {
        2024: Decimal('80.00'),
        2025: Decimal('95.00'),
        2026: Decimal('110.00'),
        2027: Decimal('125.00'),
        2028: Decimal('140.00'),
        2029: Decimal('155.00'),
        2030: Decimal('170.00'),
    }

    for year, rate in initial_rates.items():
        # Get existing reporting year
        try:
            reporting_year = ReportingYear.objects.get(reporting_year=year)

            # Create compliance charge rate
            ComplianceChargeRate.objects.create(reporting_year=reporting_year, rate=rate)
        except ReportingYear.DoesNotExist:
            # Skip if reporting year doesn't exist
            print(f"Warning: Reporting year {year} does not exist, skipping compliance charge rate creation")


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
