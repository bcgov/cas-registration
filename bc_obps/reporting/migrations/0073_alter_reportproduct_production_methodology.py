# Generated by Django 5.0.11 on 2025-03-10 22:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reporting', '0072_not_applicable_methodology'),
    ]

    operations = [
        migrations.AlterField(
            model_name='reportproduct',
            name='production_methodology',
            field=models.CharField(
                choices=[
                    ('OBPS Calculator', 'Obps Calculator'),
                    ('other', 'Other'),
                    ('Not Applicable', 'Not Applicable'),
                ],
                db_comment='The production methodoogy used to make this product',
                default='OBPS Calculator',
                max_length=10000,
            ),
        ),
    ]
