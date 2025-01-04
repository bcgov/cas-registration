# Generated by Django 5.0.10 on 2024-12-28 07:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reporting', '0041_reportnewentrant_reportnewentrantemission_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='reportverification',
            name='other_facility_coordinates',
            field=models.CharField(
                blank=True, db_comment='Geographic location of the other facility visited', max_length=100, null=True
            ),
        ),
        migrations.AlterField(
            model_name='reportverification',
            name='other_facility_name',
            field=models.CharField(
                blank=True,
                db_comment="Name of the other facility visited if 'Other' is selected",
                max_length=100,
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='reportverification',
            name='threats_to_independence',
            field=models.BooleanField(
                db_comment='Indicates whether there were any threats to independence noted', default=False
            ),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='reportverification',
            name='verification_conclusion',
            field=models.CharField(
                choices=[('Positive', 'Positive'), ('Modified', 'Modified'), ('Negative', 'Negative')],
                db_comment='The conclusion of the verification',
                default='Positive',
                max_length=8,
            ),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='reportverification',
            name='visit_name',
            field=models.CharField(
                db_comment='The name of the site visited (Facility X, Other, or None)', max_length=100
            ),
        ),
        migrations.AlterField(
            model_name='reportverification',
            name='visit_type',
            field=models.CharField(
                blank=True,
                choices=[('In person', 'In Person'), ('Virtual', 'Virtual')],
                db_comment='The type of visit conducted (Virtual or In Person)',
                max_length=10,
                null=True,
            ),
        ),
    ]
