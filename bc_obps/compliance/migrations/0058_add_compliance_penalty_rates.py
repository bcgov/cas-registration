from django.db import migrations


def add_compliance_penalty_rates(apps, schema_editor):
    CompliancePenaltyRate = apps.get_model('compliance', 'CompliancePenaltyRate')
    CompliancePeriod = apps.get_model('compliance', 'CompliancePeriod')

    CompliancePenaltyRate.objects.create(
        created_at='2026-07-06T00:00:00Z',
        updated_at='2026-07-06T00:00:00Z',
        compliance_period=CompliancePeriod.objects.get(pk=1),
        rate=0.0038,
        is_current_rate=False,
    )
    CompliancePenaltyRate.objects.create(
        created_at='2026-07-06T00:00:00Z',
        updated_at='2026-07-06T00:00:00Z',
        compliance_period=CompliancePeriod.objects.get(pk=2),
        rate=0.0038,
        is_current_rate=True,
    )


def reverse_add_compliance_penalty_rates(apps, schema_editor):
    CompliancePenaltyRate = apps.get_model('compliance', 'CompliancePenaltyRate')
    CompliancePenaltyRate.objects.filter(pk=1).delete()
    CompliancePenaltyRate.objects.filter(pk=2).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('compliance', '0057_compliancepenaltyrate_unique_is_current_rate_true_per_compliance_penalty_rate'),
    ]

    operations = [
        migrations.RunPython(add_compliance_penalty_rates, reverse_add_compliance_penalty_rates),
    ]
