# Generated by Django 5.0.7 on 2024-11-07 23:46

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0055_alter_historicaltransferevent_status_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='historicaltransferevent',
            name='future_designated_operator',
        ),
        migrations.RemoveField(
            model_name='transferevent',
            name='future_designated_operator',
        ),
    ]
