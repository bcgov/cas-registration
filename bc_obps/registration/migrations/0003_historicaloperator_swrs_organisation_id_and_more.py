# Generated by Django 4.2.8 on 2024-02-23 14:47

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('registration', '0002_prod_data'),
    ]

    operations = [
        migrations.AddField(
            model_name='historicaloperator',
            name='swrs_organisation_id',
            field=models.IntegerField(
                blank=True,
                db_comment='An identifier used in the CIIP/SWRS dataset (in swrs: organisation = operator). This identifier will only be populated for operators that were imported from that dataset.',
                null=True,
            ),
        ),
        migrations.AddField(
            model_name='operator',
            name='swrs_organisation_id',
            field=models.IntegerField(
                blank=True,
                db_comment='An identifier used in the CIIP/SWRS dataset (in swrs: organisation = operator). This identifier will only be populated for operators that were imported from that dataset.',
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='historicaloperator',
            name='cra_business_number',
            field=models.IntegerField(
                db_comment='The CRA business number of an operator',
                validators=[
                    django.core.validators.MaxValueValidator(
                        999999999, message='CRA Business Number should be 9 digits.'
                    ),
                    django.core.validators.MinValueValidator(
                        100000000, message='CRA Business Number should be 9 digits.'
                    ),
                ],
            ),
        ),
        migrations.AlterField(
            model_name='operator',
            name='cra_business_number',
            field=models.IntegerField(
                db_comment='The CRA business number of an operator',
                validators=[
                    django.core.validators.MaxValueValidator(
                        999999999, message='CRA Business Number should be 9 digits.'
                    ),
                    django.core.validators.MinValueValidator(
                        100000000, message='CRA Business Number should be 9 digits.'
                    ),
                ],
            ),
        ),
    ]
