# Generated by Django 4.2.8 on 2024-04-16 20:26

from django.db import migrations, models
import django.db.models.deletion
import simple_history.models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0010_V1_3_0'),
    ]

    operations = [
        migrations.CreateModel(
            name='Facility',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('updated_at', models.DateTimeField(blank=True, null=True)),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                ('name', models.CharField(db_comment="An operation or facility's name", max_length=1000)),
                ('type', models.CharField(db_comment="An operation or facility's type", max_length=1000)),
                (
                    'id',
                    models.UUIDField(
                        db_comment='Primary key to identify the facility',
                        default=uuid.uuid4,
                        primary_key=True,
                        serialize=False,
                        verbose_name='ID',
                    ),
                ),
                ('new_entrant', models.BooleanField(db_comment='Whether or not the facility is a new entrant')),
                (
                    'address',
                    models.ForeignKey(
                        db_comment='The address of the operation or facility',
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        to='registration.address',
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
                'db_table': 'erc"."facility',
                'db_table_comment': 'Facilities ',
            },
        ),
        migrations.AlterModelTableComment(
            name='operation',
            table_comment='Operations ',
        ),
        migrations.AddField(
            model_name='historicaloperation',
            name='address',
            field=models.ForeignKey(
                blank=True,
                db_comment='The address of the operation or facility',
                db_constraint=False,
                null=True,
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='+',
                to='registration.address',
            ),
        ),
        migrations.AddField(
            model_name='operation',
            name='address',
            field=models.ForeignKey(
                db_comment='The address of the operation or facility',
                null=True,
                on_delete=django.db.models.deletion.DO_NOTHING,
                to='registration.address',
            ),
        ),
        migrations.CreateModel(
            name='WellAuthorizationNumber',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('updated_at', models.DateTimeField(blank=True, null=True)),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                (
                    'well_authorization_number',
                    models.IntegerField(db_comment='A well authorization number from the BC Energy Regulator'),
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
                    'facility',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='well_authorization_numbers',
                        to='registration.facility',
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
                'db_table': 'erc"."well_authorization_number',
                'db_table_comment': 'A table containing well authorization numbers. Facilities can have multiple well authorization numbers.',
            },
        ),
        migrations.CreateModel(
            name='HistoricalWellAuthorizationNumber',
            fields=[
                ('id', models.BigIntegerField(auto_created=True, blank=True, db_index=True, verbose_name='ID')),
                ('created_at', models.DateTimeField(blank=True, editable=False, null=True)),
                ('updated_at', models.DateTimeField(blank=True, null=True)),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                (
                    'well_authorization_number',
                    models.IntegerField(db_comment='A well authorization number from the BC Energy Regulator'),
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
                    'facility',
                    models.ForeignKey(
                        blank=True,
                        db_constraint=False,
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='+',
                        to='registration.facility',
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
                'verbose_name': 'historical well authorization number',
                'verbose_name_plural': 'historical well authorization numbers',
                'db_table': 'erc_history"."well_authorization_number_history',
                'ordering': ('-history_date', '-history_id'),
                'get_latest_by': ('history_date', 'history_id'),
            },
            bases=(simple_history.models.HistoricalChanges, models.Model),
        ),
        migrations.CreateModel(
            name='HistoricalFacility',
            fields=[
                ('created_at', models.DateTimeField(blank=True, editable=False, null=True)),
                ('updated_at', models.DateTimeField(blank=True, null=True)),
                ('archived_at', models.DateTimeField(blank=True, null=True)),
                ('name', models.CharField(db_comment="An operation or facility's name", max_length=1000)),
                ('type', models.CharField(db_comment="An operation or facility's type", max_length=1000)),
                (
                    'id',
                    models.UUIDField(
                        db_comment='Primary key to identify the facility',
                        db_index=True,
                        default=uuid.uuid4,
                        verbose_name='ID',
                    ),
                ),
                ('new_entrant', models.BooleanField(db_comment='Whether or not the facility is a new entrant')),
                ('history_user_id', models.UUIDField(blank=True, null=True)),
                ('history_id', models.AutoField(primary_key=True, serialize=False)),
                ('history_date', models.DateTimeField(db_index=True)),
                ('history_change_reason', models.CharField(max_length=100, null=True)),
                (
                    'history_type',
                    models.CharField(choices=[('+', 'Created'), ('~', 'Changed'), ('-', 'Deleted')], max_length=1),
                ),
                (
                    'address',
                    models.ForeignKey(
                        blank=True,
                        db_comment='The address of the operation or facility',
                        db_constraint=False,
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name='+',
                        to='registration.address',
                    ),
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
                'verbose_name': 'historical facility',
                'verbose_name_plural': 'historical facilitys',
                'db_table': 'erc_history"."facility_history',
                'ordering': ('-history_date', '-history_id'),
                'get_latest_by': ('history_date', 'history_id'),
            },
            bases=(simple_history.models.HistoricalChanges, models.Model),
        ),
    ]
