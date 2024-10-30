# Generated by Django 5.0.7 on 2024-10-30 18:39

import django.db.models.deletion
import simple_history.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0048_bcobpsregulatedoperation_issued_by_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='BcghgOperationOrFacility',
            fields=[
                (
                    'id',
                    models.CharField(
                        db_comment='The BCGHG ID of an operation or facility',
                        max_length=255,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    'issued_at',
                    models.DateTimeField(
                        auto_now_add=True, db_comment='The time the BCGHG ID was issued by an IRC user'
                    ),
                ),
                (
                    'comments',
                    models.TextField(
                        blank=True, db_comment='Comments from admins in the case that a BCGHG ID is revoked'
                    ),
                ),
                (
                    'issued_by',
                    models.ForeignKey(
                        blank=True,
                        db_comment='The IRC user who issued the BCGHG ID',
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='bcghg_operation_or_facility_issued_by',
                        to='registration.user',
                    ),
                ),
            ],
            options={
                'db_table': 'erc"."bcghg_operation_or_facility',
                'db_table_comment': 'Table to store BCGHG ID metadata. Once an operation or facility meets the criteria for an ID, then it is issued one.',
            },
        ),
        migrations.CreateModel(
            name='HistoricalBcghgOperationOrFacility',
            fields=[
                (
                    'id',
                    models.CharField(
                        db_comment='The BCGHG ID of an operation or facility', db_index=True, max_length=255
                    ),
                ),
                (
                    'issued_at',
                    models.DateTimeField(
                        blank=True, db_comment='The time the BCGHG ID was issued by an IRC user', editable=False
                    ),
                ),
                (
                    'comments',
                    models.TextField(
                        blank=True, db_comment='Comments from admins in the case that a BCGHG ID is revoked'
                    ),
                ),
                ('history_user_id', models.UUIDField(blank=True, null=True)),
                ('history_id', models.AutoField(primary_key=True, serialize=False)),
                ('history_date', models.DateTimeField(db_index=True)),
                ('history_change_reason', models.CharField(max_length=100, null=True)),
                (
                    'history_type',
                    models.CharField(choices=[('+', 'Created'), ('~', 'Changed'), ('-', 'Deleted')], max_length=1),
                ),
                (
                    'issued_by',
                    models.ForeignKey(
                        blank=True,
                        db_comment='The IRC user who issued the BCGHG ID',
                        db_constraint=False,
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='+',
                        to='registration.user',
                    ),
                ),
            ],
            options={
                'verbose_name': 'historical bcghg operation or facility',
                'verbose_name_plural': 'historical bcghg operation or facilitys',
                'db_table': 'erc_history"."bcghg_operation_or_facility_history',
                'ordering': ('-history_date', '-history_id'),
                'get_latest_by': ('history_date', 'history_id'),
            },
            bases=(simple_history.models.HistoricalChanges, models.Model),
        ),
    ]
