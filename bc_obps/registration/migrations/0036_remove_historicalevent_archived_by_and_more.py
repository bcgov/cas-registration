# Generated by Django 5.0.8 on 2024-08-27 15:31

import django.db.models.deletion
import simple_history.models
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0035_operation_contacts_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='historicalevent',
            name='archived_by',
        ),
        migrations.RemoveField(
            model_name='historicalevent',
            name='created_by',
        ),
        migrations.RemoveField(
            model_name='historicalevent',
            name='facility',
        ),
        migrations.RemoveField(
            model_name='historicalevent',
            name='operation',
        ),
        migrations.RemoveField(
            model_name='historicalevent',
            name='updated_by',
        ),
        migrations.CreateModel(
            name='ClosureEvent',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('updated_at', models.DateTimeField(blank=True, null=True)),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                (
                    'id',
                    models.UUIDField(
                        db_comment='Primary key to identify the event',
                        default=uuid.uuid4,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ('effective_date', models.DateTimeField(db_comment='The effective date of the event')),
                (
                    'description',
                    models.TextField(blank=True, db_comment='Rationale for closure or other details.', null=True),
                ),
                ('status', models.CharField(choices=[('Closed', 'Closed')], default='Closed', max_length=100)),
                (
                    'archived_by',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_archived',
                        to='registration.user',
                    ),
                ),
                (
                    'created_by',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_created',
                        to='registration.user',
                    ),
                ),
                ('facilities', models.ManyToManyField(blank=True, to='registration.facility')),
                (
                    'operation',
                    models.ForeignKey(
                        blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, to='registration.operation'
                    ),
                ),
                (
                    'updated_by',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_updated',
                        to='registration.user',
                    ),
                ),
            ],
            options={
                'db_table': 'erc"."closure_event',
                'db_table_comment': 'Closure events for operations and/or facilities.',
                'default_related_name': 'closure_events',
            },
        ),
        migrations.CreateModel(
            name='HistoricalClosureEvent',
            fields=[
                ('created_at', models.DateTimeField(blank=True, editable=False, null=True)),
                ('updated_at', models.DateTimeField(blank=True, null=True)),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                (
                    'id',
                    models.UUIDField(db_comment='Primary key to identify the event', db_index=True, default=uuid.uuid4),
                ),
                ('effective_date', models.DateTimeField(db_comment='The effective date of the event')),
                (
                    'description',
                    models.TextField(blank=True, db_comment='Rationale for closure or other details.', null=True),
                ),
                ('status', models.CharField(choices=[('Closed', 'Closed')], default='Closed', max_length=100)),
                ('history_user_id', models.UUIDField(blank=True, null=True)),
                ('history_id', models.AutoField(primary_key=True, serialize=False)),
                ('history_date', models.DateTimeField(db_index=True)),
                ('history_change_reason', models.CharField(max_length=100, null=True)),
                (
                    'history_type',
                    models.CharField(choices=[('+', 'Created'), ('~', 'Changed'), ('-', 'Deleted')], max_length=1),
                ),
                (
                    'archived_by',
                    models.ForeignKey(
                        blank=True,
                        db_constraint=False,
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='+',
                        to='registration.user',
                    ),
                ),
                (
                    'created_by',
                    models.ForeignKey(
                        blank=True,
                        db_constraint=False,
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='+',
                        to='registration.user',
                    ),
                ),
                (
                    'operation',
                    models.ForeignKey(
                        blank=True,
                        db_constraint=False,
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='+',
                        to='registration.operation',
                    ),
                ),
                (
                    'updated_by',
                    models.ForeignKey(
                        blank=True,
                        db_constraint=False,
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='+',
                        to='registration.user',
                    ),
                ),
            ],
            options={
                'verbose_name': 'historical closure event',
                'verbose_name_plural': 'historical closure events',
                'db_table': 'erc_history"."closure_event_history',
                'ordering': ('-history_date', '-history_id'),
                'get_latest_by': ('history_date', 'history_id'),
            },
            bases=(simple_history.models.HistoricalChanges, models.Model),
        ),
        migrations.CreateModel(
            name='HistoricalRestartEvent',
            fields=[
                ('created_at', models.DateTimeField(blank=True, editable=False, null=True)),
                ('updated_at', models.DateTimeField(blank=True, null=True)),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                (
                    'id',
                    models.UUIDField(db_comment='Primary key to identify the event', db_index=True, default=uuid.uuid4),
                ),
                ('effective_date', models.DateTimeField(db_comment='The effective date of the event')),
                ('status', models.CharField(choices=[('Restarted', 'Restarted')], default='Restarted', max_length=100)),
                ('history_user_id', models.UUIDField(blank=True, null=True)),
                ('history_id', models.AutoField(primary_key=True, serialize=False)),
                ('history_date', models.DateTimeField(db_index=True)),
                ('history_change_reason', models.CharField(max_length=100, null=True)),
                (
                    'history_type',
                    models.CharField(choices=[('+', 'Created'), ('~', 'Changed'), ('-', 'Deleted')], max_length=1),
                ),
                (
                    'archived_by',
                    models.ForeignKey(
                        blank=True,
                        db_constraint=False,
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='+',
                        to='registration.user',
                    ),
                ),
                (
                    'created_by',
                    models.ForeignKey(
                        blank=True,
                        db_constraint=False,
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='+',
                        to='registration.user',
                    ),
                ),
                (
                    'operation',
                    models.ForeignKey(
                        blank=True,
                        db_constraint=False,
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='+',
                        to='registration.operation',
                    ),
                ),
                (
                    'updated_by',
                    models.ForeignKey(
                        blank=True,
                        db_constraint=False,
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='+',
                        to='registration.user',
                    ),
                ),
            ],
            options={
                'verbose_name': 'historical restart event',
                'verbose_name_plural': 'historical restart events',
                'db_table': 'erc_history"."restart_event_history',
                'ordering': ('-history_date', '-history_id'),
                'get_latest_by': ('history_date', 'history_id'),
            },
            bases=(simple_history.models.HistoricalChanges, models.Model),
        ),
        migrations.CreateModel(
            name='HistoricalTemporaryShutdownEvent',
            fields=[
                ('created_at', models.DateTimeField(blank=True, editable=False, null=True)),
                ('updated_at', models.DateTimeField(blank=True, null=True)),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                (
                    'id',
                    models.UUIDField(db_comment='Primary key to identify the event', db_index=True, default=uuid.uuid4),
                ),
                ('effective_date', models.DateTimeField(db_comment='The effective date of the event')),
                (
                    'description',
                    models.TextField(
                        blank=True, db_comment='Rationale for temporary shutdown or other details.', null=True
                    ),
                ),
                (
                    'status',
                    models.CharField(
                        choices=[('Temporarily Shutdown', 'Temporarily Shutdown')],
                        default='Temporarily Shutdown',
                        max_length=100,
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
                    'archived_by',
                    models.ForeignKey(
                        blank=True,
                        db_constraint=False,
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='+',
                        to='registration.user',
                    ),
                ),
                (
                    'created_by',
                    models.ForeignKey(
                        blank=True,
                        db_constraint=False,
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='+',
                        to='registration.user',
                    ),
                ),
                (
                    'operation',
                    models.ForeignKey(
                        blank=True,
                        db_constraint=False,
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='+',
                        to='registration.operation',
                    ),
                ),
                (
                    'updated_by',
                    models.ForeignKey(
                        blank=True,
                        db_constraint=False,
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='+',
                        to='registration.user',
                    ),
                ),
            ],
            options={
                'verbose_name': 'historical temporary shutdown event',
                'verbose_name_plural': 'historical temporary shutdown events',
                'db_table': 'erc_history"."temporary_shutdown_event_history',
                'ordering': ('-history_date', '-history_id'),
                'get_latest_by': ('history_date', 'history_id'),
            },
            bases=(simple_history.models.HistoricalChanges, models.Model),
        ),
        migrations.CreateModel(
            name='HistoricalTransferEvent',
            fields=[
                ('created_at', models.DateTimeField(blank=True, editable=False, null=True)),
                ('updated_at', models.DateTimeField(blank=True, null=True)),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                (
                    'id',
                    models.UUIDField(db_comment='Primary key to identify the event', db_index=True, default=uuid.uuid4),
                ),
                ('effective_date', models.DateTimeField(db_comment='The effective date of the event')),
                (
                    'description',
                    models.TextField(db_comment='Description of the transfer or change in designated operator.'),
                ),
                (
                    'future_designated_operator',
                    models.CharField(
                        choices=[
                            ('My Operator', 'My Operator'),
                            ('Other Operator', 'Other Operator'),
                            ('Not Sure', 'Not Sure'),
                        ],
                        db_comment='The designated operator of the entit(y)/(ies) associated with the transfer, who will be responsible for matters related to GGERR.',
                        max_length=1000,
                    ),
                ),
                (
                    'status',
                    models.CharField(
                        choices=[('Complete', 'Complete'), ('Pending', 'Pending'), ('Transferred', 'Transferred')],
                        default='Pending',
                        max_length=100,
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
                    'archived_by',
                    models.ForeignKey(
                        blank=True,
                        db_constraint=False,
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='+',
                        to='registration.user',
                    ),
                ),
                (
                    'created_by',
                    models.ForeignKey(
                        blank=True,
                        db_constraint=False,
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='+',
                        to='registration.user',
                    ),
                ),
                (
                    'operation',
                    models.ForeignKey(
                        blank=True,
                        db_constraint=False,
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='+',
                        to='registration.operation',
                    ),
                ),
                (
                    'other_operator',
                    models.ForeignKey(
                        blank=True,
                        db_comment='The second operator who is involved in the transfer but is not reporting the event.',
                        db_constraint=False,
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='+',
                        to='registration.operator',
                    ),
                ),
                (
                    'other_operator_contact',
                    models.ForeignKey(
                        blank=True,
                        db_comment='Contact information for the other operator.',
                        db_constraint=False,
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='+',
                        to='registration.contact',
                    ),
                ),
                (
                    'updated_by',
                    models.ForeignKey(
                        blank=True,
                        db_constraint=False,
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='+',
                        to='registration.user',
                    ),
                ),
            ],
            options={
                'verbose_name': 'historical transfer event',
                'verbose_name_plural': 'historical transfer events',
                'db_table': 'erc_history"."transfer_event_history',
                'ordering': ('-history_date', '-history_id'),
                'get_latest_by': ('history_date', 'history_id'),
            },
            bases=(simple_history.models.HistoricalChanges, models.Model),
        ),
        migrations.CreateModel(
            name='RestartEvent',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('updated_at', models.DateTimeField(blank=True, null=True)),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                (
                    'id',
                    models.UUIDField(
                        db_comment='Primary key to identify the event',
                        default=uuid.uuid4,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ('effective_date', models.DateTimeField(db_comment='The effective date of the event')),
                ('status', models.CharField(choices=[('Restarted', 'Restarted')], default='Restarted', max_length=100)),
                (
                    'archived_by',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_archived',
                        to='registration.user',
                    ),
                ),
                (
                    'created_by',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_created',
                        to='registration.user',
                    ),
                ),
                ('facilities', models.ManyToManyField(blank=True, to='registration.facility')),
                (
                    'operation',
                    models.ForeignKey(
                        blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, to='registration.operation'
                    ),
                ),
                (
                    'updated_by',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_updated',
                        to='registration.user',
                    ),
                ),
            ],
            options={
                'db_table': 'erc"."restart_event',
                'db_table_comment': 'Restart events for operations and/or facilities after they have been closed or temporarily shutdown.',
                'default_related_name': 'restart_events',
            },
        ),
        migrations.CreateModel(
            name='TemporaryShutdownEvent',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('updated_at', models.DateTimeField(blank=True, null=True)),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                (
                    'id',
                    models.UUIDField(
                        db_comment='Primary key to identify the event',
                        default=uuid.uuid4,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ('effective_date', models.DateTimeField(db_comment='The effective date of the event')),
                (
                    'description',
                    models.TextField(
                        blank=True, db_comment='Rationale for temporary shutdown or other details.', null=True
                    ),
                ),
                (
                    'status',
                    models.CharField(
                        choices=[('Temporarily Shutdown', 'Temporarily Shutdown')],
                        default='Temporarily Shutdown',
                        max_length=100,
                    ),
                ),
                (
                    'archived_by',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_archived',
                        to='registration.user',
                    ),
                ),
                (
                    'created_by',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_created',
                        to='registration.user',
                    ),
                ),
                ('facilities', models.ManyToManyField(blank=True, to='registration.facility')),
                (
                    'operation',
                    models.ForeignKey(
                        blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, to='registration.operation'
                    ),
                ),
                (
                    'updated_by',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_updated',
                        to='registration.user',
                    ),
                ),
            ],
            options={
                'db_table': 'erc"."temporary_shutdown_event',
                'db_table_comment': 'Temporary shutdown events for operations and/or facilities.',
                'default_related_name': 'temporary_shutdown_events',
            },
        ),
        migrations.CreateModel(
            name='TransferEvent',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('updated_at', models.DateTimeField(blank=True, null=True)),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                (
                    'id',
                    models.UUIDField(
                        db_comment='Primary key to identify the event',
                        default=uuid.uuid4,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ('effective_date', models.DateTimeField(db_comment='The effective date of the event')),
                (
                    'description',
                    models.TextField(db_comment='Description of the transfer or change in designated operator.'),
                ),
                (
                    'future_designated_operator',
                    models.CharField(
                        choices=[
                            ('My Operator', 'My Operator'),
                            ('Other Operator', 'Other Operator'),
                            ('Not Sure', 'Not Sure'),
                        ],
                        db_comment='The designated operator of the entit(y)/(ies) associated with the transfer, who will be responsible for matters related to GGERR.',
                        max_length=1000,
                    ),
                ),
                (
                    'status',
                    models.CharField(
                        choices=[('Complete', 'Complete'), ('Pending', 'Pending'), ('Transferred', 'Transferred')],
                        default='Pending',
                        max_length=100,
                    ),
                ),
                (
                    'archived_by',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_archived',
                        to='registration.user',
                    ),
                ),
                (
                    'created_by',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_created',
                        to='registration.user',
                    ),
                ),
                ('facilities', models.ManyToManyField(blank=True, to='registration.facility')),
                (
                    'operation',
                    models.ForeignKey(
                        blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, to='registration.operation'
                    ),
                ),
                (
                    'other_operator',
                    models.ForeignKey(
                        db_comment='The second operator who is involved in the transfer but is not reporting the event.',
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='transfer_events',
                        to='registration.operator',
                    ),
                ),
                (
                    'other_operator_contact',
                    models.ForeignKey(
                        db_comment='Contact information for the other operator.',
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='transfer_events',
                        to='registration.contact',
                    ),
                ),
                (
                    'updated_by',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name='%(class)s_updated',
                        to='registration.user',
                    ),
                ),
            ],
            options={
                'db_table': 'erc"."transfer_event',
                'db_table_comment': 'Transfer events for operations and/or facilities.',
                'default_related_name': 'transfer_events',
            },
        ),
        migrations.DeleteModel(
            name='Event',
        ),
        migrations.DeleteModel(
            name='HistoricalEvent',
        ),
    ]
