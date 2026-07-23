from django.db import migrations


def add_compliance_penalty_rates(apps, schema_editor):
    CompliancePenaltyRate = apps.get_model('compliance', 'CompliancePenaltyRate')

    CompliancePenaltyRate.objects.create(
        rate=0.0038,
        is_current_rate=True,
    )


def reverse_add_compliance_penalty_rates(apps, schema_editor):
    CompliancePenaltyRate = apps.get_model('compliance', 'CompliancePenaltyRate')
    CompliancePenaltyRate.objects.filter(pk=1).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('compliance', '0059_alter_compliancepenaltyrate_options_and_more'),
    ]

    operations = [
        migrations.RunPython(add_compliance_penalty_rates, reverse_add_compliance_penalty_rates),
    ]
