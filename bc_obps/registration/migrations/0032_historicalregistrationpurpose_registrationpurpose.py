# Generated by Django 5.0.7 on 2024-08-13 15:15

import django.db.models.deletion
import simple_history.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0031_activity_model'),
    ]

    operations = [
        migrations.CreateModel(
            name='HistoricalRegistrationPurpose',
            fields=[
                ('id', models.BigIntegerField(auto_created=True, blank=True, db_index=True, verbose_name='ID')),
                ('created_at', models.DateTimeField(blank=True, editable=False, null=True)),
                ('updated_at', models.DateTimeField(blank=True, null=True)),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                (
                    'registration_purpose',
                    models.CharField(
                        choices=[
                            ('Reporting Operation', 'Reporting Operation'),
                            ('OBPS Regulated Operation', 'Obps Regulated Operation'),
                            ('Opted-in Operation', 'Opted In Operation'),
                            ('New Entrant Operation', 'New Entrant Operation'),
                            ('Electricity Import Operation', 'Electricity Import Operation'),
                            ('Potential Reporting Operation', 'Potential Reporting Operation'),
                        ],
                        db_comment='Registration purpose',
                        max_length=1000,
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
                        db_comment='The operator that has the purpose',
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
                'verbose_name': 'historical registration purpose',
                'verbose_name_plural': 'historical registration purposes',
                'db_table': 'erc_history"."registration_purpose_history',
                'ordering': ('-history_date', '-history_id'),
                'get_latest_by': ('history_date', 'history_id'),
            },
            bases=(simple_history.models.HistoricalChanges, models.Model),
        ),
        migrations.CreateModel(
            name='RegistrationPurpose',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('updated_at', models.DateTimeField(blank=True, null=True)),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                (
                    'registration_purpose',
                    models.CharField(
                        choices=[
                            ('Reporting Operation', 'Reporting Operation'),
                            ('OBPS Regulated Operation', 'Obps Regulated Operation'),
                            ('Opted-in Operation', 'Opted In Operation'),
                            ('New Entrant Operation', 'New Entrant Operation'),
                            ('Electricity Import Operation', 'Electricity Import Operation'),
                            ('Potential Reporting Operation', 'Potential Reporting Operation'),
                        ],
                        db_comment='Registration purpose',
                        max_length=1000,
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
                (
                    'operation',
                    models.ForeignKey(
                        db_comment='The operator that has the purpose',
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='registration_purposes',
                        to='registration.operation',
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
                'db_table': 'erc"."registration_purpose',
                'db_table_comment': 'Table that contains operations and their registration purposes.',
            },
        ),
    ]
