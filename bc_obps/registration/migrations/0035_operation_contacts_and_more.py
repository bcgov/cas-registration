# Generated by Django 5.0.7 on 2024-08-16 22:36

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0034_historicaloptedinoperationdetail_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='operation',
            name='contacts',
            field=models.ManyToManyField(
                blank=True,
                related_name='operations_contacts',
                to='registration.contact',
            ),
        ),
        migrations.AlterField(
            model_name='historicaloperation',
            name='point_of_contact',
            field=models.ForeignKey(
                blank=True,
                db_comment='Foreign key to the contact that is the point of contact (point of contact is only used in registration 1)',
                db_constraint=False,
                null=True,
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='+',
                to='registration.contact',
            ),
        ),
        migrations.AlterField(
            model_name='operation',
            name='point_of_contact',
            field=models.ForeignKey(
                blank=True,
                db_comment='Foreign key to the contact that is the point of contact (point of contact is only used in registration 1)',
                null=True,
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='operations',
                to='registration.contact',
            ),
        ),
    ]