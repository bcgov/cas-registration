from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('compliance', '0003_remove_historicalcomplianceproduct_archived_by_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='complianceobligation',
            name='obligation_id',
            field=models.CharField(
                blank=True,
                db_comment='A human-readable identifier for the obligation in format YY-OOOO-R-V',
                max_length=30,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name='historicalcomplianceobligation',
            name='obligation_id',
            field=models.CharField(
                blank=True,
                db_comment='A human-readable identifier for the obligation in format YY-OOOO-R-V',
                max_length=30,
                null=True,
            ),
        ),
    ]
