# Generated by Django 5.0.6 on 2024-06-27 00:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reporting', '0002_prod_data'),
    ]

    operations = [
        migrations.AlterField(
            model_name='reportoperation',
            name='operator_trade_name',
            field=models.CharField(
                blank=True,
                db_comment='The trade name of the operator operating this operation',
                max_length=1000,
                null=True,
            ),
        ),
    ]
