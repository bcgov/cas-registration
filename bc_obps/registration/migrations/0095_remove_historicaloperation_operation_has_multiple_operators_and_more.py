# Generated by Django 5.0.13 on 2025-03-18 00:17

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0094_V2_0_1'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='historicaloperation',
            name='operation_has_multiple_operators',
        ),
        migrations.RemoveField(
            model_name='historicaloperation',
            name='opt_in',
        ),
        migrations.RemoveField(
            model_name='historicaloperation',
            name='verified_at',
        ),
        migrations.RemoveField(
            model_name='historicaloperation',
            name='verified_by',
        ),
        migrations.RemoveField(
            model_name='historicaloperator',
            name='is_new',
        ),
        migrations.RemoveField(
            model_name='historicaloperator',
            name='verified_at',
        ),
        migrations.RemoveField(
            model_name='historicaloperator',
            name='verified_by',
        ),
        migrations.RemoveField(
            model_name='operation',
            name='operation_has_multiple_operators',
        ),
        migrations.RemoveField(
            model_name='operation',
            name='opt_in',
        ),
        migrations.RemoveField(
            model_name='operation',
            name='verified_at',
        ),
        migrations.RemoveField(
            model_name='operation',
            name='verified_by',
        ),
        migrations.RemoveField(
            model_name='operator',
            name='is_new',
        ),
        migrations.RemoveField(
            model_name='operator',
            name='verified_at',
        ),
        migrations.RemoveField(
            model_name='operator',
            name='verified_by',
        ),
    ]
