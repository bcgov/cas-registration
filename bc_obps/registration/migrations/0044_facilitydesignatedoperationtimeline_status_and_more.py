# Generated by Django 5.0.7 on 2024-10-02 22:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0043_update_activity_weight_data'),
    ]

    operations = [
        migrations.AddField(
            model_name='facilitydesignatedoperationtimeline',
            name='status',
            field=models.CharField(
                choices=[
                    ('Active', 'Active'),
                    ('Transferred', 'Transferred'),
                    ('Closed', 'Closed'),
                    ('Temporarily Shutdown', 'Temporarily Shutdown'),
                ],
                db_comment="The status of the facility in relation to the designated operation. For example, when a facility is transferred from Operation A to Operation B, under Operation A the status will be 'Transferred' but under Operation B the status will be 'Active'.",
                default='Active',
                max_length=1000,
            ),
        ),
        migrations.AddField(
            model_name='historicalfacilitydesignatedoperationtimeline',
            name='status',
            field=models.CharField(
                choices=[
                    ('Active', 'Active'),
                    ('Transferred', 'Transferred'),
                    ('Closed', 'Closed'),
                    ('Temporarily Shutdown', 'Temporarily Shutdown'),
                ],
                db_comment="The status of the facility in relation to the designated operation. For example, when a facility is transferred from Operation A to Operation B, under Operation A the status will be 'Transferred' but under Operation B the status will be 'Active'.",
                default='Active',
                max_length=1000,
            ),
        ),
    ]
