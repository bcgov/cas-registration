# Generated by Django 5.0.7 on 2024-10-28 16:36

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0047_remove_old_activity_records'),
    ]

    operations = [
        migrations.AddField(
            model_name='bcobpsregulatedoperation',
            name='issued_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='The IRC user who issued the BC OBPS Regulated Operation ID',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='bc_obps_regulated_operation_issued_by',
                to='registration.user',
            ),
        ),
        migrations.AddField(
            model_name='historicalbcobpsregulatedoperation',
            name='issued_by',
            field=models.ForeignKey(
                blank=True,
                db_comment='The IRC user who issued the BC OBPS Regulated Operation ID',
                db_constraint=False,
                null=True,
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='+',
                to='registration.user',
            ),
        ),
    ]
