from django.db import migrations, models
from decimal import Decimal


def populate_initial_rates(apps, schema_editor):
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
        reporting_year, _ = ReportingYear.objects.get_or_create(year=year)
        ComplianceChargeRate.objects.create(
            reporting_year=reporting_year,
            rate=rate
        )


class Migration(migrations.Migration):

    dependencies = [
        ('compliance', '0001_initial'),
        ('reporting', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ComplianceChargeRate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('rate', models.DecimalField(max_digits=10, decimal_places=2, db_comment='The compliance charge rate in CAD dollars per tCO2e')),
                ('reporting_year', models.ForeignKey(
                    on_delete=models.PROTECT,
                    related_name='compliance_charge_rate',
                    to='reporting.reportingyear',
                    db_comment='The associated reporting year for this compliance charge rate'
                )),
            ],
            options={
                'db_table': 'erc"."compliance_charge_rate',
                'db_table_comment': 'A table to store compliance charge rates by reporting year',
                'ordering': ['reporting_year'],
                'abstract': False,
            },
        ),
        migrations.RunPython(
            populate_initial_rates,
            reverse_code=migrations.RunPython.noop
        ),
    ] 