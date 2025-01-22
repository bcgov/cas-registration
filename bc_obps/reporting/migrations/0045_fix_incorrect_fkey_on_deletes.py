# Generated by Django 5.0.8 on 2025-01-22 00:37

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reporting', '0044_reportoperationrepresentative_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='reportadditionaldata',
            name='report_version',
            field=models.OneToOneField(
                db_comment='The report version this report additional data applies to',
                on_delete=django.db.models.deletion.CASCADE,
                primary_key=True,
                related_name='report_additional_data',
                serialize=False,
                to='reporting.reportversion',
            ),
        ),
        migrations.AlterField(
            model_name='reportproductemissionallocation',
            name='report_product',
            field=models.ForeignKey(
                db_comment='The regulated product this emission data has been allocated to',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='%(class)s_records',
                to='reporting.reportproduct',
            ),
        ),
        migrations.AlterField(
            model_name='reportproductemissionallocation',
            name='report_version',
            field=models.ForeignKey(
                db_comment='The report version this emission data is associated with',
                on_delete=django.db.models.deletion.CASCADE,
                related_name='%(class)s_records',
                to='reporting.reportversion',
            ),
        ),
        migrations.AlterField(
            model_name='reportverification',
            name='report_version',
            field=models.OneToOneField(
                db_comment='The report version of this report verification',
                on_delete=django.db.models.deletion.CASCADE,
                primary_key=True,
                related_name='report_verification',
                serialize=False,
                to='reporting.reportversion',
            ),
        ),
    ]
