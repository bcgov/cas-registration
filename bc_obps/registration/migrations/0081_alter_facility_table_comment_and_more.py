# Generated by Django 5.0.11 on 2025-03-04 00:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0080_V1_23_1'),
    ]

    operations = [
        migrations.AlterModelTableComment(
            name='facility',
            table_comment='Contains data on facilities that emit carbon emissions and must report them to Clean Growth. A Linear Facilities Operation is made up of several different facilities whereas a Single Facility Operation has only one facility. In the case of a single facility operation, much of the data in this table will overlap with the parent record in the operation table.',
        ),
        migrations.AlterField(
            model_name='activity',
            name='applicable_to',
            field=models.CharField(
                choices=[('sfo', 'Sfo'), ('lfo', 'Lfo'), ('all', 'All')],
                db_comment='Which type of facility the activity applies to. An activity can be valid for only a Single Facility Operation, only a Linear Facilities Operation or it can apply to both',
                max_length=1000,
            ),
        ),
        migrations.AlterField(
            model_name='historicalactivity',
            name='applicable_to',
            field=models.CharField(
                choices=[('sfo', 'Sfo'), ('lfo', 'Lfo'), ('all', 'All')],
                db_comment='Which type of facility the activity applies to. An activity can be valid for only a Single Facility Operation, only a Linear Facilities Operation or it can apply to both',
                max_length=1000,
            ),
        ),
        migrations.AlterField(
            model_name='historicaloperation',
            name='type',
            field=models.CharField(
                choices=[
                    ('Linear Facilities Operation', 'Lfo'),
                    ('Single Facility Operation', 'Sfo'),
                    ('Electricity Import Operation', 'Eio'),
                ],
                db_comment='The type of an operation',
                max_length=1000,
            ),
        ),
        migrations.AlterField(
            model_name='operation',
            name='type',
            field=models.CharField(
                choices=[
                    ('Linear Facilities Operation', 'Lfo'),
                    ('Single Facility Operation', 'Sfo'),
                    ('Electricity Import Operation', 'Eio'),
                ],
                db_comment='The type of an operation',
                max_length=1000,
            ),
        ),
    ]
