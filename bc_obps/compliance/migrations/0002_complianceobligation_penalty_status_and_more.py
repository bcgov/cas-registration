# Generated by Django 5.0.11 on 2025-02-20 08:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('compliance', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='complianceobligation',
            name='penalty_status',
            field=models.CharField(
                choices=[('PENDING', 'Pending'), ('PAID', 'Paid'), ('OVERDUE', 'Overdue')],
                db_comment='The status of the penalty (e.g., PENDING, PAID, OVERDUE)',
                default='PENDING',
                max_length=50,
            ),
        ),
        migrations.AddField(
            model_name='historicalcomplianceobligation',
            name='penalty_status',
            field=models.CharField(
                choices=[('PENDING', 'Pending'), ('PAID', 'Paid'), ('OVERDUE', 'Overdue')],
                db_comment='The status of the penalty (e.g., PENDING, PAID, OVERDUE)',
                default='PENDING',
                max_length=50,
            ),
        ),
    ]
