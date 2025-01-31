# Generated by Django 5.0.11 on 2025-01-31 18:59

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0071_remove_historicaloperation_documents_document_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='facility',
            name='operation',
            field=models.ForeignKey(
                db_comment='The operation who currently owns the facility (see the FacilityDesignatedOperationTimeline for past and upcoming ownership)',
                on_delete=django.db.models.deletion.PROTECT,
                related_name='facilities',
                to='registration.operation',
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='historicalfacility',
            name='operation',
            field=models.ForeignKey(
                blank=True,
                db_comment='The operation who currently owns the facility (see the FacilityDesignatedOperationTimeline for past and upcoming ownership)',
                db_constraint=False,
                null=True,
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='+',
                to='registration.operation',
            ),
        ),
    ]
